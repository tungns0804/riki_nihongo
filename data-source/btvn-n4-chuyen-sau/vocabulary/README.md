# BTVN N4 CHUYÊN SÂU — Từ vựng

Giống phần Kanji của học phần này ([README](../kanji/README.md)): mỗi bài là một **đề**
chứ không phải bảng từ. `meta.json` khai `"kind": "test"`, dữ liệu nằm trong `test.json`
— định dạng ở [`n3-junbi/entrance-test/README.md`](../../n3-junbi/entrance-test/README.md),
phần viết thêm cho bài tập (`promptReading`, `choicesVietnamese`, `choiceNotes`) ở mục
"Bài tập về nhà" trong README gốc của dự án.

Khác bài "Danh từ" của hai học phần kia: bên đó "Danh từ" là BẢNG TỪ (`vocabulary.txt`),
còn ở đây "Danh từ" là ĐỀ hỏi về danh từ. Cùng tên, khác hình dạng dữ liệu — vì Riki đặt
tên bài như vậy.

## Các bài

| Thư mục      | Tên     | Nội dung                                                      |
| ------------ | ------- | ------------------------------------------------------------- |
| `01-danh-tu` | Danh từ | 20 câu, hai phần: 10 câu chọn câu cùng nghĩa, 10 câu 用法      |

Một đề có nhiều phần thì mỗi phần là một `section` riêng, và `title` của section là câu
lệnh 問題 in trong khung nét đứt đầu phần. Đề này chỉ chép được câu lệnh của phần sau
(`問題3：言葉の正しい使い方を選んでください。`); phần trước chưa rõ đánh số mấy nên `title`
chỉ ghi "Chọn câu cùng nghĩa".

## Nguồn và cách chép

Nguồn là đề người dùng dán thẳng vào chat, đủ bốn lựa chọn nhưng **không có đáp án** —
chữ số đứng lẻ giữa các câu là số thứ tự câu sau, không phải đáp án. Đáp án do tôi chấm.

Giữ nguyên dấu cách giữa các từ như đề in ở trình độ N4. Lỗi gõ thấy rõ thì sửa và ghi
lại ngay trong `choiceNotes` của chính lựa chọn đó — bài "Danh từ" có năm chỗ: `つうご` →
`つごう`, `ひきましたかた` → `ひきましたから`, `ラメン` → `ラーメン`, `音楽の興味` →
`音楽に興味` (trợ từ của 興味 luôn là に, mà câu đó lại là đáp án đúng nên không để sai
được), và một phần furigana dán dính vào câu (`用意よ う い`).
