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

// ── Chấm cả một câu (luyện dịch câu ví dụ) ───────────────────────────────────

/**
 * Dấu bỏ qua khi chấm một câu: ngoài dấu câu thường còn các ký hiệu sách dùng để chú
 * thích câu ví dụ (／ ＞＜ → ＝ ≒ ～). Người dịch không gõ những thứ đó, và thiếu
 * chúng cũng không làm câu dịch sai đi.
 */
const SENTENCE_PUNCTUATION = /[、。，．！？!?,.;:；：'"“”‘’「」『』（）()…‥⋯・／/～〜＞＜<>→＝=≒\-–—]/g;

/**
 * Đuôi chú thích của câu ví dụ: "…決してほえない。→ 動物", "仲がいい ＞＜ 仲が悪い".
 * Phần sau dấu là ghi chú về cách dùng hoặc từ trái nghĩa, không phải một phần của câu.
 */
const ANNOTATION_TAIL = /\s*(?:→|＞＜)[\s\S]*$/;

/**
 * Đưa một câu về dạng dùng để so sánh — chép theo bộ chấm câu của minano_nihongo.
 *
 * Bỏ HẾT khoảng trắng chứ không gom lại: tiếng Nhật không có dấu cách giữa từ, còn
 * xoá dấu câu đi thì chỗ nó đứng có thành ranh giới từ hay không là chuyện không đoán
 * được ("15.000 yên" gõ thành "15000 yên"). Đổi dấu thành dấu cách như khi chấm từ
 * đơn thì mỗi trường hợp đó lại bị chấm sai một kiểu.
 */
function normalizeSentence(value: string, options: CompareOptions): string {
  let result = foldFullwidthDigits(String(value ?? '').normalize('NFC'))
    .replace(SENTENCE_PUNCTUATION, '')
    .replace(/[\s　]+/g, '')
    .toLowerCase();

  if (options.ignoreDiacritics) result = stripDiacritics(result);
  return result;
}

/** Dấu cho biết ngoặc là lời chú của sách chứ không phải một phần của câu. */
const NOTE_MARK = /[＝=≒]|＞＜/;

/**
 * Ngoặc đứng ở CUỐI chuỗi, tính cả ngoặc lồng bên trong: "（≒ 周囲・周辺（N2））".
 * null nghĩa là chuỗi không kết thúc bằng ngoặc.
 */
function trailingParenthetical(text: string): { start: number; content: string } | null {
  const last = text[text.length - 1];
  if (last !== ')' && last !== '）') return null;

  let depth = 0;
  for (let index = text.length - 1; index >= 0; index--) {
    const ch = text[index];
    if (ch === ')' || ch === '）') depth++;
    if ((ch === '(' || ch === '（') && --depth === 0) {
      return { start: index, content: text.slice(index + 1, -1) };
    }
  }
  return null;
}

/**
 * Câu ví dụ đã bỏ lời chú của sách: đuôi "→ 動物" / "＞＜ が悪い", và ngoặc chú ở cuối
 * câu — "（＝拍手）", "(≒ 語調 = giọng điệu)".
 *
 * Chỉ bỏ ngoặc ở CUỐI câu và có dấu chú (＝ ≒ ＞＜): ngoặc giữa câu hay ngoặc liệt kê
 * là nội dung — "（パソコンを）修理に出した", "東洋（文化／芸術／医学）" — bỏ đi thì câu cụt.
 *
 * Lựa chọn trắc nghiệm của câu dịch phải qua hàm này: lời chú tiếng Việt thường nhắc
 * lại đúng chữ Nhật có trong câu dẫn (語調), nhìn chữ là chọn được mà không cần dịch.
 */
export function withoutAnnotations(sentence: string): string {
  // Gỡ ngoặc chú TRƯỚC rồi mới cắt đuôi: ngoặc chú có thể chứa chính dấu của đuôi —
  // cắt từ ＞＜ trong "（＞＜ 狭い ≒ 幅）" thì còn trơ lại nửa ngoặc "（".
  const withoutTail = withoutTrailingNotes(sentence.trimEnd()).replace(ANNOTATION_TAIL, '');
  return withoutTrailingNotes(withoutTail.trimEnd());
}

/** Gỡ lần lượt các ngoặc chú ở cuối chuỗi; dừng ở ngoặc đầu tiên là nội dung. */
function withoutTrailingNotes(text: string): string {
  let result = text;
  for (
    let note = trailingParenthetical(result);
    note && NOTE_MARK.test(note.content);
    note = trailingParenthetical(result)
  ) {
    result = result.slice(0, note.start).trimEnd();
  }
  return result;
}

/**
 * Các cách viết được chấp nhận của MỘT câu mẫu: nguyên câu, câu đã bỏ lời chú của
 * sách, và cả hai khi bỏ hết phần trong ngoặc (chữ có thể lược như "(の)", "（お）").
 *
 * KHÔNG tách theo "/" như ô nghĩa: trong câu, "/" là một phần của câu (cơ thể / giọng
 * / bụng), tách ra thì một mảnh lửng như "bụng) tốt" cũng thành đáp án đúng.
 */
function sentenceForms(sentence: string): string[] {
  return [sentence, withoutAnnotations(sentence)].flatMap((form) => [
    form,
    withoutParenthetical(form),
  ]);
}

/**
 * Câu dịch có khớp một trong các câu mẫu không.
 *
 * Khớp chuỗi không bao giờ đủ cho một câu dịch tự do — cùng một ý có nhiều cách nói,
 * nên chấm trượt ở đây chỉ là "chưa khớp câu mẫu". Phần còn lại do người học tự xác
 * nhận sau khi đã thấy câu mẫu (xem `PracticeQuestion.selfGradable`).
 */
export function isSentenceCorrect(
  given: string,
  accepted: readonly string[],
  options: CompareOptions,
): boolean {
  const normalizedGiven = normalizeSentence(given, options);
  if (!normalizedGiven) return false;

  return accepted
    .flatMap(sentenceForms)
    .some((answer) => normalizeSentence(answer, options) === normalizedGiven);
}
