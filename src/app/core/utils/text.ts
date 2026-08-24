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
