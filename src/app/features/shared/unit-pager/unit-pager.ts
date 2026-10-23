import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { COURSE, moduleOf } from '../../../core/course/course.config';
import { LanguageStore } from '../../../core/i18n/language-store';
import type { ModuleId, UnitIndexEntry } from '../../../core/models/content.model';
import { ContentStore } from '../../../core/services/content-store';

/**
 * "← Bài trước · Bài sau →" ở cuối trang chi tiết bài — chép theo `SiblingPager` của
 * minano_nihongo. Học xong "Động từ 1" thì sang thẳng "Động từ 2", không phải quay về
 * danh sách rồi tìm lại.
 *
 * Dãy để lật là các bài CÙNG CẤP trong cùng phần học, đúng thứ tự danh sách: bài đứng
 * độc lập lật qua bài đứng độc lập, bài con (BTVN của một cụm) lật qua các bài con khác
 * của cùng bài mẹ. Bài mới đặt chỗ, chưa có nội dung, bị bỏ qua — mở ra chỉ thấy trang
 * trống.
 */
@Component({
  selector: 'app-unit-pager',
  imports: [RouterLink],
  template: `
    @if (prev() || next()) {
      <nav class="pager" [attr.aria-label]="t('pager.aria')">
        @if (prev(); as item) {
          <a class="card pager-link" [routerLink]="linkOf(item)">
            <span class="pager-dir">← {{ t('pager.prev') }}</span>
            <span class="pager-name">{{ item.name }}</span>
          </a>
        } @else {
          <span></span>
        }
        @if (next(); as item) {
          <a class="card pager-link pager-next" [routerLink]="linkOf(item)">
            <span class="pager-dir">{{ t('pager.next') }} →</span>
            <span class="pager-name">{{ item.name }}</span>
          </a>
        }
      </nav>
    }
  `,
  styles: `
    .pager {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: var(--sp-3);
    }

    .pager-link {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 14px 18px;
      color: var(--text);
      transition: border-color var(--dur) var(--ease);
    }

    .pager-link:hover {
      border-color: color-mix(in srgb, var(--accent) 45%, var(--border));
      text-decoration: none;
    }

    .pager-next {
      grid-column: 2;
      text-align: right;
    }

    .pager-dir {
      color: var(--accent);
      font-size: var(--fs-xs);
      font-weight: 700;
    }

    .pager-name {
      font-family: var(--font-jp);
      font-weight: 600;
      overflow-wrap: anywhere;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnitPager {
  private readonly content = inject(ContentStore);
  private readonly course = inject(COURSE);
  private readonly lang = inject(LanguageStore);
  protected readonly t = this.lang.t.bind(this.lang);

  readonly moduleId = input.required<ModuleId>();
  readonly unitId = input.required<string>();

  /** Các bài cùng cấp với bài đang mở, đã bỏ bài chưa có nội dung. */
  private readonly siblings = computed(() => {
    const moduleId = this.moduleId();
    const self = this.content
      .units()
      .find((entry) => entry.moduleId === moduleId && entry.id === this.unitId());
    if (!self) return [];
    const row = self.parent
      ? this.content.childrenOf(moduleId, self.parent)
      : this.content.unitsOf(moduleId);
    return row.filter((entry) => entry.itemCount > 0);
  });

  private readonly index = computed(() =>
    this.siblings().findIndex((entry) => entry.id === this.unitId()),
  );

  protected readonly prev = computed(() =>
    this.index() > 0 ? this.siblings()[this.index() - 1] : null,
  );

  protected readonly next = computed(() => {
    const index = this.index();
    return index >= 0 && index < this.siblings().length - 1 ? this.siblings()[index + 1] : null;
  });

  constructor() {
    void this.content.loadIndex();
  }

  protected linkOf(entry: UnitIndexEntry): string[] {
    return ['/', this.course.id, moduleOf(entry.moduleId).path, entry.id];
  }
}
