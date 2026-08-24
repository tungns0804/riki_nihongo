import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';

import { LanguageStore } from '../../../core/i18n/language-store';
import { T } from '../../../core/i18n/t';
import type { QuizQuestion } from '../../../core/models/content.model';

/**
 * Khối câu hỏi trả lời tại chỗ, dùng cho bài đọc và bài nghe.
 *
 * Khác với màn hình luyện tập (một câu một màn, có chấm điểm cuối phiên): ở đây
 * câu hỏi nằm ngay cạnh bài đọc, trả lời xong hiện luôn đúng/sai và lời giải, và
 * không có điểm tổng. Đọc hiểu là việc quay đi quay lại giữa bài và câu hỏi, ép
 * vào khuôn "một câu một màn" thì mất chính cái thao tác đó.
 */
@Component({
  selector: 'app-quiz-block',
  imports: [T],
  templateUrl: './quiz-block.html',
  styleUrl: './quiz-block.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuizBlock {
  private readonly lang = inject(LanguageStore);

  protected readonly t = this.lang.t.bind(this.lang);

  readonly questions = input.required<readonly QuizQuestion[]>();

  /** { [questionId]: id lựa chọn đã chọn }. Một câu chỉ trả lời được một lần. */
  private readonly picked = signal<Record<string, string>>({});

  protected readonly answeredCount = computed(() => Object.keys(this.picked()).length);

  protected pickedOf(questionId: string): string | null {
    return this.picked()[questionId] ?? null;
  }

  protected isAnswered(questionId: string): boolean {
    return questionId in this.picked();
  }

  protected pick(question: QuizQuestion, choiceId: string): void {
    // Đã trả lời thì không đổi được nữa: đổi sau khi đã thấy đáp án thì con số
    // "đúng mấy câu" không còn nghĩa gì.
    if (this.isAnswered(question.id)) return;
    this.picked.update((current) => ({ ...current, [question.id]: choiceId }));
  }

  /** Lớp CSS của một lựa chọn sau khi đã chấm. */
  protected stateOf(question: QuizQuestion, choiceId: string): string {
    if (!this.isAnswered(question.id)) return '';
    if (choiceId === question.answerId) return 'is-correct';
    return this.pickedOf(question.id) === choiceId ? 'is-wrong' : '';
  }

  protected isRight(question: QuizQuestion): boolean {
    return this.pickedOf(question.id) === question.answerId;
  }

  protected reset(): void {
    this.picked.set({});
  }
}
