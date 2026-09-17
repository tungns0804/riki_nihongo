# Định dạng bài kiểm tra nhập môn

File `test.json`. Đề chia theo PHẦN, mỗi phần gắn một kỹ năng — màn hình kết quả
chấm điểm theo đúng các kỹ năng này.

```json
{
  "sections": [
    {
      "title": "Phần 1 · Từ vựng",
      "skill": "vocabulary",
      "questions": [
        {
          "promptJapanese": "この漢字の読み方はどれですか。「締め切り」",
          "prompt": "Cách đọc đúng của từ được gạch chân là gì?",
          "choices": ["しめきり", "ていきり", "しめせつ", "ていせつ"],
          "answer": 1,
          "explanation": "Giải thích hiện sau khi chấm (tuỳ chọn)."
        }
      ]
    }
  ]
}
```

- `skill` nhận một trong: `vocabulary`, `kanji`, `grammar`, `reading`, `listening`.
- `answer` là SỐ THỨ TỰ của lựa chọn đúng (đếm từ 1), hoặc chính chuỗi đáp án.
- Đề KHÔNG bị trộn câu và không bị cắt bớt số câu khi làm: giữ nguyên thứ tự người
  ra đề đã sắp.
- Phần này cố tình không có màn hình xem trước nội dung — xem trước thì bài kiểm tra
  đầu vào không còn đo được gì.
- `id` của câu hỏi là tuỳ chọn, nhưng nên đặt (`mg-01`, `bp-03`…): id là khoá của
  tiến độ, và đặt tay thì lần sau sửa lại câu chữ không làm mất kết quả đã lưu. Id
  phải KHÔNG TRÙNG trong cả đề — hai câu cùng id thì câu sau bị bỏ mà không báo gì.

## Bài đọc của phần đọc hiểu

Câu hỏi đọc hiểu thêm trường `passage`, là bài đọc của riêng câu đó:

```json
{
  "passage": [
    "山口さんの机の上に、パンフレットとこのメモがあります。",
    "留守の間に、Y社のりさんがいらっしゃいました。……"
  ],
  "promptJapanese": "このメモを読んで、山口さんはりさんに何を伝えますか。",
  "prompt": "Theo mẩu ghi chú, Yamaguchi sẽ nhắn lại điều gì?",
  "choices": ["…", "…", "…", "…"],
  "answer": 4
}
```

Mỗi phần tử là một đoạn. Viết một chuỗi dài có xuống dòng cũng được, bộ sinh tự
tách thành đoạn.

Bài đọc gắn vào TỪNG CÂU chứ không gắn vào phần, và mấy câu hỏi cùng một bài đọc
thì **lặp lại cùng đoạn văn**. Lý do: đề không có màn hình chi tiết để đặt bài đọc,
mà màn hình làm bài hiện mỗi câu một thẻ nên không xem lại được thẻ trước — bài đọc
không đi theo câu thì tới câu thứ hai là không còn gì để đọc.

Trên màn hình làm bài, bài đọc nằm trên câu hỏi, trong khung lõm, cỡ chữ và dòng
thưa như trang Đọc hiểu.
