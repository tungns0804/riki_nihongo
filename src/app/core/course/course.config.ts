import { InjectionToken } from '@angular/core';

import type { MessageKey } from '../i18n/messages';
import { MODULE_IDS, ModuleId, UnitKind } from '../models/content.model';

/**
 * Định nghĩa các học phần và các phần học của chúng.
 *
 * Đây là chỗ DUY NHẤT mô tả một phần học: đường dẫn, biểu tượng, khoá thông điệp,
 * hình dạng dữ liệu và tên thư mục nguồn. Thanh điều hướng, trang chủ và bộ định
 * tuyến đều đọc từ đây, nên thêm một phần mới là thêm một dòng ở bảng dưới chứ không
 * phải sửa năm chỗ. Script sinh nội dung giữ một bản sao ngắn (không import được file
 * TypeScript) — xem `COURSES` trong scripts/generate-content.mjs.
 */

export interface CourseDef {
  /**
   * Cũng là đoạn đầu của địa chỉ (`/n3-junbi/vocabulary`) và tên thư mục nội dung
   * (`data-source/n3-junbi/`, `public/content/n3-junbi/`).
   */
  id: string;
  /** Một chữ Hán làm biểu tượng trên thẻ, cùng kiểu với thẻ phần học. */
  icon: string;
  nameKey: MessageKey;
  descKey: MessageKey;
  /** 'active' = đang học được; 'soon' = đã có trong lộ trình của Riki nhưng chưa làm. */
  status: 'active' | 'soon';
  /**
   * Các phần học của học phần, theo thứ tự trên menu. Học phần "Sắp có" để rỗng.
   *
   * Khai theo từng học phần chứ không dùng chung bảy phần: BTVN chỉ là bài tập về
   * nhà, hiện đủ bảy thẻ thì sáu thẻ nằm "chưa có nội dung" mãi mãi, và người học
   * tưởng học phần đang soạn dở.
   */
  modules: readonly ModuleId[];
}

/**
 * Năm học phần của website Riki Nihongo, đúng thứ tự Riki liệt kê.
 *
 * Học phần chưa làm VẪN hiện trong bộ chọn, mờ đi kèm nhãn "Sắp có": người học phải
 * thấy trang gồm những học phần nào ngay từ đầu, ẩn đi thì trang trông như chỉ có
 * đúng những khoá đã làm.
 */
export const COURSES: readonly CourseDef[] = [
  // 準備 · 基本 · 深 (chuyên sâu) · 対策 · 模試 (luyện đề)
  {
    id: 'n3-junbi',
    icon: '準',
    nameKey: 'course.n3-junbi.name',
    descKey: 'course.n3-junbi.desc',
    status: 'active',
    modules: MODULE_IDS,
  },
  {
    id: 'btvn-co-ban',
    icon: '基',
    nameKey: 'course.btvn-co-ban.name',
    descKey: 'course.btvn-co-ban.desc',
    status: 'active',
    modules: ['vocabulary', 'kanji'],
  },
  {
    id: 'btvn-n4-chuyen-sau',
    icon: '深',
    nameKey: 'course.btvn-n4-chuyen-sau.name',
    descKey: 'course.btvn-n4-chuyen-sau.desc',
    status: 'active',
    modules: ['kanji'],
  },
  { id: 'n3-taisaku', icon: '策', nameKey: 'course.n3-taisaku.name', descKey: 'course.soon.desc', status: 'soon', modules: [] },
  { id: 'n3-luyen-de', icon: '模', nameKey: 'course.n3-luyen-de.name', descKey: 'course.soon.desc', status: 'soon', modules: [] },
];

/** Học phần dùng khi địa chỉ không nói gì và trình duyệt cũng chưa nhớ học phần nào. */
export const DEFAULT_COURSE: CourseDef = COURSES[0];

/** Học phần ĐANG HỌC ĐƯỢC có id này; null nếu không có, hoặc mới ở mức "Sắp có". */
export function courseById(id: unknown): CourseDef | null {
  return COURSES.find((course) => course.id === id && course.status === 'active') ?? null;
}

/**
 * Học phần của cây route đang mở, cấp ở route cha của từng học phần (xem app.routes.ts).
 *
 * Đi qua DI chứ không qua input của route: ContentStore, ProgressStore và các guard
 * cũng cần biết học phần, mà chúng không có input nào để nhận.
 */
export const COURSE = new InjectionToken<CourseDef>('COURSE');

export interface ModuleDef {
  id: ModuleId;
  /** Đoạn địa chỉ sau học phần, ví dụ `vocabulary` trong `/n3-junbi/vocabulary`. */
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
  /** Thư mục nguồn trong `data-source/<học phần>/`. */
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

/** Các phần học của một học phần, đúng thứ tự khai trong `modules`. */
export function modulesOf(course: CourseDef): ModuleDef[] {
  return course.modules.map(moduleOf);
}

/** Kiểm tra lúc khởi động: mọi id khai trong model đều phải có định nghĩa ở đây. */
export const ALL_MODULES_DEFINED = MODULE_IDS.every((id) => BY_ID.has(id));
