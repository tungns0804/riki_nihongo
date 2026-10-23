import {
  ChangeDetectionStrategy,
  Component,
  EnvironmentInjector,
  Injector,
  computed,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { ActivityStore } from '../../core/activity/activity-store';
import { COURSE, COURSES, CourseDef, ModuleDef, moduleOf, modulesOf } from '../../core/course/course.config';
import { LanguageStore } from '../../core/i18n/language-store';
import type { MessageKey } from '../../core/i18n/messages';
import type { UnitIndexEntry } from '../../core/models/content.model';
import { ContentStore } from '../../core/services/content-store';
import { ProgressStore, UnitProgress } from '../../core/services/progress-store';
import { Icon } from '../shared/icon/icon';

/** Bài có kết quả tốt nhất dưới mốc này thì vào "Nên luyện lại". */
const WEAK_BELOW = 70;
/** Bài có kết quả tốt nhất từ mốc này trở lên thì tính là "đã vững" — cùng mốc với vòng xanh ở danh sách bài. */
const SOLID_FROM = 80;
const WEAK_SHOWN = 8;

/** Kho của một học phần, dựng riêng cho trang này (xem `Overview`). */
interface CourseStores {
  course: CourseDef;
  content: ContentStore;
  progress: ProgressStore;
}

/** Số liệu của một nhóm bài: cả học phần, hoặc một phần học. */
interface Tally {
  /** Số bài có nội dung. */
  ready: number;
  /** Số bài đã luyện ít nhất một lần. */
  practised: number;
  /** Số bài có kết quả tốt nhất ≥ SOLID_FROM. */
  solid: number;
  /** Tổng số lượt luyện. */
  attempts: number;
  /** Trung bình kết quả tốt nhất của các bài đã luyện, 0–100; null nếu chưa luyện bài nào. */
  average: number | null;
  /** Phần trăm bài đã luyện trên số bài có nội dung. */
  percent: number;
}

interface WeakUnit {
  key: string;
  name: string;
  meta: string;
  best: number;
  attempts: number;
  link: string[];
}

function bestOf(entry: UnitProgress): number {
  return Math.round((entry.bestCorrect / entry.bestTotal) * 100);
}

function tally(units: readonly UnitIndexEntry[], progress: Record<string, UnitProgress>): Tally {
  const ready = units.filter((unit) => unit.itemCount > 0);
  const done = ready.map((unit) => progress[unit.id]).filter((entry) => !!entry);
  const bests = done.map(bestOf);
  return {
    ready: ready.length,
    practised: done.length,
    solid: bests.filter((best) => best >= SOLID_FROM).length,
    attempts: done.reduce((sum, entry) => sum + entry.attempts, 0),
    average: bests.length ? Math.round(bests.reduce((a, b) => a + b, 0) / bests.length) : null,
    percent: ready.length ? Math.round((done.length / ready.length) * 100) : 0,
  };
}

function sumTallies(items: readonly Tally[]): Tally {
  const ready = items.reduce((sum, item) => sum + item.ready, 0);
  const practised = items.reduce((sum, item) => sum + item.practised, 0);
  const weighted = items.reduce((sum, item) => sum + (item.average ?? 0) * item.practised, 0);
  return {
    ready,
    practised,
    solid: items.reduce((sum, item) => sum + item.solid, 0),
    attempts: items.reduce((sum, item) => sum + item.attempts, 0),
    average: practised ? Math.round(weighted / practised) : null,
    percent: ready ? Math.round((practised / ready) * 100) : 0,
  };
}

/**
 * Trang Tiến độ (`/progress`) — tổng quan việc học và luyện tập của MỌI học phần trên một
 * màn hình, theo kiểu trang Tiến độ N3 của minano_nihongo: vòng % tổng, hoạt động 30
 * ngày, tiến độ từng học phần và từng phần học, và những bài nên luyện lại.
 *
 * Trang Thống kê của học phần trả lời "bài nào đã luyện mấy lần"; trang này trả lời
 * "nhìn chung mình đang ở đâu, chỗ nào còn yếu".
 *
 * Danh mục và tiến độ là kho THEO HỌC PHẦN, cấp ở route của từng học phần — trang này
 * đứng ở gốc nên tự dựng một bộ kho cho mỗi học phần bằng injector con (cùng cách route
 * cấp). Chỉ đọc: ProgressStore đọc lại localStorage lúc dựng, nên số liệu luôn mới.
 */
@Component({
  selector: 'app-overview',
  imports: [RouterLink, Icon],
  templateUrl: './overview.html',
  styleUrl: './overview.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Overview {
  private readonly lang = inject(LanguageStore);
  protected readonly activity = inject(ActivityStore);
  protected readonly t = this.lang.t.bind(this.lang);

  private readonly stores: CourseStores[] = COURSES.filter(
    (course) => course.status === 'active',
  ).map((course) => {
    const injector = Injector.create({
      providers: [{ provide: COURSE, useValue: course }, ContentStore, ProgressStore],
      parent: inject(EnvironmentInjector),
    });
    return { course, content: injector.get(ContentStore), progress: injector.get(ProgressStore) };
  });

  /** Chưa tải xong danh mục của mọi học phần — số liệu tổng còn thiếu. */
  protected readonly loading = computed(() =>
    this.stores.some((store) => ['idle', 'loading'].includes(store.content.status())),
  );

  protected readonly failed = computed(() =>
    this.stores.some((store) => store.content.status() === 'error'),
  );

  /** Từng học phần: số liệu chung và số liệu từng phần học. */
  protected readonly courses = computed(() =>
    this.stores.map(({ course, content, progress }) => {
      const map = progress.all();
      const modules = modulesOf(course)
        .map((module) => ({
          module,
          tally: tally(
            content.units().filter((unit) => unit.moduleId === module.id),
            map,
          ),
        }))
        .filter((row) => row.tally.ready > 0);
      return {
        course,
        modules,
        tally: sumTallies(modules.map((row) => row.tally)),
      };
    }),
  );

  protected readonly total = computed(() => sumTallies(this.courses().map((row) => row.tally)));

  /** Bài đã luyện mà kết quả tốt nhất còn thấp — thấp nhất trước. */
  protected readonly weak = computed<WeakUnit[]>(() => {
    const rows: WeakUnit[] = [];
    for (const { course, content, progress } of this.stores) {
      const map = progress.all();
      for (const unit of content.units()) {
        const entry = map[unit.id];
        if (!entry || unit.itemCount === 0) continue;
        const best = bestOf(entry);
        if (best >= WEAK_BELOW) continue;
        const module = moduleOf(unit.moduleId);
        rows.push({
          key: `${course.id}/${unit.id}`,
          name: unit.name,
          meta: `${this.t(course.nameKey)} · ${this.t(module.shortKey)}`,
          best,
          attempts: entry.attempts,
          link: this.unitLink(course, module, unit),
        });
      }
    }
    return rows.sort((a, b) => a.best - b.best).slice(0, WEAK_SHOWN);
  });

  // ── Hoạt động 30 ngày ───────────────────────────────────────────────────

  protected readonly streak = this.activity.streak;
  protected readonly goal = this.activity.goal;

  /** Cột cao nhất của biểu đồ: số câu nhiều nhất trong 30 ngày, ít nhất là mục tiêu. */
  private readonly chartMax = computed(() =>
    Math.max(this.goal(), ...this.activity.month().map((day) => day.answered)),
  );

  private readonly dateFormat = computed(
    () =>
      new Intl.DateTimeFormat(this.lang.language() === 'ja' ? 'ja-JP' : 'vi-VN', {
        day: 'numeric',
        month: 'numeric',
      }),
  );

  protected readonly days = computed(() => {
    const max = this.chartMax();
    const format = this.dateFormat();
    return this.activity.month().map((day) => ({
      ...day,
      height: max ? (day.answered / max) * 100 : 0,
      // DayNumber là số ngày từ 1970-01-01 theo lịch máy, dựng lại bằng giờ UTC.
      label: format.format(new Date(day.day * 86_400_000 + 12 * 3_600_000)),
      accuracy: day.answered ? Math.round((day.correct / day.answered) * 100) : 0,
    }));
  });

  /** Vị trí của vạch mục tiêu trên biểu đồ, % chiều cao. */
  protected readonly goalLine = computed(() => (this.goal() / this.chartMax()) * 100);

  protected readonly monthTotals = computed(() => {
    const month = this.activity.month();
    const week = month.slice(-7);
    const answered = month.reduce((sum, day) => sum + day.answered, 0);
    const correct = month.reduce((sum, day) => sum + day.correct, 0);
    return {
      answered,
      week: week.reduce((sum, day) => sum + day.answered, 0),
      accuracy: answered ? Math.round((correct / answered) * 100) : null,
      activeDays: month.filter((day) => day.answered > 0).length,
      metDays: month.filter((day) => day.met).length,
    };
  });

  constructor() {
    this.activity.refreshDay();
    for (const store of this.stores) void store.content.loadIndex();
  }

  protected reload(): void {
    for (const store of this.stores) void store.content.loadIndex(true);
  }

  protected courseLink(course: CourseDef): string[] {
    return ['/', course.id];
  }

  protected statsLink(course: CourseDef): string[] {
    return ['/', course.id, 'stats'];
  }

  protected moduleLink(course: CourseDef, module: ModuleDef): string[] {
    return ['/', course.id, module.path];
  }

  /** Câu trong ô chú thích của một cột. */
  protected dayTip(day: { answered: number; accuracy: number; met: boolean }): string {
    if (day.answered === 0) return this.t('overview.chart.none');
    const key: MessageKey = day.met ? 'overview.chart.tipMet' : 'overview.chart.tip';
    return this.t(key, { answered: day.answered, accuracy: day.accuracy });
  }

  private unitLink(course: CourseDef, module: ModuleDef, unit: UnitIndexEntry): string[] {
    // Đề kiểm tra nhập môn không có trang chi tiết: dẫn về trang của phần.
    return module.kind === 'test'
      ? this.moduleLink(course, module)
      : [...this.moduleLink(course, module), unit.id];
  }
}
