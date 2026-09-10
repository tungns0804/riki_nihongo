import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { moduleOf } from '../../core/course/course.config';
import { LanguageStore } from '../../core/i18n/language-store';
import { T } from '../../core/i18n/t';
import { PracticeExample, PracticeQuestion } from '../../core/models/practice.model';
import { PracticeSessionStore } from '../../core/services/practice-session-store';
import { ProgressStore } from '../../core/services/progress-store';
import { splitAround } from '../../core/utils/text';

/**
 * Màn hình làm bài: mỗi lúc một câu.
 *
 * Hai nhịp cho mỗi câu — trả lời rồi mới sang câu sau — chứ không tự nhảy ngay khi
 * chọn đúng: khoảnh khắc học được nhiều nhất là lúc nhìn đáp án đúng bên cạnh câu
 * mình vừa trả lời, và nhịp đó phải do người học quyết định lúc nào kết thúc.
 *
 * Một câu có thể có HAI phần trên cùng một thẻ: câu hỏi về từ, rồi câu ví dụ đi kèm
 * (`followUp`). Phần sau hiện ngay khi phần trước vừa chấm xong, và nút "Câu tiếp
 * theo" chỉ hiện khi đã chấm xong cả hai.
 *
 * Phiên luyện chỉ nằm trong bộ nhớ (xem PracticeSessionStore), nên F5 giữa chừng là
 * mất — `practiceGuard` đưa về trang của bài thay vì hiện một màn hình trống.
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
  private readonly injector = inject(Injector);

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

  /** Đã chấm phần chính của câu này chưa. */
  protected readonly checked = signal(false);
  protected readonly wasCorrect = signal(false);

  /** Chuỗi người học vừa trả lời phần chính — ô nhập ở chế độ gõ, hoặc lựa chọn đã bấm. */
  protected readonly given = signal('');

  /** Câu ví dụ đi kèm của câu đang hỏi; null nếu câu này không có. */
  protected readonly followUp = computed(() => this.question()?.followUp ?? null);

  /** Câu ví dụ đang hiện trên thẻ: chỉ sau khi phần chính đã chấm. */
  protected readonly shownFollowUp = computed(() => (this.checked() ? this.followUp() : null));

  protected readonly followChecked = signal(false);
  protected readonly followCorrect = signal(false);
  protected readonly followGiven = signal('');

  /**
   * Cả thẻ đã chấm xong: phần chính, và câu ví dụ đi kèm nếu có. Chỉ lúc này mới hiện
   * danh sách câu ví dụ và nút sang câu sau.
   */
  protected readonly done = computed(
    () => this.checked() && (this.followUp() === null || this.followChecked()),
  );

  protected readonly isChoiceMode = computed(() => this.config()?.answerMode === 'choice');

  private readonly answerInput = viewChild<ElementRef<HTMLInputElement>>('answerInput');
  private readonly followInput = viewChild<ElementRef<HTMLInputElement>>('followInput');
  private readonly nextButton = viewChild<ElementRef<HTMLButtonElement>>('nextButton');

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
    // Có câu ví dụ thì đưa con trỏ xuống ô của nó luôn: gõ từ, Enter, gõ tiếp vào câu
    // mà không phải với tay ra chuột. Không có thì đưa tới nút sang câu sau.
    this.focusAfterRender(this.followUp() ? this.followInput : this.nextButton);
  }

  protected chooseFollowUp(choice: string): void {
    if (this.followChecked()) return;
    this.followGiven.set(choice);
    this.checkFollowUp();
  }

  protected checkFollowUp(): void {
    if (!this.checked() || this.followChecked() || !this.followGiven().trim()) return;
    this.followCorrect.set(this.session.answerFollowUp(this.followGiven()));
    this.followChecked.set(true);
    this.focusAfterRender(this.nextButton);
  }

  protected next(): void {
    if (!this.done()) return;

    if (!this.session.next()) {
      this.finish();
      return;
    }

    this.checked.set(false);
    this.wasCorrect.set(false);
    this.given.set('');
    this.followChecked.set(false);
    this.followCorrect.set(false);
    this.followGiven.set('');
    this.focusAfterRender(this.answerInput);
  }

  /**
   * Cắt câu ví dụ quanh từ đang học để tô đậm nó, đúng như bản in của giáo trình.
   *
   * Chỉ gọi sau khi đã chấm xong cả thẻ nên không sợ lộ đáp án: khối câu ví dụ chỉ
   * hiện ở phần phản hồi cuối.
   */
  protected parts(example: PracticeExample): { text: string; hit: boolean }[] {
    return splitAround(example.japanese, example.highlights);
  }

  /** Lớp CSS của một lựa chọn ở phần chính sau khi đã chấm. */
  protected stateOf(choice: string): string {
    const question = this.question();
    return question && this.checked() ? choiceState(choice, question, this.given()) : '';
  }

  /** Lớp CSS của một lựa chọn ở câu ví dụ sau khi đã chấm. */
  protected followStateOf(choice: string): string {
    const follow = this.followUp();
    return follow && this.followChecked() ? choiceState(choice, follow, this.followGiven()) : '';
  }

  /** Kết thúc phiên: ghi lại tiến độ rồi sang màn hình kết quả của đúng bài này. */
  protected finish(): void {
    const summary = this.session.finish();
    if (!summary) {
      void this.router.navigate(['/']);
      return;
    }

    this.progress.record(summary);
    const { moduleId, unitId } = summary.config;
    // replaceUrl: bấm Back ở màn kết quả thì về thẳng trang bài, không quay lại một
    // trang luyện tập mà phiên đã xong — guard cũng sẽ đẩy về đó, nhưng chậm một nhịp.
    void this.router.navigate(['/', moduleOf(moduleId).path, unitId, 'result'], {
      replaceUrl: true,
    });
  }

  /**
   * Đưa focus tới một phần tử SAU lượt vẽ kế tiếp: lúc gọi, phần tử đó thường chưa có
   * trong DOM — ô câu ví dụ chỉ hiện khi phần chính đã chấm, nút "Câu tiếp theo" chỉ
   * hiện khi cả thẻ đã chấm.
   *
   * Dùng `afterNextRender` chứ KHÔNG phải setTimeout(…, 0) như minano_nihongo: app này
   * bật `eventCoalescing` (xem app.config.ts) nên sau một cú bấm, Angular dồn việc vẽ
   * lại sang khung hình sau. Hẹn giờ 0ms chạy trước lúc đó, `viewChild` còn rỗng và cú
   * focus rơi vào hư không — đo được đúng như vậy ở chế độ trắc nghiệm: chấm xong câu
   * ví dụ mà nút sang câu sau không nhận focus, phải với chuột.
   *
   * preventScroll để trang không bị kéo đi khỏi khối phản hồi đang đọc.
   */
  private focusAfterRender(target: () => ElementRef<HTMLElement> | undefined): void {
    afterNextRender(() => target()?.nativeElement.focus({ preventScroll: true }), {
      injector: this.injector,
    });
  }
}

/** Sau khi chấm: đáp án đúng luôn xanh, lựa chọn sai người học vừa bấm thì đỏ. */
function choiceState(choice: string, question: PracticeQuestion, given: string): string {
  if (choice === question.answer) return 'is-correct';
  return choice === given ? 'is-wrong' : '';
}
