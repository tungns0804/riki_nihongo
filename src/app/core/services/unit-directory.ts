import { Injectable, signal } from '@angular/core';

import type { ModuleId, UnitIndexEntry } from '../models/content.model';

/** Những gì vỏ ứng dụng cần biết về một bài: tên để hiện, bài mẹ để đi qua. */
interface DirectoryEntry {
  name: string;
  /** Id bài mẹ; rỗng nghĩa là bài đứng độc lập. */
  parent: string;
}

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
  private readonly items = signal<ReadonlyMap<string, DirectoryEntry>>(new Map());

  register(courseId: string, entries: readonly UnitIndexEntry[]): void {
    this.items.update((current) => {
      const next = new Map(current);
      for (const entry of entries) {
        next.set(keyOf(courseId, entry.moduleId, entry.id), {
          name: entry.name,
          parent: entry.parent,
        });
      }
      return next;
    });
  }

  /** Tên bài; null khi danh mục của học phần đó chưa tải xong. */
  nameOf(courseId: string, moduleId: ModuleId, unitId: string): string | null {
    return this.items().get(keyOf(courseId, moduleId, unitId))?.name ?? null;
  }

  /**
   * Id bài mẹ của một bài, ví dụ "01-danh-tu" của BTVN 1–10. Rỗng nghĩa là bài đứng
   * độc lập (hoặc danh mục chưa tải xong) — breadcrumb khi đó không thêm cấp nào.
   */
  parentOf(courseId: string, moduleId: ModuleId, unitId: string): string {
    return this.items().get(keyOf(courseId, moduleId, unitId))?.parent ?? '';
  }
}

function keyOf(courseId: string, moduleId: ModuleId, unitId: string): string {
  return `${courseId}/${moduleId}/${unitId}`;
}
