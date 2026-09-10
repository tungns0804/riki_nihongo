import {
  GrammarPoint,
  KanjiEntry,
  QuizQuestion,
  SkillId,
  Unit,
  VocabExample,
  VocabWord,
} from '../models/content.model';
import {
  CHOICE_COUNT,
  PracticeConfig,
  PracticeDirection,
  PracticeExample,
  PracticeQuestion,
} from '../models/practice.model';
import { splitAlternatives } from '../utils/answer-check';
import { pickRandom, shuffle } from '../utils/random';
import { readingOfForm } from '../utils/text';

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

/**
 * Mặt chữ kèm trợ từ, đúng như sách in: "(が)倒れる".
 *
 * Chỉ dùng khi từ đứng ở vị trí CÂU HỎI — trợ từ cho biết tự hay tha động từ, là một
 * phần của cách sách dạy từ đó. Ở vị trí đáp án thì không: gõ "倒れる" là đã nhớ đúng
 * từ, bắt gõ thêm "(が)" là đang chấm cách trình bày.
 */
function withParticle(word: VocabWord): string {
  return word.particle ? `(${word.particle})${word.japanese}` : word.japanese;
}

/** Câu ví dụ của một từ, kèm đúng những chữ cần tô trong TỪNG câu. */
function vocabExamples(word: VocabWord): PracticeExample[] {
  return word.examples.map((example) => ({
    id: example.id,
    japanese: example.japanese,
    vietnamese: example.vietnamese,
    highlights: example.targets,
  }));
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
      prompt: prompt === 'japanese' ? withParticle(word) : String(word[prompt]),
      promptIsJapanese: prompt !== 'vietnamese',
      // Âm Hán Việt làm gợi ý, nhưng KHÔNG hiện khi nó chính là câu hỏi hay đáp án.
      hint: prompt === 'japanese' && answer === 'vietnamese' ? word.hanViet : '',
      answer: correct,
      answerIsJapanese: answer !== 'vietnamese',
      acceptedAnswers: [correct],
      choices: withChoices ? buildChoices(correct, pool) : [],
      explanation: '',
      examples: vocabExamples(word),
    };
  });
}

// ── Từ vựng: điền từ vào câu ví dụ ─────────────────────────────────────────

/** Chỗ trống thay cho từ bị khoét khỏi câu. Ngoặc toàn chiều như đề thi thật. */
const BLANK = '（　　）';

/**
 * Chữ sẽ khoét khỏi câu. Rỗng nghĩa là câu này không khoét được.
 *
 * Chỉ nhận câu có đúng MỘT chỗ đánh dấu. Câu tô hai chỗ (やる気が起きない・起こらない)
 * mà khoét một thì chỗ kia đọc lộ đáp án, khoét cả hai thì thành câu hỏi hai đáp án.
 * Câu không có chỗ nào (viết khác dạng từ điển: "引越し" cho từ "引っ越し") mà khoét
 * theo kiểu đoán thì ra câu hỏi mà đáp án đúng cũng không khớp chỗ trống.
 */
function blankOf(example: VocabExample): string {
  return example.targets.length === 1 ? example.targets[0] : '';
}

/**
 * Đoán dạng chia qua đuôi chữ: て, た, たり, ない, たい, ý chí, từ điển. Chuỗi rỗng là
 * không thuộc dạng nào — danh từ rơi hết vào đó, và vẫn làm nhiễu cho nhau như cũ.
 *
 * Chỉ dùng để XẾP mồi nhiễu nên đoán theo đuôi là đủ. Đoán trượt thì câu hỏi dễ đi
 * một chút chứ không sai, nên không đáng dựng cả bộ chia động từ theo nhóm.
 */
function inflectionOf(form: string): string {
  if (/[ただ]り$/.test(form)) return 'tari';
  if (/[てで]$/.test(form)) return 'te';
  if (/[ただ]$/.test(form)) return 'ta';
  if (/ない$/.test(form)) return 'nai';
  if (/たい$/.test(form)) return 'tai';
  if (/[おこごそぞとどのぼぽもよろ]う$/.test(form)) return 'volitional';
  if (/[うくぐすつぬぶむる]$/.test(form)) return 'dictionary';
  return '';
}

/**
 * Lựa chọn cho câu điền từ: ưu tiên mồi nhiễu CÙNG DẠNG CHIA với đáp án.
 *
 * Chỗ trống trước しまった chỉ nhận thể て. Nếu ba mồi nhiễu là 抱く・起きた・渇いた thì
 * biết ngữ pháp là loại được hết mà không cần nhớ từ nào nghĩa là gì. Mồi nhiễu cùng
 * đuôi て (殴って・倒して・起こして) thì chỉ còn cách hiểu nghĩa — đúng thứ đang luyện.
 * Không đủ mồi cùng dạng thì lấy thêm từ phần còn lại, chứ không hỏi ít lựa chọn hơn.
 */
