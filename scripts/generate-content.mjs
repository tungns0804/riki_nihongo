#!/usr/bin/env node
/**
 * Sinh nội dung của trang từ thư mục `data-source/`.
 *
 *   data-source/<học phần>/<phần>/<bài>/<file dữ liệu>  ->  public/content/<học phần>/<phần>/<id>.json
 *                                                        ->  public/content/<học phần>/index.json
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

const args = new Set(process.argv.slice(2));
const CLEAN = args.has('--clean');
const CHECK_ONLY = args.has('--check');

/**
 * Các học phần đang học được và phần học của từng học phần. PHẢI khớp với `COURSES`
 * trong `src/app/core/course/course.config.ts` (id và `modules`).
 *
 * Mỗi học phần một `index.json` riêng: trang chỉ tải danh mục của học phần đang mở, và
 * id bài được phép trùng giữa hai học phần (cả hai đều có `vocabulary/01-danh-tu`).
 */
const COURSES = [
  {
    id: 'n3-junbi',
    name: 'N3 JUNBI',
    level: 'N3',
    modules: ['entrance-test', 'vocabulary', 'kanji', 'grammar', 'reading', 'listening', 'mimikara'],
  },
  { id: 'btvn-co-ban', name: 'BTVN CƠ BẢN (MỚI)', level: 'N3', modules: ['vocabulary', 'kanji'] },
];

/**
 * Bảy phần học. PHẢI khớp với `MODULES` trong `src/app/core/course/course.config.ts`:
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

const MODULE_BY_ID = new Map(MODULES.map((module) => [module.id, module]));

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
let placeholderCount = 0;

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

/**
 * Tìm file dữ liệu trong thư mục bài, theo đúng loại của phần học.
 *
 * Ba kết quả, phân biệt rõ chứ không gộp:
 *  - đường dẫn file  : bài có nội dung.
 *  - 'placeholder'   : thư mục CHỈ có meta.json — bài đã đặt chỗ, nội dung đưa vào
 *                      sau. Đây là trạng thái bình thường của một khoá đang soạn dở,
 *                      nên không báo lỗi.
 *  - null            : có file dữ liệu nhưng tên không đúng quy ước, hoặc có nhiều
 *                      file cùng lúc. Đây mới là lỗi — gõ nhầm tên file mà bị coi là
 *                      "chưa có nội dung" thì cả bài biến mất trong im lặng.
 */
const PLACEHOLDER = 'placeholder';

function findDataFile(folderPath, kind, label) {
  const { pattern, accepted } = FILE_PATTERNS[kind];
  const files = readdirSync(folderPath).filter((name) => name !== 'meta.json');
  const matched = files.filter((name) => pattern.test(name));

  if (matched.length === 0) {
    const others = files.filter((name) => ['.txt', '.csv', '.tsv', '.json'].includes(extname(name)));
    if (others.length === 0) return PLACEHOLDER;
    fail(`[${label}] file dữ liệu sai tên: ${others.join(', ')}. Cần một trong: ${accepted}`);
    return null;
  }
  if (matched.length > 1) {
    fail(`[${label}] có nhiều file dữ liệu cùng lúc: ${matched.join(', ')}`);
    return null;
  }

  return join(folderPath, matched[0]);
}

/**
 * Phần học có thể chứa bài dạng ĐỀ (`meta.json` khai `"kind": "test"`).
 *
 * Chỉ hai phần ngữ pháp, vì chỉ trang bài của chúng biết hiện khung "bắt đầu làm
 * đề" (xem features/grammar-detail). Đặt đề vào phần từ vựng hay kanji thì bài vẫn
 * sinh ra được nhưng mở lên chỉ thấy trang trống — báo lỗi ngay ở đây còn hơn để
 * người học phát hiện hộ.
 */
const TEST_HOSTS = new Set(['grammar', 'mimikara']);

/**
 * Loại nội dung của một bài: theo phần học, trừ khi `meta.json` khai khác.
 *
 * Khai khác chỉ để một chỗ: bài dạng ĐỀ nằm trong phần lý thuyết — "Đề thi thật ôn
 * tập N4" là một bài của phần Ngữ pháp trên website Riki, không phải một phần riêng,
 * nên nó phải nằm đúng chỗ đó trong menu (xem README).
 */
