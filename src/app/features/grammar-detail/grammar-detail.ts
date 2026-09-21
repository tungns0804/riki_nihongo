import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { COURSE, moduleOf } from '../../core/course/course.config';
import { LanguageStore } from '../../core/i18n/language-store';
import { T } from '../../core/i18n/t';
import type { ModuleId } from '../../core/models/content.model';
import { loadUnit } from '../../core/services/unit-loader';
import { PracticeSetup } from '../shared/practice-setup/practice-setup';
import { TestStart } from '../shared/test-start/test-start';

/**
 * Một bài ngữ pháp — dùng cho cả phần "Ngữ pháp" và phần "Ngữ pháp MIMIKARA
 * OBOERU": hai giáo trình khác nhau nhưng cùng một hình dạng dữ liệu.
 *
 * Đây là trang LÝ THUYẾT, dài nhất trong cả ứng dụng: một bài có năm mẫu, mỗi mẫu
 * vài cách dùng, mỗi cách dùng vài ví dụ. Vì thế đầu trang có bảng "Tóm tắt ngữ
 * pháp" — Ý nghĩa và Cấu trúc của từng mẫu, như slide tổng hợp cuối bài giảng — để
 * nắm cả bài trước khi đọc chi tiết. Bấm tên mẫu trong bảng thì cuộn tới mẫu đó.
 *
 * Một bài của phần này có thể là ĐỀ thay vì lý thuyết ("Đề thi thật ôn tập N4" —
 * `"kind": "test"` trong meta.json). Trên website Riki đó là một bài nằm giữa các bài
 * ngữ pháp chứ không phải một phần riêng, nên nó vào đúng chỗ này trong menu: trang
 * bài khi đó chỉ có khung bắt đầu làm đề (xem TestStart), phần lý thuyết bên dưới
 * không có gì để hiện.
 */
@Component({
  selector: 'app-grammar-detail',
  imports: [RouterLink, T, PracticeSetup, TestStart],
  templateUrl: './grammar-detail.html',
  styleUrl: './grammar-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GrammarDetail {
  private readonly lang = inject(LanguageStore);

  protected readonly t = this.lang.t.bind(this.lang);

  readonly id = input.required<string>();
  readonly moduleId = input.required<ModuleId>();

  protected readonly course = inject(COURSE);
  protected readonly module = computed(() => moduleOf(this.moduleId()));

  private readonly resource = loadUnit(this.moduleId, this.id);
  protected readonly unit = this.resource.unit;
  protected readonly loading = this.resource.loading;
  protected readonly notFound = this.resource.notFound;

  protected readonly points = computed(() => this.unit()?.points ?? []);

  /** Bảng tóm tắt chỉ có ích khi bài có nhiều hơn một mẫu; một mẫu thì nó lặp lại y nguyên thẻ bên dưới. */
  protected readonly showOverview = computed(() => this.points().length > 1);

  /**
   * Cuộn tới một mẫu. Tự viết thay vì dựa vào `fragment` của router: neo bằng
   * fragment sẽ ghi thêm một mục vào lịch sử duyệt cho MỖI lần bấm, và người dùng
   * phải bấm Back cả chục lần mới ra khỏi trang. Cũng không dùng href="#…": bản chạy
   * bằng file:// định tuyến bằng dấu # nên href đó bị hiểu là một đường dẫn khác.
   */
  protected scrollToPoint(pointId: string): void {
    document.getElementById(`point-${pointId}`)?.scrollIntoView({ block: 'start' });
  }
}
