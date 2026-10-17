# Combo Kanji N5-N4 — Kanji

Khoá kanji sơ cấp của Riki, chỉ có một phần Kanji. Mỗi bài là một **đề**, chép như phần
Kanji của BTVN N4 CHUYÊN SÂU ([README](../../btvn-n4-chuyen-sau/kanji/README.md)):
`meta.json` khai `"kind": "test"`, dữ liệu nằm trong `test.json` (định dạng ở
[`n3-junbi/entrance-test/README.md`](../../n3-junbi/entrance-test/README.md)), mỗi câu có
`choicesVietnamese` và `choiceNotes`.

## Các bài

| Thư mục     | Tên          | Nội dung                                                                    |
| ----------- | ------------ | --------------------------------------------------------------------------- |
| `01-chu-so` | Chữ số 一〜十 | 20 câu: 問題1 đọc 10 từ có chữ số, 問題2 chọn chữ Hán cho 10 từ viết bằng hiragana |
| `03-bai-3`  | Bài 3        | 20 câu: 百・千・万・円・何 — số tiền, số lượng                                   |
| `05-bai-5`  | Bài 5        | 20 câu: 日・月・火・水・木 — thứ trong tuần, 花火, お正月…                        |
| `06-bai-6`  | Bài 6        | 20 câu: 時・分・半・間・週 — giờ giấc, thời gian                                 |

Đề "Chữ số" dán vào không kèm tên bài trên web Riki, nên tạm đặt tên theo nội dung (nhiều
khả năng là Bài 2). Biết tên Riki in thì đổi `name` (và tên thư mục nếu cần) cho khớp.

## Bảng tóm tắt

Mỗi đề có `summary` — bảng "Tóm tắt bài" hiện trên khung bắt đầu: mỗi chữ một dòng
`{ "title": "百", "meaning": "BÁCH · trăm", "lines": ["ひゃく — …", "びゃく — 三百…"] }`.
`lines` ghi các cách đọc kèm ví dụ lấy từ chính đề, nhất là chỗ biến âm (ひゃく／びゃく／ぴゃく),
vì đề kanji sơ cấp hỏi đúng những chỗ đó.

## Cách chép

- Mỗi 問題 một `section`, `skill` đều là `kanji`. Đề không in câu lệnh nên không có
  `instructions`.
- Từ đang hỏi đánh dấu bằng 「」 thay cho gạch chân, như quy ước của
  [đề kiểm tra](../../n3-junbi/entrance-test/README.md#dấu-「」-thay-cho-gạch-chân):
  `うちから　かいしゃまで　でんしゃで　「二十分」です。`
- **Không có `promptReading`**: câu đề ở trình độ này đã viết bằng hiragana, chỉ còn đúng
  chữ đang hỏi là chữ Hán — viết cách đọc ra là lộ đáp án.
- Dấu cách giữa các từ giữ như đề in, viết bằng dấu cách toàn khổ `　`.
- Lỗi gõ thấy rõ thì sửa và ghi ở cuối `explanation`: `でんわばんご` → `でんわばんごう`,
  `なんほん` → `なんぼん`. Lựa chọn sai cố ý (`丸つ` — chữ 丸 trông giống 九) thì giữ nguyên.

Đáp án do tôi chấm vì đề không in đáp án.
