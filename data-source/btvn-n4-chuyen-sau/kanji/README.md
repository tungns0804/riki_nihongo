# BTVN N4 CHUYÊN SÂU — Kanji

Học phần này là **bài tập về nhà**: mỗi buổi học của Riki là một thư mục, và nội dung
của buổi là một **đề** chứ không phải bảng thẻ kanji. Nên `meta.json` khai
`"kind": "test"` và file dữ liệu tên `test.json`, viết y như mọi đề khác — định dạng ở
[`n3-junbi/entrance-test/README.md`](../../n3-junbi/entrance-test/README.md), phần viết
thêm cho bài tập (`promptReading`, `choicesVietnamese`, `choiceNotes`) ở mục "Bài tập về
nhà" trong README gốc của dự án.

Đề nằm trong phần KANJI vì trên web Riki các bài này nằm ở mục Kanji, kể cả khi nội dung
không hỏi chữ Hán (buổi 2 là câu hỏi **用法** — chọn câu dùng đúng một phó từ). Danh sách
bài chép đúng danh sách của Riki, không xếp lại theo kỹ năng; còn `skill` của từng phần
câu hỏi thì ghi đúng thứ đang được hỏi để màn hình kết quả chấm không sai tên kỹ năng —
một đề hỏi cả hai thứ thì mỗi phần một `skill` riêng (bài 3: phần 1 `kanji`, phần 2
`vocabulary`).

## Các bài

| Thư mục     | Tên    | Nội dung                                                                             |
| ----------- | ------ | ------------------------------------------------------------------------------------ |
| `02-buoi-2` | Buổi 2 | Đề 用法 9 câu: そろそろ・たいへん・ぜひ・かならず・やっと・なるほど・どんどん・はっきり・ちっとも |
| `03-bai-3`  | Bài 3  | Đề 34 câu: 問題1 24 câu chữ Hán (12 câu đọc, 12 câu chọn chữ), 問題2 10 câu điền từ     |

Tên bài lấy đúng chữ Riki in trên web, nên trong cùng một phần có bài gọi "Buổi 2" và bài
gọi "Bài 3" — đừng thống nhất lại. Buổi 1 chưa có nội dung nên chưa có thư mục; thêm bài
mới thì tạo `0N-<tên>/` gồm `meta.json` (`"kind": "test"`, `"order": N`) và `test.json`,
rồi chạy `npm run generate`.

## Nguồn và cách chép

Nguồn là đề người dùng dán thẳng vào chat (không có file), kèm cả bốn lựa chọn nhưng
**không có đáp án**. Đáp án do tôi chấm, và câu nào có hơn một lựa chọn đúng tiếng Nhật
thì nói ra chỗ phân vân ngay trong `choiceNotes` để còn đối chiếu lại với Riki.

Giữ nguyên dấu cách giữa các từ như đề in ở trình độ N4. Chỉ sửa lại lỗi gõ thấy rõ và
ghi lại ngay chỗ đã sửa: lỗi nằm trong một lựa chọn thì ghi ở `choiceNotes` của chính lựa
chọn đó, lỗi nằm trong câu hỏi thì ghi ở cuối `explanation` — chỗ nào cũng đọc được sau
khi chấm. Buổi 2 có `むざかしい` → `むずかしい` và `時間が あたら` → `時間が あったら`. Bài 3
có bảy chỗ: `たてものを みえます` → `〜が みえます`, `いっしょうに` → `いっしょに`,
`りようり` → `りょうり`, `うちのねこか` → `うちのねこが`, `学校を 住んで` →
`学校を 休んで`, `くだささい` → `ください`, và `きっぶ` → `きっぷ` (hai câu).

Chỗ đề in hỏng mà không đoán chắc được thì giữ nguyên và nói rõ trong `choiceNotes`: câu
20 của bài 3 in trùng hai lựa chọn (`話って` hai lần), chép y như vậy để còn đối chiếu lại
với Riki.
