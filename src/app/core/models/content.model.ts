/**
 * Hình dạng dữ liệu học của khoá N3 JUNBI.
 *
 * Mỗi interface ở đây trùng đúng cấu trúc file JSON trong `public/content/`, do
 * `scripts/generate-content.mjs` sinh ra từ `data-source/`. Sửa một trường ở đây
 * thì phải sửa cả ở script sinh và ở phần "sanitize" của ContentStore — ba chỗ đó
 * mô tả cùng một thứ, lệch nhau là dữ liệu bị âm thầm bỏ qua.
 *
 * Quy ước chung:
 *  - `id` luôn ổn định, sinh từ nội dung. Nó là khoá của tiến độ và của mục yêu
 *    thích, nên đổi id nghĩa là mất dấu vết học tập của mục đó.
 *  - Chuỗi rỗng nghĩa là "chưa có", KHÔNG dùng null/undefined: giao diện chỉ cần
 *    kiểm tra một kiểu vắng mặt duy nhất.
 */

/** Bảy phần học của khoá, theo đúng thứ tự hiển thị ngoài trang chủ. */
export const MODULE_IDS = [
  'entrance-test',
  'vocabulary',
  'kanji',
  'grammar',
  'reading',
  'listening',
  'mimikara',
] as const;

export type ModuleId = (typeof MODULE_IDS)[number];

export function isModuleId(value: unknown): value is ModuleId {
  return MODULE_IDS.includes(value as ModuleId);
}

/**
 * Hình dạng nội dung của một bài.
 *
 * KHÔNG trùng với ModuleId: phần "Ngữ pháp" và phần "Ngữ pháp MIMIKARA OBOERU" là
 * hai module khác nhau trên giao diện nhưng cùng một hình dạng dữ liệu, nên dùng
 * chung `kind: 'grammar'` và dùng chung luôn màn hình chi tiết.
 */
export type UnitKind = 'test' | 'vocabulary' | 'kanji' | 'grammar' | 'reading' | 'listening';

/** Kỹ năng mà một câu hỏi đo. Bài kiểm tra nhập môn chấm điểm theo năm nhóm này. */
export const SKILL_IDS = ['vocabulary', 'kanji', 'grammar', 'reading', 'listening'] as const;

export type SkillId = (typeof SKILL_IDS)[number];

export function isSkillId(value: unknown): value is SkillId {
  return SKILL_IDS.includes(value as SkillId);
}

// ── Từ vựng ────────────────────────────────────────────────────────────────

/** Một câu ví dụ của từ. */
export interface VocabExample {
  id: string;
  japanese: string;
  /** Bản dịch tiếng Việt. Rỗng nghĩa là chưa dịch — giáo trình gốc cũng thường để trống. */
  vietnamese: string;
}

/**
 * Một dòng ghi chú đi kèm từ, giữ nguyên nhãn của giáo trình:
 *
 *   合 từ ghép · 対 trái nghĩa · 関 từ liên quan · 連 cách nói đi kèm · 類 từ đồng nghĩa
 *   使い方 / 使い分け cách dùng và phân biệt
 *
 * Nhãn để dạng chuỗi tự do chứ không phải union đóng: giáo trình dùng thêm nhãn mới
 * thì chỉ cần gõ vào file nguồn, không phải sửa mã và build lại.
 */
export interface VocabNote {
  label: string;
  text: string;
}

