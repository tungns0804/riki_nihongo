import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { moduleOf } from '../../core/course/course.config';
import { LanguageStore } from '../../core/i18n/language-store';
import { T } from '../../core/i18n/t';
import { ModuleId, VocabExample, VocabWord, groupsOf } from '../../core/models/content.model';
import { loadUnit } from '../../core/services/unit-loader';
import { matchesAllWords, normalizeSearch, splitAround } from '../../core/utils/text';
import { PracticeSetup } from '../shared/practice-setup/practice-setup';

/**
 * Một bài từ vựng: khung thiết lập luyện tập ở trên, danh sách từ ở dưới.
 *
 * Mỗi từ là một THẺ chứ không phải một hàng bảng, và bố cục thẻ đi theo đúng bản
 * PDF của giáo trình: số thứ tự, từ và nghĩa ở cột trái, câu ví dụ cùng các dòng
 * 合 / 対 / 関 / 連 ở cột phải. Bảng không chứa nổi phần bên phải — một từ có tới
 * năm sáu câu ví dụ, và ô bảng cao bằng cả màn hình thì cột bên cạnh trống trơn.
 */
@Component({
  selector: 'app-vocabulary-detail',
  imports: [RouterLink, T, PracticeSetup],
  templateUrl: './vocabulary-detail.html',
  styleUrl: './vocabulary-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VocabularyDetail {
  private readonly lang = inject(LanguageStore);

  protected readonly t = this.lang.t.bind(this.lang);

  readonly id = input.required<string>();
  readonly moduleId = input.required<ModuleId>();

  protected readonly module = computed(() => moduleOf(this.moduleId()));

  private readonly resource = loadUnit(this.moduleId, this.id);
  protected readonly unit = this.resource.unit;
  protected readonly loading = this.resource.loading;
  protected readonly notFound = this.resource.notFound;

  protected readonly allWords = computed(() => this.unit()?.words ?? []);

  /**
   * Từ khoá lọc danh sách từ.
   *
   * Một bài có thể tới 120 từ (bài Danh từ gom cả sáu 課), mà thứ người học cần
   * thường là ĐÚNG MỘT từ vừa gặp ở đâu đó. Cuộn tay qua 120 thẻ để tìm nó là việc
   * mà máy nên làm thay người.
   */
  private readonly searchRef = signal('');
  protected readonly search = this.searchRef.asReadonly();

  private readonly needle = computed(() => normalizeSearch(this.searchRef()));

  /**
   * Tìm trên cả tiếng Nhật, cách đọc, nghĩa và SỐ THỨ TỰ: người học nhớ "từ 107"
   * cũng nhiều như nhớ mặt chữ, mà số thứ tự là thứ đối chiếu được với bản PDF.
   */
  protected readonly words = computed(() => {
    const group = this.group();
    const base = group ? this.allWords().filter((word) => word.group === group) : this.allWords();

    const needle = this.needle();
    if (!needle) return base;

    return base.filter((word) =>
      matchesAllWords(
        `${word.number} ${word.japanese} ${word.reading} ${word.hanViet} ${word.vietnamese}`,
        needle,
      ),
    );
  });

  protected readonly noMatch = computed(
    () => this.allWords().length > 0 && this.words().length === 0,
  );

  /** Các cụm của bài, ví dụ 01–10, 11–20… Rỗng nghĩa là bài không chia cụm. */
  protected readonly groups = computed(() => groupsOf(this.allWords()));

  /**
   * Cụm đang xem. Ràng buộc hai chiều với khung thiết lập luyện tập: chọn cụm ở
   * khung đó thì danh sách dưới đây lọc theo luôn, và ngược lại.
   */
  protected readonly group = signal<string | null>(null);

  /**
   * Danh sách đã lọc, cắt thành từng cụm để hiện tiêu đề ngăn giữa các cụm.
   *
   * Bài không chia cụm thì vẫn có đúng một khối, nhãn rỗng — template chỉ cần một
   * đường đi duy nhất thay vì hai nhánh có/không có cụm.
   */
  protected readonly sections = computed<{ label: string; words: VocabWord[] }[]>(() => {
    const words = this.words();
    const groups = this.groups();
    if (groups.length === 0) return [{ label: '', words }];

    return groups
      .map((label) => ({ label, words: words.filter((word) => word.group === label) }))
      .filter((section) => section.words.length > 0);
  });


  /**
   * Cắt câu ví dụ quanh dạng của từ trong câu để tô nó, như chữ đỏ gạch chân của sách.
   *
   * Ở danh sách thì tô ngay, không phải đợi chấm như màn luyện tập: đây là chỗ để
   * ĐỌC, không có câu hỏi nào để lộ đáp án.
   */
  protected parts(example: VocabExample): { text: string; hit: boolean }[] {
    return splitAround(example.japanese, example.targets);
  }

  protected onSearch(event: Event): void {
    this.searchRef.set((event.target as HTMLInputElement).value);
  }

  protected clearSearch(): void {
    this.searchRef.set('');
  }
}
