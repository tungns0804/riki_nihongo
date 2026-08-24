import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { moduleOf } from '../../core/course/course.config';
import { LanguageStore } from '../../core/i18n/language-store';
import { T } from '../../core/i18n/t';
import type { ModuleId, UnitIndexEntry } from '../../core/models/content.model';
import { ContentStore } from '../../core/services/content-store';
import { ProgressStore } from '../../core/services/progress-store';
import { matchesAllWords, normalizeSearch } from '../../core/utils/text';

/**
 * Danh sách bài của MỘT phần học — dùng chung cho cả bảy phần.
 *
 * `moduleId` tới từ `data` của route (xem app.routes.ts), nhờ
 * `withComponentInputBinding()`. Bảy danh sách chỉ khác nhau ở nội dung được liệt
 * kê, còn khung chờ, ô tìm kiếm, khung rỗng và lưới thẻ thì giống hệt nhau — nên
 * chúng dùng chung một component thay vì bảy bản sao chỉ khác một chuỗi.
 */
@Component({
  selector: 'app-unit-list',
  imports: [RouterLink, T],
  templateUrl: './unit-list.html',
  styleUrl: './unit-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnitList {
  private readonly content = inject(ContentStore);
  private readonly progress = inject(ProgressStore);
  private readonly lang = inject(LanguageStore);

  protected readonly t = this.lang.t.bind(this.lang);

  readonly moduleId = input.required<ModuleId>();

  protected readonly status = this.content.status;
  protected readonly errorKey = this.content.errorKey;
  protected readonly skeletons = [0, 1, 2, 3, 4, 5];

  protected readonly module = computed(() => moduleOf(this.moduleId()));

  /**
   * Từ khoá tìm bài. KHÔNG nhớ sang lần mở sau: mở lại mà danh sách đã bị cắt sẵn
   * theo thứ gõ hôm trước thì trông y như mất bài học.
   */
  private readonly searchRef = signal('');
  protected readonly search = this.searchRef.asReadonly();

  /** Dạng đã chuẩn hoá của từ khoá, tính một lần cho cả danh sách. */
  private readonly needle = computed(() => normalizeSearch(this.searchRef()));

  /** Toàn bộ bài của phần này, chưa lọc — dùng để phân biệt "chưa có" và "không khớp". */
  protected readonly allUnits = computed(() => this.content.unitsOf(this.moduleId()));

  protected readonly units = computed<UnitIndexEntry[]>(() => {
    const needle = this.needle();
    if (!needle) return this.allUnits();
    return this.allUnits().filter((unit) =>
      matchesAllWords(`${unit.name} ${unit.description} ${unit.id}`, needle),
    );
  });

  protected readonly noMatch = computed(
    () => this.allUnits().length > 0 && this.units().length === 0,
  );

  protected readonly totalItems = computed(() =>
    this.units().reduce((sum, unit) => sum + unit.itemCount, 0),
  );

  /**
   * Số bài mới đặt chỗ, chưa có nội dung (itemCount === 0).
   *
   * Hiện thành một huy hiệu riêng thay vì để lẫn vào tổng số bài: "12 bài" mà mở ra
   * chỉ một bài học được thì con số đó đang hứa quá lời.
   */
  protected readonly pendingCount = computed(
    () => this.units().filter((unit) => unit.itemCount === 0).length,
  );

  constructor() {
    void this.content.loadIndex();
  }

  /** Tỉ lệ đúng tốt nhất của một bài, hoặc null nếu chưa luyện lần nào. */
  protected bestPercent(unitId: string): number | null {
    return this.progress.bestPercent(unitId);
  }

  protected onSearch(event: Event): void {
    this.searchRef.set((event.target as HTMLInputElement).value);
  }

  protected clearSearch(): void {
    this.searchRef.set('');
  }

  protected reload(): void {
    void this.content.loadIndex(true);
  }
}
