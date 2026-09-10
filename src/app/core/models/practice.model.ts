import type { MessageKey } from '../i18n/messages';
import type { ModuleId, SkillId } from './content.model';

/** Cách người học trả lời. */
export type AnswerMode = 'choice' | 'typing';

/**
 * Chiều hỏi khi câu hỏi được DỰNG RA từ bảng dữ liệu (từ vựng, kanji, ngữ pháp).
 *
 * Câu hỏi có sẵn trong nội dung (đọc, nghe, kiểm tra nhập môn) không dùng tới chiều:
 * đề đã viết sẵn cả câu dẫn lẫn bốn lựa chọn.
 */
export type PracticeDirection = 'jp-vi' | 'vi-jp' | 'jp-reading' | 'jp-sentence';

export interface DirectionInfo {
  id: PracticeDirection;
  labelKey: MessageKey;
}

export const DIRECTIONS: readonly DirectionInfo[] = [
  { id: 'jp-vi', labelKey: 'practice.direction.jpToVi' },
  { id: 'vi-jp', labelKey: 'practice.direction.viToJp' },
  { id: 'jp-reading', labelKey: 'practice.direction.jpToReading' },
  // Hỏi trên CÂU VÍ DỤ: khoét từ cần học khỏi câu rồi bắt điền lại. Nhớ nghĩa của
  // một từ đứng một mình khác hẳn với dùng được nó trong câu, mà đề N3 phần 文字語彙
  // hỏi đúng theo kiểu này.
  { id: 'jp-sentence', labelKey: 'practice.direction.sentence' },
];

/** Số lựa chọn của một câu trắc nghiệm tự dựng (1 đúng + 3 nhiễu). */
export const CHOICE_COUNT = 4;

/** Các mức "số câu" cho khung thiết lập. null = toàn bộ. */
export const QUESTION_LIMITS: readonly (number | null)[] = [10, 20, 30, null];

export interface PracticeConfig {
  moduleId: ModuleId;
  unitId: string;
  unitName: string;
  answerMode: AnswerMode;
  direction: PracticeDirection;
  /** null = lấy hết mục trong bài. */
  questionLimit: number | null;
  /**
   * Chỉ luyện các từ thuộc cụm này. null = cả bài.
   *
   * Có mặt vì bài từ vựng gom tới 120 từ, còn buổi học thì chỉ 10 từ: luyện xong
   * cụm hôm nay là mục đích thường gặp nhất, không phải luyện cả bài.
   */
  group: string | null;
}

/**
 * Một câu hỏi đã sẵn sàng để hỏi.
 *
 * Cố tình phẳng và không tham chiếu ngược về dữ liệu gốc: màn hình luyện tập và
 * màn hình kết quả chỉ cần đọc, không cần biết câu này dựng từ từ vựng hay lấy
 * nguyên từ đề thi.
 */
export interface PracticeQuestion {
  id: string;
  skill: SkillId;
  /** Câu dẫn. Với câu tự dựng thì đây chính là từ/chữ được hỏi. */
  prompt: string;
  /** Vẽ câu dẫn bằng font tiếng Nhật hay font giao diện. */
  promptIsJapanese: boolean;
  /** Dòng phụ dưới câu dẫn (âm Hán Việt, tên mẫu ngữ pháp…). Rỗng nghĩa là không có. */
  hint: string;
  /** Đáp án đúng, dạng hiển thị. */
  answer: string;
  answerIsJapanese: boolean;
  /** Mọi cách viết được chấp nhận khi gõ tay. Luôn chứa `answer`. */
  acceptedAnswers: string[];
  /** Lựa chọn cho chế độ trắc nghiệm, đã trộn. Rỗng ở chế độ gõ. */
  choices: string[];
  /** Giải thích hiện sau khi chấm. Rỗng nghĩa là không có. */
  explanation: string;
  /**
   * Câu ví dụ của mục đang hỏi, hiện SAU KHI chấm.
   *
   * Hiện cả danh sách chứ không một câu: câu ví dụ là chỗ duy nhất cho thấy từ này
   * đi với trợ từ nào, đứng ở vị trí nào trong câu — mà đúng lúc vừa trả lời xong
   * là lúc người học chịu đọc nhất.
   */
  examples: PracticeExample[];
}

export interface PracticeExample {
  id: string;
  japanese: string;
  vietnamese: string;
  /**
   * Chữ cần tô đậm trong câu. Rỗng nghĩa là không tô.
   *
   * Nằm ở TỪNG CÂU chứ không ở cấp câu hỏi: với động từ, mỗi câu mang một dạng chia
   * khác nhau của cùng một từ (叩く, 叩いた), nên không có một chữ chung để tô cho cả
   * danh sách. Cũng không tự suy từ đáp án: ở chiều điền từ, đáp án là dạng trong
   * MỘT câu, còn các câu khác của từ đó mang dạng khác.
   */
  highlights: string[];
}

export interface QuestionResult {
  question: PracticeQuestion;
  /** Chuỗi người học đã trả lời. Rỗng nghĩa là bỏ qua. */
  given: string;
  isCorrect: boolean;
}

export interface SessionSummary {
  config: PracticeConfig;
  total: number;
  correctCount: number;
  wrongCount: number;
  /** Thời gian làm bài, tính bằng mili giây. */
  durationMs: number;
  results: QuestionResult[];
}

/** Điểm theo từng kỹ năng — màn hình kết quả của bài kiểm tra nhập môn cần con số này. */
export interface SkillScore {
  skill: SkillId;
  correct: number;
  total: number;
}

export function scoreBySkill(results: readonly QuestionResult[]): SkillScore[] {
  const bySkill = new Map<SkillId, SkillScore>();

  for (const result of results) {
    const skill = result.question.skill;
    const current = bySkill.get(skill) ?? { skill, correct: 0, total: 0 };
    current.total += 1;
    if (result.isCorrect) current.correct += 1;
    bySkill.set(skill, current);
  }

  return [...bySkill.values()];
}
