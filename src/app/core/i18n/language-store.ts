import { Injectable, computed, effect, signal } from '@angular/core';

import { readJson, writeJson } from '../services/local-storage';
import { LANGUAGES, LANGUAGE_NAME, LANGUAGE_SHORT, Language, MESSAGES, MessageKey } from './messages';

const STORAGE_KEY = 'riki:language';
const DEFAULT_LANGUAGE: Language = 'vi';

/** Giá trị chèn vào chỗ `{ten}` trong thông điệp. */
export type MessageParams = Record<string, string | number>;

/**
 * Ngôn ngữ giao diện.
 *
 * Dịch lúc chạy chứ không dùng i18n biên dịch của Angular: đổi ngôn ngữ phải có
 * hiệu lực ngay, và bản offline phải gộp được thành MỘT file HTML — `ng build
 * --localize` thì mỗi ngôn ngữ là một bundle riêng nên không làm được cả hai.
 *
 * Template gọi thẳng `t('key')`. Hàm này đọc signal `language` nên Angular ghi nhận
 * phụ thuộc và tự vẽ lại component khi đổi ngôn ngữ.
 */
@Injectable({ providedIn: 'root' })
export class LanguageStore {
  private readonly current = signal<Language>(readLanguage());

  readonly language = this.current.asReadonly();
  readonly name = computed(() => LANGUAGE_NAME[this.current()]);
  readonly short = computed(() => LANGUAGE_SHORT[this.current()]);

  /** Ngôn ngữ sẽ chuyển sang khi bấm nút (hiện chỉ có hai nên là cái còn lại). */
  readonly next = computed<Language>(() => {
    const index = LANGUAGES.indexOf(this.current());
    return LANGUAGES[(index + 1) % LANGUAGES.length];
  });

  readonly nextName = computed(() => LANGUAGE_NAME[this.next()]);

  constructor() {
    effect(() => applyLanguage(this.current()));
  }

  set(language: Language): void {
    this.current.set(language);
    writeJson(STORAGE_KEY, language);
  }

  toggle(): void {
    this.set(this.next());
  }

  /** Lấy chuỗi đã dịch, chèn tham số nếu có. */
  t(key: MessageKey, params?: MessageParams): string {
    const text = MESSAGES[key][this.current()];
    return params ? interpolate(text, params) : text;
  }

  /**
   * Như `t` nhưng tham số cũng là khoá thông điệp, dịch lồng nhau.
   * Dùng cho nhãn ghép kiểu "{from} → {to}" với from/to là tên các thể động từ.
   */
  tNested(key: MessageKey, paramKeys: Record<string, MessageKey>): string {
    const params: MessageParams = {};
    for (const [name, messageKey] of Object.entries(paramKeys)) {
      params[name] = this.t(messageKey);
    }
    return this.t(key, params);
  }
}

function interpolate(text: string, params: MessageParams): string {
  return text.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}

function isLanguage(value: unknown): value is Language {
  return LANGUAGES.includes(value as Language);
}

function readLanguage(): Language {
  const stored = readJson<unknown>(STORAGE_KEY, DEFAULT_LANGUAGE);
  return isLanguage(stored) ? stored : DEFAULT_LANGUAGE;
}

function applyLanguage(language: Language): void {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = language;
}
