import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { moduleOf } from '../../core/course/course.config';
import { LanguageStore } from '../../core/i18n/language-store';
import { T } from '../../core/i18n/t';
import type { ModuleId } from '../../core/models/content.model';
import { loadUnit } from '../../core/services/unit-loader';
import { QuizBlock } from '../shared/quiz-block/quiz-block';

/**
 * Một bài đọc hiểu: bài đọc, câu hỏi trả lời tại chỗ, từ vựng của bài.
 *
 * Bản dịch mặc định ẨN. Đọc hiểu là đoán nghĩa từ ngữ cảnh; để bản dịch nằm sẵn
 * bên cạnh thì mắt sẽ chạy sang đó trước khi kịp đoán, và bài đọc thành bài đối
 * chiếu song ngữ.
 */
@Component({
  selector: 'app-reading-detail',
  imports: [RouterLink, T, QuizBlock],
  templateUrl: './reading-detail.html',
  styleUrl: './reading-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReadingDetail {
  private readonly lang = inject(LanguageStore);

  protected readonly t = this.lang.t.bind(this.lang);

  readonly id = input.required<string>();
  readonly moduleId = input.required<ModuleId>();

  protected readonly module = computed(() => moduleOf(this.moduleId()));

  private readonly resource = loadUnit(this.moduleId, this.id);
  protected readonly unit = this.resource.unit;
  protected readonly loading = this.resource.loading;
  protected readonly notFound = this.resource.notFound;

  protected readonly passages = computed(() => this.unit()?.passages ?? []);

  /** Id các bài đọc đang mở bản dịch. */
  private readonly translated = signal<ReadonlySet<string>>(new Set());

  protected showsTranslation(passageId: string): boolean {
    return this.translated().has(passageId);
  }

  protected toggleTranslation(passageId: string): void {
    this.translated.update((current) => {
      const next = new Set(current);
      next.has(passageId) ? next.delete(passageId) : next.add(passageId);
      return next;
    });
  }
}
