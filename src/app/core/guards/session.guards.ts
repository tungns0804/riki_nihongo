import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';

import { moduleOf } from '../course/course.config';
import type { ModuleId } from '../models/content.model';
import type { PracticeConfig } from '../models/practice.model';
import { PracticeSessionStore } from '../services/practice-session-store';

/**
 * Trang của bài mà một địa chỉ luyện tập / kết quả thuộc về — nơi có khung thiết lập
 * để bắt đầu lại. Bài kiểm tra nhập môn không có trang chi tiết nên về danh sách đề.
 */
function unitPage(route: ActivatedRouteSnapshot): string[] {
  const module = moduleOf(route.data['moduleId'] as ModuleId);
  const id = route.paramMap.get('id');
  return module.kind === 'test' || !id ? ['/', module.path] : ['/', module.path, id];
}

/** Phiên (hay bản tổng kết) có đúng là của bài đang nằm trên địa chỉ không. */
function belongsTo(config: PracticeConfig | null | undefined, route: ActivatedRouteSnapshot): boolean {
  return (
    !!config &&
    config.moduleId === route.data['moduleId'] &&
    config.unitId === route.paramMap.get('id')
  );
}

/**
 * Phiên luyện tập chỉ nằm trong bộ nhớ, nên mở thẳng địa chỉ luyện tập (dán link, F5
 * giữa chừng, bấm back sau khi đã xong) sẽ rơi vào một màn hình không có câu hỏi nào.
 *
 * Đưa về TRANG CỦA BÀI chứ không về trang chủ: địa chỉ đã nói rõ đang luyện bài nào
 * (/vocabulary/02-dong-tu/practice), và trang bài có sẵn khung thiết lập để bắt đầu lại
 * ngay. Phiên đang có mà là của bài KHÁC thì cũng về trang bài, chứ không hiện câu hỏi
 * của bài kia dưới địa chỉ của bài này.
 */
export const practiceGuard: CanActivateFn = (route) => {
  const session = inject(PracticeSessionStore);
  const router = inject(Router);
  return session.hasSession() && belongsTo(session.config(), route)
    ? true
    : router.createUrlTree(unitPage(route));
};

/** Cùng lý do, cho màn hình kết quả: không có bản tổng kết của bài này thì không có gì để xem. */
export const resultGuard: CanActivateFn = (route) => {
  const session = inject(PracticeSessionStore);
  const router = inject(Router);
  return belongsTo(session.summary()?.config, route) ? true : router.createUrlTree(unitPage(route));
};
