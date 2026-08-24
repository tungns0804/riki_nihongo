import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MODULES } from '../../core/course/course.config';
import { LanguageStore } from '../../core/i18n/language-store';
import { T } from '../../core/i18n/t';
import { ContentStore } from '../../core/services/content-store';
import { ProgressStore } from '../../core/services/progress-store';

/**
 * Trang chủ — bảy phần của khoá N3 JUNBI.
 *
 * Thẻ của phần chưa có bài nào vẫn hiện, chỉ mờ đi và không bấm được: người học
 * phải thấy khoá gồm những gì ngay từ đầu, kể cả phần chưa soạn xong. Ẩn hẳn đi thì
 * khoá trông như bị thiếu.
 */
@Component({
  selector: 'app-home',
  imports: [RouterLink, T],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  private readonly content = inject(ContentStore);
  private readonly progress = inject(ProgressStore);
  private readonly lang = inject(LanguageStore);

  protected readonly t = this.lang.t.bind(this.lang);

  protected readonly status = this.content.status;
  protected readonly errorKey = this.content.errorKey;

  /** Số thẻ xám vẽ trong lúc chờ tải — đúng bằng số phần, vì con số đó cố định. */
  protected readonly skeletons = MODULES.map((module) => module.id);

  /** Bảy phần kèm số bài đã có của từng phần. */
  protected readonly modules = computed(() => {
    const counts = this.content.countByModule();
    const studied = this.progress.countByModule();

    return MODULES.map((module) => ({
      ...module,
      unitCount: counts[module.id] ?? 0,
      studiedCount: studied[module.id] ?? 0,
    }));
  });

  protected readonly totalUnits = this.content.totalUnits;

  /** Cả khoá chưa có bài nào — khác hẳn với "một phần chưa có bài". */
  protected readonly isEmpty = computed(
    () => this.status() === 'ready' && this.totalUnits() === 0,
  );

  constructor() {
    void this.content.loadIndex();
  }

  protected reload(): void {
    void this.content.loadIndex(true);
  }
}
