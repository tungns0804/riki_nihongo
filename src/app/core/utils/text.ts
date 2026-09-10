/**
 * Chuẩn hoá chữ để SO SÁNH và để TÌM KIẾM. Không dùng cho việc hiển thị.
 */

/**
 * Bỏ dấu tiếng Việt.
 *
 * NFD tách chữ cái ra khỏi dấu, rồi xoá dải dấu kết hợp U+0300–U+036F. Riêng đ/Đ
 * không phải chữ có dấu kết hợp nên phải thay tay.
 */
export function stripDiacritics(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

/** Đưa chuỗi về dạng so khớp khi tìm kiếm: bỏ dấu, thường hoá, gộp khoảng trắng. */
export function normalizeSearch(value: string): string {
  return stripDiacritics(String(value ?? ''))
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Khớp theo TỪNG TỪ chứ không theo cả cụm: gõ "bai 3 kanji" vẫn ra "Kanji — Bài 3"
 * dù trong tên thật hai phần đó đảo thứ tự.
 */
export function matchesAllWords(haystack: string, needle: string): boolean {
  if (!needle) return true;
  const normalized = normalizeSearch(haystack);
  return needle.split(' ').every((word) => normalized.includes(word));
}

/**
 * Cắt một câu quanh các chữ cần tô đậm: trả về các mảnh, mảnh nào là một trong các
 * chữ đó thì `hit = true`.
 *
 * Dùng để tô đậm từ đang học trong câu ví dụ — đúng như bản in của giáo trình, nơi
 * từ mục tiêu được bôi đỏ giữa câu. Nhận NHIỀU chữ vì sách có câu tô hai chỗ
 * (やる気が起きない・起こらない). Không tìm thấy chữ nào thì trả về nguyên câu một
 * mảnh, chứ không cố đoán: tô nhầm còn tệ hơn không tô.
 */
export function splitAround(
  text: string,
  needles: readonly string[],
): { text: string; hit: boolean }[] {
  const wanted = needles.filter((needle) => needle.length > 0);
  const parts: { text: string; hit: boolean }[] = [];
  let rest = text;

  while (true) {
    // Chỗ khớp SỚM NHẤT trong phần còn lại. Hai chữ khớp cùng một chỗ (chữ này là
    // phần đầu của chữ kia) thì lấy chữ dài hơn, nếu không phần đuôi sẽ không được tô.
    let at = -1;
    let hit = '';
    for (const needle of wanted) {
      const index = rest.indexOf(needle);
      if (index === -1) continue;
      if (at === -1 || index < at || (index === at && needle.length > hit.length)) {
        at = index;
        hit = needle;
      }
    }
    if (at === -1) break;

    if (at > 0) parts.push({ text: rest.slice(0, at), hit: false });
    parts.push({ text: hit, hit: true });
    rest = rest.slice(at + hit.length);
  }

  if (rest || parts.length === 0) parts.push({ text: rest, hit: false });
  return parts;
}

/** Phần kana (hiragana, katakana, dấu ー) ở CUỐI một chuỗi. */
const TRAILING_KANA = /[ぁ-ゟ゠-ヿ]*$/;
const KANA_ONLY = /^[ぁ-ゟ゠-ヿ]*$/;

/**
 * Cách đọc của một DẠNG CHIA, suy từ cách đọc của dạng từ điển:
 *
 *   readingOfForm('渇いた', '渇く', 'かわく')          -> 'かわいた'
 *   readingOfForm('お尋ねしたい', '尋ねる', 'たずねる') -> 'おたずねしたい'
 *
 * Chia động từ chỉ đổi phần kana đứng sau chữ Hán (okurigana), còn chữ Hán vẫn đọc
 * như cũ. Nên bỏ phần kana cuối của dạng từ điển khỏi cách đọc là còn lại cách đọc
 * của chữ Hán, ghép với phần kana của dạng chia là xong — không cần biết động từ
 * thuộc nhóm nào.
 *
 * Cần để khi luyện điền từ, gõ "かわいた" thay cho "渇いた" vẫn tính đúng, như danh từ.
 * Không suy được (dạng chia có chữ Hán khác chen vào, cách đọc không kết thúc bằng
 * đúng phần kana đó) thì trả về chuỗi rỗng, không đoán.
 */
export function readingOfForm(form: string, dictionary: string, reading: string): string {
  if (!reading) return '';
  if (form === dictionary) return reading;

  const tail = dictionary.match(TRAILING_KANA)?.[0] ?? '';
  const stem = dictionary.slice(0, dictionary.length - tail.length);
  if (!stem || !reading.endsWith(tail)) return '';

  const at = form.indexOf(stem);
  if (at === -1) return '';
  const before = form.slice(0, at);
  const after = form.slice(at + stem.length);
  if (!KANA_ONLY.test(before) || !KANA_ONLY.test(after)) return '';

  return before + reading.slice(0, reading.length - tail.length) + after;
}
