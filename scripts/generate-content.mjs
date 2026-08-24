#!/usr/bin/env node
/**
 * Sinh nội dung của trang từ thư mục `data-source/`.
 *
 *   data-source/<phần>/<bài>/<file dữ liệu>  ->  public/content/<phần>/<id>.json
 *                                            ->  public/content/index.json
 *
 * Cách dùng:
 *   npm run generate            Sinh lại toàn bộ
 *   npm run generate:clean      Sinh lại, đồng thời xoá file .json thừa
 *   npm run generate:check      Chỉ kiểm tra, không ghi file (dùng cho CI)
 *
 * Mỗi thư mục con của một phần là MỘT bài. Trong đó đặt `meta.json` để chỉ định
 * tên hiển thị và thứ tự:
 *
 *   { "name": "Bài 1 · Từ vựng", "description": "…", "order": 1 }
 *
 * Không có meta.json thì tên lấy từ tên thư mục và thứ tự lấy từ số đầu tên thư mục
 * ("01-tu-vung" -> 1), nên đặt tên thư mục có số ở đầu là đủ dùng.
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  normalizeGrammar,
  normalizeListening,
  normalizeReading,
  normalizeTest,
  parseKanji,
  parseVocabulary,
  slugify,
} from './content-core.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const SOURCE_DIR = join(ROOT, 'data-source');
const OUTPUT_DIR = join(ROOT, 'public', 'content');
const INDEX_FILE = join(OUTPUT_DIR, 'index.json');

const args = new Set(process.argv.slice(2));
const CLEAN = args.has('--clean');
const CHECK_ONLY = args.has('--check');

/**
 * Bảy phần học. PHẢI khớp với `src/app/core/course/course.config.ts`:
 * `folder` ở đây là `folder` bên đó, `kind` là `kind` bên đó.
 */
const MODULES = [
  { id: 'entrance-test', folder: 'entrance-test', kind: 'test' },
  { id: 'vocabulary', folder: 'vocabulary', kind: 'vocabulary' },
  { id: 'kanji', folder: 'kanji', kind: 'kanji' },
  { id: 'grammar', folder: 'grammar', kind: 'grammar' },
  { id: 'reading', folder: 'reading', kind: 'reading' },
  { id: 'listening', folder: 'listening', kind: 'listening' },
  { id: 'mimikara', folder: 'mimikara', kind: 'grammar' },
];

/**
 * Tên file dữ liệu của từng loại bài.
 *
 * Tên file KHÔNG khớp danh sách này là báo lỗi chứ không đoán: một file `tuvung.txt`
 * bị đọc bằng bộ đọc kanji sẽ ra một bài đầy mục rỗng mà không có cảnh báo nào.
 */
const FILE_PATTERNS = {
  vocabulary: { pattern: /^(?:vocabulary|vocab|tu-?vung)\.(?:txt|csv|tsv)$/i, accepted: 'vocabulary.txt, tu-vung.txt' },
  kanji: { pattern: /^(?:kanji|chu-?han)\.(?:txt|csv|tsv)$/i, accepted: 'kanji.txt, chu-han.txt' },
  grammar: { pattern: /^(?:grammar|ngu-?phap)\.json$/i, accepted: 'grammar.json, ngu-phap.json' },
  reading: { pattern: /^(?:reading|doc-?hieu)\.json$/i, accepted: 'reading.json, doc-hieu.json' },
  listening: { pattern: /^(?:listening|nghe-?hieu)\.json$/i, accepted: 'listening.json, nghe-hieu.json' },
  test: { pattern: /^(?:test|de|kiem-?tra)\.json$/i, accepted: 'test.json, de.json, kiem-tra.json' },
};

// Mã màu ANSI, tự tắt khi output bị pipe vào file hoặc khi đặt biến môi trường NO_COLOR.
const USE_COLOR = process.stdout.isTTY === true && !process.env['NO_COLOR'];
const ESC = String.fromCharCode(27);
const ansi = (code) => (USE_COLOR ? `${ESC}[${code}m` : '');
const c = {
  reset: ansi(0),
  bold: ansi(1),
  dim: ansi(2),
  red: ansi(31),
  green: ansi(32),
  yellow: ansi(33),
  cyan: ansi(36),
};

