import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { COURSES, CourseDef } from '../../../core/course/course.config';
import { LanguageStore } from '../../../core/i18n/language-store';
import { T } from '../../../core/i18n/t';
import { Icon } from '../icon/icon';

/**
 * Nút chọn học phần trên thanh trên cùng: "N3 JUNBI ▾" mở danh sách năm học phần
 * của Riki Nihongo.
 *
 * Học phần chưa làm dùng `aria-disabled` chứ không `disabled`: nút `disabled` bị bỏ
 * khỏi thứ tự Tab và phần lớn trình đọc màn hình đọc lướt qua, trong khi mục đích
 * của việc liệt kê chính là cho người học biết học phần đó sắp có.
 */
@Component({
  selector: 'app-course-switcher',
  imports: [RouterLink, T, Icon],
  templateUrl: './course-switcher.html',
  styleUrl: './course-switcher.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'close(true)',
  },
})
export class CourseSwitcher {
  private readonly lang = inject(LanguageStore);
  private readonly router = inject(Router);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly t = this.lang.t.bind(this.lang);

  protected readonly courses = COURSES;
  /** Học phần đang học. Vỏ ứng dụng tính từ địa chỉ trang (xem `course` trong app.ts). */
  readonly current = input.required<CourseDef>();
  protected readonly open = signal(false);

  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');

  protected toggle(): void {
    this.open.update((value) => !value);
  }

  /**
   * Đóng danh sách. Đóng bằng Esc thì trả focus về nút: danh sách biến mất mà focus
   * nằm trên một mục không còn tồn tại thì người dùng bàn phím mất chỗ đứng.
   */
  protected close(returnFocus = false): void {
    if (!this.open()) return;
    this.open.set(false);
    if (returnFocus) this.trigger().nativeElement.focus();
  }

  /** Bấm ra ngoài thì đóng, như mọi menu thả xuống khác. */
  protected onDocumentClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) this.close();
  }

  /** Học phần đang học thì vào trang của nó (`/n3-junbi`); "Sắp có" thì không làm gì. */
  protected choose(course: CourseDef): void {
    if (course.status !== 'active') return;
    this.close();
    void this.router.navigate(['/', course.id]);
  }
}
