import { Injectable, signal } from '@angular/core';

import type { ModuleId } from '../models/content.model';
import { readJson, writeJson } from './local-storage';

const STORAGE_KEY = 'riki:recent';

/** Giữ bấy nhiêu bài gần nhất — trang gốc chỉ hiện vài bài, dư ra để bỏ bài trùng. */
const KEEP = 6;

/** Một bài vừa mở. */
export interface RecentEntry {
  courseId: string;
  moduleId: ModuleId;
  unitId: string;
  /** Tên bài lúc mở — trang gốc không tải danh mục của học phần nào nên phải nhớ sẵn. */
  name: string;
  /** Địa chỉ của trang bài, dạng `/n3-junbi/vocabulary/01-danh-tu`. */
  path: string;
}

/**
 * Các bài mở gần đây, MỚI NHẤT TRƯỚC — chép theo `RecentStore` của minano_nihongo.
 *
 * Dùng ở hai chỗ: khối "Học tiếp" ở trang gốc (quay lại đúng bài đang dở mà không phải
 * đi qua học phần → phần học → bài), và nhãn "Đang học" trên thẻ của bài mở gần nhất.
 *
 * Một bản cho cả ứng dụng: trang gốc đứng trên mọi học phần.
 */
@Injectable({ providedIn: 'root' })
export class RecentStore {
  private readonly entriesRef = signal<RecentEntry[]>(sanitize(readJson<unknown>(STORAGE_KEY, [])));

  readonly entries = this.entriesRef.asReadonly();

  /** Ghi một bài vừa mở lên đầu danh sách. */
  record(entry: RecentEntry): void {
    const rest = this.entriesRef().filter((item) => item.path !== entry.path);
    const next = [entry, ...rest].slice(0, KEEP);
    this.entriesRef.set(next);
    writeJson(STORAGE_KEY, next);
  }

  /** Bài mở gần nhất của một học phần, hoặc null. */
  latestIn(courseId: string): RecentEntry | null {
    return this.entriesRef().find((item) => item.courseId === courseId) ?? null;
  }
}

function sanitize(raw: unknown): RecentEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (item): item is RecentEntry =>
      !!item &&
      typeof item === 'object' &&
      ['courseId', 'moduleId', 'unitId', 'name', 'path'].every(
        (field) => typeof (item as Record<string, unknown>)[field] === 'string',
      ),
  );
}
