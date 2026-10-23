import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { COURSES } from '../../core/course/course.config';
import { LanguageStore } from '../../core/i18n/language-store';
import { T } from '../../core/i18n/t';
import { TodayPanel } from './today-panel/today-panel';

/**
 * Trang gốc — năm học phần của Riki Nihongo.
 *
 * Trang gốc là chỗ CHỌN học phần chứ không mở thẳng vào N3 JUNBI: website có năm học
 * phần, mở ra mà chỉ thấy một khoá thì người học không biết còn bốn học phần kia.
 *
 * Trên các thẻ học phần là khối "Hôm nay" (TodayPanel): chuỗi ngày học tính chung cho
 * mọi học phần, nên chỗ của nó là trang đứng trên mọi học phần.
 *
 * Học phần "Sắp có" vẫn là một thẻ, chỉ mờ đi và không bấm được — cùng cách trang
 * N3 JUNBI hiện phần học chưa có bài.
 */
@Component({
  selector: 'app-course-list',
  imports: [RouterLink, T, TodayPanel],
  templateUrl: './course-list.html',
  styleUrl: './course-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseList {
  private readonly lang = inject(LanguageStore);

  protected readonly t = this.lang.t.bind(this.lang);

  protected readonly courses = COURSES;
}
