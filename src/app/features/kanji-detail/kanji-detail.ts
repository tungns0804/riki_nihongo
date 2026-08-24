import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { moduleOf } from '../../core/course/course.config';
import { LanguageStore } from '../../core/i18n/language-store';
import { T } from '../../core/i18n/t';
import type { ModuleId } from '../../core/models/content.model';
import { loadUnit } from '../../core/services/unit-loader';
import { PracticeSetup } from '../shared/practice-setup/practice-setup';

/**
 * Một bài kanji: mỗi chữ là một thẻ riêng chứ không phải một dòng bảng.
 *
 * Lý do không dùng bảng như bài từ vựng: một chữ có tới bốn nhóm thông tin dài ngắn
 * rất khác nhau (âm On, âm Kun, nghĩa, và một danh sách từ ghép). Nhồi vào một hàng
 * thì hàng nào cũng cao khác nhau và mắt không bám được cột.
 */
@Component({
  selector: 'app-kanji-detail',
  imports: [RouterLink, T, PracticeSetup],
  templateUrl: './kanji-detail.html',
  styleUrl: './kanji-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KanjiDetail {
  private readonly lang = inject(LanguageStore);

  protected readonly t = this.lang.t.bind(this.lang);

  readonly id = input.required<string>();
  readonly moduleId = input.required<ModuleId>();

  protected readonly module = computed(() => moduleOf(this.moduleId()));

  private readonly resource = loadUnit(this.moduleId, this.id);
  protected readonly unit = this.resource.unit;
  protected readonly loading = this.resource.loading;
  protected readonly notFound = this.resource.notFound;

  protected readonly entries = computed(() => this.unit()?.kanji ?? []);
}
