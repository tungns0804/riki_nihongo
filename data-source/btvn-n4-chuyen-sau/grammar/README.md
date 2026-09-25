# BTVN N4 CHUYÊN SÂU — Ngữ pháp

Giống hai phần kia của học phần này ([Kanji](../kanji/README.md), [Từ vựng](../vocabulary/README.md)):
mỗi bài là một **đề** chứ không phải bảng mẫu ngữ pháp. `meta.json` khai `"kind": "test"`,
dữ liệu nằm trong `test.json` — định dạng ở
[`n3-junbi/entrance-test/README.md`](../../n3-junbi/entrance-test/README.md), phần viết
thêm cho bài tập (`promptReading`, `choicesVietnamese`, `choiceNotes`) ở mục "Bài tập về
nhà" trong README gốc của dự án.

Đề của phần này có bài chỉ hai lựa chọn (a hay b) chứ không phải bốn — màn hình làm đề
liệt kê đúng số lựa chọn có trong `choices`, không cần khai gì thêm.

## Câu ghép câu (問題2, chọn từ vào ★)

Dạng 並べ替え không có màn hình kéo thả riêng, và cũng không cần: đề giấy cũng chỉ hỏi
MỘT câu trả lời — từ nào rơi vào ô ★. Nên chép y như đề, bằng đúng định dạng câu hỏi bốn
lựa chọn sẵn có:

| Trường              | Viết gì                                                              |
| ------------------- | --------------------------------------------------------------------- |
| `promptJapanese`    | cả câu, giữ nguyên các ô `＿＿＿` và dấu `★` ĐÚNG vị trí đề in         |
| `choices`           | bốn mảnh ghép, đúng thứ tự đánh số 1–4 của đề                         |
| `choiceNotes`       | mảnh ấy vào Ô THỨ MẤY — đọc bốn ghi chú là dựng lại được cả câu        |
| `answer`            | số của mảnh rơi vào ô ★                                                |
| `explanation`       | câu hoàn chỉnh, kèm dãy số thứ tự (ví dụ `2-1-4-3`), rồi tới ngữ pháp  |

`promptVietnamese` dịch CÂU ĐÃ XẾP XONG. Dịch câu còn rời thì không thành câu tiếng
Việt nào cả; mà bản dịch vốn nằm sau nút "Hiện bản dịch" nên người học tự quyết định có
xem gợi ý hay không.

## Các bài

| Thư mục      | Tên     | Nội dung                                                         |
| ------------ | ------- | ---------------------------------------------------------------- |
| `01-lien-tu` | Liên từ | 練習2: 5 câu chọn vế sau hợp với だから・それに・けれども・では・たとえば |
| `02-tro-tu`  | Trợ từ  | 15 câu điền trợ từ: でも・は・も・と・ごろ・では・に・の・など・には・へ・が・までに |
| `03-the-te`  | Tổng hợp ngữ pháp thể て | 問題2: 7 câu ghép câu (★) — てくる・てしまう・bị động・ないで・ておく・てある・ていく |

Bài "Liên từ" trên Riki mới chép được 練習2; thêm 練習 khác của cùng bài thì thêm một
`section` nữa vào `test.json` (mỗi 練習 một section, `title` ghi đúng số 練習), rồi chạy
`npm run generate`.

## Nguồn và cách chép

Nguồn là đề người dùng dán thẳng vào chat, kèm đủ lựa chọn nhưng **không có đáp án** —
chữ số đứng lẻ giữa các câu là số thứ tự câu sau. Đáp án do tôi chấm.

Câu lệnh của 練習 hay của 問題 chép nguyên vào `instructions` để hiện trong khung nét đứt.
Lỗi gõ thấy rõ thì sửa và ghi lại ngay: lỗi trong một lựa chọn ghi ở `choiceNotes` của
lựa chọn đó, lỗi trong câu hỏi ghi ở cuối `explanation`. Bài "Liên từ" có `花 が` → `花が`;
bài "Trợ từ" có `知 っています` → `知っています`, `寒日` → `寒い日` và
`かえさなけれな` → `かえさなければ`.

Sai chính tả nằm trong lựa chọn SAI thì GIỮ NGUYÊN, chỉ ghi chú cho rõ — sửa đi là mất
mất chỗ đề muốn bẫy: câu 1 bài "Liên từ" để nguyên `ねむきない` và ghi chú đúng ra phải
là `ねむくない`.
