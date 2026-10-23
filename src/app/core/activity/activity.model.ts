/**
 * Hoạt động học mỗi ngày và CHUỖI NGÀY (streak) — toán thuần, không đụng tới Angular.
 *
 * Một ngày "giữ chuỗi" khi người học trả lời đủ MỤC TIÊU số câu trong ngày đó (mặc
 * định 20). Đếm câu đã chấm xong — đúng hay sai đều tính: chuỗi thưởng cho việc NGỒI
 * VÀO HỌC mỗi ngày, không thưởng cho việc chỉ chọn bài dễ để đúng hết.
 *
 * Ngày đạt mục tiêu được CHỐT lúc đạt (`met`): hạ mục tiêu thì hôm nay được xét lại,
 * nhưng không có ngày cũ nào tự dưng thành "đạt" — chuỗi không thể bơm lên bằng cách
 * kéo mục tiêu về 1 câu.
 *
 * Chuỗi tính tới HÔM NAY nếu hôm nay đã đạt, còn chưa thì tính tới HÔM QUA: cả ngày
 * hôm nay vẫn còn để giữ chuỗi, sáng ra mở app mà đã thấy "0 ngày" là một lời buộc
 * tội sai và mất động lực nhất có thể.
 */

/** Số ngày kể từ 1970-01-01 theo giờ máy (xem `todayDay`). */
export type DayNumber = number;

const MS_PER_DAY = 86_400_000;

/**
 * Hôm nay theo LỊCH CỦA MÁY, không theo UTC: học lúc 6 giờ sáng ở Việt Nam phải tính
 * cho hôm nay, không phải cho hôm qua như ngày UTC.
 */
export function todayDay(now: Date = new Date()): DayNumber {
  return Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / MS_PER_DAY);
}

export interface DayActivity {
  /** Số câu đã chấm xong trong ngày. */
  answered: number;
  correct: number;
  /** Đã đạt mục tiêu của ngày đó chưa — chốt lúc đạt, xem đầu file. */
  met: boolean;
}

export type ActivityLog = Readonly<Record<number, DayActivity>>;

export const GOAL_CHOICES: readonly number[] = [10, 20, 30, 50];
export const DEFAULT_GOAL = 20;

/** Nhật ký giữ bấy nhiêu ngày gần nhất — đủ cho chuỗi dài nhất của hơn một năm học. */
const KEEP_DAYS = 400;

/** Ghi một câu vừa chấm xong vào ngày `day`. */
export function recordAnswer(log: ActivityLog, day: DayNumber, correct: boolean, goal: number): ActivityLog {
  const current = log[day] ?? { answered: 0, correct: 0, met: false };
  const answered = current.answered + 1;
  const next: Record<number, DayActivity> = {
    ...log,
    [day]: {
      answered,
      correct: current.correct + (correct ? 1 : 0),
      met: current.met || answered >= goal,
    },
  };
  for (const key of Object.keys(next)) {
    if (Number(key) < day - KEEP_DAYS) delete next[Number(key)];
  }
  return next;
}

/** Đổi mục tiêu: chỉ HÔM NAY được xét lại theo mục tiêu mới. */
export function applyGoal(log: ActivityLog, today: DayNumber, goal: number): ActivityLog {
  const current = log[today];
  if (!current) return log;
  return { ...log, [today]: { ...current, met: current.answered >= goal } };
}

export type StreakState =
  /** Hôm nay đã đạt mục tiêu. */
  | 'done'
  /** Hôm qua đạt, hôm nay chưa — còn cả ngày để giữ chuỗi. */
  | 'at-risk'
  /** Chưa có chuỗi nào đang chạy. */
  | 'none';

export interface Streak {
  /** Số ngày liên tiếp đạt mục tiêu, tính tới hôm nay (nếu đã đạt) hoặc hôm qua. */
  current: number;
  /** Chuỗi dài nhất từng có, kể cả chuỗi hiện tại. */
  best: number;
  state: StreakState;
}

const met = (log: ActivityLog, day: DayNumber) => log[day]?.met === true;

export function streakOf(log: ActivityLog, today: DayNumber): Streak {
  const state: StreakState = met(log, today) ? 'done' : met(log, today - 1) ? 'at-risk' : 'none';
  let current = 0;
  for (let day = state === 'done' ? today : today - 1; met(log, day); day--) current++;

  let best = 0;
  let run = 0;
  const days = Object.keys(log)
    .map(Number)
    .filter((day) => met(log, day))
    .sort((a, b) => a - b);
  for (let i = 0; i < days.length; i++) {
    run = i > 0 && days[i] === days[i - 1] + 1 ? run + 1 : 1;
    best = Math.max(best, run);
  }
  return { current, best: Math.max(best, current), state };
}

/** Bảy ngày gần nhất, cũ trước — dải chấm tròn dưới con số chuỗi. */
export function lastWeek(log: ActivityLog, today: DayNumber): { day: DayNumber; met: boolean; isToday: boolean }[] {
  return Array.from({ length: 7 }, (_, index) => {
    const day = today - 6 + index;
    return { day, met: met(log, day), isToday: day === today };
  });
}

/** `count` ngày gần nhất, cũ trước, kể cả ngày không học — biểu đồ của trang Tiến độ. */
export function recentDays(
  log: ActivityLog,
  today: DayNumber,
  count: number,
): ({ day: DayNumber; isToday: boolean } & DayActivity)[] {
  return Array.from({ length: count }, (_, index) => {
    const day = today - count + 1 + index;
    const entry = log[day] ?? { answered: 0, correct: 0, met: false };
    return { day, isToday: day === today, ...entry };
  });
}

/** Đọc lại nhật ký từ localStorage, bỏ mọi thứ không đúng dạng. */
export function sanitizeLog(raw: unknown): ActivityLog {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return {};
  const out: Record<number, DayActivity> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    const day = Number(key);
    if (!Number.isInteger(day) || typeof value !== 'object' || value === null) continue;
    const { answered, correct, met: isMet } = value as Partial<DayActivity>;
    if (typeof answered !== 'number' || typeof correct !== 'number' || answered < 0) continue;
    out[day] = { answered, correct, met: isMet === true };
  }
  return out;
}

export function sanitizeGoal(raw: unknown): number {
  return GOAL_CHOICES.includes(raw as number) ? (raw as number) : DEFAULT_GOAL;
}
