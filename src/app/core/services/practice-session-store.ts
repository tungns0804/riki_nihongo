import { Injectable, computed, signal } from '@angular/core';

import {
  AnswerRecord,
  PracticeConfig,
  PracticeQuestion,
  QuestionResult,
  SessionSummary,
} from '../models/practice.model';
import { isAnswerCorrect } from '../utils/answer-check';

/**
 * Phiên luyện tập đang diễn ra.
 *
 * Sống trong bộ nhớ, KHÔNG lưu xuống localStorage: mỗi lần luyện là một lần mới.
 * Ba màn hình dùng chung nó — màn hình chi tiết bài (bấm bắt đầu), màn hình luyện
 * tập (trả lời), màn hình kết quả (đọc tổng kết) — nên nó là service ở cấp gốc chứ
 * không phải state trong một component.
 *
 * Vì phiên chỉ nằm trong bộ nhớ nên F5 giữa chừng là mất. Đó là lý do có hai guard
 * ở `core/guards/session.guards.ts`: vào thẳng trang luyện tập hay trang kết quả mà
 * không có phiên của đúng bài đó thì đưa về trang của bài thay vì hiện màn hình trống.
 */
@Injectable({ providedIn: 'root' })
export class PracticeSessionStore {
  private readonly configRef = signal<PracticeConfig | null>(null);
  private readonly questionsRef = signal<PracticeQuestion[]>([]);
  private readonly resultsRef = signal<QuestionResult[]>([]);
  private readonly indexRef = signal(0);
  private readonly summaryRef = signal<SessionSummary | null>(null);
  private startedAt = 0;

  readonly config = this.configRef.asReadonly();
  readonly questions = this.questionsRef.asReadonly();
  readonly index = this.indexRef.asReadonly();
  readonly summary = this.summaryRef.asReadonly();

  /** Có phiên đang làm dở không — guard của trang luyện tập hỏi cái này. */
  readonly hasSession = computed(() => this.questionsRef().length > 0);

  readonly total = computed(() => this.questionsRef().length);

  readonly current = computed<PracticeQuestion | null>(
    () => this.questionsRef()[this.indexRef()] ?? null,
  );

  readonly correctCount = computed(
    () => this.resultsRef().filter((result) => result.isCorrect).length,
  );

  /** Câu hiện tại là câu cuối cùng chưa. */
  readonly isLast = computed(() => this.indexRef() >= this.questionsRef().length - 1);

  start(config: PracticeConfig, questions: PracticeQuestion[]): void {
    this.configRef.set(config);
    this.questionsRef.set(questions);
    this.resultsRef.set([]);
    this.indexRef.set(0);
    this.summaryRef.set(null);
    this.startedAt = Date.now();
  }

  /**
   * Chấm phần chính của câu đang hỏi và ghi lại kết quả.
   *
   * Chấm ở đây chứ không ở component: màn hình luyện tập chỉ biết người dùng vừa
   * gõ gì, còn "gõ thế có đúng không" là luật của cả ứng dụng.
   *
   * Câu có câu ví dụ đi kèm thì lúc này CHƯA biết cả câu đúng hay sai: phần câu ví dụ
   * ghi tạm là bỏ qua, chờ `answerFollowUp` điền nốt. Dừng luyện giữa chừng thì nó giữ
   * nguyên là bỏ qua — đúng với việc người học chưa trả lời phần đó.
   */
  answer(given: string): boolean {
    const question = this.current();
    if (!question) return false;

    const main: AnswerRecord = { given, isCorrect: grade(question, given) };
    const followUp: AnswerRecord | null = question.followUp ? { given: '', isCorrect: false } : null;
    this.resultsRef.update((results) => [
      ...results,
      { question, main, followUp, isCorrect: main.isCorrect && followUp === null },
    ]);
    return main.isCorrect;
  }

  /** Chấm câu ví dụ đi kèm của câu đang hỏi. Chỉ có nghĩa sau khi đã gọi `answer`. */
  answerFollowUp(given: string): boolean {
    const question = this.current();
    const results = this.resultsRef();
    const last = results[results.length - 1];
    if (!question?.followUp || last?.question !== question) return false;

    const followUp: AnswerRecord = { given, isCorrect: grade(question.followUp, given) };
    this.resultsRef.set([
      ...results.slice(0, -1),
      { ...last, followUp, isCorrect: last.main.isCorrect && followUp.isCorrect },
    ]);
    return followUp.isCorrect;
  }

  /** Sang câu tiếp theo. Trả về false khi đã hết câu. */
  next(): boolean {
    if (this.isLast()) return false;
    this.indexRef.update((value) => value + 1);
    return true;
  }

  /**
   * Kết thúc phiên và dựng bản tổng kết cho màn hình kết quả.
   *
   * Câu chưa trả lời (bấm dừng giữa chừng) được ghi là bỏ qua chứ không bị lờ đi:
   * "8/10 đúng" khi mới làm 8 câu là một con số nói dối.
   */
  finish(): SessionSummary | null {
    const config = this.configRef();
    if (!config) return null;

    const answered = this.resultsRef();
    const skipped: QuestionResult[] = this.questionsRef()
      .slice(answered.length)
      .map((question) => ({
        question,
        main: { given: '', isCorrect: false },
        followUp: question.followUp ? { given: '', isCorrect: false } : null,
        isCorrect: false,
      }));

    const results = [...answered, ...skipped];
    const correctCount = results.filter((result) => result.isCorrect).length;

    const summary: SessionSummary = {
      config,
      total: results.length,
      correctCount,
      wrongCount: results.length - correctCount,
      durationMs: Date.now() - this.startedAt,
      results,
    };

    this.summaryRef.set(summary);
    this.questionsRef.set([]);
    this.resultsRef.set([]);
    this.indexRef.set(0);
    return summary;
  }

  /** Xoá sạch, kể cả bản tổng kết — dùng khi rời hẳn khu luyện tập. */
  clear(): void {
    this.configRef.set(null);
    this.questionsRef.set([]);
    this.resultsRef.set([]);
    this.indexRef.set(0);
    this.summaryRef.set(null);
  }
}

/** Chấm một chuỗi trả lời cho một câu hỏi. */
function grade(question: PracticeQuestion, given: string): boolean {
  return isAnswerCorrect(given, question.acceptedAnswers, {
    // Đáp án tiếng Nhật thì không có dấu tiếng Việt để mà bỏ qua; đáp án tiếng
    // Việt thì bỏ qua dấu, vì gõ tiếng Việt có dấu trên bàn phím Nhật rất cực.
    ignoreDiacritics: !question.answerIsJapanese,
  });
}