const log = (msg = '') => process.stdout.write(`${msg}\n`);

let failureCount = 0;
let warningCount = 0;

function fail(msg) {
  log(`${c.red}[LOI] ${msg}${c.reset}`);
  failureCount++;
  process.exitCode = 1;
}

function warn(msg) {
  log(`${c.yellow}  ! ${msg}${c.reset}`);
  warningCount++;
}

function listDirs(path) {
  if (!existsSync(path)) return [];
  return readdirSync(path)
    .filter((name) => !name.startsWith('.'))
    .filter((name) => statSync(join(path, name)).isDirectory())
    .sort();
}

/** Đọc meta.json của một bài, trả về {} nếu không có / hỏng. */
function readMeta(folderPath, label) {
  const metaPath = join(folderPath, 'meta.json');
  if (!existsSync(metaPath)) return {};
  try {
    const parsed = JSON.parse(readFileSync(metaPath, 'utf8'));
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    fail(`[${label}] meta.json không phải JSON hợp lệ: ${error.message}`);
    return {};
  }
}

/** Số ở đầu tên thư mục ("03-kanji" -> 3), dùng làm thứ tự khi meta không nói gì. */
function orderFromName(name) {
  const match = name.match(/^(\d+)/);
  return match ? Number.parseInt(match[1], 10) : 0;
}

/** Tìm file dữ liệu trong thư mục bài, theo đúng loại của phần học. */
function findDataFile(folderPath, kind, label) {
  const { pattern, accepted } = FILE_PATTERNS[kind];
  const files = readdirSync(folderPath).filter((name) => name !== 'meta.json');
  const matched = files.filter((name) => pattern.test(name));

  if (matched.length === 0) {
    const others = files.filter((name) => ['.txt', '.csv', '.tsv', '.json'].includes(extname(name)));
    fail(
      `[${label}] không có file dữ liệu. Cần một trong: ${accepted}` +
        (others.length > 0 ? ` (đang có: ${others.join(', ')})` : ''),
    );
    return null;
  }
  if (matched.length > 1) {
    fail(`[${label}] có nhiều file dữ liệu cùng lúc: ${matched.join(', ')}`);
    return null;
  }

  return join(folderPath, matched[0]);
}

/** Đọc một bài và dựng nội dung đã chuẩn hoá. Trả về null nếu bài đó hỏng. */
function buildUnit(module, folderName) {
  const folderPath = join(SOURCE_DIR, module.folder, folderName);
  const label = `${module.folder}/${folderName}`;

  const dataFile = findDataFile(folderPath, module.kind, label);
  if (!dataFile) return null;

  const meta = readMeta(folderPath, label);
  const raw = readFileSync(dataFile, 'utf8');

  let payload = {};
  let warnings = [];

  try {
    if (module.kind === 'vocabulary') {
      const parsed = parseVocabulary(raw);
      payload = { words: parsed.words };
      warnings = parsed.warnings;
    } else if (module.kind === 'kanji') {
      const parsed = parseKanji(raw);
      payload = { kanji: parsed.entries };
      warnings = parsed.warnings;
    } else {
      const json = JSON.parse(raw);
      if (module.kind === 'grammar') {
        const parsed = normalizeGrammar(json);
        payload = { points: parsed.points };
        warnings = parsed.warnings;
      } else if (module.kind === 'reading') {
        const parsed = normalizeReading(json);
        payload = { passages: parsed.passages };
        warnings = parsed.warnings;
      } else if (module.kind === 'listening') {
        const parsed = normalizeListening(json);
        payload = { tracks: parsed.tracks };
        warnings = parsed.warnings;
      } else {
        const parsed = normalizeTest(json);
        payload = { sections: parsed.sections };
        warnings = parsed.warnings;
      }
    }
  } catch (error) {
    fail(`[${label}] không đọc được ${dataFile.replace(ROOT, '.')}: ${error.message}`);
    return null;
  }

  const itemCount = countItems(module.kind, payload);
  if (itemCount === 0) {
    fail(`[${label}] không có mục nào dùng được`);
    for (const message of warnings) warn(`[${label}] ${message}`);
    return null;
  }

  for (const message of warnings) warn(`[${label}] ${message}`);

  const id = typeof meta.id === 'string' && meta.id ? slugify(meta.id) : slugify(folderName);
  const name = typeof meta.name === 'string' && meta.name ? meta.name : folderName;
  const order = typeof meta.order === 'number' ? meta.order : orderFromName(folderName);

  return {
    entry: {
      id,
      name,
      description: typeof meta.description === 'string' ? meta.description : '',
      kind: module.kind,
      itemCount,
      order,
      file: `${module.folder}/${id}.json`,
    },
    content: { id, name, description: typeof meta.description === 'string' ? meta.description : '', kind: module.kind, ...payload },
  };
}

