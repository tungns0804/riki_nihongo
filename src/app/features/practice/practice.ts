import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { LanguageStore } from '../../core/i18n/language-store';
import { T } from '../../core/i18n/t';
import { PracticeSessionStore } from '../../core/services/practice-session-store';
import { ProgressStore } from '../../core/services/progress-store';

/**
 * Màn hình làm bài: mỗi lúc một câu.
 *
 * Hai nhịp cho mỗi câu — trả lời rồi mới sang câu sau — chứ không tự nhảy ngay khi
 * chọn đúng: khoảnh khắc học được nhiều nhất là lúc nhìn đáp án đúng bên cạnh câu
 * mình vừa trả lời, và nhịp đó phải do người học quyết định lúc nào kết thúc.
 *
 * Phiên luyện chỉ nằm trong bộ nhớ (xem PracticeSessionStore), nên F5 giữa chừng là
 * mất — `practiceGuard` đưa về trang chủ thay vì hiện một màn hình trống.
 */
@Component({
  selector: 'app-practice',
  imports: [FormsModule, T],
  templateUrl: './practice.html',
  styleUrl: './practice.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Practice {
  private readonly session = inject(PracticeSessionStore);
  private readonly progress = inject(ProgressStore);
  private readonly router = inject(Router);
  private readonly lang = inject(LanguageStore);

  protected readonly t = this.lang.t.bind(this.lang);

  protected readonly config = this.session.config;
  protected readonly question = this.session.current;
  protected readonly total = this.session.total;
  protected readonly isLast = this.session.isLast;

  /** Số thứ tự câu đang hỏi, đếm từ 1 để hiển thị. */
  protected readonly position = computed(() => this.session.index() + 1);

  protected readonly percent = computed(() =>
    this.total() === 0 ? 0 : Math.round(((this.position() - 1) / this.total()) * 100),
  );

  /** Đã chấm câu này chưa. */
  protected readonly checked = signal(false);
  protected readonly wasCorrect = signal(false);

  /** Chuỗi người học vừa trả lời — ô nhập ở chế độ gõ, hoặc lựa chọn đã bấm. */
  protected readonly given = signal('');

  protected readonly isChoiceMode = computed(() => this.config()?.answerMode === 'choice');

  /** Chọn một đáp án trắc nghiệm: bấm là chấm luôn, không cần bấm thêm nút. */
  protected choose(choice: string): void {
    if (this.checked()) return;
    this.given.set(choice);
    this.check();
  }

  protected check(): void {
    if (this.checked() || !this.given().trim()) return;
    this.wasCorrect.set(this.session.answer(this.given()));
    this.checked.set(true);
  }

  protected next(): void {
    if (!this.checked()) return;

    if (!this.session.next()) {
      this.finish();
      return;
    }

    this.checked.set(false);
    this.wasCorrect.set(false);
    this.given.set('');
  }

  /** Lớp CSS của một lựa chọn sau khi đã chấm. */
  protected stateOf(choice: string): string {
    if (!this.checked()) return '';
    const question = this.question();
    if (!question) return '';
    if (choice === question.answer) return 'is-correct';
    return choice === this.given() ? 'is-wrong' : '';
  }

  /** Kết thúc phiên: ghi lại tiến độ rồi sang màn hình kết quả. */
  protected finish(): void {
    const summary = this.session.finish();
    if (summary) this.progress.record(summary);
    void this.router.navigate(['/result']);
  }
}
