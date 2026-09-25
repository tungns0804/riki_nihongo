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

- `summary` (ý nghĩa) và `structures` (cấu trúc) dựng thành bảng "Tóm tắt ngữ pháp" ở
  đầu bài khi bài có từ hai mẫu trở lên — viết ngắn gọn.
- Mẫu chỉ có MỘT cách dùng thì được viết gọn: bỏ `usages`, đặt thẳng `examples` ở
  cấp mẫu.
- `structures`, `explanation`, `notes` nhận cả một chuỗi lẫn mảng nhiều dòng.
- Mẫu không còn ví dụ nào sẽ bị bỏ qua kèm cảnh báo: không có ví dụ thì không luyện
  được, mà trang lý thuyết cũng trống.
- Câu hỏi luyện tập được sinh từ chính các CÂU VÍ DỤ (Nhật ↔ Việt), nên ví dụ càng
  đủ thì phần luyện càng có nội dung.

## Bài dạng ĐỀ trong phần này

Phần Ngữ pháp còn có bài không phải lý thuyết mà là một **đề** — "Đề thi thật ôn tập
N4 · Nhiệm vụ 2" (`02-de-thi-that-n4-nhiem-vu-2/`). Bài như vậy viết khác:

```
02-de-thi-that-n4-nhiem-vu-2/
├── meta.json     có thêm "kind": "test"
└── test.json     30 câu, định dạng của bài kiểm tra
```

Định dạng `test.json` nằm ở [README của phần Kiểm tra nhập
môn](../entrance-test/README.md) — cùng một định dạng, kể cả `promptVietnamese` và
`choicesVietnamese` (viết cho MỌI câu).

Vài điểm riêng của đề ngữ pháp:

- Cả đề chỉ một `section`, `"skill": "grammar"`. Màn hình làm đề không hiện hàng tab
  khi đề chỉ đo một kỹ năng.
- Không có `instructions`: đề gốc không in câu lệnh 問題 ở chỗ này, mà câu lệnh tự
  nghĩ ra thì cũng chỉ là chữ thừa.
- Câu hội thoại xuống dòng bằng `\n`, mỗi người nói một dòng đúng như đề in. Bản dịch
  `promptVietnamese` xuống dòng theo đúng các dòng đó.
- Kỳ thi gốc của từng câu ghi ngay cuối câu như đề của Riki: `… (07/2014)`.

## Bài lý thuyết theo PDF buổi học, kèm đề luyện tập

PDF ngữ pháp của Riki (vd. `bai-9-phan-1.pdf`, 第9課) in mỗi mẫu gồm ポイント, khung cấu
trúc, 例 rồi các 問題 "Luyện tập". Chép thành HAI thư mục:

```
09-bai-9-phan-1/              grammar.json — ポイント → explanation, 例 → examples, ⚠ → notes
09-bai-9-phan-1-luyen-tap/    "kind": "test", "parent": "09-bai-9-phan-1", order = order bài mẹ × 100 + n
```

- Tên thư mục và `name` theo tên file PDF ("Bài 9 · Phần 1"); `order` = số bài × 10 +
  số phần (91), để phần 2 đứng ngay sau.
- Câu 例 hội thoại xuống dòng bằng `\n`, mỗi người nói một dòng; `reading` và
  `vietnamese` xuống dòng ở đúng những chỗ đó.
- Đề luyện tập chỉ lấy các câu CHỌN được (Chọn đáp án đúng, Chọn từ trong khung, câu đố
  trang bìa). Mỗi 問題 một `section`, `instructions` chép nguyên câu lệnh tiếng Việt của
  PDF, lựa chọn là các từ trong khung theo đúng thứ tự in. PDF không in đáp án (trừ câu
  đố bìa) nên đáp án tự chấm, kèm `choiceNotes`.
- Bỏ qua: Đuổi hình bắt chữ (cần ảnh), Sắp xếp câu, チャレンジ (dịch tự do).
