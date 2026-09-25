# BTVN N4 CHUYÊN SÂU — Ngữ pháp

Giống hai phần kia của học phần này ([Kanji](../kanji/README.md), [Từ vựng](../vocabulary/README.md)):
mỗi bài là một **đề** chứ không phải bảng mẫu ngữ pháp. `meta.json` khai `"kind": "test"`,
dữ liệu nằm trong `test.json` — định dạng ở
[`n3-junbi/entrance-test/README.md`](../../n3-junbi/entrance-test/README.md), phần viết
thêm cho bài tập (`promptReading`, `choicesVietnamese`, `choiceNotes`) ở mục "Bài tập về
nhà" trong README gốc của dự án.

Đề của phần này có bài chỉ hai lựa chọn (a hay b) chứ không phải bốn — màn hình làm đề
liệt kê đúng số lựa chọn có trong `choices`, không cần khai gì thêm.

## Các bài

| Thư mục      | Tên      | Nội dung                                                        |
| ------------ | -------- | --------------------------------------------------------------- |
| `01-lien-tu` | Liên từ  | 練習2: 5 câu chọn vế sau hợp với だから・それに・けれども・では・たとえば |

Bài "Liên từ" trên Riki mới chép được 練習2; thêm 練習 khác của cùng bài thì thêm một
`section` nữa vào `test.json` (mỗi 練習 một section, `title` ghi đúng số 練習), rồi chạy
`npm run generate`.

## Nguồn và cách chép

Nguồn là đề người dùng dán thẳng vào chat, kèm đủ lựa chọn nhưng **không có đáp án** —
chữ số đứng lẻ giữa các câu là số thứ tự câu sau. Đáp án do tôi chấm.

Câu lệnh của 練習 chép nguyên vào `instructions` để hiện trong khung nét đứt. Lỗi gõ thấy
rõ thì sửa và ghi lại ngay: lỗi trong một lựa chọn ghi ở `choiceNotes` của lựa chọn đó,
lỗi trong câu hỏi ghi ở cuối `explanation`. Bài "Liên từ" có `花 が` → `花が`; riêng
`ねむきない` ở câu 1 thì GIỮ NGUYÊN vì đó là lựa chọn sai của đề, và ghi chú rõ đúng ra
phải là `ねむくない`.
