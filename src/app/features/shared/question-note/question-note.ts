import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';

import { LanguageStore } from '../../../core/i18n/language-store';
import type { ModuleId } from '../../../core/models/content.model';
import { NoteStore } from '../../../core/services/note-store';

/**
 * Ghi chú riêng của người học cho MỘT câu của đề: nút hiện / ẩn và một ô viết rộng.
 *
 * Mặc định ĐÓNG, kể cả câu đã có ghi chú: ba mươi ô ghi chú mở sẵn thì trang làm đề dài
 * gấp đôi, và ghi chú viết sau khi chấm thường chứa luôn đáp án. Câu đã có ghi chú thì
 * nút có thêm một chấm để biết mà mở ra xem lại.
 *
 * Dùng ở cả màn hình làm đề lẫn màn hình kết quả — cùng một kho (NoteStore), nên ghi ở
 * màn này thì mở màn kia vẫn thấy.
 */
@Component({
  selector: 'app-question-note',
  templateUrl: './question-note.html',
  styleUrl: './question-note.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionNote {
  private readonly notes = inject(NoteStore);
  private readonly lang = inject(LanguageStore);

  protected readonly t = this.lang.t.bind(this.lang);

  readonly moduleId = input.required<ModuleId>();
  readonly unitId = input.required<string>();
  readonly questionId = input.required<string>();

  protected readonly open = signal(false);

  protected readonly text = computed(() =>
    this.notes.of(this.moduleId(), this.unitId(), this.questionId()),
  );

  protected readonly hasNote = computed(() => this.text().trim().length > 0);

  protected readonly saveFailed = this.notes.saveFailed;

  /** id của ô viết, để nhãn và nút trỏ được vào nó. */
  protected readonly fieldId = computed(
    () => `note-${this.moduleId()}-${this.unitId()}-${this.questionId()}`,
  );

  protected toggle(): void {
    this.open.update((value) => !value);
  }

  protected save(value: string): void {
    this.notes.set(this.moduleId(), this.unitId(), this.questionId(), value);
  }
}
