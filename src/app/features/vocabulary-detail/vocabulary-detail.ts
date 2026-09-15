import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { COURSE, moduleOf } from '../../core/course/course.config';
import { LanguageStore } from '../../core/i18n/language-store';
import { T } from '../../core/i18n/t';
import { ModuleId, VocabExample, groupsOf } from '../../core/models/content.model';
import { readJson, writeJson } from '../../core/services/local-storage';
import { loadUnit } from '../../core/services/unit-loader';
import { matchesAllWords, normalizeSearch, splitAround } from '../../core/utils/text';
import { PracticeSetup } from '../shared/practice-setup/practice-setup';

/**
 * Một bài từ vựng: tóm tắt bài, khung thiết lập luyện tập, rồi BẢNG từ.
 *
 * Bảng chứ không phải thẻ, theo bảng từ của minano_nihongo: mỗi từ một hàng gồm số, âm
 * Hán Việt, mặt chữ, cách đọc, nghĩa và câu ví dụ. Thẻ hai cột trước đây cao gần 170px
 * cho một từ chỉ có MỘT câu ví dụ — cột trái xếp dọc năm dòng, cột phải bỏ trống gần hết
 * — nên bài 70 từ dài hơn chục màn hình. Trên điện thoại bảng tự đổi lại thành thẻ xếp
 * dọc (vocabulary-detail.css), vì sáu cột không vừa khổ đó.
 *
 * Mặc định chỉ hiện MỘT cụm (một buổi học / một bài tập 10 từ) chứ không cả bài: người
 * học mở bài để học cụm hôm nay, không phải để cuộn qua 120 từ. Cụm đang xem được nhớ lại
 * cho lần mở sau.
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
  private readonly injector = inject(Injector);

  protected readonly t = this.lang.t.bind(this.lang);

  readonly id = input.required<string>();
  readonly moduleId = input.required<ModuleId>();

  protected readonly course = inject(COURSE);
  protected readonly module = computed(() => moduleOf(this.moduleId()));

  private readonly resource = loadUnit(this.moduleId, this.id);
  protected readonly unit = this.resource.unit;
  protected readonly loading = this.resource.loading;
  protected readonly notFound = this.resource.notFound;

  protected readonly allWords = computed(() => this.unit()?.words ?? []);

  /** Các cụm của bài, ví dụ 01–10, 11–20… Rỗng nghĩa là bài không chia cụm. */
  protected readonly groups = computed(() => groupsOf(this.allWords()));

  /** Khoá localStorage nhớ cụm đang xem — riêng từng bài của từng học phần. */
  private readonly groupStorageKey = computed(
    () => `riki:vocab-group:${this.course.id}/${this.moduleId()}/${this.id()}`,
  );

  /**
   * Cụm đang xem; null = cả bài. Ràng buộc hai chiều với khung thiết lập luyện tập: chọn
   * cụm ở đâu thì bảng từ và phần luyện tập cùng theo cụm đó.
   *
   * Khi bài vừa tải xong: lấy cụm đã nhớ của bài này, không có thì lấy cụm ĐẦU TIÊN — mở
   * một bài 120 từ mà đổ ra cả 120 từ là đúng thứ khiến trang dài lê thê.
   */
  protected readonly group = linkedSignal<{ key: string; groups: string[] }, string | null>({
    source: () => ({ key: this.groupStorageKey(), groups: this.groups() }),
    computation: ({ key, groups }, previous) => {
      if (groups.length === 0) return null;
      // Cùng một bài mà danh sách cụm tính lại thì giữ lựa chọn đang có của người học.
      const sameUnit = previous?.source.key === key && previous.source.groups.length > 0;
      const candidate: unknown = sameUnit ? previous.value : readJson<unknown>(key, undefined);
      if (candidate === null) return null;
      return typeof candidate === 'string' && groups.includes(candidate) ? candidate : groups[0];
    },
  });

  /**
   * Từ khoá lọc danh sách từ.
   *
   * Thứ người học cần thường là ĐÚNG MỘT từ vừa gặp ở đâu đó, nên khi đang gõ tìm thì tìm
   * trong CẢ BÀI chứ không trong cụm đang xem: từ đó nằm cụm nào thì người học đâu biết.
   */
  private readonly searchRef = signal('');
  protected readonly search = this.searchRef.asReadonly();

  private readonly needle = computed(() => normalizeSearch(this.searchRef()));

  /**
   * Tìm trên cả tiếng Nhật, cách đọc, nghĩa và SỐ THỨ TỰ: người học nhớ "từ 107"
   * cũng nhiều như nhớ mặt chữ, mà số thứ tự là thứ đối chiếu được với bản PDF.
   */
  protected readonly words = computed(() => {
    const needle = this.needle();
    if (needle) {
      return this.allWords().filter((word) =>
        matchesAllWords(
          `${word.number} ${word.japanese} ${word.reading} ${word.hanViet} ${word.vietnamese}`,
          needle,
        ),
      );
    }

    const group = this.group();
    return group ? this.allWords().filter((word) => word.group === group) : this.allWords();
  });

  protected readonly noMatch = computed(() => !!this.needle() && this.words().length === 0);

  /**
   * Bảng đã lọc, cắt theo cụm để chèn một hàng tiêu đề trước mỗi cụm — cả khi chỉ xem một
   * cụm, hàng đó cũng là chỗ ghi chủ đề của cụm.
   *
   * Bài không chia cụm thì vẫn có đúng một khối, nhãn rỗng — template chỉ cần một đường
   * đi duy nhất thay vì hai nhánh có/không có cụm.
   */
  protected readonly sections = computed(() => {
    const words = this.words();
    const groups = this.groups();
    const titles = this.unit()?.groups ?? [];
    if (groups.length === 0) return [{ label: '', title: '', words }];

    return groups
      .map((label) => ({
        label,
        title: titles.find((group) => group.label === label)?.title ?? '',
        words: words.filter((word) => word.group === label),
      }))
      .filter((section) => section.words.length > 0);
  });

  /** Cột Hán Việt và Cách đọc chỉ có khi bài có dữ liệu cho chúng, như bảng của minano. */
  protected readonly hasHanViet = computed(() => this.allWords().some((word) => word.hanViet));
  protected readonly hasReadings = computed(() => this.allWords().some((word) => word.reading));

  /** Số cột của bảng — hàng tiêu đề cụm trải hết bề ngang. */
  protected readonly columnCount = computed(
    () => 4 + (this.hasHanViet() ? 1 : 0) + (this.hasReadings() ? 1 : 0),
  );

  /**
   * Bảng "Tóm tắt bài": mỗi cụm MỘT dòng — nút cụm, chủ đề, các mặt chữ.
   *
   * Không kèm nghĩa nữa: nghĩa đã nằm ngay trong bảng từ bên dưới, lặp lại ở đây thì bảng
   * tóm tắt dài bằng nửa trang chỉ để nhắc lại chính nó. Bảng này để biết bài học về gì
   * và để chuyển cụm.
   *
   * Chỉ hiện khi có ít nhất một cụm viết chủ đề (`## 266–273 = …` trong nguồn). Không có
   * chủ đề thì mỗi dòng chỉ còn nút cụm, mà nút cụm đã có ở khung luyện tập.
   */
  protected readonly overview = computed(() => {
    const unit = this.unit();
    if (!unit || !unit.groups.some((group) => group.title)) return [];

    return unit.groups.map((group) => ({
      ...group,
      preview: unit.words
        .filter((word) => word.group === group.label)
        .map((word) => word.japanese)
        .join('・'),
    }));
  });

  /** Nhãn trong ô chọn cụm: có chủ đề thì ghi kèm để chọn không cần nhớ số. */
  protected readonly groupOptions = computed(() =>
    (this.unit()?.groups ?? []).map((group) => ({
      label: group.label,
      text: group.title ? `${group.label} · ${group.title}` : group.label,
    })),
  );

  private readonly groupIndex = computed(() => {
    const group = this.group();
    return group === null ? -1 : this.groups().indexOf(group);
  });

  protected readonly prevGroup = computed(() => {
    const index = this.groupIndex();
    return index > 0 ? this.groups()[index - 1] : null;
  });

  protected readonly nextGroup = computed(() => {
    const index = this.groupIndex();
    const groups = this.groups();
    return index >= 0 && index < groups.length - 1 ? groups[index + 1] : null;
  });

  /** Mép trên của bảng — "Học tiếp cụm sau" cuộn về đây. */
  private readonly listTop = viewChild<ElementRef<HTMLElement>>('listTop');

  constructor() {
    effect(() => {
      // Chỉ nhớ khi bài đã có cụm: lúc đang tải thì group() là null tạm thời, ghi xuống lúc
      // đó là xoá mất cụm đã nhớ.
      if (this.groups().length > 0) writeJson(this.groupStorageKey(), this.group());
    });
  }

  /**
   * Chọn một cụm. `reveal`: cuộn về đầu bảng — dùng cho nút ở CUỐI bảng, nơi cụm mới hiện
   * ra ở tít phía trên chỗ đang nhìn.
   */
  protected selectGroup(label: string | null, reveal = false): void {
    this.group.set(label);
    if (!reveal) return;
    afterNextRender(() => this.listTop()?.nativeElement.scrollIntoView({ block: 'start' }), {
      injector: this.injector,
    });
  }

  protected onPickGroup(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectGroup(value || null);
  }

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
