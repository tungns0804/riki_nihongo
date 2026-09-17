# Định dạng bài kiểm tra nhập môn

File `test.json`. Đề chia theo PHẦN (một 問題 của đề), mỗi phần gắn một kỹ năng — màn
hình kết quả chấm điểm theo đúng các kỹ năng này, và màn hình làm đề gom các phần
cùng kỹ năng vào một tab.

```json
{
  "sections": [
    {
      "title": "Phần 3 · 文字語彙 問題3 — Điền từ",
      "instructions": "( )に なにを いれますか。1・2・3・4から いちばん いい ものを ひとつ えらんで ください。",
      "skill": "vocabulary",
      "questions": [
        {
          "id": "mg-11",
          "promptJapanese": "台風の場合は、明日のコンサートを（　）します。",
          "promptVietnamese": "Nếu có bão thì buổi hoà nhạc ngày mai sẽ bị （　）.",
          "prompt": "Chọn từ thích hợp điền vào chỗ trống.",
          "choices": ["ちゅうしゃ", "ちゅうし", "こしょう", "しょうたい"],
          "choicesVietnamese": ["đỗ xe (駐車)", "hoãn, dừng (中止)", "hỏng hóc (故障)", "mời (招待)"],
          "answer": 2,
          "explanation": "Giải thích hiện sau khi chấm (tuỳ chọn)."
        }
      ]
    }
  ]
}
```

- `skill` nhận một trong: `vocabulary`, `kanji`, `grammar`, `reading`, `listening`.
- `instructions` là câu lệnh 問題 bằng tiếng Nhật, chép nguyên trong đề. Màn hình làm
  đề in nó trong khung nét đứt trên đầu phần, đúng như đề giấy. Bỏ trống thì không
  hiện khung nào.
- `answer` là SỐ THỨ TỰ của lựa chọn đúng (đếm từ 1), hoặc chính chuỗi đáp án.
- Đề KHÔNG bị trộn câu và không bị cắt bớt số câu khi làm: giữ nguyên thứ tự người
  ra đề đã sắp.
- Phần này cố tình không có màn hình xem trước nội dung — xem trước thì bài kiểm tra
  đầu vào không còn đo được gì.
- `id` của câu hỏi là tuỳ chọn, nhưng nên đặt (`mg-01`, `bp-03`…): id là khoá của
  tiến độ, và đặt tay thì lần sau sửa lại câu chữ không làm mất kết quả đã lưu. Id
  phải KHÔNG TRÙNG trong cả đề — hai câu cùng id thì câu sau bị bỏ mà không báo gì.

## Hai câu dẫn tiếng Việt, đừng lẫn

| Trường              | Là gì                                   | Hiện khi nào              |
| ------------------- | --------------------------------------- | ------------------------- |
| `prompt`            | Chỉ dẫn làm bài ("Chọn từ thích hợp…")  | Luôn hiện                 |
| `promptVietnamese`  | NGHĨA của câu tiếng Nhật                | Chỉ khi bật "Bản dịch"    |

Nghĩa của câu phải nằm sau công tắc: ở phần điền từ, dịch câu ra tiếng Việt là gần
như chỉ thẳng vào đáp án.

Phần 読解 thì ngược lại — `promptJapanese` chính là câu hỏi, nên `prompt` viết luôn
bản dịch của câu hỏi đó và không cần `promptVietnamese`: đọc hiểu thì hiểu câu hỏi
không phải là gian lận, đáp án nằm trong bài đọc.

Màn hình làm đề chỉ in `prompt` ở câu ĐẦU của mỗi phần khi cả phần dùng chung một
chỉ dẫn, nên không cần lo năm câu lặp lại một dòng chữ.

## Bản dịch của lựa chọn

`choicesVietnamese` là mảng SONG SONG với `choices` — thiếu một phần tử là bộ sinh
báo cảnh báo, vì trên màn hình sẽ có lựa chọn hiện nghĩa, lựa chọn không, trông như
chỗ đó cố tình để trống.

Chỉ viết cho những phần mà bốn lựa chọn đều là từ hoặc câu có nghĩa thật. Phần chọn
cách đọc (問題1) và chọn chữ Hán (問題2) thì **bỏ hẳn**: ba mồi nhiễu ở đó không phải
là từ (`験究`, `験空`, `研空`), dịch ra chỉ còn cách để trống ba chỗ — mà như thế là
chỉ thẳng vào đáp án.

## Bài đọc của phần đọc hiểu

Câu hỏi đọc hiểu thêm `passage`, là bài đọc của riêng câu đó, và `passageVietnamese`
là bản dịch (cùng số đoạn):

```json
{
  "passage": [
    "山口さんの机の上に、パンフレットとこのメモがあります。",
    "留守の間に、Y社のりさんがいらっしゃいました。……"
  ],
  "passageVietnamese": [
    "Trên bàn của Yamaguchi có tập tài liệu quảng cáo và mẩu ghi chú này.",
    "Trong lúc Yamaguchi đi vắng, Ri ở công ty Y có tới. ……"
  ],
  "promptJapanese": "このメモを読んで、山口さんはりさんに何を伝えますか。",
  "prompt": "Theo mẩu ghi chú, Yamaguchi sẽ nhắn lại điều gì?",
  "choices": ["…", "…", "…", "…"],
  "answer": 4
}
```

Mỗi phần tử là một đoạn. Viết một chuỗi dài có xuống dòng cũng được, bộ sinh tự tách
thành đoạn.

Bài đọc gắn vào TỪNG CÂU chứ không gắn vào phần, và mấy câu hỏi cùng một bài đọc thì
**lặp lại y nguyên cùng đoạn văn**. Lý do: màn hình luyện tập hiện mỗi câu một thẻ,
không xem lại được thẻ trước, nên bài đọc không đi theo câu thì tới câu thứ hai là
không còn gì để đọc.

Trên màn hình LÀM ĐỀ thì ngược lại — cả phần hiện cùng lúc, nên các câu liền nhau có
bài đọc GIỐNG HỆT NHAU được gom lại và bài đọc chỉ in một lần. Vì vậy phải chép lại
đúng từng chữ, lệch một dấu câu là nó tách thành hai bài đọc.
