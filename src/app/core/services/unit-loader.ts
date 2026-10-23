import { Signal, effect, inject, signal } from '@angular/core';

import { COURSE, moduleOf } from '../course/course.config';
import type { ModuleId, Unit } from '../models/content.model';
import { ContentStore } from './content-store';
import { RecentStore } from './recent-store';

export interface UnitResource {
  unit: Signal<Unit | null>;
  loading: Signal<boolean>;
  /** Đã tải xong và kết luận là không có bài này. */
  notFound: Signal<boolean>;
}

/**
 * Tải nội dung một bài theo `moduleId` + `id` lấy từ route.
 *
 * Cả năm màn hình chi tiết đều cần đúng ba trạng thái này (đang tải / có bài /
 * không có bài) và đều phải tải lại khi người dùng bấm sang bài khác mà không rời
 * component. Viết một lần ở đây thay vì năm lần trong năm component.
 *
 * Bài tải được thì ghi vào "bài mở gần đây" (RecentStore) — nguồn của khối "Học tiếp"
 * ở trang gốc và nhãn "Đang học" trên thẻ bài. Ghi ở đây vì đây là chỗ DUY NHẤT cả năm
 * màn hình chi tiết đi qua.
 *
 * Phải gọi trong ngữ cảnh khởi tạo (field initializer hoặc constructor) vì bên
 * trong có `inject` và `effect`.
 */
export function loadUnit(moduleId: Signal<ModuleId>, id: Signal<string>): UnitResource {
  const content = inject(ContentStore);
  const course = inject(COURSE);
  const recent = inject(RecentStore);

  const unit = signal<Unit | null>(null);
  const loading = signal(true);
  const notFound = signal(false);

  effect(() => {
    const currentModule = moduleId();
    const currentId = id();

    unit.set(null);
    loading.set(true);
    notFound.set(false);

    void content.getUnit(currentModule, currentId).then((loaded) => {
      // Người dùng có thể đã bấm sang bài khác trong lúc đợi: kết quả về muộn của
      // bài cũ không được phép ghi đè bài đang mở.
      if (moduleId() !== currentModule || id() !== currentId) return;

      unit.set(loaded);
      loading.set(false);
      notFound.set(loaded === null);

      if (loaded) {
        recent.record({
          courseId: course.id,
          moduleId: currentModule,
          unitId: currentId,
          name: loaded.name,
          path: `/${course.id}/${moduleOf(currentModule).path}/${currentId}`,
        });
      }
    });
  });

  return { unit: unit.asReadonly(), loading: loading.asReadonly(), notFound: notFound.asReadonly() };
}
