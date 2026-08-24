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
