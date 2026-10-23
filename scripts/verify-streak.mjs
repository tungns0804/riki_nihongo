#!/usr/bin/env node
/**
 * Kiểm tra cách tính chuỗi ngày học (src/app/core/activity/activity.model.ts).
 *
 * Chuỗi là con số người học nhìn mỗi sáng để có động lực — tính sai một ngày (báo
 * "đứt chuỗi" khi hôm nay chưa kịp học, hay hạ mục tiêu mà bơm được chuỗi cũ) là mất
 * lòng tin ngay. Mỗi quy tắc ở đầu file model có một ca kiểm tra ở đây.
 *
 * Chạy: npm run verify:streak
 */

import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const USE_COLOR = process.stdout.isTTY === true && !process.env['NO_COLOR'];
const ESC = String.fromCharCode(27);
const ansi = (code) => (USE_COLOR ? `${ESC}[${code}m` : '');
const c = { reset: ansi(0), red: ansi(31), green: ansi(32) };
const print = (msg = '') => process.stdout.write(`${msg}
`);

const HERE = dirname(fileURLToPath(import.meta.url));
const MODEL = join(HERE, '..', 'src', 'app', 'core', 'activity', 'activity.model.ts');
const { applyGoal, lastWeek, recordAnswer, sanitizeGoal, sanitizeLog, streakOf } = await import(
  pathToFileURL(MODEL)
);

let checks = 0;
const problems = [];
function expect(name, actual, expected) {
  checks++;
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    problems.push(`${name}: mong đợi ${JSON.stringify(expected)}, nhận ${JSON.stringify(actual)}`);
  }
}

const TODAY = 20_000;
/** Ghi `n` câu (đúng hết) vào ngày `day` với mục tiêu `goal`. */
function answer(log, day, n, goal = 20, correct = true) {
  for (let i = 0; i < n; i++) log = recordAnswer(log, day, correct, goal);
  return log;
}

// 1. Chưa học gì.
expect('rỗng', streakOf({}, TODAY), { current: 0, best: 0, state: 'none' });

// 2. Đủ mục tiêu hôm nay → chuỗi 1, đã xong.
let log = answer({}, TODAY, 20);
expect('đạt hôm nay', streakOf(log, TODAY), { current: 1, best: 1, state: 'done' });
expect('đếm câu', log[TODAY], { answered: 20, correct: 20, met: true });

// 3. Chưa đủ mục tiêu thì chưa tính ngày đó.
log = answer({}, TODAY, 19);
expect('thiếu một câu', streakOf(log, TODAY), { current: 0, best: 0, state: 'none' });

// 4. Câu sai cũng tính vào số câu đã làm.
log = answer({}, TODAY, 20, 20, false);
expect('câu sai vẫn tính', streakOf(log, TODAY).state, 'done');
expect('đếm câu đúng', log[TODAY].correct, 0);

// 5. Ba ngày trước đều đạt, hôm nay chưa học: chuỗi 3, đang chờ — KHÔNG về 0.
log = {};
for (const day of [TODAY - 3, TODAY - 2, TODAY - 1]) log = answer(log, day, 20);
expect('còn cả ngày để giữ chuỗi', streakOf(log, TODAY), { current: 3, best: 3, state: 'at-risk' });

// 6. Hôm nay học tiếp → chuỗi 4.
log = answer(log, TODAY, 20);
expect('nối chuỗi', streakOf(log, TODAY), { current: 4, best: 4, state: 'done' });

// 7. Bỏ một ngày (hôm qua) → chuỗi đứt, nhưng chuỗi dài nhất vẫn nhớ.
log = {};
for (const day of [TODAY - 5, TODAY - 4, TODAY - 3, TODAY - 2]) log = answer(log, day, 20);
expect('đứt chuỗi', streakOf(log, TODAY), { current: 0, best: 4, state: 'none' });
log = answer(log, TODAY, 20);
expect('bắt đầu lại', streakOf(log, TODAY), { current: 1, best: 4, state: 'done' });

// 8. Hạ mục tiêu: hôm nay được xét lại, ngày cũ thì không.
log = answer({}, TODAY - 1, 12);
log = answer(log, TODAY, 12);
log = applyGoal(log, TODAY, 10);
expect('hạ mục tiêu chỉ xét hôm nay', [log[TODAY - 1].met, log[TODAY].met], [false, true]);
expect('không bơm chuỗi cũ', streakOf(log, TODAY), { current: 1, best: 1, state: 'done' });

// 9. Nâng mục tiêu sau khi đã đạt: hôm nay xét lại theo mục tiêu mới.
log = applyGoal(answer({}, TODAY, 20), TODAY, 30);
expect('nâng mục tiêu', log[TODAY].met, false);

// 10. Bảy ngày gần nhất, cũ trước, đánh dấu hôm nay.
log = answer(answer({}, TODAY - 6, 20), TODAY, 20);
expect(
  'dải bảy ngày',
  lastWeek(log, TODAY).map((d) => [d.met, d.isToday]),
  [[true, false], [false, false], [false, false], [false, false], [false, false], [false, false], [true, true]],
);

// 11. Dữ liệu hỏng trong localStorage không làm sập.
expect('log hỏng', sanitizeLog('rác'), {});
expect('ngày hỏng bị bỏ', sanitizeLog({ x: 1, 5: { answered: 'a' }, 6: { answered: 2, correct: 1, met: true } }), {
  6: { answered: 2, correct: 1, met: true },
});
expect('mục tiêu lạ về mặc định', [sanitizeGoal(7), sanitizeGoal(30)], [20, 30]);

if (problems.length > 0) {
  for (const problem of problems) print(`${c.red}[LOI] ${problem}${c.reset}`);
  process.exitCode = 1;
} else {
  print(`${c.green}OK: chuoi ngay hoc dung ca ${checks} truong hop.${c.reset}`);
}
