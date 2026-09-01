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
 * Cắt một câu quanh từ cần tô đậm: trả về các mảnh, mảnh nào là chính từ đó thì
 * `hit = true`.
 *
 * Dùng để tô đậm từ đang học trong câu ví dụ — đúng như bản in của giáo trình, nơi
 * từ mục tiêu được bôi đỏ giữa câu. Không tìm thấy thì trả về nguyên câu một mảnh,
 * chứ không cố đoán: dữ liệu có vài chỗ câu viết khác dạng từ điển (từ "引っ越し"
 * nhưng câu viết "引越し"), tô nhầm còn tệ hơn không tô.
 */
export function splitAround(text: string, needle: string): { text: string; hit: boolean }[] {
  if (!needle || !text.includes(needle)) return [{ text, hit: false }];

  const parts: { text: string; hit: boolean }[] = [];
  let rest = text;
  while (rest.includes(needle)) {
    const at = rest.indexOf(needle);
    if (at > 0) parts.push({ text: rest.slice(0, at), hit: false });
    parts.push({ text: needle, hit: true });
    rest = rest.slice(at + needle.length);
  }
  if (rest) parts.push({ text: rest, hit: false });
  return parts;
}
