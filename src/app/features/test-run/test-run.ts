import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { COURSE, MODULES, moduleOf } from '../../core/course/course.config';
import { LanguageStore } from '../../core/i18n/language-store';
import type { MessageKey } from '../../core/i18n/messages';
import { T } from '../../core/i18n/t';
import type {
  ModuleId,
  QuizChoice,
  QuizQuestion,
  SkillId,
  TestSection,
} from '../../core/models/content.model';
import { ContentStore } from '../../core/services/content-store';
import { PracticeSessionStore } from '../../core/services/practice-session-store';
import { ProgressStore } from '../../core/services/progress-store';
import { type TextPart, diffAgainst } from '../../core/utils/text';

/** Nhãn của một kỹ năng lấy luôn từ tên phần học tương ứng, như màn hình kết quả. */
const SKILL_LABEL_KEY: Record<string, MessageKey> = Object.fromEntries(
  MODULES.map((module) => [module.id, module.shortKey]),
);

/** Một câu hỏi trên trang làm đề, kèm số thứ tự trong tab. */
interface QuestionView {
  id: string;
  number: number;
  promptJapanese: string;
  promptTranslation: string;
  prompt: string;
  choices: readonly QuizChoice[];
  /**
   * Có hiện câu dẫn tiếng Việt của câu này không.
   *
   * Phần 文字語彙 và 文法 dùng CHUNG một câu dẫn cho cả 問題 ("Chọn từ thích hợp điền
   * vào chỗ trống."), in lại ở cả năm câu thì thành năm dòng chữ giống nhau; chỉ hiện
   * ở câu đầu là đủ. Phần 読解 thì mỗi câu một câu hỏi khác nhau nên câu nào cũng hiện.
   */
  showPrompt: boolean;
  /** Phần này có gì để dịch không — không có thì ẩn luôn nút "Bản dịch". */
  hasTranslation: boolean;
}

/**
 * Các câu dùng CHUNG một bài đọc. Bài đọc hiện một lần cho cả nhóm.
 *
 * `key` là bài đọc đã nối thành chuỗi, chỉ dùng để so hai câu liền nhau có cùng bài
 * đọc hay không.
 */
interface PassageGroup {
  id: string;
  key: string;
  passage: readonly string[];
  passageTranslation: readonly string[];
  questions: QuestionView[];
}

/** Một 問題 của đề: câu lệnh tiếng Nhật rồi tới các câu hỏi. */
interface SectionView {
  id: string;
  title: string;
  instructions: string;
  groups: PassageGroup[];
}

/** Một thẻ trên hàng tab: gom các 問題 cùng một kỹ năng. */
interface TabView {
  skill: SkillId;
  labelKey: MessageKey;
  sections: SectionView[];
  questionIds: readonly string[];
}

/**
 * Màn hình LÀM ĐỀ kiểm tra nhập môn.
 *
 * Khác hẳn màn hình luyện tập (features/practice), và đó là điểm chính: đề thi thì
 * làm cả bài rồi nộp, không phải mỗi câu một thẻ chấm ngay.
 *
 *  - Cả một kỹ năng hiện trên MỘT trang, xem lại và sửa câu đã chọn thoải mái.
 *  - Không chấm, không hiện đáp án cho tới khi bấm nộp bài. Chấm ngay từng câu thì
 *    những câu sau của cùng một 問題 đã bị gợi ý mất rồi.
 *  - Trả lời theo thứ tự nào cũng được, bỏ trống câu nào cũng được.
 *
 * Bố cục theo đúng trang làm bài của Riki: hàng tab theo kỹ năng, câu lệnh 問題 trong
 * khung nét đứt, mỗi câu bốn lựa chọn xếp hai cột.
 *
 * Hai chế độ học thêm, bật tắt độc lập với việc làm bài:
 *
 *  - **Bản dịch**: nghĩa tiếng Việt của câu hỏi, của từng lựa chọn và của bài đọc.
 *    Mặc định TẮT, vì ở phần điền từ thì bốn nghĩa tiếng Việt chỉ thẳng vào đáp án —
 *    bật lên là quyết định của người học, không phải mặc định của đề.
 *  - **Tự viết**: tự gõ lại câu tiếng Nhật rồi so từng chữ với bản gốc. KHÔNG tính
 *    điểm, không liên quan tới phần chấm.
 *
 * Phiên vẫn là PracticeSessionStore để dùng lại màn hình kết quả và phần ghi tiến độ,
 * nhưng chấm một lượt lúc nộp bằng `submitAll` chứ không `answer` từng câu. Nội dung
 * đề lấy lại từ ContentStore (đã nằm trong bộ nhớ vì trang danh sách đề vừa tải nó)
 * vì phiên chỉ giữ danh sách câu phẳng, không giữ phần, câu lệnh hay bản dịch.
 */
