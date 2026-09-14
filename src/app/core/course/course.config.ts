import type { MessageKey } from '../i18n/messages';
import { MODULE_IDS, ModuleId, UnitKind } from '../models/content.model';

/**
 * Định nghĩa khoá học và bảy phần của nó.
 *
 * Đây là chỗ DUY NHẤT mô tả một phần học: đường dẫn, biểu tượng, khoá thông điệp,
 * hình dạng dữ liệu và tên thư mục nguồn. Thanh điều hướng, trang chủ, bộ định
 * tuyến và cả script sinh nội dung đều đọc từ đây, nên thêm một phần mới là thêm
 * một dòng ở bảng dưới chứ không phải sửa năm chỗ.
 */
export const COURSE_ID = 'n3-junbi';

export interface CourseDef {
  /** Cũng là đường dẫn trang của học phần: `/n3-junbi`. */
  id: string;
  /** Một chữ Hán làm biểu tượng trên thẻ, cùng kiểu với thẻ phần học. */
  icon: string;
  nameKey: MessageKey;
  descKey: MessageKey;
  /** 'active' = đang học được; 'soon' = đã có trong lộ trình của Riki nhưng chưa làm. */
  status: 'active' | 'soon';
}

/**
 * Năm học phần của website Riki Nihongo, đúng thứ tự Riki liệt kê.
 *
 * Chỉ N3 JUNBI đang làm. Bốn học phần kia VẪN hiện trong bộ chọn, mờ đi kèm nhãn
 * "Sắp có": người học phải thấy trang gồm những học phần nào ngay từ đầu, ẩn đi thì
 * trang trông như chỉ có đúng một khoá.
 *
 * Địa chỉ trang chưa mang tên học phần (`/vocabulary`, không phải
 * `/n3-junbi/vocabulary`) vì mới có một học phần có nội dung. Khi làm học phần thứ
 * hai thì MODULES, bộ định tuyến và `public/content/` phải tách theo học phần.
 */
export const COURSES: readonly CourseDef[] = [
  // 準備 · 基本 · 深 (chuyên sâu) · 対策 · 模試 (luyện đề)
  { id: 'n3-junbi', icon: '準', nameKey: 'course.n3-junbi.name', descKey: 'course.n3-junbi.desc', status: 'active' },
  { id: 'btvn-co-ban', icon: '基', nameKey: 'course.btvn-co-ban.name', descKey: 'course.soon.desc', status: 'soon' },
  { id: 'btvn-n4-chuyen-sau', icon: '深', nameKey: 'course.btvn-n4-chuyen-sau.name', descKey: 'course.soon.desc', status: 'soon' },
  { id: 'n3-taisaku', icon: '策', nameKey: 'course.n3-taisaku.name', descKey: 'course.soon.desc', status: 'soon' },
  { id: 'n3-luyen-de', icon: '模', nameKey: 'course.n3-luyen-de.name', descKey: 'course.soon.desc', status: 'soon' },
];

/** Học phần của toàn bộ nội dung đang có trong app. */
export const CURRENT_COURSE: CourseDef =
  COURSES.find((course) => course.id === COURSE_ID) ?? COURSES[0];

export interface ModuleDef {
  id: ModuleId;
  /** Đường dẫn trên URL, ví dụ `/vocabulary`. */
  path: string;
  /** Một chữ Hán làm biểu tượng. Chọn chữ nói đúng nội dung phần đó. */
  icon: string;
  labelKey: MessageKey;
  /** Nhãn ngắn dùng trên thanh điều hướng, nơi không đủ chỗ cho tên đầy đủ. */
  shortKey: MessageKey;
  descKey: MessageKey;
  /** Khoá đếm số bài, ví dụ "12 bài" / "3 bài đọc". */
  unitKey: MessageKey;
  kind: UnitKind;
  /** Thư mục nguồn trong `data-source/`. */
  folder: string;
  /**
   * Phần này có màn hình luyện tập sinh câu hỏi từ dữ liệu không.
   *
   * Từ vựng / kanji / ngữ pháp thì có: câu hỏi dựng được từ chính bảng dữ liệu.
   * Đọc, nghe và bài kiểm tra thì không cần — câu hỏi đã nằm sẵn trong nội dung.
   */
  practice: boolean;
}

