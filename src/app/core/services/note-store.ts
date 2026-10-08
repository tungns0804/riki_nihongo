import { Injectable, inject, signal } from '@angular/core';

import { COURSE } from '../course/course.config';
import type { ModuleId } from '../models/content.model';
import { readJson, writeJson } from './local-storage';

/**
 * Ghi chú người học tự viết cho từng câu của một đề, lưu trong trình duyệt.
 *
 * Khoá theo phần học + bài + id câu: id câu chỉ không trùng trong MỘT đề, mà hai đề
 * khác nhau hoàn toàn có thể cùng đặt `q-01`. Mỗi học phần một khoá localStorage riêng
 * vì id bài trùng nhau giữa các học phần (xem ProgressStore).
 *
 * Lưu NGAY mỗi lần gõ, không đợi nút "Lưu": ghi chú là thứ viết dở rồi đóng tab, và
 * mất một đoạn ghi chú dài vì quên bấm lưu thì không ai muốn viết lại. Một lần ghi chỉ
 * vài chục KB nên ghi theo từng phím vẫn nhẹ.
 *
 * Như tiến độ, dữ liệu gắn với MỘT trình duyệt trên MỘT máy (xem ProgressStore).
 */
@Injectable()
export class NoteStore {
  private readonly storageKey = `riki:notes:${inject(COURSE).id}`;

  private readonly map = signal<Record<string, string>>(
    sanitize(readJson<unknown>(this.storageKey, {})),
  );

  /** Lần ghi gần nhất có vào được localStorage không (chế độ ẩn danh, quota đầy…). */
  readonly saveFailed = signal(false);

  of(moduleId: ModuleId, unitId: string, questionId: string): string {
    return this.map()[keyOf(moduleId, unitId, questionId)] ?? '';
  }

  set(moduleId: ModuleId, unitId: string, questionId: string, text: string): void {
    const key = keyOf(moduleId, unitId, questionId);
    const next = { ...this.map() };
    // Xoá trắng ô thì bỏ hẳn mục: không giữ lại hàng trăm chuỗi rỗng trong bộ nhớ.
    // So với chuỗi rỗng chứ không `trim()`: ô viết lấy lại chữ từ đây, bỏ mục khi mới gõ
    // một dấu cách hay một lần xuống dòng là ô xoá luôn chính phím vừa gõ.
    if (text) next[key] = text;
    else delete next[key];

    this.map.set(next);
    this.saveFailed.set(!writeJson(this.storageKey, next));
  }
}

function keyOf(moduleId: ModuleId, unitId: string, questionId: string): string {
  return `${moduleId}/${unitId}/${questionId}`;
}

/** Bảo vệ trước dữ liệu localStorage hỏng: chỉ giữ các cặp khoá → chuỗi. */
function sanitize(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value === 'string' && value) result[key] = value;
  }
  return result;
}
