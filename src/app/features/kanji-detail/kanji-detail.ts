import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { COURSE, moduleOf } from '../../core/course/course.config';
import { LanguageStore } from '../../core/i18n/language-store';
import { T } from '../../core/i18n/t';
import type { ModuleId } from '../../core/models/content.model';
import { ContentStore } from '../../core/services/content-store';
import { loadUnit } from '../../core/services/unit-loader';
import { PracticeSetup } from '../shared/practice-setup/practice-setup';
import { TestStart } from '../shared/test-start/test-start';

/**
 * Một bài kanji: mỗi chữ là một thẻ riêng chứ không phải một dòng bảng.
 *
 * Lý do không dùng bảng như bài từ vựng: một chữ có tới bốn nhóm thông tin dài ngắn
 * rất khác nhau (âm On, âm Kun, nghĩa, và một danh sách từ ghép). Nhồi vào một hàng
 * thì hàng nào cũng cao khác nhau và mắt không bám được cột.
 *
 * Màn hình này cũng nhận bài dạng ĐỀ: BTVN của một bài kanji là bài CON của nó, và
 * route của phần Kanji chỉ có một màn hình chi tiết duy nhất (xem app.routes.ts). Khi
 * đó cả trang chỉ có khung bắt đầu làm đề, y như BTVN bên phần Từ vựng.
 */
@Component({
  selector: 'app-kanji-detail',
  imports: [RouterLink, T, PracticeSetup, TestStart],
  templateUrl: './kanji-detail.html',
  styleUrl: './kanji-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KanjiDetail {
  private readonly lang = inject(LanguageStore);
  private readonly content = inject(ContentStore);

  protected readonly t = this.lang.t.bind(this.lang);

  readonly id = input.required<string>();
  readonly moduleId = input.required<ModuleId>();

  protected readonly course = inject(COURSE);
  protected readonly module = computed(() => moduleOf(this.moduleId()));

  private readonly resource = loadUnit(this.moduleId, this.id);
  protected readonly unit = this.resource.unit;
  protected readonly loading = this.resource.loading;
  protected readonly notFound = this.resource.notFound;

  protected readonly entries = computed(() => this.unit()?.kanji ?? []);

  /**
   * BTVN của bài này. Lấy từ DANH MỤC chứ không tải nội dung: trang bài chỉ cần tên và
   * số câu để vẽ một cái nút, còn câu hỏi thì đợi lúc bấm vào mới tải.
   *
   * Bài kanji không chia cụm như bài từ vựng, nên BTVN đứng thành một khối riêng ngay
   * trên khung luyện tập chứ không nằm trên dòng của cụm nào.
   */
  protected readonly homework = computed(() =>
    this.content.childrenOf(this.moduleId(), this.id()),
  );

  /** Bài mẹ của bài đang mở (BTVN thì về đúng bài kanji của nó, không về danh sách). */
  protected readonly parentId = computed(() => this.unit()?.parent ?? '');

  protected readonly backLink = computed(() => {
    const moduleLink = ['/', this.course.id, this.module().path];
    const parent = this.parentId();
    return parent ? [...moduleLink, parent] : moduleLink;
  });
}
