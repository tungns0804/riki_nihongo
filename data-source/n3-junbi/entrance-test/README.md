# Định dạng đề kiểm tra

File `test.json`. Đề chia theo PHẦN (một 問題 của đề), mỗi phần gắn một kỹ năng — màn
hình kết quả chấm điểm theo đúng các kỹ năng này, và màn hình làm đề gom các phần
cùng kỹ năng vào một tab (đề chỉ đo một kỹ năng thì không hiện hàng tab).

Định dạng này dùng cho MỌI bài dạng đề, không riêng phần Kiểm tra nhập môn: bài có
`"kind": "test"` trong `meta.json` ở phần Ngữ pháp cũng viết đúng như đây (xem
[data-source/README.md](../../README.md)).

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
- `title` chỉ để người soạn đề đọc file cho dễ, KHÔNG hiện trên màn hình làm đề.
- `answer` là SỐ THỨ TỰ của lựa chọn đúng (đếm từ 1), hoặc chính chuỗi đáp án.
- Đề KHÔNG bị trộn câu và không bị cắt bớt số câu khi làm: giữ nguyên thứ tự người
  ra đề đã sắp.
- Phần này cố tình không có màn hình xem trước nội dung — xem trước thì bài kiểm tra
  đầu vào không còn đo được gì.
- Câu hội thoại nhiều dòng thì xuống dòng bằng `\n`, mỗi người nói một dòng như đề
  in; màn hình làm đề giữ nguyên các dòng đó. Bản dịch `promptVietnamese` nên xuống
  dòng ở đúng những chỗ ấy để hai bên đọc song song được.
- `id` của câu hỏi là tuỳ chọn, nhưng nên đặt (`mg-01`, `bp-03`…): id là khoá của
  tiến độ, và đặt tay thì lần sau sửa lại câu chữ không làm mất kết quả đã lưu. Id
  phải KHÔNG TRÙNG trong cả đề — hai câu cùng id thì câu sau bị bỏ mà không báo gì.

## Không thêm câu dẫn tiếng Việt vào từng câu

Đề KHÔNG dùng trường `prompt` (câu dẫn kiểu "Từ trong 「 」 đọc bằng hiragana thế
nào?"). Câu lệnh 問題 trong khung nét đứt đã nói phần này hỏi gì; in thêm một dòng
tiếng Việt ở từng câu chỉ là năm dòng chữ giống nhau (người dùng đã yêu cầu bỏ).

Mọi chữ tiếng Việt của một câu đều là BẢN DỊCH, và chỉ hiện khi bấm "Hiện bản dịch":

| Trường              | Bản dịch của         |
| ------------------- | -------------------- |
| `promptVietnamese`  | câu hỏi tiếng Nhật   |
| `choicesVietnamese` | từng lựa chọn        |
| `passageVietnamese` | bài đọc (đọc hiểu)   |

## Bản dịch của lựa chọn

`choicesVietnamese` là mảng SONG SONG với `choices` — thiếu một phần tử là bộ sinh báo
cảnh báo, vì trên màn hình sẽ có lựa chọn hiện nghĩa, lựa chọn không, trông như chỗ đó
cố tình để trống.

Viết cho MỌI câu, kể cả phần chọn cách đọc (問題1) và chọn chữ Hán (問題2). Ở hai phần
đó mồi nhiễu thường không phải là từ, nên ghi rõ, và ghi nghĩa chữ Hán khi chữ đó đáng
học:

```json
"choices": ["青れ", "清れ", "晴れ", "静れ"],
"choicesVietnamese": [
  "không có từ này (青 = xanh)",
  "không có từ này (清 = trong, sạch)",
  "晴れ · trời quang, nắng",
  "không có từ này (静 = tĩnh, yên)"
]
```

Đọc bản dịch đáp án của phần này là biết đáp án — vì vậy bản dịch mặc định ẨN, mở lúc
nào là do người học chọn.

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
  "promptJapanese": "このメモを読んで、山口さんはりさんに何でどんなことを伝えますか。",
  "promptVietnamese": "Theo mẩu ghi chú, Yamaguchi sẽ liên lạc với Ri bằng cách nào và để nói điều gì?",
  "choices": ["…", "…", "…", "…"],
  "choicesVietnamese": ["…", "…", "…", "…"],
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

## Dấu 「」 thay cho gạch chân

File nguồn không giữ được gạch chân của đề in, nên phần 文字語彙 đánh dấu từ đang hỏi
bằng 「」: `つよい「台風」が 来る そうです。`. Ô tự viết trên màn hình làm đề bỏ qua
「」 (và khoảng trắng) khi so với bản gốc — người học không gõ chúng.
