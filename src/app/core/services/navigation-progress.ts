import { Injectable, inject, signal } from '@angular/core';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
} from '@angular/router';

/**
 * Chờ bao lâu rồi mới VẼ thanh tiến trình, tính từ lúc bắt đầu điều hướng.
 *
 * Mọi màn hình trong app đều nạp động (`loadComponent` ở app.routes.ts), nên bấm một
 * mục menu, một thẻ bài hay nút "Bắt đầu luyện" là trình duyệt phải tải về một tệp
 * JavaScript. Lần đầu vào một màn hình thì việc đó mất vài trăm mili giây; những lần
 * sau tệp đã nằm trong bộ nhớ đệm nên xong gần như tức thì.
 *
 * Vẽ thanh ngay từ mili giây đầu tiên sẽ khiến trường hợp thứ hai — tức đa số lần bấm
 * qua lại — loé lên một cái rồi tắt, nhiễu hơn là không có gì. Ngưỡng này lọc đúng
 * những lần thật sự phải chờ.
 */
const SHOW_DELAY_MS = 120;

/**
 * Đã vẽ ra thì giữ ít nhất chừng này, kể cả khi điều hướng xong sớm hơn.
 *
 * Không có ngưỡng này thì một lần tải mất 130ms sẽ vẽ thanh rồi xoá ngay sau 10ms —
 * người dùng chỉ kịp thấy một vệt nháy, không đọc được là chuyện gì đang xảy ra.
 */
const MIN_VISIBLE_MS = 320;

/**
 * Trạng thái "đang chuyển trang", để thanh tiến trình ở khung ngoài biết khi nào cần
 * hiện. Cơ chế giống hệt minano_nihongo.
 *
 * Vì sao cần: router chỉ dựng component MỚI sau khi tệp của nó tải xong, nên trong lúc
 * chờ thì màn hình vẫn đứng nguyên ở trang cũ. Không có phản hồi gì thì người dùng
 * tưởng cú bấm bị trượt và bấm thêm lần nữa.
 *
 * Đặt ở đây chứ không nhét thẳng vào `App` để phần hẹn giờ có chỗ đứng riêng, còn
 * `App` chỉ việc đọc một signal.
 */
@Injectable({ providedIn: 'root' })
export class NavigationProgress {
  private readonly router = inject(Router);

  private readonly activeRef = signal(false);

  /** Đang chuyển trang và đã chờ đủ lâu để đáng hiện thanh tiến trình. */
  readonly active = this.activeRef.asReadonly();

  private showTimer: ReturnType<typeof setTimeout> | null = null;
  private hideTimer: ReturnType<typeof setTimeout> | null = null;
  /** Thời điểm thanh được vẽ ra, để biết đã đủ MIN_VISIBLE_MS hay chưa. */
  private shownAt = 0;

  constructor() {
    if (typeof window === 'undefined') return;

    // Không cần huỷ đăng ký: service này sống ở gốc, hết vòng đời cùng trang.
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.start();
        return;
      }
      if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.stop();
      }
    });
  }

  private start(): void {
    // Điều hướng mới chen vào giữa chừng (bấm qua lại liên tiếp) thì huỷ lệnh tắt
    // đang chờ, để thanh chạy liền một mạch thay vì tắt rồi bật lại.
    this.clearTimer('hide');
    if (this.activeRef()) return;

    this.clearTimer('show');
    this.showTimer = setTimeout(() => {
      this.showTimer = null;
      this.shownAt = Date.now();
      this.activeRef.set(true);
    }, SHOW_DELAY_MS);
  }

  private stop(): void {
    // Xong trước khi kịp vẽ: bỏ luôn lệnh vẽ, người dùng không thấy gì cả.
    this.clearTimer('show');
    if (!this.activeRef()) return;

    const shownFor = Date.now() - this.shownAt;
    const remaining = Math.max(0, MIN_VISIBLE_MS - shownFor);
    this.clearTimer('hide');
    this.hideTimer = setTimeout(() => {
      this.hideTimer = null;
      this.activeRef.set(false);
    }, remaining);
  }

  private clearTimer(which: 'show' | 'hide'): void {
    const timer = which === 'show' ? this.showTimer : this.hideTimer;
    if (timer === null) return;
    clearTimeout(timer);
    if (which === 'show') this.showTimer = null;
    else this.hideTimer = null;
  }
}
