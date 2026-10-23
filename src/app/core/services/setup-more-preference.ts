import { Injectable, signal } from '@angular/core';

import { readJson, writeJson } from './local-storage';

const STORAGE_KEY = 'riki:setup-more-open';

/**
 * Phần "Tuỳ chỉnh thêm" của khung thiết lập luyện tập đang mở hay đóng — MỘT lựa chọn
 * cho mọi bài, mọi học phần. Người hay chỉnh số câu, kiểu trả lời thì mở một lần là mọi
 * bài đều mở sẵn; người chỉ bấm Bắt đầu thì không bao giờ phải thấy chúng.
 */
@Injectable({ providedIn: 'root' })
export class SetupMorePreference {
  private readonly openRef = signal(readJson<unknown>(STORAGE_KEY, false) === true);
  readonly open = this.openRef.asReadonly();

  set(open: boolean): void {
    if (open === this.openRef()) return;
    this.openRef.set(open);
    writeJson(STORAGE_KEY, open);
  }
}
