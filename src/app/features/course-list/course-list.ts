import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { COURSES } from '../../core/course/course.config';
import { LanguageStore } from '../../core/i18n/language-store';
import { T } from '../../core/i18n/t';

/**
 * Trang gốc — năm học phần của Riki Nihongo.
 *
 * Trang gốc là chỗ CHỌN học phần chứ không mở thẳng vào N3 JUNBI: website có năm học
 * phần, mở ra mà chỉ thấy một khoá thì người học không biết còn bốn học phần kia.
 *
 * Học phần "Sắp có" vẫn là một thẻ, chỉ mờ đi và không bấm được — cùng cách trang
 * N3 JUNBI hiện phần học chưa có bài.
 */
@Component({
  selector: 'app-course-list',
  imports: [RouterLink, T],
  templateUrl: './course-list.html',
  styleUrl: './course-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseList {
  private readonly lang = inject(LanguageStore);

  protected readonly t = this.lang.t.bind(this.lang);

  protected readonly courses = COURSES;
}
