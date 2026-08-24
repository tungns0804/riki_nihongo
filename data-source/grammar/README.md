# Định dạng bài ngữ pháp

File `grammar.json` — dùng chung cho phần `grammar` và phần `mimikara`.

```json
{
  "points": [
    {
      "title": "～によって",
      "summary": "Bằng cách / tuỳ theo / bởi",
      "structures": ["N ＋ によって", "N ＋ による ＋ N"],
      "explanation": ["Một dòng giải thích.", "Thêm dòng nữa nếu cần."],
      "notes": ["Lưu ý hiện trong khung vàng ở cuối mẫu."],
      "usages": [
        {
          "title": "Phương tiện, cách thức",
          "detail": "Giải thích ngắn cho cách dùng này.",
          "examples": [
            {
              "japanese": "話し合いによって問題を解決しました。",
              "reading": "はなしあいによってもんだいをかいけつしました。",
              "vietnamese": "Chúng tôi đã giải quyết vấn đề bằng cách trao đổi.",
              "note": "Ghi chú riêng cho câu này (tuỳ chọn)."
            }
          ]
        }
      ]
    }
  ]
}
```

- Mẫu chỉ có MỘT cách dùng thì được viết gọn: bỏ `usages`, đặt thẳng `examples` ở
  cấp mẫu.
- `structures`, `explanation`, `notes` nhận cả một chuỗi lẫn mảng nhiều dòng.
- Mẫu không còn ví dụ nào sẽ bị bỏ qua kèm cảnh báo: không có ví dụ thì không luyện
  được, mà trang lý thuyết cũng trống.
- Câu hỏi luyện tập được sinh từ chính các CÂU VÍ DỤ (Nhật ↔ Việt), nên ví dụ càng
  đủ thì phần luyện càng có nội dung.