/** Số mục của một bài — cùng quy ước với `countItems` bên src/app/core/models. */
function countItems(kind, payload) {
  if (kind === 'vocabulary') return payload.words.length;
  if (kind === 'kanji') return payload.kanji.length;
  if (kind === 'grammar') return payload.points.length;
  if (kind === 'reading') return payload.passages.length;
  if (kind === 'listening') return payload.tracks.length;
  return payload.sections.reduce((sum, section) => sum + section.questions.length, 0);
}

/** Ghi file JSON, tạo sẵn thư mục cha. Ở chế độ --check thì không ghi gì. */
function writeJson(path, value) {
  if (CHECK_ONLY) return;
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

// ── Chạy ───────────────────────────────────────────────────────────────────

if (!existsSync(SOURCE_DIR)) {
  fail(`không tìm thấy thư mục nguồn: ${SOURCE_DIR}`);
  process.exit(1);
}

log(`${c.bold}Sinh noi dung tu data-source/${c.reset}`);
log();

const indexModules = [];
const writtenFiles = new Set(['index.json']);
let totalUnits = 0;
let totalItems = 0;

for (const module of MODULES) {
  const moduleDir = join(SOURCE_DIR, module.folder);
  const folders = listDirs(moduleDir);
  const units = [];

  for (const folderName of folders) {
    const built = buildUnit(module, folderName);
    if (!built) continue;

    const duplicate = units.find((unit) => unit.id === built.entry.id);
    if (duplicate) {
      fail(`[${module.folder}/${folderName}] id "${built.entry.id}" đã được bài khác dùng`);
      continue;
    }

    units.push(built.entry);
    writtenFiles.add(built.entry.file);
    writeJson(join(OUTPUT_DIR, built.entry.file), built.content);
    totalItems += built.entry.itemCount;
  }

  units.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, 'vi'));
  totalUnits += units.length;
  indexModules.push({ id: module.id, units });

  const count = units.length;
  const line = `  ${module.folder.padEnd(14)} ${String(count).padStart(3)} bai`;
  log(count > 0 ? `${c.green}${line}${c.reset}` : `${c.dim}${line}${c.reset}`);
}

writeJson(INDEX_FILE, {
  course: { id: 'n3-junbi', name: 'N3 JUNBI', level: 'N3' },
  generatedAt: new Date().toISOString(),
  modules: indexModules,
});

// Xoá file .json không còn nguồn tương ứng. Chỉ khi được yêu cầu: thư mục public/
// có thể chứa file người dùng tự đặt vào, xoá tự động là mất dữ liệu không hỏi.
if (CLEAN && !CHECK_ONLY && existsSync(OUTPUT_DIR)) {
  for (const module of MODULES) {
    const dir = join(OUTPUT_DIR, module.folder);
    if (!existsSync(dir)) continue;
    for (const name of readdirSync(dir)) {
      const relative = `${module.folder}/${name}`;
      if (extname(name) === '.json' && !writtenFiles.has(relative)) {
        rmSync(join(dir, name));
        log(`${c.dim}  xoa ${relative}${c.reset}`);
      }
    }
  }
}

log();
log(`  tong cong      : ${totalUnits} bai, ${totalItems} muc`);
if (warningCount > 0) log(`${c.yellow}  canh bao       : ${warningCount}${c.reset}`);
log();

if (failureCount === 0) {
  log(`${c.green}OK: ${CHECK_ONLY ? 'noi dung nguon hop le' : 'da ghi public/content/'}${c.reset}`);
} else {
  log(`${c.red}CO ${failureCount} LOI o tren — cac bai bi loi da bi bo qua.${c.reset}`);
}
