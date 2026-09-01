import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { moduleOf } from '../../core/course/course.config';
import { LanguageStore } from '../../core/i18n/language-store';
import { T } from '../../core/i18n/t';
import type { ModuleId, UnitIndexEntry } from '../../core/models/content.model';
import type { PracticeConfig } from '../../core/models/practice.model';
import { buildQuestions } from '../../core/practice/build-questions';
import { ContentStore } from '../../core/services/content-store';
import { PracticeSessionStore } from '../../core/services/practice-session-store';
import { ProgressStore } from '../../core/services/progress-store';

/**
 * Bài kiểm tra nhập môn N3.
 *
 * Khác mọi phần còn lại ở chỗ nó KHÔNG có màn hình chi tiết: xem trước đề thì bài
 * kiểm tra đầu vào không còn đo được gì. Bấm bắt đầu là vào thẳng màn hình làm bài,
 * và kết quả chấm theo từng kỹ năng ở màn hình kết quả.
 *
 * Đề không bị trộn câu (xem `buildQuestions`) và không giới hạn số câu: một bài
 * kiểm tra phải giữ nguyên như người ra đề đã sắp.
 */
@Component({
  selector: 'app-entrance-test',
  imports: [RouterLink, T],
  templateUrl: './entrance-test.html',
  styleUrl: './entrance-test.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntranceTest {
  private readonly content = inject(ContentStore);
  private readonly session = inject(PracticeSessionStore);
  private readonly progress = inject(ProgressStore);
  private readonly router = inject(Router);
  private readonly lang = inject(LanguageStore);

  protected readonly t = this.lang.t.bind(this.lang);

  readonly moduleId = input.required<ModuleId>();

  protected readonly module = computed(() => moduleOf(this.moduleId()));
  protected readonly status = this.content.status;
  protected readonly errorKey = this.content.errorKey;

  protected readonly tests = computed(() => this.content.unitsOf(this.moduleId()));

  /** Id đề đang được tải sau khi bấm bắt đầu — để khoá nút và báo đang chờ. */
  protected readonly starting = signal<string | null>(null);

  constructor() {
    void this.content.loadIndex();
  }

  protected bestPercent(unitId: string): number | null {
    return this.progress.bestPercent(unitId);
  }

  protected async start(entry: UnitIndexEntry): Promise<void> {
    if (this.starting()) return;
    this.starting.set(entry.id);

    try {
      const unit = await this.content.getUnit(entry.moduleId, entry.id);
      if (!unit) return;

      const config: PracticeConfig = {
        moduleId: unit.moduleId,
        unitId: unit.id,
        unitName: unit.name,
        answerMode: 'choice',
        direction: 'jp-vi',
        questionLimit: null,
        group: null,
      };

      const questions = buildQuestions(unit, config);
      if (questions.length === 0) return;

      this.session.start(config, questions);
      await this.router.navigate(['/practice']);
    } finally {
      this.starting.set(null);
    }
  }

  protected reload(): void {
    void this.content.loadIndex(true);
  }
}
