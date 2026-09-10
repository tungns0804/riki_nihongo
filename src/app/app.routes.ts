import { Routes } from '@angular/router';

import { MODULES } from './core/course/course.config';
import { practiceGuard, resultGuard } from './core/guards/session.guards';

/**
 * Bảy phần học, mỗi phần một cặp route: danh sách bài và chi tiết một bài.
 *
 * `title` là KHOÁ thông điệp, không phải chữ hiển thị — `AppTitleStrategy` dịch
 * khoá đó rồi ghép với tên ứng dụng, và đặt lại mỗi khi đổi ngôn ngữ.
 *
 * `data.moduleId` là thứ nối route với cấu hình khoá học: nhờ
 * `withComponentInputBinding()` (xem app.config.ts) nó vào thẳng input `moduleId`
 * của component. Đó là lý do bảy danh sách bài dùng CHUNG một component: chúng chỉ
 * khác nhau ở phần nào đang được liệt kê, còn tìm kiếm, khung rỗng, lưới thẻ và
 * trạng thái tải thì giống hệt.
 *
 * Ngược lại, màn hình CHI TIẾT thì mỗi loại một component: bảng từ vựng, lưới chữ
 * Hán và trang lý thuyết ngữ pháp không có mấy điểm chung để mà gộp. Riêng phần
 * Mimikara dùng lại màn hình ngữ pháp vì dữ liệu cùng hình dạng.
 *
 * Mọi màn hình đều `loadComponent` để mỗi phần là một gói tải riêng: người chỉ học
 * từ vựng không phải tải mã của phần nghe hiểu.
 */
const unitList = () => import('./features/unit-list/unit-list').then((m) => m.UnitList);
const practice = () => import('./features/practice/practice').then((m) => m.Practice);
const result = () => import('./features/result/result').then((m) => m.Result);

export const routes: Routes = [
  {
    // Trang chủ không đặt title để tab hiện đúng tên ứng dụng.
    path: '',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
  },

  {
    path: 'test',
    title: 'route.test',
    data: { moduleId: 'entrance-test' },
    loadComponent: () =>
      import('./features/entrance-test/entrance-test').then((m) => m.EntranceTest),
  },

  {
    path: 'vocabulary',
    title: 'module.vocabulary.label',
    data: { moduleId: 'vocabulary' },
    loadComponent: unitList,
  },
  {
    path: 'vocabulary/:id',
    title: 'route.unit',
    data: { moduleId: 'vocabulary' },
    loadComponent: () =>
      import('./features/vocabulary-detail/vocabulary-detail').then((m) => m.VocabularyDetail),
  },

  {
    path: 'kanji',
    title: 'module.kanji.label',
    data: { moduleId: 'kanji' },
    loadComponent: unitList,
  },
  {
    path: 'kanji/:id',
    title: 'route.unit',
    data: { moduleId: 'kanji' },
    loadComponent: () => import('./features/kanji-detail/kanji-detail').then((m) => m.KanjiDetail),
  },

  {
    path: 'grammar',
    title: 'module.grammar.label',
    data: { moduleId: 'grammar' },
    loadComponent: unitList,
  },
  {
    path: 'grammar/:id',
    title: 'route.unit',
    data: { moduleId: 'grammar' },
    loadComponent: () =>
      import('./features/grammar-detail/grammar-detail').then((m) => m.GrammarDetail),
  },

  {
    path: 'reading',
    title: 'module.reading.label',
    data: { moduleId: 'reading' },
    loadComponent: unitList,
  },
  {
    path: 'reading/:id',
    title: 'route.unit',
    data: { moduleId: 'reading' },
    loadComponent: () =>
      import('./features/reading-detail/reading-detail').then((m) => m.ReadingDetail),
  },

  {
    path: 'listening',
    title: 'module.listening.label',
    data: { moduleId: 'listening' },
    loadComponent: unitList,
  },
  {
    path: 'listening/:id',
    title: 'route.unit',
    data: { moduleId: 'listening' },
    loadComponent: () =>
      import('./features/listening-detail/listening-detail').then((m) => m.ListeningDetail),
  },

  {
    path: 'mimikara',
    title: 'module.mimikara.label',
    data: { moduleId: 'mimikara' },
    loadComponent: unitList,
  },
  {
    path: 'mimikara/:id',
    title: 'route.unit',
    // Cùng component với /grammar/:id — khác nhau đúng một chỗ là phần nào đang mở,
    // và chỗ đó đi qua data.moduleId.
    data: { moduleId: 'mimikara' },
    loadComponent: () =>
      import('./features/grammar-detail/grammar-detail').then((m) => m.GrammarDetail),
  },

  // Luyện tập và kết quả nằm DƯỚI địa chỉ của bài đang luyện:
  //
  //   /vocabulary/02-dong-tu/practice      /vocabulary/02-dong-tu/result
  //
  // Trước đây là /practice và /result trơn, nên thanh địa chỉ không nói đang luyện phần
  // nào, bài nào, và mục "Từ vựng" trên menu không sáng — routerLinkActive chỉ sáng khi
  // địa chỉ nằm dưới /vocabulary. Dựng từ MODULES để phần học thêm sau tự có cặp này.
  //
  // Không có link vào từ menu: chúng chỉ tới từ nút "bắt đầu luyện" của một bài. Guard
  // chặn người vào thẳng bằng URL khi không có phiên của đúng bài đó.
  ...MODULES.flatMap((module): Routes => [
    {
      path: `${module.path}/:id/practice`,
      title: 'route.practice',
      data: { moduleId: module.id },
      canActivate: [practiceGuard],
      loadComponent: practice,
    },
    {
      path: `${module.path}/:id/result`,
      title: 'route.result',
      data: { moduleId: module.id },
      canActivate: [resultGuard],
      loadComponent: result,
    },
  ]),

  { path: '**', redirectTo: '' },
];
