import { Injectable, effect, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

import { LanguageStore } from './i18n/language-store';
import type { MessageKey } from './i18n/messages';

/**
 * Ghép tiêu đề của từng trang với tên ứng dụng, theo ngôn ngữ đang chọn.
 *
 * Không có cái này thì `title` khai báo ở route sẽ ghi đè hẳn tiêu đề trong
 * index.html, khiến tab mất tên ứng dụng ngay khi điều hướng sang trang khác.
 *
 * Route khai báo `title` là một MessageKey (xem app.routes.ts) chứ không phải chữ
 * sẵn, nên đổi ngôn ngữ là tiêu đề tab đổi theo.
 */
@Injectable({ providedIn: 'root' })
export class AppTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly lang = inject(LanguageStore);

  // KHÔNG được inject Router ở đây: Router cần TitleStrategy, inject ngược lại
  // sẽ tạo vòng phụ thuộc và Angular ném NG0200 ngay lúc khởi động.
  private currentKey: MessageKey | null = null;

  constructor() {
    super();
    // Đổi ngôn ngữ thì đặt lại tiêu đề của đúng trang đang mở.
    effect(() => {
      this.lang.language();
      this.apply(this.currentKey);
    });
  }

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const raw = this.buildTitle(snapshot);
    this.currentKey = (raw as MessageKey | undefined) ?? null;
    this.apply(this.currentKey);
  }

  private apply(key: MessageKey | null): void {
    const appName = this.lang.t('app.title');
    this.title.setTitle(key ? `${this.lang.t(key)} · ${appName}` : appName);
  }
}
