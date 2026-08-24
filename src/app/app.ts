import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { MODULES } from './core/course/course.config';
import { LanguageStore } from './core/i18n/language-store';
import { T } from './core/i18n/t';
import { ThemeStore } from './core/services/theme-store';

/** Cuộn quá ngưỡng này thì nút "lên đầu trang" hiện ra (đơn vị: px). */
const BACK_TO_TOP_AT = 700;

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, T],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly theme = inject(ThemeStore);
  protected readonly lang = inject(LanguageStore);

  protected readonly t = this.lang.t.bind(this.lang);

  /**
   * Bảy mục menu dựng từ cấu hình khoá học chứ không viết tay trong template: thêm
   * một phần học là thêm một dòng ở course.config.ts, menu tự có mục mới.
   */
  protected readonly modules = MODULES;

  /**
   * Đã cuộn đủ xa để cần nút quay lên đầu chưa.
   *
   * Vì sao cần nút này: trang một bài ngữ pháp hay một bài đọc dài tới cả chục màn
   * hình, mà nút "bắt đầu luyện" lại nằm ở đầu trang.
   */
  protected readonly scrolledDown = signal(false);

  constructor() {
    if (typeof window === 'undefined') return;

    const update = () => this.scrolledDown.set(window.scrollY > BACK_TO_TOP_AT);
    update();
    // passive: trình duyệt khỏi phải chờ xem hàm này có gọi preventDefault không,
    // nên cuộn không bị khựng. Không cần gỡ bỏ: component gốc sống hết vòng đời trang.
    window.addEventListener('scroll', update, { passive: true });
  }

  /**
   * Không truyền `behavior: 'smooth'`: để mặc định thì trình duyệt dùng
   * `scroll-behavior` khai báo trong styles.css, mà chỗ đó đã bọc trong
   * `prefers-reduced-motion: no-preference` — người tắt hiệu ứng chuyển động sẽ
   * được nhảy thẳng lên đầu thay vì bị kéo trôi qua cả trang.
   */
  protected scrollToTop(): void {
    window.scrollTo({ top: 0 });
  }

  /**
   * Đưa focus vào vùng nội dung chính. `tabindex="-1"` trên <main> là điều kiện
   * bắt buộc: một phần tử không tự nhận focus được thì gọi focus() cũng không có
   * tác dụng, và người dùng bàn phím sẽ Tab tiếp từ đúng chỗ cũ trên header.
   */
  protected focusMain(): void {
    document.getElementById('main-content')?.focus();
  }
}
