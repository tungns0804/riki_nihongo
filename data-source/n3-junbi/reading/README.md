# Định dạng bài đọc hiểu

File `reading.json`:

```json
{
  "passages": [
    {
      "title": "Thông báo của thư viện",
      "paragraphs": ["Đoạn 1…", "Đoạn 2…"],
      "translation": ["Bản dịch đoạn 1…", "Bản dịch đoạn 2…"],
      "vocabulary": ["利用 (りよう),sử dụng", { "japanese": "貸出", "reading": "かしだし", "vietnamese": "cho mượn" }],
      "questions": [
        {
          "promptJapanese": "この文章の内容と合っているものはどれですか。",
          "prompt": "Câu nào đúng với nội dung bài đọc?",
          "choices": ["…", "…", "…", "…"],
          "answer": 2,
          "explanation": "Vì đoạn 2 nói rằng…"
        }
      ]
    }
  ]
}
```

- `paragraphs` nhận cả mảng đoạn lẫn một chuỗi dài có xuống dòng.
- `translation` mặc định ẨN trên giao diện, người học tự bấm hiện.
- `vocabulary` viết gọn được thành chuỗi `TIẾNG NHẬT (CÁCH ĐỌC),NGHĨA`.
- `answer` là SỐ THỨ TỰ của lựa chọn đúng (đếm từ 1), hoặc chính chuỗi đáp án.
