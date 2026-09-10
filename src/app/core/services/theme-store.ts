import { Injectable, computed, effect, signal } from '@angular/core';

import type { MessageKey } from '../i18n/messages';
import { readJson, writeJson } from './local-storage';

const STORAGE_KEY = 'riki:theme';

/**
 * 'system' = đi theo cài đặt sáng/tối của hệ điều hành.
 * 'night'  = đèn đêm: nền giấy ngà, ít ánh sáng xanh, giống Night light của Windows.
 */
export type ThemePreference = 'system' | 'light' | 'dark' | 'night';

const ORDER: readonly ThemePreference[] = ['system', 'light', 'dark', 'night'];

/**
 * Tông của người mở trang lần đầu, khi chưa từng bấm nút giao diện.
 *
 * Là đèn đêm chứ không phải 'system' như minano_nihongo: trang này được yêu cầu mở ra
 * là tông dịu mắt ngay, không bắt người học tự đi tìm. index.html cũng mặc định đúng
 * tông này để không chớp màu lúc mới mở — đổi ở đây thì đổi cả ở đó.
 */
const DEFAULT_PREFERENCE: ThemePreference = 'night';

/** Nhãn là khoá thông điệp vì giao diện có hai ngôn ngữ. */
const LABEL_KEY: Record<ThemePreference, MessageKey> = {
  system: 'theme.system',
  light: 'theme.light',
  dark: 'theme.dark',
  night: 'theme.night',
};

const ICON: Record<ThemePreference, string> = {
  system: '◐',
  light: '☀',
  dark: '☾',
  // Ngọn nến chứ không phải một mặt trời thứ hai: ☀ và ☼ khác nhau đúng một nét
  // ở cỡ chữ 14px, mà đây lại là dấu hiệu duy nhất trên nút khi thu gọn nhãn.
  night: '🕯',
};

/** Tông thật sự đang vẽ ra màn hình — 'system' đã được quy đổi xong. */
type ResolvedTheme = 'light' | 'dark' | 'night';

/** Màu thanh trình duyệt trên di động, khớp với nền của từng tông. */
const THEME_COLOR: Record<ResolvedTheme, string> = {
  light: '#0f766e',
  dark: '#0d1117',
  night: '#9a4c15',
};

/**
 * Lựa chọn giao diện: sáng, tối, hoặc đèn đêm.
 *
 * Bảng màu thật nằm trong `styles.css`. Sáng và tối khai báo chung bằng
 * `light-dark(sáng, tối)`, nên ở đây chỉ cần đổi `color-scheme` qua `data-theme`
 * trên thẻ <html> là toàn bộ biến màu đổi theo. Đèn đêm là bảng màu ấm viết riêng
 * dưới `:root[data-theme='night']`, cũng chỉ cần đúng thuộc tính đó để bật.
 */
@Injectable({ providedIn: 'root' })
export class ThemeStore {
  private readonly preferenceRef = signal<ThemePreference>(readPreference());
  private readonly systemPrefersDark = signal(systemPrefersDark());

  readonly preference = this.preferenceRef.asReadonly();

  /**
   * Tông đang thực sự hiển thị: 'system' đã quy đổi thành sáng hoặc tối, ba lựa
   * chọn còn lại thì giữ nguyên.
   */
  readonly resolved = computed<ResolvedTheme>(() => {
    const preference = this.preferenceRef();
    if (preference !== 'system') return preference;
    return this.systemPrefersDark() ? 'dark' : 'light';
  });

  readonly labelKey = computed(() => LABEL_KEY[this.preferenceRef()]);
  readonly icon = computed(() => ICON[this.preferenceRef()]);
  readonly nextLabelKey = computed(() => LABEL_KEY[nextPreference(this.preferenceRef())]);

  constructor() {
    // Khi đang để 'Tự động' mà người dùng đổi cài đặt hệ thống thì đổi theo ngay.
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      window
        .matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', (event) => this.systemPrefersDark.set(event.matches));
    }

    effect(() => applyTheme(this.preferenceRef(), this.resolved()));
  }

  set(preference: ThemePreference): void {
    this.preferenceRef.set(preference);
    writeJson(STORAGE_KEY, preference);
  }

  /** Xoay vòng Tự động → Sáng → Tối → Đèn đêm → Tự động. */
  cycle(): void {
    this.set(nextPreference(this.preferenceRef()));
  }
}

function nextPreference(current: ThemePreference): ThemePreference {
  const index = ORDER.indexOf(current);
  return ORDER[(index + 1) % ORDER.length];
}

function isThemePreference(value: unknown): value is ThemePreference {
  return ORDER.includes(value as ThemePreference);
}

function readPreference(): ThemePreference {
  const stored = readJson<unknown>(STORAGE_KEY, DEFAULT_PREFERENCE);
  return isThemePreference(stored) ? stored : DEFAULT_PREFERENCE;
}

function systemPrefersDark(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyTheme(preference: ThemePreference, resolved: ResolvedTheme): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  if (preference === 'system') {
    delete root.dataset['theme'];
  } else {
    root.dataset['theme'] = preference;
  }

  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[resolved]);
}
