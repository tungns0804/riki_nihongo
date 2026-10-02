import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { COURSE, ModuleDef, modulesOf } from '../../core/course/course.config';
import { LanguageStore } from '../../core/i18n/language-store';
import type { MessageKey } from '../../core/i18n/messages';
import { T } from '../../core/i18n/t';
import type { UnitIndexEntry } from '../../core/models/content.model';
import { ContentStore } from '../../core/services/content-store';
import { PracticeStat, ProgressStore } from '../../core/services/progress-store';

/** Một dòng của bảng thống kê: một bài, một cụm của bài từ vựng, hoặc một BTVN. */
interface StatRow {
  key: string;
  module: ModuleDef;
  /** 0 = bài, 1 = cụm hoặc BTVN nằm dưới bài của nó. */
  level: 0 | 1;
  name: string;
  /** Chủ đề của cụm ("Bài 3.2 · Bản thân, sở thích…"). Rỗng với bài. */
  detail: string;
  /** Bài chứa dòng này, để dòng vẫn đọc được khi bảng xếp theo số lần. Rỗng với bài. */
  parentName: string;
  link: string[];
  attempts: number;
  /** Tỉ lệ đúng tốt nhất, 0–100; null nếu chưa luyện. */
  best: number | null;
  lastAt: string;
}

type Filter = 'all' | 'never' | 'done';
type Sort = 'order' | 'most' | 'least';

const FILTERS: readonly { id: Filter; key: MessageKey }[] = [
  { id: 'all', key: 'stats.filter.all' },
  { id: 'never', key: 'stats.filter.never' },
  { id: 'done', key: 'stats.filter.done' },
];
const SORTS: readonly { id: Sort; key: MessageKey }[] = [
  { id: 'order', key: 'stats.sort.order' },
  { id: 'most', key: 'stats.sort.most' },
  { id: 'least', key: 'stats.sort.least' },
];

function percentOf(stat: PracticeStat | null): number | null {
  return stat && stat.bestTotal > 0 ? Math.round((stat.bestCorrect / stat.bestTotal) * 100) : null;
}

/**
 * Thống kê luyện tập của một học phần: mỗi bài, mỗi cụm, mỗi BTVN đã luyện bao nhiêu
 * lần — để thấy ngay chỗ nào luyện nhiều, chỗ nào chưa đụng tới.
 *
 * Liệt kê cả những dòng CHƯA luyện lần nào: câu hỏi chính của trang này là "còn sót gì",
 * mà chỉ liệt kê thứ đã có trong tiến độ thì chỗ sót lại vô hình. Vì vậy danh sách lấy
 * từ DANH MỤC bài, tiến độ chỉ điền số vào.
 *
 * Cụm của bài từ vựng là một dòng riêng: người học học theo buổi, mỗi buổi một cụm, nên
 * "Danh từ: 12 lần" không nói được buổi nào chưa luyện.
 */
