# Định dạng bài nghe hiểu

File `listening.json`:

```json
{
  "tracks": [
    {
      "title": "会話1 · Ở quầy lễ tân",
      "audio": "audio/listening/bai-1-01.mp3",
      "script": ["女：すみません、会議室はどこですか。", { "speaker": "男", "japanese": "三階です。", "vietnamese": "Ở tầng ba." }],
      "questions": [
        {
          "promptJapanese": "女の人はこれからどこへ行きますか。",
          "prompt": "Người phụ nữ sắp đi đâu?",
          "choices": ["…", "…", "…", "…"],
          "answer": 1
        }
      ]
    }
  ]
}
```

- `audio` là đường dẫn tính từ thư mục `public/`, ví dụ `audio/listening/bai-1-01.mp3`
  ứng với file đặt tại `public/audio/listening/bai-1-01.mp3`. Để trống thì giao diện
  báo "chưa có file âm thanh" và script vẫn học được.
- `script` viết gọn được thành chuỗi `NGƯỜI NÓI：LỜI THOẠI` (dấu hai chấm nửa chiều
  hoặc toàn chiều đều được).
- Lời thoại mặc định ẨN trên giao diện — nghe trước, đọc sau.