export interface VocabWord {
  id: string;
  /**
   * Số thứ tự trong giáo trình gốc (1–120 của N3 JUNBI). 0 nghĩa là không đánh số.
   *
   * Giữ lại để đối chiếu được với bản PDF khi học: người học nhớ "từ số 107" chứ
   * không nhớ vị trí của nó trong bài.
   */
  number: number;
  /**
   * Cụm mà từ này thuộc về, ví dụ "01–10". Rỗng nghĩa là bài không chia cụm.
   *
   * Cụm là cách giáo trình chia buổi học: mỗi buổi 10 từ, và bài tập cũng ra theo
   * đúng cụm đó. Nhờ vậy người học lọc và luyện đúng 10 từ của buổi hôm nay thay
   * vì cả 120 từ một lúc.
   */
  group: string;
  /** Từ tiếng Nhật, ví dụ "締め切り". */
  japanese: string;
  /** Cách đọc bằng kana, ví dụ "しめきり". Rỗng nếu từ vốn đã là kana. */
  reading: string;
  /**
   * Âm Hán Việt, ví dụ "ĐẾ THIẾT". Rỗng với từ katakana và trạng từ thuần kana —
   * cột này chỉ hiện khi bài có ít nhất một từ khai báo âm Hán Việt.
   */
  hanViet: string;
  /** Nghĩa tiếng Việt. Nhiều nghĩa ngăn nhau bằng dấu /. */
  vietnamese: string;
  /**
   * Các câu ví dụ. Là MẢNG chứ không phải một câu: giáo trình cho tới năm sáu câu
   * cho một từ (底, 太陽), và mỗi câu minh hoạ một cách dùng khác nhau — giữ lại một
   * câu thì mất đúng phần dạy cách dùng.
   */
  examples: VocabExample[];
  notes: VocabNote[];
}

// ── Kanji ──────────────────────────────────────────────────────────────────

/** Một từ ghép minh hoạ cho chữ Hán. */
export interface KanjiWord {
  id: string;
  japanese: string;
  reading: string;
  vietnamese: string;
}

export interface KanjiEntry {
  id: string;
  /** Đúng một chữ Hán, ví dụ "険". */
  character: string;
  hanViet: string;
  /** Nghĩa tiếng Việt của chữ, ví dụ "hiểm/ nguy hiểm". */
  meaning: string;
  /** Âm On, viết katakana theo quy ước từ điển: ["ケン"]. */
  onyomi: string[];
  /** Âm Kun, viết hiragana: ["けわ.しい"]. */
  kunyomi: string[];
  /** Số nét. 0 nghĩa là chưa khai báo. */
  strokes: number;
  words: KanjiWord[];
}

// ── Ngữ pháp (dùng chung cho phần Ngữ pháp và phần Mimikara Oboeru) ─────────

export interface GrammarExample {
  id: string;
  japanese: string;
  /** Cách đọc / furigana của cả câu. Rỗng nghĩa là chưa có. */
  reading: string;
  vietnamese: string;
  note: string;
}

/**
 * Một cách dùng của mẫu ngữ pháp.
 *
 * Mẫu N3 hầu như luôn có nhiều hơn một nghĩa (～わけだ có tới bốn), và ví dụ chỉ
 * có ích khi gắn với đúng cách dùng nó minh hoạ — nên ví dụ nằm trong usage chứ
 * không nằm phẳng ở cấp mẫu.
 */
export interface GrammarUsage {
  id: string;
  title: string;
  detail: string;
  examples: GrammarExample[];
}

export interface GrammarPoint {
  id: string;
  /** Tên mẫu, ví dụ "～きり". */
  title: string;
  /** Một dòng tóm tắt nghĩa, hiện ở mục lục. */
  summary: string;
  /** Công thức nối, mỗi phần tử một dòng: ["V thể ta ＋ きり"]. */
  structures: string[];
  explanation: string[];
  notes: string[];
  usages: GrammarUsage[];
}

// ── Câu hỏi trắc nghiệm (đọc, nghe, kiểm tra nhập môn) ──────────────────────

export interface QuizChoice {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  skill: SkillId;
  /** Câu dẫn bằng tiếng Việt, ví dụ "Theo bài đọc, vì sao tác giả…". */
  prompt: string;
  /** Phần tiếng Nhật của câu hỏi (câu có chỗ trống, câu cần chọn cách đọc…). */
  promptJapanese: string;
  choices: QuizChoice[];
  /** Id của lựa chọn đúng. Luôn nằm trong `choices`. */
  answerId: string;
  explanation: string;
}

// ── Đọc hiểu ───────────────────────────────────────────────────────────────

export interface ReadingPassage {
  id: string;
  title: string;
  /** Bài đọc tách theo đoạn để giữ được xuống dòng của bản gốc. */
  paragraphs: string[];
  /** Bản dịch tiếng Việt, cùng số đoạn với `paragraphs` nếu có. */
  translation: string[];
  vocabulary: VocabWord[];
  questions: QuizQuestion[];
}

// ── Nghe hiểu ──────────────────────────────────────────────────────────────

