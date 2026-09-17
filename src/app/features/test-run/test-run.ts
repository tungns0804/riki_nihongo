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

/** Có chữ tiếng Nhật (kana hoặc chữ Hán) không — để biết người học đang viết gì. */
const JAPANESE = /[぀-ヿ㐀-䶿一-鿿ｦ-ﾟ]/u;

/** Một câu hỏi trên trang làm đề, kèm số thứ tự trong tab. */
interface QuestionView {
  id: string;
  number: number;
  promptJapanese: string;
  promptTranslation: string;
  choices: readonly QuizChoice[];
  /** Câu này có gì để dịch không — không có thì không hiện nút bản dịch. */
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

/** Kết quả so câu người học tự viết với câu gốc. */
interface Comparison {
  /** Người học viết tiếng Nhật: so được từng chữ. Viết tiếng Việt thì không. */
  japanese: boolean;
  matches: boolean;
  parts: TextPart[];
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
 * Hai thứ học thêm ở từng câu, không dính gì tới phần chấm:
 *
 *  - **Bản dịch** của câu hỏi và của cả bốn đáp án. Mỗi câu một nút hiện / ẩn riêng,
 *    và một nút trên thanh đầu hiện / ẩn tất cả. Mặc định ẩn: dịch đáp án ra là gần
 *    như đọc được đáp án, nên mở lúc nào là do người học chọn.
 *  - **Ô tự viết** LUÔN có sẵn dưới mỗi câu, để gõ lại câu tiếng Nhật (luyện chữ Hán)
 *    hoặc tự dịch sang tiếng Việt. So với bản gốc: viết tiếng Nhật thì tô từng chữ
 *    lệch, viết tiếng Việt thì hiện bản dịch tham khảo để tự đối chiếu — một câu dịch
 *    có nhiều cách đúng, so từng chữ thì vô nghĩa.
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

  /** Câu đang mở bản dịch. Nút "hiện tất cả" chỉ là điền / xoá hết tập này. */
  private readonly revealedQuestions = signal<ReadonlySet<string>>(new Set());
  /** Bài đọc đang mở bản dịch, theo id nhóm. Tách riêng vì bài đọc có nút riêng. */
  private readonly revealedPassages = signal<ReadonlySet<string>>(new Set());

  /** Chữ người học tự viết ở từng câu, và những câu đang hiện phần so với bản gốc. */
  private readonly typed = signal<ReadonlyMap<string, string>>(new Map());
  private readonly compared = signal<ReadonlySet<string>>(new Set());

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

  /** Mọi câu và mọi bài đọc CÓ bản dịch — thứ mà nút "hiện tất cả" mở ra. */
  private readonly translatable = computed(() => {
    const questions: string[] = [];
    const passages: string[] = [];
    for (const tab of this.tabs()) {
      for (const section of tab.sections) {
        for (const group of section.groups) {
          if (group.passageTranslation.length > 0) passages.push(group.id);
          for (const question of group.questions) {
            if (question.hasTranslation) questions.push(question.id);
          }
        }
      }
    }
    return { questions, passages };
  });

  /** Đang mở hết bản dịch chưa — để nút trên thanh đầu biết mình là "hiện" hay "ẩn". */
  protected readonly allTranslationsShown = computed(() => {
    const { questions, passages } = this.translatable();
    const openQuestions = this.revealedQuestions();
    const openPassages = this.revealedPassages();
    return (
      questions.length + passages.length > 0 &&
      questions.every((id) => openQuestions.has(id)) &&
      passages.every((id) => openPassages.has(id))
    );
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

  protected isAnswered(questionId: string): boolean {
    return this.answers().has(questionId);
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
    // Vừa điền thêm một câu thì lời nhắc "còn N câu chưa trả lời" không còn đúng số.
    this.confirming.set(false);
  }

  // ── Bản dịch ─────────────────────────────────────────────────────────────

  protected isRevealed(questionId: string): boolean {
    return this.revealedQuestions().has(questionId);
  }

  protected toggleTranslation(questionId: string): void {
    this.revealedQuestions.update((current) => toggle(current, questionId));
  }

  protected isPassageRevealed(groupId: string): boolean {
    return this.revealedPassages().has(groupId);
  }

  protected togglePassageTranslation(groupId: string): void {
    this.revealedPassages.update((current) => toggle(current, groupId));
  }

  /**
   * Hiện hết hoặc ẩn hết. Không phải một công tắc đè lên từng câu: nếu vậy thì lúc
   * đang "hiện tất cả", nút ẩn của từng câu bấm vào không có tác dụng gì.
   */
  protected toggleAllTranslations(): void {
    if (this.allTranslationsShown()) {
      this.revealedQuestions.set(new Set());
      this.revealedPassages.set(new Set());
      return;
    }
    const { questions, passages } = this.translatable();
    this.revealedQuestions.set(new Set(questions));
    this.revealedPassages.set(new Set(passages));
  }

  // ── Ô tự viết (không tính điểm) ──────────────────────────────────────────

  protected typedOf(questionId: string): string {
    return this.typed().get(questionId) ?? '';
  }

  protected setTyped(questionId: string, value: string): void {
    this.typed.update((current) => new Map(current).set(questionId, value));
    // Sửa chữ thì phần so sánh đang hiện là so với chữ cũ.
    this.compared.update((current) => remove(current, questionId));
  }

  protected isCompared(questionId: string): boolean {
    return this.compared().has(questionId);
  }

  protected compare(questionId: string): void {
    this.compared.update((current) => new Set(current).add(questionId));
  }

  protected closeComparison(questionId: string): void {
    this.compared.update((current) => remove(current, questionId));
  }

  /**
   * So chữ người học vừa viết với câu gốc.
   *
   * Viết tiếng Nhật thì so từng chữ và tô chỗ lệch. Viết tiếng Việt (tự dịch) thì
   * KHÔNG chấm khớp / không khớp: một câu dịch có nhiều cách viết đúng, chỉ hiện bản
   * dịch tham khảo để người học tự đối chiếu.
   */
  protected comparisonOf(question: QuestionView): Comparison {
    const typed = this.typedOf(question.id);
    const { parts, matches } = diffAgainst(question.promptJapanese, typed);
    return { japanese: JAPANESE.test(typed), matches, parts };
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

/** Thêm hoặc bớt một phần tử, trả về Set MỚI (signal cần giá trị mới mới báo đổi). */
function toggle(current: ReadonlySet<string>, id: string): ReadonlySet<string> {
  return current.has(id) ? remove(current, id) : new Set(current).add(id);
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

  for (const question of questions) {
    const view: QuestionView = {
      id: question.id,
      number: number++,
      promptJapanese: question.promptJapanese,
      promptTranslation: question.promptTranslation,
      choices: question.choices,
      hasTranslation:
        question.promptTranslation.length > 0 ||
        question.choices.some((choice) => choice.translation.length > 0),
    };

    const key = question.passage.join('\n');
    const last = groups[groups.length - 1];
    if (last && last.key === key) {
      last.questions.push(view);
    } else {
      groups.push({
        // Tiền tố riêng để id nhóm không trùng id câu đầu tiên của nhóm.
        id: `passage:${question.id}`,
        key,
        passage: question.passage,
        passageTranslation: question.passageTranslation,
        questions: [view],
      });
    }
  }

  return groups;
}
