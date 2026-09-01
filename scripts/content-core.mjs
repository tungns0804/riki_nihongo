/**
 * Đọc và chuẩn hoá nội dung nguồn.
 *
 * Tách khỏi generate-content.mjs để phần "hiểu định dạng" nằm riêng khỏi phần
 * "duyệt thư mục và ghi file". Mọi hàm ở đây đều thuần: nhận chuỗi hoặc object,
 * trả về dữ liệu đã chuẩn hoá cùng danh sách cảnh báo, không đụng tới đĩa.
 */

import { createHash } from 'node:crypto';

/** Id ổn định sinh từ nội dung: sửa chỗ khác trong bài không làm đổi id của mục này. */
export function hashId(...parts) {
  return createHash('sha1').update(parts.join('\u0001')).digest('hex').slice(0, 16);
}

/** Tên thư mục thành id dùng được trên URL. */
export function slugify(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Như `contentLines` nhưng GIỮ LẠI dòng bắt đầu bằng ## — đó là mốc chia cụm của
 * bài từ vựng, không phải chú thích. Một dấu # vẫn là chú thích như mọi nơi khác.
 */
function contentLinesWithGroups(raw) {
  return raw
    .split(/\r?\n/)
    .map((line, index) => ({ text: line.trim(), lineNumber: index + 1 }))
    .filter(({ text }) => text.length > 0 && (text.startsWith('##') || !text.startsWith('#')));
}

/** Bỏ dòng trống và dòng chú thích (bắt đầu bằng #). */
function contentLines(raw) {
  return raw
    .split(/\r?\n/)
    .map((line, index) => ({ text: line.trim(), lineNumber: index + 1 }))
    .filter(({ text }) => text.length > 0 && !text.startsWith('#'));
}

/**
 * Tách "見ます (みます)" thành { japanese: '見ます', reading: 'みます' }.
 *
 * Ngoặc có thể là nửa chiều hoặc toàn chiều — bộ gõ tiếng Nhật cho ra loại toàn
 * chiều, còn người gõ trên bàn phím thường cho ra loại nửa chiều.
 */
function splitReading(value) {
  const match = value.match(/^(.*?)[\s]*[(（]([^)）]*)[)）]\s*$/);
  if (!match) return { japanese: value.trim(), reading: '' };
  return { japanese: match[1].trim(), reading: match[2].trim() };
}

// ── Từ vựng ────────────────────────────────────────────────────────────────

/**
 * Định dạng KHỐI: một từ gồm một dòng tiêu đề, rồi các dòng ví dụ và ghi chú.
 *
 *   101. 判 (はん) = Con dấu
 *   ・書類に判を押す。| Đóng dấu vào giấy tờ.
 *   合: 判子を押す = Đóng dấu
 *   類: 判子・印・印鑑
 *
 * Vì sao không phải mỗi từ một dòng CSV như lúc đầu: giáo trình N3 JUNBI cho một
 * từ tới năm sáu câu ví dụ, kèm các dòng 合 / 対 / 関 / 連 / 類 / 使い方. Nhồi tất
 * cả vào một dòng thì dòng dài hàng trăm ký tự và không ai soát nổi; mà bỏ bớt đi
 * thì mất đúng phần dạy CÁCH DÙNG, tức là phần đáng giá nhất của giáo trình.
 *
 * Bốn loại dòng, nhận diện theo thứ tự này (thứ tự có ý nghĩa: dòng ghi chú cũng
 * có thể chứa dấu = như "合: 判子を押す = Đóng dấu"):
 *   1. ## nhãn                  -> mốc chia CỤM, áp cho mọi từ phía sau nó
 *   2. bắt đầu bằng ・ hoặc -   -> câu ví dụ, phần sau dấu | là bản dịch
 *   3. NHÃN : nội dung          -> ghi chú, nhãn giữ nguyên như trong sách
 *   4. còn lại                  -> dòng tiêu đề của một từ mới
 *
 * Cụm là cách giáo trình chia bài: mỗi buổi học 10 từ, và bài tập cũng ra theo
 * đúng cụm đó. Nhờ có mốc cụm, màn hình từ vựng lọc được theo cụm và người học
 * luyện đúng 10 từ của buổi hôm nay thay vì cả 120 từ.
 */