export interface ScriptLine {
  id: string;
  /** Tên người nói, ví dụ "男の人". Rỗng với bài độc thoại. */
  speaker: string;
  japanese: string;
  vietnamese: string;
}

export interface ListeningTrack {
  id: string;
  title: string;
  /** Đường dẫn file âm thanh, tính từ thư mục public/. Rỗng nghĩa là chưa thu. */
  audio: string;
  script: ScriptLine[];
  questions: QuizQuestion[];
}

// ── Bài kiểm tra nhập môn ──────────────────────────────────────────────────

export interface TestSection {
  id: string;
  title: string;
  skill: SkillId;
  questions: QuizQuestion[];
}

// ── Bài học và danh mục ────────────────────────────────────────────────────

/**
 * Một dòng trong `content/index.json`: đủ để vẽ danh sách bài mà chưa phải tải
 * nội dung của bài. Trang danh sách của một phần có thể có tới vài chục bài, tải
 * hết nội dung ngay từ đầu là tải thừa gần như toàn bộ.
 */
export interface UnitIndexEntry {
  id: string;
  moduleId: ModuleId;
  name: string;
  description: string;
  kind: UnitKind;
  /** Số mục của bài: số từ, số chữ Hán, số mẫu ngữ pháp, số câu hỏi… */
  itemCount: number;
  /** Thứ tự hiển thị. Số nhỏ lên trước. */
  order: number;
  /** Đường dẫn file nội dung, tính từ `content/`. */
  file: string;
}

/**
 * Nội dung đầy đủ của một bài.
 *
 * Năm mảng nội dung nằm cạnh nhau chứ không dùng union: `kind` cho biết mảng nào
 * có dữ liệu, các mảng còn lại rỗng. Đổi lại việc phải nhớ quy ước đó, template
 * không phải ép kiểu ở mọi chỗ truy cập.
 */
export interface Unit extends Omit<UnitIndexEntry, 'file'> {
  words: VocabWord[];
  kanji: KanjiEntry[];
  points: GrammarPoint[];
  passages: ReadingPassage[];
  tracks: ListeningTrack[];
  sections: TestSection[];
}

/** Đếm số mục của một bài theo đúng loại của nó. */
export function countItems(unit: Pick<Unit, 'kind' | 'words' | 'kanji' | 'points' | 'passages' | 'tracks' | 'sections'>): number {
  switch (unit.kind) {
    case 'vocabulary':
      return unit.words.length;
    case 'kanji':
      return unit.kanji.length;
    case 'grammar':
      return unit.points.length;
    case 'reading':
      return unit.passages.length;
    case 'listening':
      return unit.tracks.length;
    case 'test':
      // Đề kiểm tra đếm theo CÂU chứ không theo phần: "40 câu" là thứ người làm
      // bài hình dung được, còn "5 phần" thì không nói lên bài dài bao nhiêu.
      return unit.sections.reduce((sum, section) => sum + section.questions.length, 0);
  }
}

/** Bài rỗng, dùng làm điểm khởi đầu khi dựng dữ liệu. */
export function emptyUnit(entry: Omit<UnitIndexEntry, 'file'>): Unit {
  return {
    ...entry,
    words: [],
    kanji: [],
    points: [],
    passages: [],
    tracks: [],
    sections: [],
  };
}

/**
 * Danh sách cụm của một bài từ vựng, theo đúng thứ tự xuất hiện trong nguồn.
 *
 * Theo thứ tự XUẤT HIỆN chứ không sắp xếp lại: "01–10, 11–20, …, 101–110" mà đem
 * sắp theo chữ cái thì "101–110" nhảy lên đứng ngay sau "01–10".
 */
export function groupsOf(words: readonly VocabWord[]): string[] {
  const seen: string[] = [];
  for (const word of words) {
    if (word.group && !seen.includes(word.group)) seen.push(word.group);
  }
  return seen;
}

/** Toàn bộ câu hỏi của một bài, gom từ mọi nguồn có trong bài. */
export function questionsOf(unit: Unit): QuizQuestion[] {
  return [
    ...unit.sections.flatMap((section) => section.questions),
    ...unit.passages.flatMap((passage) => passage.questions),
    ...unit.tracks.flatMap((track) => track.questions),
  ];
}
