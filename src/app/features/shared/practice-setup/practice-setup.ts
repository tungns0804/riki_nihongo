import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  model,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';

import { COURSE, moduleOf } from '../../../core/course/course.config';
import { LanguageStore } from '../../../core/i18n/language-store';
import { T } from '../../../core/i18n/t';
import { Unit, groupsOf } from '../../../core/models/content.model';
import {
  AnswerMode,
  DIRECTIONS,
  PracticeConfig,
  PracticeDirection,
  QUESTION_LIMITS,
} from '../../../core/models/practice.model';
import {
  KANJI_WORD_DIRECTIONS,
  buildQuestions,
  directionIsUsable,
  kanjiWordsUnit,
  pairsWithExample,
} from '../../../core/practice/build-questions';
import { PracticeSessionStore } from '../../../core/services/practice-session-store';
import { ProgressStore } from '../../../core/services/progress-store';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PracticeSetup {
  private readonly session = inject(PracticeSessionStore);
  private readonly progress = inject(ProgressStore);
  private readonly course = inject(COURSE);
  private readonly router = inject(Router);
  private readonly lang = inject(LanguageStore);

  protected readonly t = this.lang.t.bind(this.lang);

  readonly unit = input.required<Unit>();

  /**
   * Bài kanji luyện CHỮ hay luyện TỪ GHÉP của các thẻ ('words'). Bài loại khác bỏ qua.
   *
   * Từ ghép là nửa còn lại của việc học chữ: nhớ 賃 là NHẪM mà gặp 家賃 không đọc được
   * thì vẫn chưa dùng được chữ đó. Luyện từ thì dùng nguyên các chiều của phần Từ vựng
   * (xem `kanjiWordsUnit`), kể cả câu ví dụ đi kèm để điền từ.
   */
  protected readonly target = signal<'kanji' | 'words'>('kanji');

  /** Bài kanji nhìn như bài từ vựng gồm các từ ghép; null với bài loại khác. */
  private readonly wordsUnit = computed(() =>
    this.unit().kind === 'kanji' ? kanjiWordsUnit(this.unit()) : null,
  );

  /** Số từ ghép của bài kanji — 0 thì không hiện lựa chọn luyện từ. */
  protected readonly wordCount = computed(() => this.wordsUnit()?.words.length ?? 0);

  /** Bài đem đi dựng câu hỏi: chính bài đang mở, hoặc bản từ ghép của bài kanji. */
  private readonly practiceUnit = computed(() => {
    const words = this.wordsUnit();
    return this.target() === 'words' && words && words.words.length > 0 ? words : this.unit();
  });

  private readonly practicingWords = computed(() => this.practiceUnit() !== this.unit());

  /**
   * Cụm từ đang luyện; null = cả bài.
   *
   * Là `model` (ràng buộc hai chiều) chứ không phải input: chọn cụm ở đây thì danh
   * sách từ bên dưới lọc theo luôn. Một màn hình chỉ nên có MỘT chỗ chọn cụm —
   * hai chỗ thì người học không biết chỗ nào ăn chỗ nào.
   */
  readonly group = model<string | null>(null);

  /** Các cụm của bài, ví dụ 01–10, 11–20… Rỗng nghĩa là bài không chia cụm. */
  protected readonly groups = computed(() => groupsOf(this.practiceUnit().words));

  /**
   * Số lần đã luyện bài này, đếm trong trình duyệt (ProgressStore). Hiện ngay trên đầu
   * khung: mở bài ra là biết đã ôn nó mấy lượt, không phải sang trang Thống kê.
   *
   * Đếm cả BÀI, gồm mọi phiên dù luyện theo chiều nào, theo cụm nào hay luyện từ ghép
   * của bài kanji — số lần của từng cụm đã có trên bảng tóm tắt của trang từ vựng.
   */
  protected readonly attempts = computed(() => this.progress.of(this.unit().id)?.attempts ?? 0);

  protected readonly answerMode = signal<AnswerMode>('choice');

  /**
   * Số câu. Chọn cụm thì tự nhảy về "Tất cả", bỏ cụm thì về 20.
   *
   * Vì chọn "cụm 11–20" nghĩa là muốn học đúng mười từ đó, chứ không phải học một
   * nửa số đó rồi bỏ dở — mà nếu để nguyên "20 câu" thì nút vẫn hiện 20 trong khi
   * chỉ dựng được 10, trông như hụt mất câu.
   *
   * `linkedSignal` chứ không đặt lại trong hàm chọn cụm: cụm còn đổi được từ bên ngoài
   * khung này (bảng "Tóm tắt bài" của trang từ vựng), đổi từ đâu số câu cũng phải theo.
   */
  protected readonly limit = linkedSignal<number | null>(() => (this.group() === null ? 20 : null));
  protected readonly limits = QUESTION_LIMITS;

  private readonly directionRef = signal<PracticeDirection>('jp-vi');

  /** Các chiều luyện được với bài đang mở. */
  protected readonly directions = computed(() =>
    DIRECTIONS.filter(
      (info) =>
        directionIsUsable(this.practiceUnit(), info.id) &&
        (!this.practicingWords() || KANJI_WORD_DIRECTIONS.includes(info.id)),
    ),
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

  /**
   * Bài từ vựng đang kèm một câu ví dụ để điền vào mỗi câu hỏi về từ — chỉ ở chiều đáp
   * án là mặt chữ Nhật (xem `pairsWithExample`). Nói ra ngay trong khung thiết lập, để
   * người học biết trước là mỗi câu có hai phần trên cùng một thẻ.
   */
  protected readonly pairsWithExample = computed(
    () =>
      this.practiceUnit().kind === 'vocabulary' &&
      pairsWithExample(this.direction()) &&
      directionIsUsable(this.practiceUnit(), 'jp-sentence'),
  );

  /** Số câu thực sự dựng được — hiện ngay trên nút bắt đầu để không hứa suông. */
  protected readonly available = computed(
    () =>
      buildQuestions(this.practiceUnit(), {
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
      group: this.group(),
    };
  }

  protected setTarget(target: 'kanji' | 'words'): void {
    this.target.set(target);
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

  /** Số câu tự đổi theo cụm — xem `limit`. */
  protected setGroup(group: string | null): void {
    this.group.set(group);
  }

  protected start(): void {
    const config = this.config();
    const questions = buildQuestions(this.practiceUnit(), config);
    if (questions.length === 0) return;

    this.session.start(config, questions);
    // Địa chỉ nói rõ đang luyện phần nào, bài nào — xem các route luyện tập trong
    // app.routes.ts.
    void this.router.navigate([
      '/',
      this.course.id,
      moduleOf(config.moduleId).path,
      config.unitId,
      'practice',
    ]);
  }
}
