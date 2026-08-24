import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { PracticeSessionStore } from '../services/practice-session-store';

/**
 * Phiên luyện tập chỉ nằm trong bộ nhớ, nên mở thẳng /practice (dán link, F5 giữa
 * chừng, bấm back sau khi đã xong) sẽ rơi vào một màn hình không có câu hỏi nào.
 * Đưa về trang chủ vẫn hơn là để người dùng nhìn một trang trống không giải thích.
 */
export const practiceGuard: CanActivateFn = () => {
  const session = inject(PracticeSessionStore);
  const router = inject(Router);
  return session.hasSession() ? true : router.createUrlTree(['/']);
};

/** Cùng lý do, cho màn hình kết quả: không có bản tổng kết thì không có gì để xem. */
export const resultGuard: CanActivateFn = () => {
  const session = inject(PracticeSessionStore);
  const router = inject(Router);
  return session.summary() !== null ? true : router.createUrlTree(['/']);
};
