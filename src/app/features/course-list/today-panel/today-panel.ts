import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ActivityStore } from '../../../core/activity/activity-store';
import { GOAL_CHOICES } from '../../../core/activity/activity.model';
import { COURSES, courseById, moduleOf } from '../../../core/course/course.config';
import { LanguageStore } from '../../../core/i18n/language-store';
import type { MessageKey } from '../../../core/i18n/messages';
import { RecentStore } from '../../../core/services/recent-store';
import { Icon } from '../../shared/icon/icon';

/** Số bài hiện ở "Học tiếp". */
const RECENT_SHOWN = 3;

/**
 * Khối "Hôm nay" ở đầu trang gốc — chép theo trang Hôm nay của minano_nihongo.
 *
 * Hai thẻ cạnh nhau: CHUỖI NGÀY HỌC (bao nhiêu ngày liên tiếp đã đủ mục tiêu, bảy ngày
 * gần nhất, kỷ lục) và KẾ HOẠCH HÔM NAY (đủ số câu mục tiêu, kèm các bài đang học dở để
 * vào thẳng). Chuỗi là động lực quay lại mỗi ngày; kế hoạch trả lời "hôm nay làm gì".
 *
 * Đặt ở trang gốc vì đó là trang mở đầu, và chuỗi ngày tính chung cho mọi học phần.
 * Chỉ ĐỌC dữ liệu của ActivityStore và RecentStore — không tính lại gì theo cách riêng.
 */
@Component({
  selector: 'app-today-panel',
  imports: [RouterLink, Icon],
  templateUrl: './today-panel.html',
  styleUrl: './today-panel.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodayPanel {
  private readonly lang = inject(LanguageStore);
  private readonly recentStore = inject(RecentStore);
  protected readonly activity = inject(ActivityStore);
  protected readonly goalChoices = GOAL_CHOICES;

  protected readonly t = this.lang.t.bind(this.lang);

  protected readonly streak = this.activity.streak;
  protected readonly goal = this.activity.goal;
  protected readonly answered = computed(() => this.activity.today().answered);
  protected readonly goalPercent = this.activity.goalPercent;

  /** Bảy ngày gần nhất kèm tên thứ — vẽ thành dải chấm tròn. */
  protected readonly week = computed(() =>
    this.activity.week().map((day) => ({
      ...day,
      // DayNumber là số ngày từ 1970-01-01 (thứ Năm): +4 ra thứ trong tuần, 0 = Chủ nhật.
      label: `streak.dow.${(day.day + 4) % 7}` as MessageKey,
    })),
  );

  /**
   * Các bài mở gần đây, kèm tên học phần và phần học. Bỏ bài của học phần không còn mở
   * (đã đổi id, hoặc lùi về "Sắp có") — link tới đó chỉ dẫn về trang gốc.
   */
  protected readonly recent = computed(() =>
    this.recentStore
      .entries()
      .filter((entry) => courseById(entry.courseId) !== null)
      .slice(0, RECENT_SHOWN)
      .map((entry) => ({
        ...entry,
        courseKey: courseById(entry.courseId)!.nameKey,
        moduleKey: moduleOf(entry.moduleId).shortKey,
      })),
  );

  /** Nút "Học tiếp" của mục tiêu: bài đang dở, chưa có thì học phần đầu tiên. */
  protected readonly continuePath = computed(
    () =>
      this.recent()[0]?.path ??
      `/${COURSES.find((course) => course.status === 'active')?.id ?? ''}`,
  );

  /** Dòng nhắc dưới con số chuỗi, theo trạng thái hôm nay. */
  protected readonly streakHint = computed(() => {
    const remaining = this.activity.remaining();
    switch (this.streak().state) {
      case 'done':
        return this.t('streak.state.done');
      case 'at-risk':
        return this.t('streak.state.atRisk', { count: remaining });
      default:
        return this.t('streak.state.none', { count: remaining });
    }
  });

  constructor() {
    this.activity.refreshDay();
  }

  protected setGoal(goal: number): void {
    this.activity.setGoal(goal);
  }
}