const VOCAB_GROUP = /^##\s*(.+)$/;
const VOCAB_EXAMPLE = /^[・･\-]\s*(.+)$/;
const VOCAB_NOTE = /^(\S{1,8}?)\s*[:：]\s*(.+)$/;
const VOCAB_HEADER = /^(?:(\d+)\s*[.．]\s*)?(.+?)(?:\s*[(（]([^)）]+)[)）])?\s*[=＝]\s*(.+)$/;

export function parseVocabulary(raw) {
  const words = [];
  const warnings = [];
  const seen = new Set();
  let current = null;
  let group = '';

  /** Đóng từ đang dựng dở và đưa vào danh sách. */
  const flush = () => {
    if (!current) return;
    // Id băm từ japanese + hanViet, KHÔNG gồm ví dụ hay ghi chú: bổ sung ví dụ cho
    // một từ đã có không được làm mất tiến độ đã ghi theo id đó.
    const id = hashId(current.japanese, current.hanViet);
    if (seen.has(id)) {
      warnings.push(`dòng ${current.line}: trùng với một từ đã có ở trên (${current.japanese})`);
    } else {
      seen.add(id);
      words.push({
        id,
        number: current.number,
        group: current.group,
        japanese: current.japanese,
        reading: current.reading,
        hanViet: current.hanViet,
        vietnamese: current.vietnamese,
        examples: current.examples,
        notes: current.notes,
      });
    }
    current = null;
  };

  for (const { text, lineNumber } of contentLinesWithGroups(raw)) {
    const groupMark = text.match(VOCAB_GROUP);
    if (groupMark) {
      flush();
      group = groupMark[1].trim();
      continue;
    }

    const example = text.match(VOCAB_EXAMPLE);
    if (example) {
      if (!current) {
        warnings.push(`dòng ${lineNumber}: câu ví dụ nhưng chưa có từ nào ở trên`);
        continue;
      }
      const [japanese = '', vietnamese = ''] = example[1].split('|').map((part) => part.trim());
      if (japanese) {
        current.examples.push({ id: hashId('ex', japanese), japanese, vietnamese });
      }
      continue;
    }

    const note = text.match(VOCAB_NOTE);
    if (note) {
      if (!current) {
        warnings.push(`dòng ${lineNumber}: ghi chú nhưng chưa có từ nào ở trên`);
        continue;
      }
      current.notes.push({ label: note[1], text: note[2].trim() });
      continue;
    }

    const header = text.match(VOCAB_HEADER);
    if (!header) {
      warnings.push(`dòng ${lineNumber}: không hiểu dòng này (thiếu dấu = ở dòng tiêu đề?)`);
      continue;
    }

    flush();
    const [, number, japanese, reading, meaning] = header;
    // Cột nghĩa có thể mang thêm âm Hán Việt ở đầu, ngăn bằng dấu ;
    //   判 (はん) = PHÁN ; Con dấu
    const [first = '', second = ''] = meaning.split(';').map((part) => part.trim());
    const hanViet = second ? first : '';
    const vietnamese = second || first;

    if (!japanese.trim() || !vietnamese) {
      warnings.push(`dòng ${lineNumber}: thiếu từ tiếng Nhật hoặc nghĩa tiếng Việt`);
      continue;
    }

    current = {
      line: lineNumber,
      number: number ? Number.parseInt(number, 10) : 0,
      group,
      japanese: japanese.trim(),
      reading: (reading ?? '').trim(),
      hanViet,
      vietnamese,
      examples: [],
      notes: [],
    };
  }

  flush();
  return { words, warnings };
}

// ── Kanji ──────────────────────────────────────────────────────────────────

/** Một từ ghép: `危険 (きけん)=nguy hiểm`. */
function parseKanjiWord(raw) {
  const [left, meaning = ''] = raw.split('=');
  const { japanese, reading } = splitReading(left);
  if (!japanese) return null;
  return { id: hashId(japanese, reading), japanese, reading, vietnamese: meaning.trim() };
}

