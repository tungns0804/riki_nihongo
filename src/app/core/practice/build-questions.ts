import {
  GrammarPoint,
  KanjiEntry,
  QuizQuestion,
  SkillId,
  Unit,
  VocabWord,
} from '../models/content.model';
import {
  CHOICE_COUNT,
  PracticeConfig,
  PracticeDirection,
  PracticeQuestion,
} from '../models/practice.model';
import { pickRandom, shuffle } from '../utils/random';

/**
 * Dựng danh sách câu hỏi cho một phiên luyện tập.
 *
 * Hai nguồn câu hỏi, khác nhau về bản chất:
 *
 *  - Từ vựng / Kanji / Ngữ pháp: câu hỏi được SINH RA từ bảng dữ liệu. Đáp án là
 *    một ô trong bảng, còn ba lựa chọn nhiễu lấy từ các mục khác cùng bài — nhiễu
 *    lấy trong bài chứ không lấy toàn khoá là có chủ ý: nhiễu quá xa thì loại trừ
 *    được mà không cần nhớ từ.
 *
 *  - Đọc / Nghe / Kiểm tra nhập môn: câu hỏi đã VIẾT SẴN trong nội dung, kèm bốn
 *    lựa chọn của đề. Ở đây chỉ chuyển sang cùng một kiểu dữ liệu để hai màn hình
 *    luyện tập và kết quả dùng chung được.
 */

/** Lấy tối đa `CHOICE_COUNT - 1` mồi nhiễu khác đáp án, rồi trộn cùng đáp án. */
function buildChoices(answer: string, pool: readonly string[]): string[] {
  const others = [...new Set(pool.filter((value) => value && value !== answer))];
  return shuffle([answer, ...pickRandom(others, CHOICE_COUNT - 1)]);
}

// ── Từ vựng ────────────────────────────────────────────────────────────────

/** Ô nào làm câu hỏi, ô nào làm đáp án, theo chiều đang chọn. */
function vocabFields(direction: PracticeDirection): {
  prompt: keyof VocabWord;
  answer: keyof VocabWord;
} {
  switch (direction) {
    case 'vi-jp':
      return { prompt: 'vietnamese', answer: 'japanese' };
    case 'jp-reading':
      return { prompt: 'japanese', answer: 'reading' };
    case 'jp-vi':
    default:
      return { prompt: 'japanese', answer: 'vietnamese' };
  }
}

function fromVocabulary(
  words: readonly VocabWord[],
  direction: PracticeDirection,
  withChoices: boolean,
): PracticeQuestion[] {
  const { prompt, answer } = vocabFields(direction);
  // Từ thiếu đúng ô đang hỏi thì bỏ qua, không hỏi một câu có đáp án rỗng.
  const usable = words.filter((word) => word[prompt] && word[answer]);
  const pool = usable.map((word) => String(word[answer]));

  return usable.map((word) => {
    const correct = String(word[answer]);
    return {
      id: `${word.id}:${direction}`,
      skill: 'vocabulary' as SkillId,
      prompt: String(word[prompt]),
      promptIsJapanese: prompt !== 'vietnamese',
      // Âm Hán Việt làm gợi ý, nhưng KHÔNG hiện khi nó chính là câu hỏi hay đáp án.
      hint: prompt === 'japanese' && answer === 'vietnamese' ? word.hanViet : '',
      answer: correct,
      answerIsJapanese: answer !== 'vietnamese',
      acceptedAnswers: [correct],
      choices: withChoices ? buildChoices(correct, pool) : [],
      // Lời giải sau khi chấm là câu ví dụ ĐẦU TIÊN: một từ có tới năm sáu câu, đổ
      // hết ra thì khối phản hồi dài hơn cả câu hỏi và không ai đọc nữa.
      explanation: word.examples[0]?.japanese ?? '',
    };
  });
}

// ── Kanji ──────────────────────────────────────────────────────────────────

/** Mọi cách đọc của một chữ, gộp On và Kun. */
function readingsOf(entry: KanjiEntry): string[] {
  return [...entry.onyomi, ...entry.kunyomi].filter((value) => value.length > 0);
}

function fromKanji(
  entries: readonly KanjiEntry[],
  direction: PracticeDirection,
  withChoices: boolean,
): PracticeQuestion[] {
  const usable = entries.filter((entry) => {
    if (direction === 'jp-reading') return readingsOf(entry).length > 0;
    return entry.meaning.length > 0;
  });

  const pool = usable.map((entry) =>
    direction === 'jp-reading' ? readingsOf(entry)[0] : entry.meaning,
  );

  return usable.map((entry) => {
    const readings = readingsOf(entry);
    const isReadingQuestion = direction === 'jp-reading';
    const askForCharacter = direction === 'vi-jp';
    const correct = isReadingQuestion ? readings[0] : askForCharacter ? entry.character : entry.meaning;

    return {
      id: `${entry.id}:${direction}`,
      skill: 'kanji' as SkillId,
      prompt: askForCharacter ? entry.meaning : entry.character,
      promptIsJapanese: !askForCharacter,
      hint: askForCharacter ? '' : entry.hanViet,
      answer: correct,
      answerIsJapanese: isReadingQuestion || askForCharacter,
      // Chữ có nhiều âm On/Kun thì gõ đúng MỘT âm là đủ.
      acceptedAnswers: isReadingQuestion ? readings : [correct],
      choices: withChoices
        ? buildChoices(
            correct,
            askForCharacter ? usable.map((item) => item.character) : pool,
          )
        : [],
      explanation: entry.words.map((word) => `${word.japanese} (${word.reading})`).join('　'),
    };
  });
}

