import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';

import { COURSE, moduleOf } from '../../../core/course/course.config';
import { LanguageStore } from '../../../core/i18n/language-store';
import { T } from '../../../core/i18n/t';
import type { Unit } from '../../../core/models/content.model';
import { buildQuestions, testConfig } from '../../../core/practice/build-questions';
import { PracticeSessionStore } from '../../../core/services/practice-session-store';
import { ProgressStore } from '../../../core/services/progress-store';

/**
 * Khung bắt đầu làm ĐỀ, đứng đúng chỗ của khung thiết lập luyện tập trên trang một bài.
 *
 * Dùng cho bài dạng đề nằm trong phần lý thuyết — "Đề thi thật ôn tập N4" là một bài
 * của phần Ngữ pháp chứ không phải một phần riêng (xem grammar-detail).
 *
 * Không có gì để thiết lập: đề làm cả bài, giữ nguyên thứ tự, trả lời bằng bốn lựa
 * chọn của đề. Nên khung này chỉ nói bài dài bao nhiêu câu, lần làm tốt nhất được bao
 * nhiêu, rồi đưa thẳng sang màn hình làm đề.
 */
@Component({
  selector: 'app-test-start',
  imports: [T],
  templateUrl: './test-start.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestStart {
  private readonly session = inject(PracticeSessionStore);
  private readonly progress = inject(ProgressStore);
  private readonly router = inject(Router);
  private readonly course = inject(COURSE);
  private readonly lang = inject(LanguageStore);

  protected readonly t = this.lang.t.bind(this.lang);

  readonly unit = input.required<Unit>();

  protected readonly questions = computed(() => buildQuestions(this.unit(), testConfig(this.unit())));

  /** Tỉ lệ đúng tốt nhất của bài này; null nghĩa là chưa làm lần nào (0% cũng là đã làm). */
  protected readonly best = computed(() => this.progress.bestPercent(this.unit().id));

  protected start(): void {
    const unit = this.unit();
    const questions = this.questions();
    if (questions.length === 0) return;

    const config = testConfig(unit);
    this.session.start(config, questions);
    // Đoạn cuối là `test-run` chứ không phải `practice`: cùng một bài có thể mở bằng
    // hai màn hình khác nhau, nên địa chỉ phải nói rõ đang làm đề (xem app.routes.ts).
    void this.router.navigate([
      '/',
      this.course.id,
      moduleOf(config.moduleId).path,
      config.unitId,
      'test-run',
    ]);
  }
}
