/**
 * Đọc dữ liệu JSON thành model đã kiểm kiểu.
 *
 * Tách khỏi ContentStore vì đây là phần dài nhất và cũng ít thay đổi nhất: store
 * lo việc tải và nhớ, còn ở đây chỉ lo "dữ liệu này có dùng được không".
 *
 * Nguyên tắc chung, áp dụng cho mọi hàm dưới đây:
 *  - Thiếu trường BẮT BUỘC (id, phần chữ chính) thì bỏ cả mục, không đoán.
 *  - Thiếu trường tuỳ chọn thì coi như chuỗi rỗng / mảng rỗng, giữ lại mục.
 *  - Trùng id thì giữ mục đầu tiên: id là khoá của tiến độ, hai mục cùng id sẽ
 *    dẫm lên nhau khi đánh dấu.
 */

import {
  GrammarExample,
  GrammarPoint,
  GrammarUsage,
  KanjiEntry,
  KanjiWord,
  ListeningTrack,
  QuizChoice,
  QuizQuestion,
  ReadingPassage,
  ScriptLine,
  TestSection,
  UnitKind,
  VocabExample,
  VocabNote,
  VocabWord,
  isSkillId,
} from '../models/content.model';

const KNOWN_KINDS: readonly UnitKind[] = [
  'test',
  'vocabulary',
  'kanji',
  'grammar',
  'reading',
  'listening',
];

export function sanitizeUnitKind(raw: unknown): UnitKind {
  return KNOWN_KINDS.includes(raw as UnitKind) ? (raw as UnitKind) : 'vocabulary';
}

/** Chuỗi tuỳ chọn: không phải chuỗi thì coi như chưa có. */
function text(raw: unknown): string {
  return typeof raw === 'string' ? raw : '';
}

/** Danh sách chuỗi: bỏ phần tử không phải chuỗi và phần tử rỗng. */
function textList(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is string => typeof item === 'string' && item.length > 0);
}

/** Duyệt một mảng các object, bỏ qua phần tử hỏng và phần tử trùng id. */
function each<T>(raw: unknown, seen: Set<string>, read: (item: Record<string, unknown>, id: string) => T | null): T[] {
  if (!Array.isArray(raw)) return [];

  return raw.flatMap((item): T[] => {
    if (!item || typeof item !== 'object') return [];
    const record = item as Record<string, unknown>;
    const id = record['id'];
    if (typeof id !== 'string' || !id || seen.has(id)) return [];
    const parsed = read(record, id);
    if (!parsed) return [];
    seen.add(id);
    return [parsed];
  });
}

// ── Từ vựng ────────────────────────────────────────────────────────────────

function sanitizeVocabExamples(raw: unknown): VocabExample[] {
  return each(raw, new Set<string>(), (item, id) => {
    const japanese = text(item['japanese']);
    if (!japanese) return null;
    return {
      id,
      japanese,
      vietnamese: text(item['vietnamese']),
      // Chỗ đánh dấu không nằm trong câu thì tô không được, còn khoét ra thì câu hỏi
      // không có chỗ trống nào — bỏ đi chứ không giữ lại một lời hứa sai.
      targets: textList(item['targets']).filter((target) => japanese.includes(target)),
    };
  });
}

/** Ghi chú không có id (nhãn + chữ là đủ để phân biệt), nên không dùng `each`. */
function sanitizeVocabNotes(raw: unknown): VocabNote[] {
  if (!Array.isArray(raw)) return [];

  return raw.flatMap((item): VocabNote[] => {
    if (!item || typeof item !== 'object') return [];
    const record = item as Record<string, unknown>;
    const value = text(record['text']);
    if (!value) return [];
    return [{ label: text(record['label']), text: value }];
  });
}

export function sanitizeVocabulary(raw: unknown, seen = new Set<string>()): VocabWord[] {
  return each(raw, seen, (item, id) => {
    const japanese = text(item['japanese']);
    const vietnamese = text(item['vietnamese']);
    // Không có một trong hai thì từ này không luyện được theo chiều nào cả.
    if (!japanese || !vietnamese) return null;

    return {
      id,
      number: typeof item['number'] === 'number' ? (item['number'] as number) : 0,
      group: text(item['group']),
      particle: text(item['particle']),
      japanese,
      reading: text(item['reading']),
      hanViet: text(item['hanViet']),
      vietnamese,
      examples: sanitizeVocabExamples(item['examples']),
      notes: sanitizeVocabNotes(item['notes']),
    };
  });
}

// ── Kanji ──────────────────────────────────────────────────────────────────

function sanitizeKanjiWords(raw: unknown): KanjiWord[] {
  return each(raw, new Set<string>(), (item, id) => {
    const japanese = text(item['japanese']);
    if (!japanese) return null;
    return {
      id,
      japanese,
      reading: text(item['reading']),
      vietnamese: text(item['vietnamese']),
    };
  });
}

export function sanitizeKanji(raw: unknown): KanjiEntry[] {
  return each(raw, new Set<string>(), (item, id) => {
    const character = text(item['character']);
    if (!character) return null;

    return {
      id,
      character,
      hanViet: text(item['hanViet']),
      meaning: text(item['meaning']),
      onyomi: textList(item['onyomi']),
      kunyomi: textList(item['kunyomi']),
      strokes: typeof item['strokes'] === 'number' ? (item['strokes'] as number) : 0,
      words: sanitizeKanjiWords(item['words']),
    };
  });
}

// ── Ngữ pháp ───────────────────────────────────────────────────────────────