// ── Ngữ pháp (và Mimikara Oboeru) ──────────────────────────────────────────

/**
 * Hỏi trên CÂU VÍ DỤ chứ không trên tên mẫu.
 *
 * Nhớ được "～きり nghĩa là chỉ, duy nhất" mà không đặt được câu thì vào phòng thi
 * vẫn không chọn được đáp án. Câu ví dụ bắt người học đọc cả ngữ cảnh, còn tên mẫu
 * thì hiện làm gợi ý để biết câu này đang luyện mẫu nào.
 */
function fromGrammar(
  points: readonly GrammarPoint[],
  direction: PracticeDirection,
  withChoices: boolean,
): PracticeQuestion[] {
  const pairs = points.flatMap((point) =>
    point.usages.flatMap((usage) =>
      usage.examples
        .filter((example) => example.japanese && example.vietnamese)
        .map((example) => ({ point, example })),
    ),
  );

  const askForJapanese = direction === 'vi-jp';
  const pool = pairs.map(({ example }) => (askForJapanese ? example.japanese : example.vietnamese));

  return pairs.map(({ point, example }) => {
    const correct = askForJapanese ? example.japanese : example.vietnamese;
    return {
      id: `${example.id}:${direction}`,
      skill: 'grammar' as SkillId,
      prompt: askForJapanese ? example.vietnamese : example.japanese,
      promptIsJapanese: !askForJapanese,
      hint: point.title,
      answer: correct,
      answerIsJapanese: askForJapanese,
      acceptedAnswers: [correct],
      choices: withChoices ? buildChoices(correct, pool) : [],
      explanation: example.note,
    };
  });
}

// ── Câu hỏi viết sẵn trong đề ──────────────────────────────────────────────

/**
 * Đề đã có đủ bốn lựa chọn nên KHÔNG dựng lựa chọn mới, kể cả khi người học chọn
 * chế độ gõ đáp án: mồi nhiễu của đề là một phần của việc ra đề, thay bằng mồi tự
 * sinh thì câu hỏi không còn là câu hỏi đó nữa.
 */
export function fromQuizQuestions(questions: readonly QuizQuestion[]): PracticeQuestion[] {
  return questions.flatMap((question): PracticeQuestion[] => {
    const answer = question.choices.find((choice) => choice.id === question.answerId);
    if (!answer) return [];

    return [
      {
        id: question.id,
        skill: question.skill,
        prompt: question.promptJapanese || question.prompt,
        promptIsJapanese: question.promptJapanese.length > 0,
        hint: question.promptJapanese ? question.prompt : '',
        answer: answer.text,
        answerIsJapanese: true,
        acceptedAnswers: [answer.text],
        choices: question.choices.map((choice) => choice.text),
        explanation: question.explanation,
      },
    ];
  });
}

// ── Cửa vào chung ──────────────────────────────────────────────────────────

/** Phần này có luyện được theo chiều đó không (bài thiếu cách đọc thì không). */
export function directionIsUsable(unit: Unit, direction: PracticeDirection): boolean {
  if (direction !== 'jp-reading') return true;
  if (unit.kind === 'vocabulary') return unit.words.some((word) => word.reading.length > 0);
  if (unit.kind === 'kanji') return unit.kanji.some((entry) => readingsOf(entry).length > 0);
  // Ngữ pháp không có "cách đọc" để hỏi riêng.
  return false;
}

/**
 * Dựng câu hỏi cho cả phiên: chọn nguồn theo loại bài, trộn, rồi cắt theo số câu
 * đã đặt. Trộn TRƯỚC khi cắt, nếu không thì "10 câu" luôn là đúng mười mục đầu bài.
 */
export function buildQuestions(unit: Unit, config: PracticeConfig): PracticeQuestion[] {
  const withChoices = config.answerMode === 'choice';

  // Lọc theo cụm TRƯỚC khi dựng câu hỏi: mồi nhiễu cũng phải lấy trong cụm đang
  // luyện, nếu không thì ba lựa chọn sai đến từ những từ chưa học bao giờ và chọn
  // đúng chỉ nhờ loại trừ.
  const words = config.group
    ? unit.words.filter((word) => word.group === config.group)
    : unit.words;

  const all = (() => {
    switch (unit.kind) {
      case 'vocabulary':
        return fromVocabulary(words, config.direction, withChoices);
      case 'kanji':
        return fromKanji(unit.kanji, config.direction, withChoices);
      case 'grammar':
        return fromGrammar(unit.points, config.direction, withChoices);
      case 'reading':
        return fromQuizQuestions(unit.passages.flatMap((passage) => passage.questions));
      case 'listening':
        return fromQuizQuestions(unit.tracks.flatMap((track) => track.questions));
      case 'test':
        return fromQuizQuestions(unit.sections.flatMap((section) => section.questions));
    }
  })();

  // Đề kiểm tra giữ nguyên thứ tự: các phần đi từ từ vựng tới nghe hiểu, trộn lên
  // thì người làm phải nhảy qua nhảy lại giữa năm kiểu câu hỏi suốt cả bài.
  const ordered = unit.kind === 'test' ? all : shuffle(all);
  return config.questionLimit === null ? ordered : ordered.slice(0, config.questionLimit);
}