export const MODULES: readonly ModuleDef[] = [
  {
    id: 'entrance-test',
    path: 'test',
    icon: '試',
    labelKey: 'module.entrance-test.label',
    shortKey: 'module.entrance-test.short',
    descKey: 'module.entrance-test.desc',
    unitKey: 'module.entrance-test.unit',
    kind: 'test',
    folder: 'entrance-test',
    practice: false,
  },
  {
    id: 'vocabulary',
    path: 'vocabulary',
    icon: '語',
    labelKey: 'module.vocabulary.label',
    shortKey: 'module.vocabulary.short',
    descKey: 'module.vocabulary.desc',
    unitKey: 'module.vocabulary.unit',
    kind: 'vocabulary',
    folder: 'vocabulary',
    practice: true,
  },
  {
    id: 'kanji',
    path: 'kanji',
    icon: '漢',
    labelKey: 'module.kanji.label',
    shortKey: 'module.kanji.short',
    descKey: 'module.kanji.desc',
    unitKey: 'module.kanji.unit',
    kind: 'kanji',
    folder: 'kanji',
    practice: true,
  },
  {
    id: 'grammar',
    path: 'grammar',
    icon: '文',
    labelKey: 'module.grammar.label',
    shortKey: 'module.grammar.short',
    descKey: 'module.grammar.desc',
    unitKey: 'module.grammar.unit',
    kind: 'grammar',
    folder: 'grammar',
    practice: true,
  },
  {
    id: 'reading',
    path: 'reading',
    icon: '読',
    labelKey: 'module.reading.label',
    shortKey: 'module.reading.short',
    descKey: 'module.reading.desc',
    unitKey: 'module.reading.unit',
    kind: 'reading',
    folder: 'reading',
    practice: false,
  },
  {
    id: 'listening',
    path: 'listening',
    icon: '聴',
    labelKey: 'module.listening.label',
    shortKey: 'module.listening.short',
    descKey: 'module.listening.desc',
    unitKey: 'module.listening.unit',
    kind: 'listening',
    folder: 'listening',
    practice: false,
  },
  {
    id: 'mimikara',
    path: 'mimikara',
    icon: '耳',
    labelKey: 'module.mimikara.label',
    shortKey: 'module.mimikara.short',
    descKey: 'module.mimikara.desc',
    unitKey: 'module.mimikara.unit',
    // Cùng hình dạng dữ liệu với phần Ngữ pháp nên dùng chung màn hình chi tiết;
    // tách thành hai module vì đây là giáo trình khác, học song song chứ không nối tiếp.
    kind: 'grammar',
    folder: 'mimikara',
    practice: true,
  },
];

const BY_ID = new Map<ModuleId, ModuleDef>(MODULES.map((module) => [module.id, module]));
const BY_PATH = new Map<string, ModuleDef>(MODULES.map((module) => [module.path, module]));

export function moduleOf(id: ModuleId): ModuleDef {
  const found = BY_ID.get(id);
  // MODULES phủ hết MODULE_IDS nên nhánh này không xảy ra; ném lỗi rõ ràng còn hơn
  // trả về undefined rồi hỏng ở một chỗ xa tít phía sau.
  if (!found) throw new Error(`Module không có trong cấu hình: ${id}`);
  return found;
}

export function moduleByPath(path: string): ModuleDef | null {
  return BY_PATH.get(path) ?? null;
}

/** Kiểm tra lúc khởi động: mọi id khai trong model đều phải có định nghĩa ở đây. */
export const ALL_MODULES_DEFINED = MODULE_IDS.every((id) => BY_ID.has(id));
