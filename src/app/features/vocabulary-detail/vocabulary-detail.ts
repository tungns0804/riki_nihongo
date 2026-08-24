import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { moduleOf } from '../../core/course/course.config';
import { LanguageStore } from '../../core/i18n/language-store';
import { T } from '../../core/i18n/t';
import type { ModuleId } from '../../core/models/content.model';
import { loadUnit } from '../../core/services/unit-loader';
import { PracticeSetup } from '../shared/practice-setup/practice-setup';

/**
 * Một bài từ vựng: khung thiết lập luyện tập ở trên, danh sách từ ở dưới.
 *
 * Mỗi từ là một THẺ chứ không phải một hàng bảng, và bố cục thẻ đi theo đúng bản
 * PDF của giáo trình: số thứ tự, từ và nghĩa ở cột trái, câu ví dụ cùng các dòng
 * 合 / 対 / 関 / 連 ở cột phải. Bảng không chứa nổi phần bên phải — một từ có tới
 * năm sáu câu ví dụ, và ô bảng cao bằng cả màn hình thì cột bên cạnh trống trơn.
 */
@Component({
  selector: 'app-vocabulary-detail',
  imports: [RouterLink, T, PracticeSetup],
  templateUrl: './vocabulary-detail.html',
  styleUrl: './vocabulary-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VocabularyDetail {
  private readonly lang = inject(LanguageStore);

  protected readonly t = this.lang.t.bind(this.lang);

  readonly id = input.required<string>();
  readonly moduleId = input.required<ModuleId>();

  protected readonly module = computed(() => moduleOf(this.moduleId()));

  private readonly resource = loadUnit(this.moduleId, this.id);
  protected readonly unit = this.resource.unit;
  protected readonly loading = this.resource.loading;
  protected readonly notFound = this.resource.notFound;

  protected readonly words = computed(() => this.unit()?.words ?? []);
}