/**
 * Mỗi dòng: `CHỮ,ÂM HÁN VIỆT,NGHĨA,ÂM ON,ÂM KUN,SỐ NÉT|TỪ GHÉP;TỪ GHÉP`
 *
 * Nhiều âm On (hoặc Kun) ngăn nhau bằng dấu ・ như trong từ điển tiếng Nhật, chứ
 * không dùng dấu phẩy — dấu phẩy đã là dấu ngăn cột.
 */
export function parseKanji(raw) {
  const entries = [];
  const warnings = [];
  const seen = new Set();

  for (const { text, lineNumber } of contentLines(raw)) {
    const [main, wordsPart = ''] = text.split('|');
    const columns = main.split(',').map((part) => part.trim());
    const [character = '', hanViet = '', meaning = '', onyomi = '', kunyomi = '', strokes = ''] =
      columns;

    if (!character) {
      warnings.push(`dòng ${lineNumber}: thiếu chữ Hán ở cột đầu`);
      continue;
    }
    if (seen.has(character)) {
      warnings.push(`dòng ${lineNumber}: chữ ${character} đã có ở trên`);
      continue;
    }
    seen.add(character);

    const splitReadings = (value) =>
      value
        .split('・')
        .map((part) => part.trim())
        .filter((part) => part.length > 0);

    entries.push({
      id: hashId('kanji', character),
      character,
      hanViet,
      meaning,
      onyomi: splitReadings(onyomi),
      kunyomi: splitReadings(kunyomi),
      strokes: Number.parseInt(strokes, 10) || 0,
      words: wordsPart
        .split(';')
        .map((part) => part.trim())
        .filter((part) => part.length > 0)
        .map(parseKanjiWord)
        .filter((word) => word !== null),
    });
  }

  return { entries, warnings };
}

// ── Ngữ pháp ───────────────────────────────────────────────────────────────

const asText = (value) => (typeof value === 'string' ? value.trim() : '');

/** Nhận cả chuỗi một dòng lẫn mảng nhiều dòng cho các trường dạng đoạn văn. */
function asLines(value) {
  if (Array.isArray(value)) return value.map(asText).filter((line) => line.length > 0);
  const single = asText(value);
  return single ? [single] : [];
}

/**
 * Chuẩn hoá `grammar.json`.
 *
 * Nguồn viết tay nên chấp nhận vài cách viết tắt: `examples` đặt thẳng ở cấp mẫu
 * (không có cách dùng nào) sẽ tự được gói vào một cách dùng mặc định, và `structure`
 * viết số ít cũng nhận. Mọi thứ khác thiếu thì báo cảnh báo chứ không đoán.
 */
export function normalizeGrammar(raw) {
  const warnings = [];
  const points = [];

  const source = Array.isArray(raw) ? raw : Array.isArray(raw?.points) ? raw.points : [];
  if (source.length === 0) warnings.push('không có mẫu ngữ pháp nào trong file');

  for (const [index, item] of source.entries()) {
    const title = asText(item?.title);
    if (!title) {
      warnings.push(`mẫu thứ ${index + 1}: thiếu "title"`);
      continue;
    }

    const rawUsages = Array.isArray(item?.usages)
      ? item.usages
      : // Mẫu chỉ có một cách dùng thì cho phép viết phẳng: examples đặt ngay ở mẫu.
        [{ title, examples: item?.examples }];

    const usages = [];
    for (const [usageIndex, usage] of rawUsages.entries()) {
      const examples = (Array.isArray(usage?.examples) ? usage.examples : [])
        .map((example) => ({
          japanese: asText(example?.japanese),
          reading: asText(example?.reading),
          vietnamese: asText(example?.vietnamese),
          note: asText(example?.note),
        }))
        .filter((example) => example.japanese.length > 0)
        .map((example) => ({ id: hashId('ex', example.japanese), ...example }));

      if (examples.length === 0) {
        warnings.push(`mẫu "${title}": cách dùng thứ ${usageIndex + 1} không có ví dụ nào`);
        continue;
      }

      usages.push({
        id: asText(usage?.id) || `u${usageIndex + 1}`,
        title: asText(usage?.title) || title,
        detail: asText(usage?.detail),
        examples,
      });
    }

    if (usages.length === 0) {
      warnings.push(`mẫu "${title}": bỏ qua vì không còn ví dụ nào`);
      continue;
    }

    points.push({
      id: asText(item?.id) || hashId('point', title),
      title,
      summary: asText(item?.summary),
      structures: asLines(item?.structures ?? item?.structure),
      explanation: asLines(item?.explanation),
      notes: asLines(item?.notes ?? item?.note),
      usages,
    });
  }

  return { points, warnings };
}

