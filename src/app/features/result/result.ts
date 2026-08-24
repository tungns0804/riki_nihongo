import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MODULES, moduleOf } from '../../core/course/course.config';
import { LanguageStore } from '../../core/i18n/language-store';
import type { MessageKey } from '../../core/i18n/messages';
import { T } from '../../core/i18n/t';
import { scoreBySkill } from '../../core/models/practice.model';
import { PracticeSessionStore } from '../../core/services/practice-session-store';

/** Nhãn của một kỹ năng lấy luôn từ tên phần học tương ứng. */
const SKILL_LABEL_KEY: Record<string, MessageKey> = Object.fromEntries(
  MODULES.map((module) => [module.id, module.shortKey]),
);

/**
 * Màn hình kết quả của một phiên.
 *
 * Hai phần: con số tổng, và danh sách từng câu để xem lại. Phần điểm theo kỹ năng
 * chỉ hiện khi phiên có nhiều hơn một kỹ năng — tức là gần như chỉ với bài kiểm tra
 * nhập môn, vì luyện một bài từ vựng thì cả phiên chỉ có một kỹ năng.
 */
@Component({
  selector: 'app-result',
  imports: [RouterLink, T],
  templateUrl: './result.html',
  styleUrl: './result.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Result {
  private readonly session = inject(PracticeSessionStore);
  private readonly lang = inject(LanguageStore);

  protected readonly t = this.lang.t.bind(this.lang);

  protected readonly summary = this.session.summary;

  protected readonly percent = computed(() => {
    const data = this.summary();
    if (!data || data.total === 0) return 0;
    return Math.round((data.correctCount / data.total) * 100);
  });

  /** Phần học của phiên vừa rồi — dùng để dựng đường quay lại đúng chỗ. */
  protected readonly module = computed(() => {
    const data = this.summary();
    return data ? moduleOf(data.config.moduleId) : null;
  });

  /**
   * Đường "luyện lại": về đúng bài vừa luyện, nơi có khung thiết lập. Riêng bài
   * kiểm tra nhập môn không có màn hình chi tiết nên về thẳng danh sách đề.
   */
  protected readonly retryLink = computed<string[]>(() => {
    const data = this.summary();
    const module = this.module();
    if (!data || !module) return ['/'];
    return module.kind === 'test' ? ['/', module.path] : ['/', module.path, data.config.unitId];
  });

  protected readonly skillScores = computed(() => {
    const data = this.summary();
    if (!data) return [];
    const scores = scoreBySkill(data.results);
    // Một kỹ năng duy nhất thì bảng này chỉ chép lại con số tổng ở trên.
    return scores.length > 1 ? scores : [];
  });

  protected skillLabelKey(skill: string): MessageKey {
    return SKILL_LABEL_KEY[skill] ?? 'module.grammar.short';
  }

  protected percentOf(correct: number, total: number): number {
    return total === 0 ? 0 : Math.round((correct / total) * 100);
  }
}
