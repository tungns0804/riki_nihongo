# Định dạng bài ngữ pháp MIMIKARA OBOERU

Giống hệt phần `grammar`: file `grammar.json` với cùng cấu trúc. Xem
[../grammar/README.md](../grammar/README.md).

Tách thành hai phần vì đây là giáo trình khác (耳から覚える), học song song chứ không
nối tiếp phần ngữ pháp chính — không phải vì dữ liệu khác nhau.

## Mỗi bài một thư mục

Mỗi BÀI của khoá là MỘT thư mục, chứa hết các mẫu ngữ pháp học trong bài đó — không
tách thành "Bài 1.1", "Bài 1.2"… Người học mở "Bài 1" là thấy trọn bài như trên lớp.

```
data-source/mimikara/01-bai-1/
├── meta.json      { "name": "Bài 1", "description": "～ことにしている · ～こと · …" }
└── grammar.json   các mẫu theo đúng thứ tự trong bài giảng
```

- Thứ tự lấy từ số đầu tên thư mục: `01-bai-1` → 1, `02-bai-2` → 2.
- `description` liệt kê tên các mẫu, hiện trên thẻ bài ở trang danh sách.

## Mỗi mẫu ngữ pháp

- `summary` là **Ý nghĩa** ngắn gọn, `structures` là **Cấu trúc** — viết như slide bài
  giảng (`Vる / Vない ＋ ことにしている`). Hai trường này dựng thành bảng "Tóm tắt ngữ
  pháp" ở đầu bài, nên giữ đủ ngắn để liếc qua là nắm được cả bài.
- Khoảng 5 câu ví dụ mỗi mẫu, chia theo cách dùng. Câu ví dụ trên slide bài giảng đặt
  ĐẦU TIÊN, dịch đúng như slide.
- Đủ ví dụ còn để phần luyện tập có nội dung: câu hỏi dựng từ chính các câu ví dụ, và
  đáp án nhiễu lấy từ các câu còn lại trong bài.