@Component({
  selector: 'app-stats',
  imports: [RouterLink, T],
  templateUrl: './stats.html',
  styleUrl: './stats.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Stats {
  private readonly content = inject(ContentStore);
  private readonly progress = inject(ProgressStore);
  private readonly lang = inject(LanguageStore);

  protected readonly t = this.lang.t.bind(this.lang);
  protected readonly course = inject(COURSE);
  protected readonly courseHome = ['/', this.course.id];

  protected readonly status = this.content.status;
  protected readonly errorKey = this.content.errorKey;

  protected readonly filters = FILTERS;
  protected readonly sorts = SORTS;
  protected readonly filter = signal<Filter>('all');
  protected readonly sort = signal<Sort>('order');

  /** Mọi dòng, theo đúng thứ tự học: phần → bài → từng cụm, BTVN ngay sau cụm của nó. */
  private readonly rows = computed<StatRow[]>(() => {
    const progress = this.progress.all();
    const rows: StatRow[] = [];

    for (const module of modulesOf(this.course)) {
      const moduleLink = ['/', this.course.id, module.path];
      const units = this.content.unitsOf(module.id).filter((unit) => unit.itemCount > 0);

      for (const unit of units) {
        const stat = progress[unit.id] ?? null;
        // Đề kiểm tra nhập môn không có trang chi tiết: dòng của nó dẫn về trang của phần.
        const unitLink = module.kind === 'test' ? moduleLink : [...moduleLink, unit.id];
        rows.push(this.row(module, unit, 0, unit.name, '', '', unitLink, stat));

        const children = this.content
          .childrenOf(module.id, unit.id)
          .filter((child) => child.itemCount > 0);
        const placed = new Set<string>();

        for (const group of unit.groups) {
          rows.push(
            this.row(
              module,
              unit,
              1,
              group.label,
              group.title,
              unit.name,
              unitLink,
              stat?.groups[group.label] ?? null,
              `${unit.id}#${group.label}`,
            ),
          );
          for (const child of children.filter((item) => item.group === group.label)) {
            placed.add(child.id);
            rows.push(this.childRow(module, unit, child, moduleLink));
          }
        }

        // Bài con không gắn với cụm nào thì xếp cuối bài mẹ, không để rơi mất.
        for (const child of children.filter((item) => !placed.has(item.id))) {
          rows.push(this.childRow(module, unit, child, moduleLink));
        }
      }
    }
    return rows;
  });

  /** Các dòng đang hiện, sau khi lọc và xếp. */
  protected readonly visible = computed(() => {
    const filter = this.filter();
    const filtered = this.rows().filter((row) =>
      filter === 'all' ? true : filter === 'never' ? row.attempts === 0 : row.attempts > 0,
    );

    const sort = this.sort();
    if (sort === 'order') return filtered;
    // sort() của mảng là ổn định: cùng số lần thì giữ thứ tự học.
    return [...filtered].sort((a, b) =>
      sort === 'most' ? b.attempts - a.attempts : a.attempts - b.attempts,
    );
  });

  /** Xếp theo thứ tự bài thì chèn tên phần làm dòng tiêu đề; xếp theo số lần thì không. */
  protected readonly grouped = computed(() => this.sort() === 'order');

  protected readonly doneCount = computed(() => this.rows().filter((row) => row.attempts > 0).length);
  protected readonly totalCount = computed(() => this.rows().length);

  /** Tổng số lượt luyện của cả học phần — chỉ cộng các dòng cấp bài, để lượt luyện theo cụm không bị đếm hai lần. */
  protected readonly totalAttempts = computed(() =>
    this.rows()
      .filter((row) => row.level === 0 || row.key.startsWith('child:'))
      .reduce((sum, row) => sum + row.attempts, 0),
  );

  private readonly dateFormat = computed(
    () =>
      new Intl.DateTimeFormat(this.lang.language() === 'ja' ? 'ja-JP' : 'vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
  );

  constructor() {
    void this.content.loadIndex();
  }

  protected formatDate(iso: string): string {
    const date = iso ? new Date(iso) : null;
    return date && !Number.isNaN(date.getTime()) ? this.dateFormat().format(date) : '';
  }

  /** Dòng đầu của một phần học (để chèn tiêu đề phần khi xếp theo thứ tự bài). */
  protected startsModule(index: number): boolean {
    const rows = this.visible();
    return index === 0 || rows[index - 1].module.id !== rows[index].module.id;
  }

  protected reload(): void {
    void this.content.loadIndex(true);
  }

  private childRow(
    module: ModuleDef,
    parent: UnitIndexEntry,
    child: UnitIndexEntry,
    moduleLink: string[],
  ): StatRow {
    const stat = this.progress.all()[child.id] ?? null;
    return this.row(module, child, 1, child.name, '', parent.name, [...moduleLink, child.id], stat, `child:${child.id}`);
  }

  private row(
    module: ModuleDef,
    unit: UnitIndexEntry,
    level: 0 | 1,
    name: string,
    detail: string,
    parentName: string,
    link: string[],
    stat: PracticeStat | null,
    key = unit.id,
  ): StatRow {
    return {
      key,
      module,
      level,
      name,
      detail,
      parentName,
      link,
      attempts: stat?.attempts ?? 0,
      best: percentOf(stat),
      lastAt: stat?.lastAt ?? '',
    };
  }
}