function kindOf(module, meta, label) {
  const raw = meta.kind;
  if (typeof raw !== 'string' || !raw || raw === module.kind) return module.kind;

  if (raw !== 'test') {
    fail(`[${label}] meta.json khai "kind": "${raw}" — chỉ "test" mới được khai khác phần học`);
    return module.kind;
  }
  if (!TEST_HOSTS.has(module.id)) {
    fail(
      `[${label}] bài dạng đề ("kind": "test") chỉ đặt được trong: ${[...TEST_HOSTS].join(', ')}`,
    );
    return module.kind;
  }
  return 'test';
}

/** Đọc một bài và dựng nội dung đã chuẩn hoá. Trả về null nếu bài đó hỏng. */
function buildUnit(course, module, folderName) {
  const folderPath = join(SOURCE_DIR, course.id, module.folder, folderName);
  const label = `${course.id}/${module.folder}/${folderName}`;

  // Đọc meta TRƯỚC khi tìm file dữ liệu: meta mới là chỗ nói bài này thuộc loại nào,
  // mà loại quyết định file dữ liệu tên gì (grammar.json hay test.json).
  const meta = readMeta(folderPath, label);
  const kind = kindOf(module, meta, label);

  const dataFile = findDataFile(folderPath, kind, label);
  if (!dataFile) return null;

  const id = typeof meta.id === 'string' && meta.id ? slugify(meta.id) : slugify(folderName);
  const name = typeof meta.name === 'string' && meta.name ? meta.name : folderName;
  const description = typeof meta.description === 'string' ? meta.description : '';
  const order = typeof meta.order === 'number' ? meta.order : orderFromName(folderName);

  // Bài giữ chỗ vẫn được ghi ra file JSON với mảng rỗng, và vẫn có mặt trong danh mục.
  // Nhờ vậy người học nhìn thấy khoá gồm những bài gì ngay từ đầu, còn giao diện thì
  // chỉ cần một quy tắc duy nhất để nhận ra bài chưa có nội dung: itemCount === 0.
  if (dataFile === PLACEHOLDER) {
    placeholderCount++;
    return {
      entry: { id, name, description, kind, itemCount: 0, order, file: `${module.folder}/${id}.json` },
      content: { id, name, description, kind, ...emptyPayload(kind) },
      placeholder: true,
    };
  }

  const raw = readFileSync(dataFile, 'utf8');

  let payload = {};
  let warnings = [];

  try {
    if (kind === 'vocabulary') {
      const parsed = parseVocabulary(raw);
      payload = { groups: parsed.groups, words: parsed.words };
      warnings = parsed.warnings;
    } else if (kind === 'kanji') {
      const parsed = parseKanji(raw);
      payload = { kanji: parsed.entries };
      warnings = parsed.warnings;
    } else {
      const json = JSON.parse(raw);
      if (kind === 'grammar') {
        const parsed = normalizeGrammar(json);
        payload = { points: parsed.points };
        warnings = parsed.warnings;
      } else if (kind === 'reading') {
        const parsed = normalizeReading(json);
        payload = { passages: parsed.passages };
        warnings = parsed.warnings;
      } else if (kind === 'listening') {
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

  const itemCount = countItems(kind, payload);
  if (itemCount === 0) {
    fail(`[${label}] không có mục nào dùng được`);
    for (const message of warnings) warn(`[${label}] ${message}`);
    return null;
  }

  for (const message of warnings) warn(`[${label}] ${message}`);

  return {
    // `file` tính từ thư mục của học phần, nên danh mục không phải lặp lại tên học phần.
    entry: { id, name, description, kind, itemCount, order, file: `${module.folder}/${id}.json` },
    content: { id, name, description, kind, ...payload },
    placeholder: false,
  };
}

/** Nội dung rỗng đúng hình dạng của loại bài — dùng cho bài giữ chỗ. */
function emptyPayload(kind) {
  if (kind === 'vocabulary') return { groups: [], words: [] };
  if (kind === 'kanji') return { kanji: [] };
  if (kind === 'grammar') return { points: [] };
  if (kind === 'reading') return { passages: [] };
  if (kind === 'listening') return { tracks: [] };
  return { sections: [] };
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

// Thư mục lạ ở cấp học phần gần như chắc chắn là đặt nhầm chỗ — ví dụ thả bài thẳng vào
// data-source/vocabulary/ theo cách cũ, từ trước khi nội dung tách theo học phần. Bỏ qua
// trong im lặng thì bài đó không bao giờ lên trang mà không ai biết vì sao.
for (const name of listDirs(SOURCE_DIR)) {
  if (!COURSES.some((course) => course.id === name)) {
    fail(
      `data-source/${name}/ không phải học phần nào. Nội dung đặt trong ` +
        `data-source/<học phần>/<phần học>/, học phần hợp lệ: ${COURSES.map((course) => course.id).join(', ')}`,
    );
  }
}

/** Mọi file đã ghi, tính từ public/content/ — để --clean biết file nào không còn nguồn. */
const writtenFiles = new Set();
let totalUnits = 0;
let totalItems = 0;

for (const course of COURSES) {
  log(`  ${c.cyan}${course.id}${c.reset}`);
  const indexModules = [];

  for (const moduleId of course.modules) {
    const module = MODULE_BY_ID.get(moduleId);
    const folders = listDirs(join(SOURCE_DIR, course.id, module.folder));
    const units = [];

    for (const folderName of folders) {
      const built = buildUnit(course, module, folderName);
      if (!built) continue;

      const duplicate = units.find((unit) => unit.id === built.entry.id);
      if (duplicate) {
        fail(`[${course.id}/${module.folder}/${folderName}] id "${built.entry.id}" đã được bài khác dùng`);
        continue;
      }

      units.push(built.entry);
      writtenFiles.add(`${course.id}/${built.entry.file}`);
      writeJson(join(OUTPUT_DIR, course.id, built.entry.file), built.content);
      totalItems += built.entry.itemCount;
    }

    units.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, 'vi'));
    totalUnits += units.length;
    indexModules.push({ id: module.id, units });

    const count = units.length;
    const pending = units.filter((unit) => unit.itemCount === 0).length;
    const suffix = pending > 0 ? ` ${c.dim}(${pending} giu cho)${c.reset}` : '';
    const line = `    ${module.folder.padEnd(14)} ${String(count).padStart(3)} bai`;
    log((count > 0 ? `${c.green}${line}${c.reset}` : `${c.dim}${line}${c.reset}`) + suffix);
  }

  writtenFiles.add(`${course.id}/index.json`);
  writeJson(join(OUTPUT_DIR, course.id, 'index.json'), {
    course: { id: course.id, name: course.name, level: course.level },
    generatedAt: new Date().toISOString(),
    modules: indexModules,
  });
}

// Xoá file .json không còn nguồn tương ứng. Chỉ khi được yêu cầu: thư mục public/
// có thể chứa file người dùng tự đặt vào, xoá tự động là mất dữ liệu không hỏi.
if (CLEAN && !CHECK_ONLY && existsSync(OUTPUT_DIR)) {
  for (const course of COURSES) {
    for (const moduleId of course.modules) {
      const folder = MODULE_BY_ID.get(moduleId).folder;
      const dir = join(OUTPUT_DIR, course.id, folder);
      if (!existsSync(dir)) continue;
      for (const name of readdirSync(dir)) {
        const relative = `${course.id}/${folder}/${name}`;
        if (extname(name) === '.json' && !writtenFiles.has(relative)) {
          rmSync(join(dir, name));
          log(`${c.dim}  xoa ${relative}${c.reset}`);
        }
      }
    }
  }
}

log();
log(`  tong cong      : ${COURSES.length} hoc phan, ${totalUnits} bai, ${totalItems} muc`);
if (placeholderCount > 0) log(`  ${c.dim}dang giu cho   : ${placeholderCount} bai (moi co meta.json)${c.reset}`);
if (warningCount > 0) log(`${c.yellow}  canh bao       : ${warningCount}${c.reset}`);
log();

if (failureCount === 0) {
  log(`${c.green}OK: ${CHECK_ONLY ? 'noi dung nguon hop le' : 'da ghi public/content/'}${c.reset}`);
} else {
  log(`${c.red}CO ${failureCount} LOI o tren — cac bai bi loi da bi bo qua.${c.reset}`);
}
