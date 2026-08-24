import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  inject,
  input,
} from '@angular/core';

import { LanguageStore, MessageParams } from './language-store';
import { LANGUAGES, MESSAGES, MessageKey } from './messages';

/**
 * Hiển thị một thông điệp mà KHÔNG làm layout xê dịch khi đổi ngôn ngữ.
 *
 * Cách làm: vẽ bản dịch của MỌI ngôn ngữ chồng lên nhau trong cùng một ô grid,
 * chỉ ngôn ngữ đang chọn là `visible`, các bản còn lại `visibility: hidden`.
 * Chữ ẩn kiểu này vẫn chiếm chỗ, nên ô luôn rộng/cao bằng bản dịch dài nhất —
 * đổi ngôn ngữ thì chữ đổi còn khung thì đứng yên.
 *
 * Vì sao không dùng min-width/min-height với số đo cố định: số đo đó đúng vào
 * hôm nay và sai vào hôm ai đó sửa một câu dịch, mà lại sai âm thầm. Cách này tự
 * đo lại theo đúng nội dung thật nên không bao giờ lệch.
 *
 * Chỉ cần dùng ở những chỗ kích thước ảnh hưởng tới vị trí của phần khác (nhãn
 * nút trên header, tiêu đề cột bảng, đoạn mô tả nhiều dòng). Chữ nằm một mình
 * trong khối riêng thì `{{ t('key') }}` bình thường là đủ.
 */
@Component({
  selector: 'app-t',
  template: `
    @for (variant of variants(); track variant.lang) {
      <span
        class="t-variant"
        [class.is-visible]="variant.visible"
        [attr.aria-hidden]="variant.visible ? null : 'true'"
        >{{ variant.text }}</span
      >
    }
  `,
  styles: `
    :host {
      display: inline-grid;
      grid-template-areas: 'text';
    }

    /* Dùng cho đoạn văn nhiều dòng: chiếm trọn chiều ngang như một khối. */
    :host(.t-block) {
      display: grid;
      width: 100%;
    }

    .t-variant {
      grid-area: text;
      visibility: hidden;
    }

    .t-variant.is-visible {
      visibility: visible;
    }
  `,
  host: { '[class.t-block]': 'block()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class T {
  private readonly lang = inject(LanguageStore);

  readonly key = input.required<MessageKey>();
  readonly params = input<MessageParams>({});
  /**
   * Tham số mà giá trị cũng là khoá thông điệp, ví dụ nhãn "{from} → {to}" với
   * from/to là tên các thể động từ. Mỗi bản dịch dùng tham số của đúng ngôn ngữ đó.
   */
  readonly paramKeys = input<Record<string, MessageKey>>({});
  /** Bật khi dùng cho đoạn văn (khối) thay vì chữ nằm trong dòng. Viết `block` là đủ. */
  readonly block = input(false, { transform: booleanAttribute });

  readonly variants = computed(() => {
    const key = this.key();
    const params = this.params();
    const paramKeys = this.paramKeys();
    const current = this.lang.language();

    return LANGUAGES.map((lang) => {
      const resolved: MessageParams = { ...params };
      for (const [name, paramKey] of Object.entries(paramKeys)) {
        resolved[name] = MESSAGES[paramKey][lang];
      }
      return {
        lang,
        visible: lang === current,
        text: interpolate(MESSAGES[key][lang], resolved),
      };
    });
  });
}

function interpolate(text: string, params: MessageParams): string {
  return text.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}