@Component({
  selector: 'app-test-run',
  imports: [FormsModule, T],
  templateUrl: './test-run.html',
  styleUrl: './test-run.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestRun {
  private readonly session = inject(PracticeSessionStore);
  private readonly content = inject(ContentStore);
  private readonly progress = inject(ProgressStore);
  private readonly router = inject(Router);
  private readonly lang = inject(LanguageStore);
  private readonly course = inject(COURSE);

  protected readonly t = this.lang.t.bind(this.lang);

  protected readonly config = this.session.config;

  /** Phần tử xin toàn màn hình: cả trang làm bài, không riêng khối câu hỏi. */
  private readonly root = viewChild<ElementRef<HTMLElement>>('root');

  private readonly sections = signal<readonly TestSection[]>([]);
  protected readonly loading = signal(true);

  /** Lựa chọn đã chọn của từng câu: id câu → CHỮ của lựa chọn (thứ đem đi chấm). */
  private readonly answers = signal<ReadonlyMap<string, string>>(new Map());

  protected readonly activeIndex = signal(0);
  protected readonly expanded = signal(true);
  protected readonly isFullscreen = signal(false);

  /** Bật bản dịch cho cả trang. Từng câu vẫn mở riêng được (xem `revealed`). */
  protected readonly showAllTranslations = signal(false);
  private readonly revealed = signal<ReadonlySet<string>>(new Set());

  /** Bật ô "tự viết" cho cả trang. */
  protected readonly writeMode = signal(false);
  private readonly typedPrompt = signal<ReadonlyMap<string, string>>(new Map());
  private readonly typedAnswer = signal<ReadonlyMap<string, string>>(new Map());
  private readonly comparedPrompt = signal<ReadonlySet<string>>(new Set());
  private readonly comparedAnswer = signal<ReadonlySet<string>>(new Set());

  /** Đã bấm nộp khi còn câu trống: hỏi lại một nhịp thay vì nộp luôn. */
  protected readonly confirming = signal(false);

  protected readonly tabs = computed(() => buildTabs(this.sections()));

  protected readonly activeTab = computed<TabView | null>(
    () => this.tabs()[this.activeIndex()] ?? null,
  );

  protected readonly totalCount = computed(() =>
    this.tabs().reduce((sum, tab) => sum + tab.questionIds.length, 0),
  );

  protected readonly answeredCount = computed(() => this.answers().size);

  protected readonly unansweredCount = computed(() => this.totalCount() - this.answeredCount());

  /** Số câu đã trả lời của tab đang mở — con số trên thanh tiến độ. */
  protected readonly activeDone = computed(() => this.doneIn(this.activeTab()));

  protected readonly activeTotal = computed(() => this.activeTab()?.questionIds.length ?? 0);

  protected readonly percent = computed(() => {
    const total = this.activeTotal();
    return total === 0 ? 0 : Math.round((this.activeDone() / total) * 100);
  });

  constructor() {
    const config = this.session.config();
    if (config) void this.load(config.moduleId, config.unitId);

    // Nút toàn màn hình phải theo được cả khi người dùng thoát bằng Esc.
    const sync = (): void => this.isFullscreen.set(document.fullscreenElement !== null);
    document.addEventListener('fullscreenchange', sync);
    inject(DestroyRef).onDestroy(() => document.removeEventListener('fullscreenchange', sync));
  }

  private async load(moduleId: ModuleId, unitId: string): Promise<void> {
    try {
      const unit = await this.content.getUnit(moduleId, unitId);
      this.sections.set(unit?.sections ?? []);
    } finally {
      this.loading.set(false);
    }
  }

  // ── Tiến độ và tab ───────────────────────────────────────────────────────

  protected doneIn(tab: TabView | null): number {
    if (!tab) return 0;
    const answers = this.answers();
    return tab.questionIds.reduce((sum, id) => sum + (answers.has(id) ? 1 : 0), 0);
  }

  protected isTabDone(tab: TabView): boolean {
    return tab.questionIds.length > 0 && this.doneIn(tab) === tab.questionIds.length;
  }

  protected skillLabelKey(skill: SkillId): MessageKey {
    return SKILL_LABEL_KEY[skill] ?? 'module.grammar.short';
  }

  protected selectTab(index: number): void {
    if (index === this.activeIndex()) return;
    this.activeIndex.set(index);
    this.expanded.set(true);
    this.confirming.set(false);
    // Đổi tab khi đang ở giữa trang thì rơi vào giữa danh sách câu của tab mới.
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected toggleExpanded(): void {
    this.expanded.update((value) => !value);
  }

  protected toggleFullscreen(): void {
    const element = this.root()?.nativeElement;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void element?.requestFullscreen();
  }

  // ── Chọn đáp án ──────────────────────────────────────────────────────────

  protected isPicked(questionId: string, choiceText: string): boolean {
    return this.answers().get(questionId) === choiceText;
  }

  protected pickedOf(questionId: string): string {
    return this.answers().get(questionId) ?? '';
  }

  /**
   * Chọn (hoặc đổi) đáp án của một câu.
   *
   * Không chấm gì ở đây: đúng sai chỉ biết sau khi nộp. Bấm lại chính lựa chọn đang
   * chọn thì BỎ chọn — đề cho phép để trống, mà chọn lỡ một câu rồi không bỏ được thì
   * người làm buộc phải trả lời bừa.
   */
  protected pick(questionId: string, choiceText: string): void {
    this.answers.update((current) => {
      const next = new Map(current);
      if (next.get(questionId) === choiceText) next.delete(questionId);
      else next.set(questionId, choiceText);
      return next;
    });
    // Đổi đáp án thì phần "viết lại đáp án" đang so với đáp án cũ.
    this.comparedAnswer.update((current) => remove(current, questionId));
    // Vừa điền thêm một câu thì lời nhắc "còn N câu chưa trả lời" không còn đúng số.
    this.confirming.set(false);
  }

  // ── Bản dịch ─────────────────────────────────────────────────────────────

  protected showsTranslation(questionId: string): boolean {
    return this.showAllTranslations() || this.revealed().has(questionId);
  }

  protected toggleTranslation(questionId: string): void {
    this.revealed.update((current) =>
      current.has(questionId) ? remove(current, questionId) : add(current, questionId),
    );
  }

  protected toggleAllTranslations(): void {
    this.showAllTranslations.update((value) => !value);
    // Bật rồi tắt công tắc chung thì trả lại đúng trạng thái "chưa mở gì".
    if (!this.showAllTranslations()) this.revealed.set(new Set());
  }

  // ── Tự viết lại tiếng Nhật (không tính điểm) ─────────────────────────────

  protected toggleWriteMode(): void {
    this.writeMode.update((value) => !value);
  }

  protected typedPromptOf(questionId: string): string {
    return this.typedPrompt().get(questionId) ?? '';
  }

  protected typedAnswerOf(questionId: string): string {
    return this.typedAnswer().get(questionId) ?? '';
  }

  protected setTypedPrompt(questionId: string, value: string): void {
    this.typedPrompt.update((current) => new Map(current).set(questionId, value));
    this.comparedPrompt.update((current) => remove(current, questionId));
  }

  protected setTypedAnswer(questionId: string, value: string): void {
    this.typedAnswer.update((current) => new Map(current).set(questionId, value));
    this.comparedAnswer.update((current) => remove(current, questionId));
  }

  protected comparePrompt(questionId: string): void {
    this.comparedPrompt.update((current) => add(current, questionId));
  }

  protected compareAnswer(questionId: string): void {
    this.comparedAnswer.update((current) => add(current, questionId));
  }

  protected isPromptCompared(questionId: string): boolean {
    return this.comparedPrompt().has(questionId);
  }

  protected isAnswerCompared(questionId: string): boolean {
    return this.comparedAnswer().has(questionId);
  }

  protected resetPrompt(questionId: string): void {
    this.comparedPrompt.update((current) => remove(current, questionId));
  }

  protected resetAnswer(questionId: string): void {
    this.comparedAnswer.update((current) => remove(current, questionId));
  }

  protected promptDiff(question: QuestionView): TextPart[] {
    return diffAgainst(question.promptJapanese, this.typedPromptOf(question.id)).parts;
  }

  protected promptMatches(question: QuestionView): boolean {
    return diffAgainst(question.promptJapanese, this.typedPromptOf(question.id)).matches;
  }

  protected answerDiff(question: QuestionView): TextPart[] {
    return diffAgainst(this.pickedOf(question.id), this.typedAnswerOf(question.id)).parts;
  }

  protected answerMatches(question: QuestionView): boolean {
    return diffAgainst(this.pickedOf(question.id), this.typedAnswerOf(question.id)).matches;
  }

  // ── Nộp bài ──────────────────────────────────────────────────────────────

  /**
   * Nộp bài. Còn câu trống thì hỏi lại một nhịp trước khi chấm — bấm nhầm nút nộp
   * lúc mới làm nửa đề là mất cả lần làm, vì phiên không lưu lại được.
   */
  protected submit(): void {
    if (this.unansweredCount() > 0 && !this.confirming()) {
      this.confirming.set(true);
      return;
    }
    this.grade();
  }

  protected keepGoing(): void {
    this.confirming.set(false);
  }

  private grade(): void {
    const summary = this.session.submitAll(this.answers());
    if (!summary) {
      void this.router.navigate(['/', this.course.id]);
      return;
    }

    this.progress.record(summary);
    const { moduleId, unitId } = summary.config;
    // Rời toàn màn hình trước khi sang màn kết quả: trang kết quả không có nút thoát.
    if (document.fullscreenElement) void document.exitFullscreen();
    // replaceUrl: bấm Back ở màn kết quả thì về danh sách đề, không quay lại một trang
    // làm bài mà phiên đã xong (guard cũng đẩy về, nhưng chậm một nhịp).
    void this.router.navigate(['/', this.course.id, moduleOf(moduleId).path, unitId, 'result'], {
      replaceUrl: true,
    });
  }
}

/** Thêm / bớt một phần tử của Set mà không sửa Set cũ (signal cần giá trị mới). */
function add(current: ReadonlySet<string>, id: string): ReadonlySet<string> {
  return new Set(current).add(id);
}

function remove(current: ReadonlySet<string>, id: string): ReadonlySet<string> {
  const next = new Set(current);
  next.delete(id);
  return next;
}

/** Gom các 問題 cùng kỹ năng thành một tab, giữ nguyên thứ tự của đề. */
function buildTabs(sections: readonly TestSection[]): TabView[] {
  const tabs: TabView[] = [];

  for (const section of sections) {
    let tab = tabs.find((item) => item.skill === section.skill);
    if (!tab) {
      tab = {
        skill: section.skill,
        labelKey: SKILL_LABEL_KEY[section.skill] ?? 'module.grammar.short',
        sections: [],
        questionIds: [],
      };
      tabs.push(tab);
    }

    // Số câu đánh liên tục trong một TAB: hai 問題 của cùng kỹ năng nằm chung một
    // trang, đánh lại từ 1 ở 問題 thứ hai thì trang có hai câu mang số 1.
    const startNumber = tab.questionIds.length + 1;
    tab.sections.push({
      id: section.id,
      title: section.title,
      instructions: section.instructions,
      groups: groupByPassage(section.questions, startNumber),
    });
    tab.questionIds = [...tab.questionIds, ...section.questions.map((question) => question.id)];
  }

  return tabs;
}

/**
 * Cắt các câu của một 問題 thành từng nhóm theo bài đọc.
 *
 * Câu liền nhau có cùng bài đọc thì vào cùng nhóm để bài đọc chỉ hiện MỘT lần: trang
 * này hiện mọi câu cùng lúc, nên in lại bài đọc trên từng câu là bắt đọc lại bốn lần
 * cùng một đoạn văn. (Màn hình luyện tập thì ngược lại, mỗi câu một thẻ nên phải lặp.)
 */
function groupByPassage(questions: readonly QuizQuestion[], startNumber: number): PassageGroup[] {
  const groups: PassageGroup[] = [];
  let number = startNumber;
  let previousPrompt = '';

  for (const question of questions) {
    const showPrompt = question.prompt.length > 0 && question.prompt !== previousPrompt;
    previousPrompt = question.prompt;

    const view: QuestionView = {
      id: question.id,
      number: number++,
      promptJapanese: question.promptJapanese,
      promptTranslation: question.promptTranslation,
      prompt: question.prompt,
      showPrompt,
      choices: question.choices,
      hasTranslation:
        question.promptTranslation.length > 0 ||
        question.passageTranslation.length > 0 ||
        question.choices.some((choice) => choice.translation.length > 0),
    };

    const key = question.passage.join('\n');
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.questions.push(view);
    else
      groups.push({
        id: question.id,
        key,
        passage: question.passage,
        passageTranslation: question.passageTranslation,
        questions: [view],
      });
  }

  return groups;
}
