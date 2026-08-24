import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { moduleOf } from '../../core/course/course.config';
import { LanguageStore } from '../../core/i18n/language-store';
import { T } from '../../core/i18n/t';
import type { ModuleId } from '../../core/models/content.model';
import { loadUnit } from '../../core/services/unit-loader';
import { QuizBlock } from '../shared/quiz-block/quiz-block';

/** Ghép đường dẫn file âm thanh theo <base href>, để chạy đúng cả khi deploy vào thư mục con. */
function assetUrl(path: string): string {
  const base = typeof document !== 'undefined' && document.baseURI ? document.baseURI : '/';
  return new URL(path, base).href;
}

/**
 * Một bài nghe hiểu: trình phát, câu hỏi trả lời tại chỗ, lời thoại.
 *
 * Lời thoại mặc định ẨN, cùng lý do với bản dịch ở bài đọc: nhìn thấy chữ thì tai
 * thôi không phải làm việc nữa. Người học tự bấm hiện khi đã nghe xong.
 */
@Component({
  selector: 'app-listening-detail',
  imports: [RouterLink, T, QuizBlock],
  templateUrl: './listening-detail.html',
  styleUrl: './listening-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListeningDetail {
  private readonly lang = inject(LanguageStore);

  protected readonly t = this.lang.t.bind(this.lang);

  readonly id = input.required<string>();
  readonly moduleId = input.required<ModuleId>();

  protected readonly module = computed(() => moduleOf(this.moduleId()));

  private readonly resource = loadUnit(this.moduleId, this.id);
  protected readonly unit = this.resource.unit;
  protected readonly loading = this.resource.loading;
  protected readonly notFound = this.resource.notFound;

  protected readonly tracks = computed(() => this.unit()?.tracks ?? []);

  /** Id các bài nghe đang mở lời thoại. */
  private readonly revealed = signal<ReadonlySet<string>>(new Set());

  protected audioUrl(path: string): string {
    return assetUrl(path);
  }

  protected showsScript(trackId: string): boolean {
    return this.revealed().has(trackId);
  }

  protected toggleScript(trackId: string): void {
    this.revealed.update((current) => {
      const next = new Set(current);
      next.has(trackId) ? next.delete(trackId) : next.add(trackId);
      return next;
    });
  }
}