// ── Câu hỏi trắc nghiệm ────────────────────────────────────────────────────

const SKILLS = ['vocabulary', 'kanji', 'grammar', 'reading', 'listening'];

/**
 * Chuẩn hoá một câu hỏi.
 *
 * Đáp án viết bằng CHỈ SỐ (`"answer": 2` — lựa chọn thứ hai, đếm từ 1) hoặc bằng
 * chính chuỗi đáp án. Viết bằng chỉ số dễ soát khi gõ đề, còn viết bằng chuỗi thì
 * an toàn khi về sau có ai đảo thứ tự lựa chọn.
 */
function normalizeQuestion(raw, context, defaultSkill, warnings) {
  const prompt = asText(raw?.prompt);
  const promptJapanese = asText(raw?.promptJapanese ?? raw?.question);
  if (!prompt && !promptJapanese) {
    warnings.push(`${context}: câu hỏi không có nội dung`);
    return null;
  }

  const choiceTexts = (Array.isArray(raw?.choices) ? raw.choices : [])
    .map((choice) => (typeof choice === 'string' ? choice.trim() : asText(choice?.text)))
    .filter((choice) => choice.length > 0);

  if (choiceTexts.length < 2) {
    warnings.push(`${context}: cần ít nhất 2 lựa chọn`);
    return null;
  }

  const choices = choiceTexts.map((text, index) => ({ id: `c${index + 1}`, text }));

  const answer = raw?.answer;
  let answerId = '';
  if (typeof answer === 'number' && answer >= 1 && answer <= choices.length) {
    answerId = choices[answer - 1].id;
  } else {
    const text = asText(answer);
    answerId = choices.find((choice) => choice.text === text)?.id ?? '';
  }

  if (!answerId) {
    warnings.push(`${context}: "answer" không trỏ tới lựa chọn nào`);
    return null;
  }

  const skill = SKILLS.includes(raw?.skill) ? raw.skill : defaultSkill;

  return {
    id: asText(raw?.id) || hashId('q', promptJapanese || prompt, choiceTexts.join('|')),
    skill,
    prompt,
    promptJapanese,
    choices,
    answerId,
    explanation: asText(raw?.explanation),
  };
}

function normalizeQuestions(raw, context, defaultSkill, warnings) {
  return (Array.isArray(raw) ? raw : [])
    .map((item, index) =>
      normalizeQuestion(item, `${context} câu ${index + 1}`, defaultSkill, warnings),
    )
    .filter((question) => question !== null);
}

// ── Đọc hiểu ───────────────────────────────────────────────────────────────

