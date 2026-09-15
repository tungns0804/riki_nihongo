import { Injectable, signal } from '@angular/core';

import type { ModuleId, UnitIndexEntry } from '../models/content.model';

/**
 * Tên bài tra theo địa chỉ, cho breadcrumb của vỏ ứng dụng.
 *
 * Vì sao cần: tên bài nằm trong danh mục của ContentStore, mà ContentStore cấp riêng ở
 * route của từng học phần (xem app.routes.ts) — vỏ ứng dụng đứng ngoài cây route đó nên
 * không inject được. ContentStore nào tải xong danh mục thì ghi tên các bài vào đây.
 *
 * Khoá gồm cả học phần và phần học: id bài trùng nhau giữa các học phần, và tra đúng theo
 * địa chỉ thì breadcrumb không bao giờ hiện nhầm tên của bài vừa mở trước đó.
 */
@Injectable({ providedIn: 'root' })
export class UnitDirectory {
  private readonly names = signal<ReadonlyMap<string, string>>(new Map());

  register(courseId: string, entries: readonly UnitIndexEntry[]): void {
    this.names.update((current) => {
      const next = new Map(current);
      for (const entry of entries) next.set(keyOf(courseId, entry.moduleId, entry.id), entry.name);
      return next;
    });
  }

  /** Tên bài; null khi danh mục của học phần đó chưa tải xong. */
  nameOf(courseId: string, moduleId: ModuleId, unitId: string): string | null {
    return this.names().get(keyOf(courseId, moduleId, unitId)) ?? null;
  }
}

function keyOf(courseId: string, moduleId: ModuleId, unitId: string): string {
  return `${courseId}/${moduleId}/${unitId}`;
}
