# BTVN N4 CHUYÊN SÂU — Kanji

Học phần này là **bài tập về nhà**: mỗi buổi học của Riki là một thư mục, và nội dung
của buổi là một **đề** chứ không phải bảng thẻ kanji. Nên `meta.json` khai
`"kind": "test"` và file dữ liệu tên `test.json`, viết y như mọi đề khác — định dạng ở
[`n3-junbi/entrance-test/README.md`](../../n3-junbi/entrance-test/README.md), phần viết
thêm cho bài tập (`promptReading`, `choicesVietnamese`, `choiceNotes`) ở mục "Bài tập về
nhà" trong README gốc của dự án.

Đề nằm trong phần KANJI vì trên web Riki buổi học này nằm ở mục Kanji, dù nội dung buổi 2
là câu hỏi **用法** (chọn câu dùng đúng một phó từ) chứ không hỏi chữ Hán. Danh sách bài
chép đúng danh sách của Riki, không xếp lại theo kỹ năng; còn `skill` của phần câu hỏi
thì ghi đúng thứ đang được hỏi (`vocabulary`) để màn hình kết quả chấm không sai tên kỹ
năng.

## Các bài

| Thư mục     | Tên     | Nội dung                                                      |
| ----------- | ------- | ------------------------------------------------------------- |
| `02-buoi-2` | Buổi 2  | Đề 用法 9 câu: そろそろ・たいへん・ぜひ・かならず・やっと・なるほど・どんどん・はっきり・ちっとも |

Buổi 1 chưa có nội dung nên chưa có thư mục — thêm buổi mới thì tạo `0N-buoi-N/` gồm
`meta.json` (`"name": "Buổi N"`, `"kind": "test"`, `"order": N`) và `test.json`, rồi chạy
`npm run generate`.

## Nguồn và cách chép

Nguồn là đề người dùng dán thẳng vào chat (không có file), kèm cả bốn lựa chọn nhưng
**không có đáp án**. Đáp án do tôi chấm, và câu nào có hơn một lựa chọn đúng tiếng Nhật
thì nói ra chỗ phân vân ngay trong `choiceNotes` để còn đối chiếu lại với Riki.

Giữ nguyên dấu cách giữa các từ như đề in ở trình độ N4. Chỉ sửa lại lỗi gõ thấy rõ và
ghi lại chỗ đã sửa trong `choiceNotes`: buổi 2 có `むざかしい` → `むずかしい` và
`時間が あたら` → `時間が あったら`.