/**
 * `seen` dùng chung cho CẢ BÀI chứ không riêng từng cách dùng: id ví dụ là khoá
 * của dấu đánh dấu, hai ví dụ trùng id thì đánh dấu câu này sẽ sáng luôn câu kia.
 */
function sanitizeGrammarExamples(raw: unknown, seen: Set<string>): GrammarExample[] {
  return each(raw, seen, (item, id) => {
    const japanese = text(item['japanese']);
    if (!japanese) return null;
    return {
      id,
      japanese,
      reading: text(item['reading']),
      vietnamese: text(item['vietnamese']),
      note: text(item['note']),
    };
  });
}

function sanitizeGrammarUsages(raw: unknown, seen: Set<string>): GrammarUsage[] {
  if (!Array.isArray(raw)) return [];

  return raw.flatMap((item, index): GrammarUsage[] => {
    if (!item || typeof item !== 'object') return [];
    const record = item as Record<string, unknown>;
    const title = text(record['title']);
    if (!title) return [];

    const examples = sanitizeGrammarExamples(record['examples'], seen);
    // Cách dùng không còn ví dụ nào thì chỉ còn là một dòng tiêu đề trống rỗng.
    if (examples.length === 0) return [];

    return [
      {
        id: typeof record['id'] === 'string' && record['id'] ? (record['id'] as string) : `u${index + 1}`,
        title,
        detail: text(record['detail']),
        examples,
      },
    ];
  });
}

export function sanitizeGrammarPoints(raw: unknown): GrammarPoint[] {
  const seenExamples = new Set<string>();

  return each(raw, new Set<string>(), (item, id) => {
    const title = text(item['title']);
    if (!title) return null;

    const usages = sanitizeGrammarUsages(item['usages'], seenExamples);
    if (usages.length === 0) return null;

    return {
      id,
      title,
      summary: text(item['summary']),
      structures: textList(item['structures']),
      explanation: textList(item['explanation']),
      notes: textList(item['notes']),
      usages,
    };
  });
}

// ── Câu hỏi trắc nghiệm ────────────────────────────────────────────────────

function sanitizeChoices(raw: unknown): QuizChoice[] {
  return each(raw, new Set<string>(), (item, id) => {
    const value = text(item['text']);
    return value ? { id, text: value } : null;
  });
}

/**
 * Câu hỏi phải có đủ: câu dẫn, ít nhất hai lựa chọn, và đáp án trỏ tới một lựa
 * chọn CÓ THẬT. Thiếu điều kiện cuối là loại lỗi tệ nhất — câu hỏi vẫn hiện ra
 * bình thường nhưng chọn kiểu gì cũng sai.
 */
export function sanitizeQuestions(raw: unknown, seen = new Set<string>()): QuizQuestion[] {
  return each(raw, seen, (item, id) => {
    const prompt = text(item['prompt']);
    const promptJapanese = text(item['promptJapanese']);
    if (!prompt && !promptJapanese) return null;

    const choices = sanitizeChoices(item['choices']);
    if (choices.length < 2) return null;

    const answerId = text(item['answerId']);
    if (!choices.some((choice) => choice.id === answerId)) return null;

    return {
      id,
      skill: isSkillId(item['skill']) ? item['skill'] : 'grammar',
      prompt,
      promptJapanese,
      choices,
      answerId,
      explanation: text(item['explanation']),
    };
  });
}

// ── Đọc hiểu ───────────────────────────────────────────────────────────────

export function sanitizeReadingPassages(raw: unknown): ReadingPassage[] {
  const seenQuestions = new Set<string>();
  const seenWords = new Set<string>();

  return each(raw, new Set<string>(), (item, id) => {
    const paragraphs = textList(item['paragraphs']);
    if (paragraphs.length === 0) return null;

    return {
      id,
      title: text(item['title']),
      paragraphs,
      translation: textList(item['translation']),
      vocabulary: sanitizeVocabulary(item['vocabulary'], seenWords),
      questions: sanitizeQuestions(item['questions'], seenQuestions),
    };
  });
}

// ── Nghe hiểu ──────────────────────────────────────────────────────────────

function sanitizeScript(raw: unknown): ScriptLine[] {
  return each(raw, new Set<string>(), (item, id) => {
    const japanese = text(item['japanese']);
    if (!japanese) return null;
    return {
      id,
      speaker: text(item['speaker']),
      japanese,
      vietnamese: text(item['vietnamese']),
    };
  });
}

export function sanitizeListeningTracks(raw: unknown): ListeningTrack[] {
  const seenQuestions = new Set<string>();

  return each(raw, new Set<string>(), (item, id) => {
    const title = text(item['title']);
    const questions = sanitizeQuestions(item['questions'], seenQuestions);
    const script = sanitizeScript(item['script']);
    // Bài nghe chưa có file âm thanh vẫn giữ lại: lời thoại và câu hỏi đã đủ để
    // học tạm, và file thu sau chỉ cần thêm một trường là xong.
    if (!title && questions.length === 0 && script.length === 0) return null;

    return {
      id,
      title,
      audio: text(item['audio']),
      script,
      questions,
    };
  });
}

// ── Bài kiểm tra nhập môn ──────────────────────────────────────────────────

export function sanitizeTestSections(raw: unknown): TestSection[] {
  const seenQuestions = new Set<string>();

  return each(raw, new Set<string>(), (item, id) => {
    const questions = sanitizeQuestions(item['questions'], seenQuestions);
    if (questions.length === 0) return null;

    return {
      id,
      title: text(item['title']),
      skill: isSkillId(item['skill']) ? item['skill'] : 'grammar',
      questions,
    };
  });
}
