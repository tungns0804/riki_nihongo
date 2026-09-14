import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type IconName = 'globe' | 'contrast' | 'sun' | 'moon' | 'candle' | 'chevron';

/**
 * Biểu tượng nét mảnh, vẽ bằng SVG nội tuyến — lấy nguyên từ minano_nihongo.
 *
 * Vì sao không dùng ký tự (◐ ☀ 🕯 🌐) như trước: mỗi font vẽ một kiểu — 🕯 là ô vuông
 * rỗng trên nhiều máy Windows, mà đó lại là dấu hiệu duy nhất của đèn đêm khi nút thu
 * gọn nhãn — và đổi `<html lang>` là trình duyệt chọn font khác, nút nhảy kích thước.
 *
 * Chỉ có năm hình cho hai nút trên thanh trên cùng. Mục menu thì dùng chữ Hán của
 * từng phần học (xem `icon` trong course.config.ts): chữ vuông của font Nhật vẽ ổn
 * định, và là cùng chữ trên thẻ ở trang chủ.
 *
 * Màu lấy `currentColor`, cỡ lấy theo `font-size` của chỗ đặt (1.25em), nên nơi gọi
 * chỉnh bằng CSS như chỉnh chữ.
 */
@Component({
  selector: 'app-icon',
  template: `
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      @switch (name()) {
        @case ('globe') {
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18" />
          <path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z" />
        }
        @case ('contrast') {
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" />
        }
        @case ('sun') {
          <circle cx="12" cy="12" r="4" />
          <path
            d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
          />
        }
        @case ('moon') {
          <path d="M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5a7 7 0 0 0 11 11z" />
        }
        @case ('chevron') {
          <path d="m6 9 6 6 6-6" />
        }
        @case ('candle') {
          <path d="M12 2.5c2 2.4 3 4.1 3 5.6a3 3 0 0 1-6 0c0-1.5 1-3.2 3-5.6z" />
          <rect x="8.5" y="13" width="7" height="8.5" rx="1" />
        }
      }
    </svg>
  `,
  styles: `
    :host {
      display: inline-grid;
      place-items: center;
      width: 1.25em;
      height: 1.25em;
      flex-shrink: 0;
    }

    svg {
      width: 100%;
      height: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Icon {
  readonly name = input.required<IconName>();
}
