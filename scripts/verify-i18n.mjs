#!/usr/bin/env node
/**
 * Kiểm tra phần đa ngôn ngữ:
 *
 *  1. Mọi khoá dùng trong mã nguồn đều có trong từ điển.
 *  2. Mọi khoá trong từ điển đều đủ cả hai ngôn ngữ và không bỏ trống.
 *  3. Chỗ chèn tham số `{ten}` phải giống nhau giữa hai ngôn ngữ — thiếu một
 *     tham số ở bản dịch là lỗi im lặng, chữ vẫn hiện nhưng mất mất số liệu.
 *  4. Không còn chuỗi tiếng Việt cứng sót lại trong template.
 *  5. Cảnh báo khoá khai báo nhưng không chỗ nào dùng.
 *
 * Chạy: npm run verify:i18n
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const SRC = join(ROOT, 'src', 'app');
const MESSAGES_FILE = join(SRC, 'core', 'i18n', 'messages.ts');

const toFileUrl = (path) => new URL(`file:///${path.replace(/\\/g, '/')}`).href;
const { MESSAGES, LANGUAGES } = await import(toFileUrl(MESSAGES_FILE));

const USE_COLOR = process.stdout.isTTY === true && !process.env['NO_COLOR'];
const ESC = String.fromCharCode(27);
const ansi = (code) => (USE_COLOR ? `${ESC}[${code}m` : '');
const c = { reset: ansi(0), bold: ansi(1), dim: ansi(2), red: ansi(31), green: ansi(32), yellow: ansi(33) };
const log = (msg = '') => process.stdout.write(`${msg}\n`);

let problems = 0;
function fail(msg) {
  log(`${c.red}[LOI] ${msg}${c.reset}`);
  problems++;
}

/** Liệt kê mọi file .ts/.html trong src/app. */
function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return walk(full);
    return ['.ts', '.html'].includes(extname(name)) ? [full] : [];
  });
}

const files = walk(SRC).filter((f) => f !== MESSAGES_FILE);
const allKeys = new Set(Object.keys(MESSAGES));

// ── 1 & 5. Khoá dùng trong mã nguồn ──────────────────────────────────────
const usedKeys = new Set();
// Bắt 'khoa.co.dau.cham' trong t('...'), labelKey: '...', v.v.
const KEY_PATTERN = /'([a-z][a-zA-Z0-9]*(?:\.[a-zA-Z0-9-]+)+)'/g;

// Khoá đặt thẳng trên <app-t key="..."> dùng NHÁY KÉP nên pattern trên không thấy.
// Lookbehind loại trừ dạng ràng buộc [key]="bieu.thuc" — chỗ đó là biểu thức
// TypeScript chứ không phải khoá, bắt nhầm thì mỗi menu động lại thành một lỗi giả.
const ATTR_KEY_PATTERN = /(?<![\[\w])key="([a-z][a-zA-Z0-9]*(?:\.[a-zA-Z0-9-]+)+)"/g;

for (const file of files) {
  const content = readFileSync(file, 'utf8');
  const matches = [...content.matchAll(KEY_PATTERN), ...content.matchAll(ATTR_KEY_PATTERN)];
  for (const match of matches) {
    const key = match[1];
    // Chỉ quan tâm những chuỗi trông giống khoá thông điệp thật.
    if (allKeys.has(key)) {
      usedKeys.add(key);
    } else if (/^(common|app|theme|course|module|home|unit|vocab|kanji|grammar|reading|listening|test|practice|result|error|route)\./.test(key)) {
      fail(`${file.replace(ROOT, '.')}: dùng khoá "${key}" nhưng từ điển không có`);
    }
  }
}

// ── 2 & 3. Từ điển đầy đủ và nhất quán ───────────────────────────────────
const PLACEHOLDER = /\{(\w+)\}/g;

for (const [key, entry] of Object.entries(MESSAGES)) {
  const placeholders = {};

  for (const lang of LANGUAGES) {
    const text = entry[lang];
    if (typeof text !== 'string') {
      fail(`Khoá "${key}" thiếu bản dịch "${lang}"`);
      continue;
    }
    if (text.trim() === '') {
      fail(`Khoá "${key}" có bản dịch "${lang}" rỗng`);
    }
    placeholders[lang] = [...text.matchAll(PLACEHOLDER)].map((m) => m[1]).sort();
  }

  const [first, ...rest] = LANGUAGES;
  for (const lang of rest) {
    const a = (placeholders[first] ?? []).join(',');
    const b = (placeholders[lang] ?? []).join(',');
    if (a !== b) {
      fail(`Khoá "${key}" lệch tham số: ${first}=[${a}] nhưng ${lang}=[${b}]`);
    }
  }
}

// ── 4. Chuỗi tiếng Việt cứng còn sót trong template ──────────────────────
// Dấu tiếng Việt có dấu là chỉ dấu chắc chắn nhất của chữ chưa dịch.
const VIETNAMESE_LETTERS = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i;

for (const file of files.filter((f) => f.endsWith('.html'))) {
  // Bỏ chú thích trên TOÀN BỘ nội dung trước, vì chú thích có thể trải nhiều dòng.
  const content = readFileSync(file, 'utf8').replace(/<!--[\s\S]*?-->/g, '');

  content.split(/\r?\n/).forEach((line, index) => {
    // Bỏ qua phần trong {{ }} (đã là biểu thức) và giá trị các thuộc tính có ràng buộc.
    const stripped = line
      .replace(/\{\{[\s\S]*?\}\}/g, '')
      .replace(/\[[a-zA-Z.]+\]="[^"]*"/g, '')
      .replace(/\([a-zA-Z.]+\)="[^"]*"/g, '');

    // Chỉ xét phần chữ nằm ngoài thẻ.
    const textOnly = stripped.replace(/<[^>]*>/g, ' ');
    if (VIETNAMESE_LETTERS.test(textOnly)) {
      fail(`${file.replace(ROOT, '.')}:${index + 1} còn chữ tiếng Việt cứng: ${textOnly.trim().slice(0, 60)}`);
    }
  });
}

// ── Tổng kết ─────────────────────────────────────────────────────────────
const unused = [...allKeys].filter((key) => !usedKeys.has(key));

log(`${c.bold}Kiem tra da ngon ngu${c.reset}`);
log(`  tong so khoa      : ${allKeys.size}`);
log(`  ngon ngu          : ${LANGUAGES.join(', ')}`);
log(`  khoa dang dung    : ${usedKeys.size}`);

if (unused.length > 0) {
  log(`${c.yellow}  khoa khong dung   : ${unused.length} (${unused.slice(0, 8).join(', ')}${unused.length > 8 ? '…' : ''})${c.reset}`);
}

log();
if (problems === 0) {
  log(`${c.green}OK: tu dien day du, khong con chuoi cung trong template.${c.reset}`);
} else {
  log(`${c.red}${problems} van de can sua.${c.reset}`);
  process.exitCode = 1;
}
