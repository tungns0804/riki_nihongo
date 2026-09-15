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

/** Kết quả tốt nhất từng đạt ở một bài. */
export interface UnitProgress {
  moduleId: ModuleId;
  /** Số câu đúng của lần làm tốt nhất. */
  bestCorrect: number;
  /** Tổng số câu của chính lần đó — cần cả hai mới ra được tỉ lệ. */
  bestTotal: number;
  /** Số lần đã luyện bài này. */
  attempts: number;
  /** Lần luyện gần nhất, dạng ISO. */
  lastAt: string;
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

  /** Ghi lại một phiên vừa xong. Chỉ nâng kỷ lục, không hạ. */
  record(summary: SessionSummary): void {
    const { unitId, moduleId } = summary.config;
    if (!unitId) return;

    const current = this.of(unitId);
    const isBetter =
      !current || summary.correctCount * current.bestTotal > current.bestCorrect * summary.total;

    const next: UnitProgress = {
      moduleId,
      bestCorrect: isBetter ? summary.correctCount : current.bestCorrect,
      bestTotal: isBetter ? summary.total : current.bestTotal,
      attempts: (current?.attempts ?? 0) + 1,
      lastAt: new Date().toISOString(),
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

/** Bảo vệ trước dữ liệu localStorage hỏng hoặc do phiên bản cũ ghi ra. */
function sanitize(raw: unknown): ProgressMap {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};

  const result: ProgressMap = {};
  for (const [id, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!value || typeof value !== 'object') continue;
    const entry = value as Record<string, unknown>;
    const bestTotal = typeof entry['bestTotal'] === 'number' ? entry['bestTotal'] : 0;
    if (bestTotal <= 0) continue;

    result[id] = {
      moduleId: entry['moduleId'] as ModuleId,
      bestCorrect: typeof entry['bestCorrect'] === 'number' ? entry['bestCorrect'] : 0,
      bestTotal,
      attempts: typeof entry['attempts'] === 'number' ? entry['attempts'] : 1,
      lastAt: typeof entry['lastAt'] === 'string' ? entry['lastAt'] : '',
    };
  }
  return result;
}
