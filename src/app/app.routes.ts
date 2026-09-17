import { Route, Routes } from '@angular/router';

import {
  COURSE,
  COURSES,
  CourseDef,
  MODULES,
  ModuleDef,
  modulesOf,
} from './core/course/course.config';
import { practiceGuard, resultGuard } from './core/guards/session.guards';
import type { UnitKind } from './core/models/content.model';
import { ContentStore } from './core/services/content-store';
import { PracticeSessionStore } from './core/services/practice-session-store';
import { ProgressStore } from './core/services/progress-store';

/**
 * Địa chỉ trang có dạng `/<học phần>/<phần học>/<bài>`:
 *
 *   /n3-junbi/vocabulary/01-danh-tu        /btvn-co-ban/vocabulary/01-danh-tu
 *
 * Route KHÔNG viết tay mà dựng từ COURSES × MODULES: hai học phần có cùng bộ màn hình,
 * viết tay thì mỗi học phần mới là chép thêm vài chục dòng, và chép sót một route là
 * một trang trắng mà không ai báo.
 *
 * Mỗi học phần là một route cha có `providers` riêng: học phần, ContentStore,
 * ProgressStore, PracticeSessionStore. Hai học phần có bài trùng id (cả hai đều có
 * `vocabulary/01-danh-tu`), mà danh mục, tiến độ và phiên luyện đều tra theo id bài —
 * dùng chung một store ở gốc thì tiến độ BTVN ghi đè lên N3 JUNBI. Tách ở cấp route
 * thì component vẫn `inject(ContentStore)` như cũ, không phải truyền học phần đi khắp nơi.
 *
 * `title` là KHOÁ thông điệp, không phải chữ hiển thị — `AppTitleStrategy` dịch khoá
 * đó rồi ghép với tên ứng dụng, và đặt lại mỗi khi đổi ngôn ngữ.
 *
 * `data.moduleId` vào thẳng input `moduleId` của component nhờ
 * `withComponentInputBinding()` (xem app.config.ts). Đó là lý do mọi danh sách bài
 * dùng CHUNG một component: chúng chỉ khác nhau ở phần nào đang được liệt kê. Ngược
 * lại, màn hình CHI TIẾT thì mỗi hình dạng dữ liệu một component (xem DETAIL).
 *
 * Mọi màn hình đều `loadComponent` để mỗi phần là một gói tải riêng: người chỉ học
 * từ vựng không phải tải mã của phần nghe hiểu.
 */

type LoadComponent = NonNullable<Route['loadComponent']>;

const courseList: LoadComponent = () =>
  import('./features/course-list/course-list').then((m) => m.CourseList);
const home: LoadComponent = () => import('./features/home/home').then((m) => m.Home);
const unitList: LoadComponent = () =>
  import('./features/unit-list/unit-list').then((m) => m.UnitList);
const entranceTest: LoadComponent = () =>
  import('./features/entrance-test/entrance-test').then((m) => m.EntranceTest);
const practice: LoadComponent = () => import('./features/practice/practice').then((m) => m.Practice);
const testRun: LoadComponent = () =>
  import('./features/test-run/test-run').then((m) => m.TestRun);
const result: LoadComponent = () => import('./features/result/result').then((m) => m.Result);

/**
 * Màn hình chi tiết của từng hình dạng dữ liệu. Phần Mimikara có `kind: 'grammar'` nên
 * tự dùng màn hình ngữ pháp. Bài kiểm tra nhập môn không có màn hình chi tiết: xem trước
 * đề thì bài kiểm tra đầu vào không còn đo được gì (xem EntranceTest).
 */
const DETAIL: Record<Exclude<UnitKind, 'test'>, LoadComponent> = {
  vocabulary: () =>
    import('./features/vocabulary-detail/vocabulary-detail').then((m) => m.VocabularyDetail),
  kanji: () => import('./features/kanji-detail/kanji-detail').then((m) => m.KanjiDetail),
  grammar: () => import('./features/grammar-detail/grammar-detail').then((m) => m.GrammarDetail),
  reading: () => import('./features/reading-detail/reading-detail').then((m) => m.ReadingDetail),
  listening: () =>
    import('./features/listening-detail/listening-detail').then((m) => m.ListeningDetail),
};

