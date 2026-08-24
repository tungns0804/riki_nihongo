import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';

import { LanguageStore } from '../../../core/i18n/language-store';
import { T } from '../../../core/i18n/t';
import type { Unit } from '../../../core/models/content.model';
import {
  AnswerMode,
  DIRECTIONS,
  PracticeConfig,
  PracticeDirection,
  QUESTION_LIMITS,
} from '../../../core/models/practice.model';
import { buildQuestions, directionIsUsable } from '../../../core/practice/build-questions';
import { PracticeSessionStore } from '../../../core/services/practice-session-store';

/**
 * Khung thiết lập luyện tập, đặt ở đầu mọi màn hình chi tiết bài có luyện được.
 *
 * Bốn phần chi tiết (từ vựng, kanji, ngữ pháp, mimikara) dùng chung khung này. Nó
 * tự ẩn những chiều hỏi mà bài không luyện được — bài từ vựng chưa khai báo cách
 * đọc thì chiều "Nhật → Cách đọc" biến mất, thay vì cho chọn rồi hỏi một loạt câu
 * có đáp án rỗng.
 */
@Component({
  selector: 'app-practice-setup',
  imports: [T],
  templateUrl: './practice-setup.html',
  styleUrl: './practice-setup.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PracticeSetup {
  private readonly session = inject(PracticeSessionStore);
  private readonly router = inject(Router);
  private readonly lang = inject(LanguageStore);

  protected readonly t = this.lang.t.bind(this.lang);

  readonly unit = input.required<Unit>();

  protected readonly answerMode = signal<AnswerMode>('choice');
  protected readonly limit = signal<number | null>(20);
  protected readonly limits = QUESTION_LIMITS;

  private readonly directionRef = signal<PracticeDirection>('jp-vi');

  /** Các chiều luyện được với bài đang mở. */
  protected readonly directions = computed(() =>
    DIRECTIONS.filter((info) => directionIsUsable(this.unit(), info.id)),
  );

  /**
   * Chiều đang có hiệu lực. Chọn một chiều rồi chuyển sang bài không có cách đọc thì
   * quay về chiều đầu tiên còn dùng được, chứ không giữ một lựa chọn đã vô nghĩa.
   */
  protected readonly direction = computed<PracticeDirection>(() => {
    const current = this.directionRef();
    const usable = this.directions();
    return usable.some((info) => info.id === current) ? current : usable[0]?.id ?? 'jp-vi';
  });

  /** Số câu thực sự dựng được — hiện ngay trên nút bắt đầu để không hứa suông. */
  protected readonly available = computed(
    () =>
      buildQuestions(this.unit(), {
        ...this.config(),
        questionLimit: null,
      }).length,
  );

  private config(): PracticeConfig {
    const unit = this.unit();
    return {
      moduleId: unit.moduleId,
      unitId: unit.id,
      unitName: unit.name,
      answerMode: this.answerMode(),
      direction: this.direction(),
      questionLimit: this.limit(),
    };
  }

  protected setMode(mode: AnswerMode): void {
    this.answerMode.set(mode);
  }

  protected setDirection(direction: PracticeDirection): void {
    this.directionRef.set(direction);
  }

  protected setLimit(limit: number | null): void {
    this.limit.set(limit);
  }

  protected start(): void {
    const config = this.config();
    const questions = buildQuestions(this.unit(), config);
    if (questions.length === 0) return;

    this.session.start(config, questions);
    void this.router.navigate(['/practice']);
  }
}
