import { Injectable, computed, inject, signal } from '@angular/core';

import { COURSE, CourseDef } from '../course/course.config';
import type { ModuleId } from '../models/content.model';
import type { SessionSummary } from '../models/practice.model';
import { readJson, writeJson } from './local-storage';

/**
 * Khoá localStorage chứa tiến độ của một học phần.
 *
 * N3 JUNBI giữ nguyên khoá `riki:progress` có từ trước khi tách học phần: đổi tên khoá
 * là người học mất sạch tiến độ đã có. Học phần khác thêm hậu tố, vì tiến độ tra theo
 * id bài mà id bài trùng nhau giữa các học phần (cả hai đều có `01-danh-tu`).
 */
function storageKeyOf(course: CourseDef): string {
  return course.id === 'n3-junbi' ? 'riki:progress' : `riki:progress:${course.id}`;
}

/** Số lần luyện và kết quả tốt nhất — của cả một bài, hoặc của một cụm trong bài. */
export interface PracticeStat {
  /** Số câu đúng của lần làm tốt nhất. */
  bestCorrect: number;
  /** Tổng số câu của chính lần đó — cần cả hai mới ra được tỉ lệ. */
  bestTotal: number;
  /** Số lần đã luyện. */
  attempts: number;
  /** Lần luyện gần nhất, dạng ISO. */
  lastAt: string;
}

/** Kết quả tốt nhất từng đạt ở một bài. */
export interface UnitProgress extends PracticeStat {
  moduleId: ModuleId;
  /**
   * Thống kê riêng của từng cụm đã luyện, theo nhãn cụm ("51–60").
   *
   * Bài Danh từ gom 120 từ mà người học lại học theo buổi, mỗi buổi một cụm 10 từ — với
   * họ "Bài 3.2" là một bài. Chỉ đếm cả bài thì "Danh từ: 12 lần" không nói được buổi
   * nào đã luyện, buổi nào chưa đụng tới. Một phiên luyện theo cụm được tính cho CẢ
   * cụm lẫn bài; luyện cả bài (không chọn cụm) thì chỉ tính cho bài.
   */
  groups: Record<string, PracticeStat>;
}

type ProgressMap = Record<string, UnitProgress>;

/**
 * Tiến độ học của MỘT học phần, lưu trong trình duyệt.
 *
 * Chỉ lưu KẾT QUẢ TỐT NHẤT và số lần làm, không lưu chi tiết từng câu: mục đích là
 * trả lời "bài này học tới đâu rồi", không phải dựng lại nguyên một phiên đã xong.
 *
 * Dữ liệu nằm ở localStorage nên gắn với MỘT trình duyệt trên MỘT máy. Xoá dữ liệu
 * duyệt web là mất; đó là đánh đổi có ý thức để trang chạy được mà không cần tài
 * khoản và không có máy chủ nào giữ dữ liệu học của người dùng.
 *
 * Mỗi học phần một bản, cấp ở route của học phần (xem app.routes.ts).
 */
@Injectable()
export class ProgressStore {
  private readonly storageKey = storageKeyOf(inject(COURSE));

  private readonly map = signal<ProgressMap>(sanitize(readJson<unknown>(this.storageKey, {})));

  readonly all = this.map.asReadonly();

  /** Số bài đã từng luyện, theo từng phần. */
  readonly countByModule = computed(() => {
    const result: Partial<Record<ModuleId, number>> = {};
    for (const entry of Object.values(this.map())) {
      result[entry.moduleId] = (result[entry.moduleId] ?? 0) + 1;
    }
    return result;
  });

  readonly studiedCount = computed(() => Object.keys(this.map()).length);

  of(unitId: string): UnitProgress | null {
    return this.map()[unitId] ?? null;
  }

  /** Tỉ lệ đúng tốt nhất của một bài, 0–100. Trả về null nếu chưa luyện lần nào. */
  bestPercent(unitId: string): number | null {
    const entry = this.of(unitId);
    if (!entry || entry.bestTotal === 0) return null;
    return Math.round((entry.bestCorrect / entry.bestTotal) * 100);
  }

  /** Thống kê của một cụm trong bài, hoặc null nếu cụm đó chưa luyện lần nào. */
  groupOf(unitId: string, group: string): PracticeStat | null {
    return this.of(unitId)?.groups[group] ?? null;
  }

  /** Ghi lại một phiên vừa xong. Chỉ nâng kỷ lục, không hạ. */
  record(summary: SessionSummary): void {
    const { unitId, moduleId, group } = summary.config;
    if (!unitId) return;

    const current = this.of(unitId);
    const now = new Date().toISOString();
    const groups = { ...(current?.groups ?? {}) };
    if (group) groups[group] = nextStat(groups[group] ?? null, summary, now);

    const next: UnitProgress = {
      moduleId,
      ...nextStat(current, summary, now),
      groups,
    };

    const map = { ...this.map(), [unitId]: next };
    this.map.set(map);
    writeJson(this.storageKey, map);
  }

  clear(): void {
    this.map.set({});
    writeJson(this.storageKey, {});
  }
}

/** Cộng thêm một lần luyện, và nâng kỷ lục nếu lần này tốt hơn. */
function nextStat(current: PracticeStat | null, summary: SessionSummary, now: string): PracticeStat {
  const isBetter =
    !current || summary.correctCount * current.bestTotal > current.bestCorrect * summary.total;
  return {
    bestCorrect: isBetter ? summary.correctCount : current.bestCorrect,
    bestTotal: isBetter ? summary.total : current.bestTotal,
    attempts: (current?.attempts ?? 0) + 1,
    lastAt: now,
  };
}

/** Đọc một bản thống kê; null nếu hỏng. */
function sanitizeStat(value: unknown): PracticeStat | null {
  if (!value || typeof value !== 'object') return null;
  const entry = value as Record<string, unknown>;
  const bestTotal = typeof entry['bestTotal'] === 'number' ? entry['bestTotal'] : 0;
  if (bestTotal <= 0) return null;
  return {
    bestCorrect: typeof entry['bestCorrect'] === 'number' ? entry['bestCorrect'] : 0,
    bestTotal,
    attempts: typeof entry['attempts'] === 'number' ? entry['attempts'] : 1,
    lastAt: typeof entry['lastAt'] === 'string' ? entry['lastAt'] : '',
  };
}

/** Bảo vệ trước dữ liệu localStorage hỏng hoặc do phiên bản cũ ghi ra. */
function sanitize(raw: unknown): ProgressMap {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};

  const result: ProgressMap = {};
  for (const [id, value] of Object.entries(raw as Record<string, unknown>)) {
    const stat = sanitizeStat(value);
    if (!stat) continue;
    const entry = value as Record<string, unknown>;

    // Bản ghi từ trước khi có thống kê theo cụm thì không có `groups`: các lần luyện cũ
    // chỉ còn tính được cho cả bài, không biết đã luyện cụm nào.
    const groups: Record<string, PracticeStat> = {};
    const rawGroups = entry['groups'];
    if (rawGroups && typeof rawGroups === 'object' && !Array.isArray(rawGroups)) {
      for (const [label, rawGroup] of Object.entries(rawGroups as Record<string, unknown>)) {
        const groupStat = sanitizeStat(rawGroup);
        if (groupStat) groups[label] = groupStat;
      }
    }

    result[id] = { moduleId: entry['moduleId'] as ModuleId, ...stat, groups };
  }
  return result;
}
