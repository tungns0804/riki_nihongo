import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { moduleOf } from '../../core/course/course.config';
import { LanguageStore } from '../../core/i18n/language-store';
import { T } from '../../core/i18n/t';
import type { ModuleId } from '../../core/models/content.model';
import { loadUnit } from '../../core/services/unit-loader';
import { PracticeSetup } from '../shared/practice-setup/practice-setup';

/**
 * Một bài từ vựng: khung thiết lập luyện tập ở trên, bảng từ ở dưới.
 *
 * Bảng ẩn những cột mà cả bài không từ nào có (âm Hán Việt với bài toàn katakana,
 * câu ví dụ với bài chưa soạn ví dụ). Cột trống suốt từ trên xuống dưới chỉ làm
 * bảng rộng thêm và đẩy các cột có nội dung ra ngoài màn hình.
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

  protected readonly hasHanViet = computed(() =>
    this.words().some((word) => word.hanViet.length > 0),
  );
  protected readonly hasReading = computed(() =>
    this.words().some((word) => word.reading.length > 0),
  );
  protected readonly hasExample = computed(() =>
    this.words().some((word) => word.example.length > 0),
  );
}
