import { stripDiacritics } from './text';

/**
 * Chấm câu trả lời gõ tay.
 *
 * Mục tiêu: chấm SAI chỉ khi người học thật sự chưa nhớ, không phải khi họ gõ đúng
 * nhưng khác cách trình bày. Ba nguồn khác biệt hay gặp nhất:
 *  - khoảng trắng (kể cả dấu cách toàn chiều mà bộ gõ tiếng Nhật sinh ra),
 *  - chữ số toàn chiều ／ nửa chiều (１日 và 1日),
 *  - dấu câu ở cuối câu ví dụ (。 và không có gì).
 */

/** Khoảng trắng toàn chiều, hay lẫn vào khi copy văn bản tiếng Nhật. */
const FULLWIDTH_SPACE = String.fromCharCode(0x3000);

const FULLWIDTH_DIGITS = /[０-９]/g;

/**
 * Chỉ đổi chữ SỐ về nửa chiều chứ không NFKC cả chuỗi: NFKC còn biến ～ (đang dùng
 * làm ký hiệu mẫu ngữ pháp: ～きり) và katakana nửa chiều thành thứ khác.
 */
function foldFullwidthDigits(value: string): string {
  return value.replace(FULLWIDTH_DIGITS, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0xff10 + 0x30),
  );
}

/** Dấu câu bỏ qua khi chấm, gồm cả dấu tiếng Nhật lẫn dấu tiếng Việt. */
const PUNCTUATION = /[、。，．！？!?,.;:；：'"“”‘’「」『』（）()…‥⋯・]/g;

export interface CompareOptions {
  /** Bỏ qua dấu thanh tiếng Việt. Bật khi đáp án là nghĩa tiếng Việt. */
  ignoreDiacritics: boolean;
}

/** Đưa một câu trả lời về dạng dùng để so sánh. */
function normalize(value: string, options: CompareOptions): string {
  // NFC: bộ gõ tiếng Việt có thể gửi dấu dạng tổ hợp (u + dấu nặng) trong khi dữ liệu
  // viết dạng dựng sẵn (ự). Khi chấm giữ dấu (âm Hán Việt), hai dạng đó phải là một.
  let result = foldFullwidthDigits(String(value ?? '').normalize('NFC'))
    .split(FULLWIDTH_SPACE)
    .join(' ')
    .replace(PUNCTUATION, ' ')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

  if (options.ignoreDiacritics) result = stripDiacritics(result);
  return result;
}

/**
 * Dấu ngăn các nghĩa tương đương trong một ô: "chạy trốn/ bỏ chạy".
 *
 * Người học gõ được MỘT trong số đó là đúng — bắt gõ cả ba nghĩa thì đang kiểm tra
 * trí nhớ về cách sách in chứ không phải về nghĩa của từ.
 */
export const ALTERNATIVE_SEPARATOR = '/';

/** Tách một ô nghĩa thành các cách trả lời được chấp nhận. */
export function splitAlternatives(value: string): string[] {
  return value
    .split(ALTERNATIVE_SEPARATOR)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

/** Phần trong ngoặc, kể cả ngoặc toàn chiều: "Phương Đông (người châu Á)". */
const PARENTHETICAL = /\s*[(（][^()（）]*[)）]/g;

/**
 * Bỏ phần trong ngoặc. Ngoặc trong ô nghĩa là chú thích bổ sung ("Phương Đông
 * (người châu Á)"), không phải phần nghĩa bắt buộc — gõ "phương đông" là đã nhớ nghĩa.
 */
function withoutParenthetical(value: string): string {
  return value.replace(PARENTHETICAL, ' ').trim();
}

/**
 * Mọi cách trả lời được chấp nhận sinh ra từ một đáp án.
 *
 * Bỏ ngoặc TRƯỚC khi tách theo "/" để dấu / nằm trong ngoặc ("A (x/ y)") không cắt
 * đáp án thành mảnh lửng; bỏ ngoặc cả SAU khi tách để từng nghĩa cũng được rút gọn.
 */
function acceptedForms(answer: string): string[] {
  return [answer, withoutParenthetical(answer)]
    .flatMap((base) => [base, ...splitAlternatives(base)])
    .flatMap((form) => [form, withoutParenthetical(form)]);
}

/**
 * Câu trả lời có khớp một trong các đáp án được chấp nhận không.
 *
 * Mỗi đáp án sinh ra các cách trả lời được chấp nhận sau, và phải có đủ cả ba:
 *
 *  - từng nghĩa tách rời ("hạn chót", "kỳ hạn") — cho chế độ GÕ, vì gõ đủ cả cụm
 *    "hạn chót/ kỳ hạn" là đang kiểm tra trí nhớ về cách sách in;
 *  - nguyên cả cụm ("hạn chót/ kỳ hạn") — cho chế độ TRẮC NGHIỆM, vì nút lựa chọn
 *    hiện đúng chuỗi trong dữ liệu, tức là cả cụm;
 *  - bản đã bỏ phần trong ngoặc ("Phương Đông" cho "Phương Đông (người châu Á)") —
 *    phần trong ngoặc chỉ là chú thích, gõ thiếu nó vẫn là nhớ đúng nghĩa.
 *
 * Thiếu vế thứ hai thì mọi từ có dấu / bị chấm sai ngay cả khi người học bấm trúng
 * nút đáp án đúng — sai ở đúng chỗ người học không thể nào ngờ tới.
 */
export function isAnswerCorrect(
  given: string,
  accepted: readonly string[],
  options: CompareOptions,
): boolean {
  const normalizedGiven = normalize(given, options);
  if (!normalizedGiven) return false;

  return accepted
    .flatMap(acceptedForms)
    .some((answer) => normalize(answer, options) === normalizedGiven);
}
