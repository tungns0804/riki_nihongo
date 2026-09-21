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

import { COURSES, courseById, moduleByPath, modulesOf } from './core/course/course.config';
import { LanguageStore } from './core/i18n/language-store';
import type { MessageKey } from './core/i18n/messages';
import { T } from './core/i18n/t';
import { NavigationProgress } from './core/services/navigation-progress';
import { ThemeStore } from './core/services/theme-store';
import { UnitDirectory } from './core/services/unit-directory';
import { CourseSwitcher } from './features/shared/course-switcher/course-switcher';
import { Icon } from './features/shared/icon/icon';

/** Cuộn quá ngưỡng này thì nút "lên đầu trang" hiện ra (đơn vị: px). */
const BACK_TO_TOP_AT = 700;

/** Nhãn breadcrumb của đoạn cuối địa chỉ: luyện tập, làm đề hay kết quả. */
const ACTION_KEY: Readonly<Record<string, MessageKey>> = {
  practice: 'route.practice',
  'test-run': 'route.testRun',
  result: 'route.result',
};

/**
 * Các đoạn của đường dẫn, bỏ query và fragment:
 * `/n3-junbi/vocabulary/02-dong-tu/practice` → học phần, phần học, bài, luyện tập.
 */
function segmentsOf(url: string): string[] {
  return url.split(/[?#;]/)[0].split('/').filter(Boolean);
}

/** Một mục của thanh bên (và dải menu trên điện thoại). */
interface NavItem {
  id: string;
  link: string[];
  icon: string;
  labelKey: MessageKey;
  /** Nhãn ngắn trên menu, nơi không đủ chỗ cho tên đầy đủ. */
  shortKey: MessageKey;
  active: boolean;
}

/** Một cấp breadcrumb sau nút học phần. `link` null = cấp đang mở, hoặc cấp không có trang. */
interface Crumb {
  label: string;
  link: string[] | null;
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
  private readonly units = inject(UnitDirectory);

  /**
   * Đang chuyển trang hay không. Mọi màn hình đều nạp động, nên bấm menu hay nút
   * "Bắt đầu luyện" là phải chờ tải tệp — không báo gì thì người dùng tưởng cú bấm
   * bị trượt.
   */
  protected readonly navigating = inject(NavigationProgress).active;

  protected readonly t = this.lang.t.bind(this.lang);

  private readonly segments = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => segmentsOf(event.urlAfterRedirects)),
    ),
    { initialValue: segmentsOf(this.router.url) },
  );

  /**
   * Học phần đang mở, lấy ĐÚNG theo địa chỉ; null ở trang gốc chọn học phần.
   *
   * Không "nhớ học phần vừa học" để hiện ở trang gốc: trang gốc đứng TRÊN cấp học
   * phần, hiện menu và breadcrumb của một học phần ở đó là nói sai người học đang ở đâu.
   */
  protected readonly course = computed(() => courseById(this.segments()[0]));

  /**
   * Phần học đang mở (`vocabulary`), tính cả các trang chi tiết, luyện tập, kết quả nằm
   * dưới nó. Rỗng ở trang gốc và trang của học phần.
   */
  protected readonly section = computed(() => (this.course() ? (this.segments()[1] ?? '') : ''));

  /**
   * Mục menu theo đúng cấp đang đứng: trong một học phần là các phần học của nó, ở trang
   * gốc là các học phần. Dựng từ cấu hình chứ không viết tay trong template: thêm một
   * phần học là thêm một dòng ở course.config.ts, menu tự có mục mới.
   *
   * Vì sao tự tính `active` thay cho `routerLinkActive`: menu vẽ HAI lần (thanh bên và dải
   * điện thoại) và breadcrumb cũng cần biết đang ở phần nào. Một tín hiệu dùng chung cho
   * cả ba chỗ thì không có chuyện menu sáng mục này mà breadcrumb ghi tên mục khác.
   */
  protected readonly navItems = computed<NavItem[]>(() => {
    const course = this.course();

    if (!course) {
      return COURSES.filter((item) => item.status === 'active').map((item) => ({
        id: item.id,
        link: ['/', item.id],
        icon: item.icon,
        labelKey: item.nameKey,
        shortKey: item.nameKey,
        active: false,
      }));
    }

    const section = this.section();
    return modulesOf(course).map((module) => ({
      id: module.id,
      link: ['/', course.id, module.path],
      icon: module.icon,
      labelKey: module.labelKey,
      shortKey: module.shortKey,
      active: module.path === section,
    }));
  });

  /**
   * Các cấp breadcrumb sau nút học phần: phần học / bài / luyện tập hoặc kết quả.
   *
   *   Riki Nihongo / BTVN CƠ BẢN (MỚI) ▾ / Từ vựng / Danh từ / Luyện tập
   *
   * Cấp nào có trang thì bấm được; cấp cuối là trang đang mở nên không. Trước đây
   * breadcrumb dừng ở "Từ vựng" cho mọi trang bên dưới — đang luyện một bài mà breadcrumb
   * nói đang ở danh sách bài, và cũng không có đường bấm về danh sách.
   */
  protected readonly crumbs = computed<Crumb[]>(() => {
    const course = this.course();
    const [, path = '', unitId, action] = this.segments();
    const module = moduleByPath(path);
    if (!course || !module || !course.modules.includes(module.id)) return [];

    const moduleLink = ['/', course.id, module.path];
    const trail: Crumb[] = [{ label: this.t(module.labelKey), link: moduleLink }];

    if (unitId) {
      // Bài con (BTVN của một cụm) thì đi qua bài mẹ: breadcrumb phải đọc ra đúng cấp
      // đang đứng — "Từ vựng / Danh từ / BTVN 1–10", không phải "Từ vựng / BTVN 1–10"
      // như thể BTVN là một bài ngang hàng với Danh từ.
      const parentId = this.units.parentOf(course.id, module.id, unitId);
      if (parentId) {
        trail.push({
          label: this.units.nameOf(course.id, module.id, parentId) ?? this.t('route.unit'),
          link: [...moduleLink, parentId],
        });
      }

      trail.push({
        // Danh mục chưa tải xong thì tạm ghi "Bài học", có tên là thay ngay.
        label: this.units.nameOf(course.id, module.id, unitId) ?? this.t('route.unit'),
        // Đề kiểm tra nhập môn không có trang chi tiết (xem EntranceTest).
        link: module.kind === 'test' ? null : [...moduleLink, unitId],
      });
    }

    // Đoạn cuối tự nói đang ở màn hình nào ("/practice" luyện tập, "/test-run" làm đề),
    // nên không phải đoán theo phần học nữa — mà cũng không đoán được: phần Ngữ pháp có
    // cả bài lý thuyết lẫn bài dạng đề.
    const actionKey = action ? ACTION_KEY[action] : undefined;
    if (actionKey) trail.push({ label: this.t(actionKey), link: null });

    trail[trail.length - 1] = { ...trail[trail.length - 1], link: null };
    return trail;
  });

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
   * ngoài mép — mở thẳng /n3-junbi/mimikara là mục thứ bảy. Kéo nó vào giữa dải, không
   * thì người dùng không thấy mình đang ở mục nào.
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
