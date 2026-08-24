import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { moduleOf } from '../../core/course/course.config';
import { LanguageStore } from '../../core/i18n/language-store';
import { T } from '../../core/i18n/t';
import type { ModuleId } from '../../core/models/content.model';
import { loadUnit } from '../../core/services/unit-loader';
import { PracticeSetup } from '../shared/practice-setup/practice-setup';

/**
 * Một bài ngữ pháp — dùng cho cả phần "Ngữ pháp" và phần "Ngữ pháp MIMIKARA
 * OBOERU": hai giáo trình khác nhau nhưng cùng một hình dạng dữ liệu.
 *
 * Đây là trang LÝ THUYẾT, dài nhất trong cả ứng dụng: một bài có thể có năm mẫu,
 * mỗi mẫu vài cách dùng, mỗi cách dùng vài ví dụ. Vì thế có mục lục ở đầu trang —
 * và mục lục dùng `fragment` của router chứ không phải href="#…", vì bản chạy bằng
 * file:// định tuyến bằng dấu # nên href như vậy sẽ bị hiểu là một đường dẫn khác.
 */
@Component({
  selector: 'app-grammar-detail',
  imports: [RouterLink, T, PracticeSetup],
  templateUrl: './grammar-detail.html',
  styleUrl: './grammar-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GrammarDetail {
  private readonly lang = inject(LanguageStore);

  protected readonly t = this.lang.t.bind(this.lang);

  readonly id = input.required<string>();
  readonly moduleId = input.required<ModuleId>();

  protected readonly module = computed(() => moduleOf(this.moduleId()));

  private readonly resource = loadUnit(this.moduleId, this.id);
  protected readonly unit = this.resource.unit;
  protected readonly loading = this.resource.loading;
  protected readonly notFound = this.resource.notFound;

  protected readonly points = computed(() => this.unit()?.points ?? []);

  /** Mục lục chỉ có ích khi bài có nhiều hơn một mẫu. */
  protected readonly showToc = computed(() => this.points().length > 1);

  /**
   * Cuộn tới một mẫu. Tự viết thay vì dựa vào `fragment` của router: neo bằng
   * fragment sẽ ghi thêm một mục vào lịch sử duyệt cho MỖI lần bấm mục lục, và
   * người dùng phải bấm Back cả chục lần mới ra khỏi trang.
   */
  protected scrollToPoint(pointId: string): void {
    document.getElementById(`point-${pointId}`)?.scrollIntoView({ block: 'start' });
  }
}