function buildBlankChoices(answer: string, pool: readonly string[]): string[] {
  const others = [...new Set(pool.filter((value) => value && value !== answer))];
  const form = inflectionOf(answer);
  const sameForm = others.filter((value) => inflectionOf(value) === form);
  const otherForms = others.filter((value) => inflectionOf(value) !== form);

  const picked = pickRandom(sameForm, CHOICE_COUNT - 1);
  const filler = pickRandom(otherForms, CHOICE_COUNT - 1 - picked.length);
  return shuffle([answer, ...picked, ...filler]);
}

/**
 * Cách đọc của chữ bị khoét, để gõ kana thay cho kanji vẫn tính đúng. Thử lần lượt
 * từng mặt chữ của từ: mục 起きる/起こる có hai, và câu mang dạng của một trong hai.
 */
function readingOfBlank(blank: string, word: VocabWord): string {
  const readings = splitAlternatives(word.reading);
  for (const [index, spelling] of splitAlternatives(word.japanese).entries()) {
    const reading = readingOfForm(blank, spelling, readings[index] ?? '');
    if (reading) return reading;
  }
  return '';
}

/**
 * Dựng câu hỏi từ CÂU VÍ DỤ: khoét từ cần học ra khỏi câu rồi bắt điền lại.
 *
 * Chữ bị khoét là DẠNG của từ trong câu chứ không phải dạng từ điển: với động từ,
 * đáp án của のどが（　　）。là 渇いた — đề 文字語彙 của kỳ thi cũng in lựa chọn ở
 * đúng dạng chia hợp với câu. Với danh từ, hai thứ đó trùng nhau.
 *
 * Một từ có mấy câu thì ra mấy câu hỏi: cùng một từ nhưng mỗi câu một ngữ cảnh, đó
 * chính là thứ cần luyện.
 */
function fromVocabularySentences(
  words: readonly VocabWord[],
  withChoices: boolean,
): PracticeQuestion[] {
  const items = words.flatMap((word) =>
    word.examples
      .map((example) => ({ word, example, blank: blankOf(example) }))
      .filter((item) => item.blank.length > 0),
  );

  return items.map(({ word, example, blank }) => {
    // Mồi nhiễu lấy từ câu của TỪ KHÁC. Dạng khác của chính từ này (倒れた làm nhiễu
    // cho 倒れて) thì câu hỏi thành bài chia động từ, không còn là bài từ vựng.
    const pool = items.filter((item) => item.word.id !== word.id).map((item) => item.blank);
    const reading = readingOfBlank(blank, word);

    return {
      // Có cả id của từ: hai từ dùng chung một câu ví dụ (成功 và 失敗 cùng câu
      // 失敗は成功の元) thì vẫn là hai câu hỏi khác nhau.
      id: `${word.id}:${example.id}:blank`,
      skill: 'vocabulary' as SkillId,
      prompt: example.japanese.split(blank).join(BLANK),
      promptIsJapanese: true,
      // Gợi ý là NGHĨA của từ cần điền: không có nó thì nhiều câu điền từ nào
      // cũng xuôi, nhất là khi bốn lựa chọn đều cùng loại từ.
      hint: word.vietnamese,
      answer: blank,
      answerIsJapanese: true,
      // Gõ cách đọc cũng tính đúng: người học nhớ từ mà chưa gõ được kanji thì
      // vẫn là nhớ từ.
      acceptedAnswers: reading ? [blank, reading] : [blank],
      choices: withChoices ? buildBlankChoices(blank, pool) : [],
      explanation: '',
      examples: vocabExamples(word),
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
      explanation: '',
      examples: entry.words.map((word) => ({
        id: word.id,
        japanese: word.reading ? `${word.japanese}（${word.reading}）` : word.japanese,
        vietnamese: word.vietnamese,
        highlights: [entry.character],
      })),
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
      examples: example.reading
        ? [
            {
              id: `${example.id}:r`,
              japanese: example.reading,
              vietnamese: '',
              highlights: [point.title.replace(/[～〜]/g, '')],
            },
          ]
        : [],
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
        examples: [],
      },
    ];
  });
}

// ── Cửa vào chung ──────────────────────────────────────────────────────────

/** Phần này có luyện được theo chiều đó không (bài thiếu cách đọc thì không). */
export function directionIsUsable(unit: Unit, direction: PracticeDirection): boolean {
  if (direction === 'jp-sentence') {
    // Chỉ bài từ vựng mới khoét câu được, và chỉ khi có câu khoét được (xem blankOf).
    return (
      unit.kind === 'vocabulary' &&
      unit.words.some((word) => word.examples.some((example) => blankOf(example).length > 0))
    );
  }

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
        return config.direction === 'jp-sentence'
          ? fromVocabularySentences(words, withChoices)
          : fromVocabulary(words, config.direction, withChoices);
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