/** Đoạn văn: nhận cả mảng đoạn lẫn một chuỗi dài có xuống dòng. */
function asParagraphs(value) {
  if (Array.isArray(value)) return value.map(asText).filter((line) => line.length > 0);
  return asText(value)
    .split(/\n{1,}/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/** Từ vựng đi kèm bài đọc, viết gọn dạng `{ japanese, reading, vietnamese }`. */
function normalizeInlineVocabulary(raw) {
  return (Array.isArray(raw) ? raw : [])
    .map((item) => {
      if (typeof item === 'string') {
        // Cho phép viết một dòng như file từ vựng: "見ます (みます),xem"
        const [left = '', right = ''] = item.split(',');
        const { japanese, reading } = splitReading(left);
        return { japanese, reading, vietnamese: right.trim(), hanViet: '' };
      }
      return {
        japanese: asText(item?.japanese),
        reading: asText(item?.reading),
        vietnamese: asText(item?.vietnamese),
        hanViet: asText(item?.hanViet),
      };
    })
    .filter((word) => word.japanese.length > 0)
    .map((word) => ({
      id: hashId(word.japanese, word.hanViet),
      number: 0,
      group: '',
      ...word,
      examples: [],
      notes: [],
    }));
}

export function normalizeReading(raw) {
  const warnings = [];
  const source = Array.isArray(raw) ? raw : Array.isArray(raw?.passages) ? raw.passages : [];
  if (source.length === 0) warnings.push('không có bài đọc nào trong file');

  const passages = [];
  for (const [index, item] of source.entries()) {
    const title = asText(item?.title);
    const context = `bài đọc ${index + 1}${title ? ` (${title})` : ''}`;
    const paragraphs = asParagraphs(item?.paragraphs ?? item?.text ?? item?.body);

    if (paragraphs.length === 0) {
      warnings.push(`${context}: không có nội dung bài đọc`);
      continue;
    }

    passages.push({
      id: asText(item?.id) || hashId('passage', paragraphs[0]),
      title,
      paragraphs,
      translation: asParagraphs(item?.translation),
      vocabulary: normalizeInlineVocabulary(item?.vocabulary),
      questions: normalizeQuestions(item?.questions, context, 'reading', warnings),
    });
  }

  return { passages, warnings };
}

// ── Nghe hiểu ──────────────────────────────────────────────────────────────

/** Một dòng thoại: `{ speaker, japanese, vietnamese }` hoặc chuỗi "男：…". */
function normalizeScript(raw) {
  return (Array.isArray(raw) ? raw : [])
    .map((item) => {
      if (typeof item === 'string') {
        const match = item.match(/^([^：:]{1,12})[：:](.*)$/);
        return match
          ? { speaker: match[1].trim(), japanese: match[2].trim(), vietnamese: '' }
          : { speaker: '', japanese: item.trim(), vietnamese: '' };
      }
      return {
        speaker: asText(item?.speaker),
        japanese: asText(item?.japanese),
        vietnamese: asText(item?.vietnamese),
      };
    })
    .filter((line) => line.japanese.length > 0)
    .map((line, index) => ({ id: hashId('line', String(index), line.japanese), ...line }));
}

export function normalizeListening(raw) {
  const warnings = [];
  const source = Array.isArray(raw) ? raw : Array.isArray(raw?.tracks) ? raw.tracks : [];
  if (source.length === 0) warnings.push('không có bài nghe nào trong file');

  const tracks = [];
  for (const [index, item] of source.entries()) {
    const title = asText(item?.title) || `${index + 1}`;
    const context = `bài nghe ${index + 1} (${title})`;
    const audio = asText(item?.audio);

    // Không có file âm thanh vẫn nhận: lời thoại và câu hỏi đủ để học tạm, thu sau
    // chỉ cần thêm một trường. Nhưng phải nói ra, nếu không sẽ quên mất là còn thiếu.
    if (!audio) warnings.push(`${context}: chưa có file âm thanh ("audio")`);

    tracks.push({
      id: asText(item?.id) || hashId('track', title),
      title,
      audio,
      script: normalizeScript(item?.script),
      questions: normalizeQuestions(item?.questions, context, 'listening', warnings),
    });
  }

  return { tracks, warnings };
}

// ── Bài kiểm tra nhập môn ──────────────────────────────────────────────────

export function normalizeTest(raw) {
  const warnings = [];
  const source = Array.isArray(raw) ? raw : Array.isArray(raw?.sections) ? raw.sections : [];
  if (source.length === 0) warnings.push('không có phần nào trong đề');

  const sections = [];
  for (const [index, item] of source.entries()) {
    const title = asText(item?.title) || `Phần ${index + 1}`;
    const skill = SKILLS.includes(item?.skill) ? item.skill : 'grammar';
    const questions = normalizeQuestions(item?.questions, `phần "${title}"`, skill, warnings);

    if (questions.length === 0) {
      warnings.push(`phần "${title}": không có câu hỏi nào dùng được`);
      continue;
    }

    sections.push({ id: asText(item?.id) || `s${index + 1}`, title, skill, questions });
  }

  return { sections, warnings };
}