/** Mọi route của một phần học, tính từ trong học phần: danh sách, chi tiết, luyện tập, kết quả. */
function moduleRoutes(module: ModuleDef): Routes {
  const data = { moduleId: module.id };

  const pages: Routes =
    module.kind === 'test'
      ? [{ path: module.path, title: 'route.test', data, loadComponent: entranceTest }]
      : [
          { path: module.path, title: module.labelKey, data, loadComponent: unitList },
          { path: `${module.path}/:id`, title: 'route.unit', data, loadComponent: DETAIL[module.kind] },
        ];

  return [
    ...pages,
    // Luyện tập và kết quả nằm DƯỚI địa chỉ của bài đang luyện
    // (/n3-junbi/vocabulary/02-dong-tu/practice), để thanh địa chỉ nói rõ đang luyện
    // phần nào, bài nào, và mục menu của phần đó vẫn sáng — menu sáng theo đoạn phần học
    // của địa chỉ (xem `section` trong app.ts).
    //
    // Không có link vào từ menu: chúng chỉ tới từ nút "bắt đầu luyện" của một bài. Guard
    // chặn người vào thẳng bằng URL khi không có phiên của đúng bài đó.
    {
      path: `${module.path}/:id/practice`,
      title: module.kind === 'test' ? 'route.test' : 'route.practice',
      data,
      canActivate: [practiceGuard],
      // Đề kiểm tra có màn hình LÀM ĐỀ riêng: làm cả bài rồi nộp, không phải mỗi câu
      // một thẻ chấm ngay như luyện tập (xem features/test-run). Dùng chung địa chỉ
      // và chung guard với luyện tập vì cùng là "đang làm dở một phiên của bài này".
      loadComponent: module.kind === 'test' ? testRun : practice,
    },
    {
      path: `${module.path}/:id/result`,
      title: 'route.result',
      data,
      canActivate: [resultGuard],
      loadComponent: result,
    },
  ];
}

function courseRoute(course: CourseDef): Route {
  return {
    path: course.id,
    providers: [
      { provide: COURSE, useValue: course },
      ContentStore,
      ProgressStore,
      PracticeSessionStore,
    ],
    children: [
      // Trang của học phần: các phần học của nó.
      { path: '', pathMatch: 'full', title: course.nameKey, loadComponent: home },
      ...modulesOf(course).flatMap(moduleRoutes),
    ],
  };
}

/**
 * Học phần của các địa chỉ cũ. Trước khi tách học phần, N3 JUNBI nằm ngay dưới gốc
 * (/vocabulary/01-danh-tu) — link đã lưu hay đã gửi đi vẫn phải mở đúng bài. Viết thẳng
 * id chứ không dùng DEFAULT_COURSE: các địa chỉ này thuộc về N3 JUNBI, kể cả khi sau này
 * đổi học phần mặc định.
 */
const LEGACY_COURSE_ID = 'n3-junbi';

export const routes: Routes = [
  {
    // Trang gốc: chọn một trong năm học phần. Không đặt title để tab hiện đúng tên
    // ứng dụng.
    path: '',
    pathMatch: 'full',
    loadComponent: courseList,
  },

  ...COURSES.filter((course) => course.status === 'active').map(courseRoute),

  // Mặc định pathMatch 'prefix', nên phần còn lại của địa chỉ được giữ nguyên khi chuyển:
  // /vocabulary/01-danh-tu → /n3-junbi/vocabulary/01-danh-tu.
  ...MODULES.map(
    (module): Route => ({ path: module.path, redirectTo: `${LEGACY_COURSE_ID}/${module.path}` }),
  ),

  { path: '**', redirectTo: '' },
];
