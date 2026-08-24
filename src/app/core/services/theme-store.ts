import { Injectable, computed, effect, signal } from '@angular/core';

import type { MessageKey } from '../i18n/messages';
import { readJson, writeJson } from './local-storage';

const STORAGE_KEY = 'riki:theme';

/** 'system' = đi theo cài đặt sáng/tối của hệ điều hành. */
export type ThemePreference = 'system' | 'light' | 'dark';

const ORDER: readonly ThemePreference[] = ['system', 'light', 'dark'];

/** Nhãn là khoá thông điệp vì giao diện có hai ngôn ngữ. */
const LABEL_KEY: Record<ThemePreference, MessageKey> = {
  system: 'theme.system',
  light: 'theme.light',
  dark: 'theme.dark',
};

const ICON: Record<ThemePreference, string> = {
  system: '◐',
  light: '☀',
  dark: '☾',
};

/** Màu thanh trình duyệt trên di động, khớp với nền của từng tông. */
const THEME_COLOR: Record<'light' | 'dark', string> = {
  light: '#0f766e',
  dark: '#0d1117',
};

/**
 * Lựa chọn giao diện sáng/tối.
 *
 * Bảng màu thật nằm trong `styles.css` dưới dạng `light-dark(sáng, tối)`; ở đây chỉ
 * cần đổi thuộc tính `color-scheme` qua `data-theme` trên thẻ <html> là toàn bộ
 * biến màu tự đổi theo.
 */
@Injectable({ providedIn: 'root' })
export class ThemeStore {
  private readonly preferenceRef = signal<ThemePreference>(readPreference());
  private readonly systemPrefersDark = signal(systemPrefersDark());

  readonly preference = this.preferenceRef.asReadonly();

  /** Tông đang thực sự hiển thị, đã quy đổi 'system' thành sáng hoặc tối. */
  readonly resolved = computed<'light' | 'dark'>(() => {
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

  /** Xoay vòng Tự động → Sáng → Tối → Tự động. */
  cycle(): void {
    this.set(nextPreference(this.preferenceRef()));
  }
}

function nextPreference(current: ThemePreference): ThemePreference {
  const index = ORDER.indexOf(current);
  return ORDER[(index + 1) % ORDER.length];
}

function isThemePreference(value: unknown): value is ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark';
}

function readPreference(): ThemePreference {
  const stored = readJson<unknown>(STORAGE_KEY, 'system');
  return isThemePreference(stored) ? stored : 'system';
}

function systemPrefersDark(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyTheme(preference: ThemePreference, resolved: 'light' | 'dark'): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  if (preference === 'system') {
    delete root.dataset['theme'];
  } else {
    root.dataset['theme'] = preference;
  }

  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[resolved]);
}
