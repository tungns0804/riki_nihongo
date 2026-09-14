import {
  afterNextRender,
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';

import { CURRENT_COURSE, MODULES, moduleByPath } from './core/course/course.config';
import { LanguageStore } from './core/i18n/language-store';
import type { MessageKey } from './core/i18n/messages';
import { T } from './core/i18n/t';
import { NavigationProgress } from './core/services/navigation-progress';
import { ThemeStore } from './core/services/theme-store';
import { CourseSwitcher } from './features/shared/course-switcher/course-switcher';
import { Icon } from './features/shared/icon/icon';

/** Cuộn quá ngưỡng này thì nút "lên đầu trang" hiện ra (đơn vị: px). */
const BACK_TO_TOP_AT = 700;

/**
 * Đoạn đầu tiên của đường dẫn, bỏ query và fragment — chính là `path` của phần học
 * đang mở. Bài chi tiết (`/vocabulary/:id`) và cả luyện tập, kết quả
 * (`/vocabulary/:id/practice`) đều nằm dưới đoạn đó nên tự thuộc về đúng mục.
 */
function sectionOf(url: string): string {
  return url.split(/[?#;]/)[0].split('/').find(Boolean) ?? '';
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, NgTemplateOutlet, T, Icon, CourseSwitcher],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly theme = inject(ThemeStore);
  protected readonly lang = inject(LanguageStore);
  private readonly router = inject(Router);

  /**
   * Đang chuyển trang hay không. Mọi màn hình đều nạp động, nên bấm menu hay nút
   * "Bắt đầu luyện" là phải chờ tải tệp — không báo gì thì người dùng tưởng cú bấm
   * bị trượt.
   */
  protected readonly navigating = inject(NavigationProgress).active;

  protected readonly t = this.lang.t.bind(this.lang);

  /**
   * Bảy mục menu dựng từ cấu hình khoá học chứ không viết tay trong template: thêm
   * một phần học là thêm một dòng ở course.config.ts, menu tự có mục mới.
   */
  protected readonly modules = MODULES;

  /** Học phần đang học, ghi dưới tên ứng dụng ở thanh bên. */
  protected readonly course = CURRENT_COURSE;

  /**
   * Phần học đang mở, tính cả các trang chi tiết nằm dưới nó.
   *
   * Vì sao tự tính thay cho `routerLinkActive`: menu giờ vẽ HAI lần (thanh bên và
   * dải điện thoại) và breadcrumb cũng cần biết đang ở phần nào. Một tín hiệu dùng
   * chung cho cả ba chỗ thì không có chuyện menu sáng mục này mà breadcrumb ghi tên
   * mục khác.
   */
  protected readonly section = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => sectionOf(event.urlAfterRedirects)),
    ),
    { initialValue: sectionOf(this.router.url) },
  );

  /** Tên hiện sau "Riki Nihongo /" trên thanh trên cùng; trang chủ thì không có. */
  protected readonly crumbKey = computed<MessageKey | null>(
    () => moduleByPath(this.section())?.labelKey ?? null,
  );

  /**
   * Đã cuộn đủ xa để cần nút quay lên đầu chưa.
   *
   * Vì sao cần nút này: trang một bài ngữ pháp hay một bài đọc dài tới cả chục màn
   * hình, mà nút "bắt đầu luyện" lại nằm ở đầu trang.
   */
  protected readonly scrolledDown = signal(false);

  /** Chính thẻ <header>, để đo chiều cao thật của nó. Xem `trackHeaderHeight`. */
  private readonly headerRef = viewChild.required<ElementRef<HTMLElement>>('appHeader');

  /** Dải menu cuộn ngang, chỉ hiện trên điện thoại. Xem `revealActiveTab`. */
  private readonly tabStrip = viewChild.required<ElementRef<HTMLElement>>('tabStrip');

  constructor() {
    // Chạy sau lần vẽ đầu tiên vì lúc này <header> chưa tồn tại. Trên máy chủ thì
    // không chạy, nên không cần tự kiểm tra `window`.
    afterNextRender(() => this.trackHeaderHeight());

    // Đọc section() để Angular chạy lại sau mỗi lần đổi mục — lúc đó class
    // is-active đã nằm đúng chỗ trong DOM.
    afterRenderEffect(() => {
      this.section();
      this.revealActiveTab();
    });

    if (typeof window === 'undefined') return;

    const update = () => this.scrolledDown.set(window.scrollY > BACK_TO_TOP_AT);
    update();
    // passive: trình duyệt khỏi phải chờ xem hàm này có gọi preventDefault không,
    // nên cuộn không bị khựng. Không cần gỡ bỏ: component gốc sống hết vòng đời trang.
    window.addEventListener('scroll', update, { passive: true });
  }

  /**
   * Đo chiều cao thật của header rồi ghi vào biến CSS `--header-h`.
   *
   * Năm chỗ cần đúng con số này để không bị header dính che mất: scroll-padding của
   * cả trang, thanh tìm từ dính trong bài từ vựng, mục lục dính trong bài ngữ pháp,
   * thanh tiến độ lúc luyện tập, và vệt báo đang chuyển trang.
   *
   * Vì sao phải ĐO thay vì viết sẵn một con số cho mỗi breakpoint: trên điện thoại
   * header gồm cả dải menu, còn trên máy tính thì không; chữ trong đó lại dài ngắn
   * theo ngôn ngữ. Con số viết sẵn trước đây (104px cho khổ ≤800px) đã sai ngay khi
   * menu xếp thành ba hàng.
   *
   * ResizeObserver chứ không phải sự kiện `resize` của cửa sổ: header còn cao thấp
   * theo cả những thứ không liên quan tới cửa sổ, như đổi ngôn ngữ.
   *
   * Không cần ngắt theo dõi: component gốc sống hết vòng đời trang.
   */
  private trackHeaderHeight(): void {
    const header = this.headerRef().nativeElement;

    const apply = () => {
      const height = Math.round(header.getBoundingClientRect().height);
      document.documentElement.style.setProperty('--header-h', `${height}px`);
    };

    apply();
    new ResizeObserver(apply).observe(header);
  }

  /**
   * Trên điện thoại menu là một dải cuộn ngang, và mục đang mở có thể nằm khuất
   * ngoài mép — mở thẳng /mimikara là mục thứ bảy. Kéo nó vào giữa dải, không thì
   * người dùng không thấy mình đang ở mục nào.
   */
  private revealActiveTab(): void {
    const strip = this.tabStrip().nativeElement;
    // Dải đang ẩn (màn hình rộng) hoặc vừa khít thì không có gì để cuộn.
    if (strip.scrollWidth <= strip.clientWidth) return;

    const active = strip.querySelector<HTMLElement>('.is-active');
    if (!active) return;

    strip.scrollLeft = active.offsetLeft - (strip.clientWidth - active.offsetWidth) / 2;
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
