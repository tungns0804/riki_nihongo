import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import {
  RouterFeatures,
  TitleStrategy,
  provideRouter,
  withComponentInputBinding,
  withHashLocation,
  withInMemoryScrolling,
} from '@angular/router';

import { routes } from './app.routes';
import { AppTitleStrategy } from './core/app-title';

/** Trang đang được mở trực tiếp từ ổ đĩa (double-click index.html) chứ không qua web server. */
const isFileProtocol = typeof location !== 'undefined' && location.protocol === 'file:';

const routerFeatures: RouterFeatures[] = [
  withInMemoryScrolling({ scrollPositionRestoration: 'top' }),
  // Tham số đường dẫn (:id) và `data` của route vào thẳng input của component, nên
  // component không phải tự inject ActivatedRoute rồi bóc từng trường ra.
  withComponentInputBinding(),
  // file:// không dùng được History pushState, phải định tuyến bằng dấu #.
  // Khi chạy qua web server thì vẫn giữ URL sạch như bình thường.
  ...(isFileProtocol ? [withHashLocation()] : []),
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, ...routerFeatures),
    provideHttpClient(withFetch()),
    { provide: TitleStrategy, useClass: AppTitleStrategy },
  ],
};
