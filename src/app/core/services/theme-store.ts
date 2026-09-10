import { Injectable, computed, effect, signal } from '@angular/core';

import type { MessageKey } from '../i18n/messages';
import { readJson, writeJson } from './local-storage';

const STORAGE_KEY = 'riki:theme';

/** index.html cũng đọc đúng khoá này để tắt đèn đêm trước khi Angular chạy — đổi thì đổi cả hai. */
const NIGHT_LIGHT_KEY = 'riki:night-light';

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
 * Lựa chọn giao diện: sáng/tối, và ánh sáng ban đêm.
 *
 * Bảng màu thật nằm trong `styles.css` dưới dạng `light-dark(sáng, tối)`; ở đây chỉ
 * cần đổi thuộc tính `color-scheme` qua `data-theme` trên thẻ <html> là toàn bộ
 * biến màu tự đổi theo. Ánh sáng ban đêm cũng thế: lớp phủ màu ấm nằm trong
 * styles.css, ở đây chỉ bật/tắt một thuộc tính trên <html>.
 */
@Injectable({ providedIn: 'root' })
export class ThemeStore {
  private readonly preferenceRef = signal<ThemePreference>(readPreference());
  private readonly systemPrefersDark = signal(systemPrefersDark());
  private readonly nightLightRef = signal(readNightLight());

  readonly preference = this.preferenceRef.asReadonly();

  /**
   * Ánh sáng ban đêm có đang bật không. Bật sẵn với người mở trang lần đầu.
   *
   * Là công tắc riêng chứ không phải nấc thứ tư trong vòng Tự động → Sáng → Tối,
   * giống như trên Windows: gộp vào một vòng thì người đang dùng nền tối muốn thêm
   * màu ấm sẽ phải bỏ nền tối.
   */
  readonly nightLight = this.nightLightRef.asReadonly();

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
    effect(() => applyNightLight(this.nightLightRef()));
  }

  set(preference: ThemePreference): void {
    this.preferenceRef.set(preference);
    writeJson(STORAGE_KEY, preference);
  }

  /** Xoay vòng Tự động → Sáng → Tối → Tự động. */
  cycle(): void {
    this.set(nextPreference(this.preferenceRef()));
  }

  toggleNightLight(): void {
    const next = !this.nightLightRef();
    this.nightLightRef.set(next);
    writeJson(NIGHT_LIGHT_KEY, next);
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

/** Chỉ một giá trị `false` đã lưu mới là tắt; chưa lưu gì (lần đầu mở trang) là bật. */
function readNightLight(): boolean {
  return readJson<unknown>(NIGHT_LIGHT_KEY, true) !== false;
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

/** Bật là mặc định của CSS nên không cần thuộc tính nào; chỉ đánh dấu khi TẮT. */
function applyNightLight(on: boolean): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  if (on) {
    delete root.dataset['nightLight'];
  } else {
    root.dataset['nightLight'] = 'off';
  }
}
