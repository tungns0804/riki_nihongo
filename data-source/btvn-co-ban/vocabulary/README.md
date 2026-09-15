# BTVN CƠ BẢN (MỚI) — Từ vựng

Định dạng file giống hệt phần Từ vựng của N3 JUNBI: xem
[`n3-junbi/vocabulary/README.md`](../../n3-junbi/vocabulary/README.md).

## Nguồn và cách chép

Nguồn là **thẻ từ vựng** của từng bài tập "Từ vựng X-Y" trên website Riki, lấy từ ảnh
chụp màn hình. Mỗi thẻ có đúng ba thứ: nghĩa, cách đọc và một câu ví dụ gạch chân từ đang
học. File chỉ chép ba thứ đó, KHÔNG kèm các dòng 合 / 対 / 関 / 使い分け như bản N3 JUNBI:
trang này chép lại đúng bài tập Riki giao, thêm ghi chú từ giáo trình khác thì không còn
là bài tập đó nữa.

- **Nghĩa và câu ví dụ lấy theo thẻ BTVN**, kể cả chỗ khác bản N3 JUNBI cùng số (thẻ BTVN
  ghi 29. 学歴 = "Bằng cấp, thành tích", 16. 出身 = "Xuất thân").
- **Âm Hán Việt** thẻ không có, nên lấy từ bản N3 JUNBI cùng số: hai học phần theo cùng
  đánh số của sách.
- **Thẻ không có câu ví dụ** (19. 成人, 38. 出席, 39. 欠席): câu trong file là tự soạn, có
  dòng `#` ghi rõ ngay trên. Không có câu thì từ đó không luyện được chiều Điền từ vào câu.
- Chữ furigana dính vào câu khi chụp màn hình (`目上の人ひとには`, `先生せんせい`) đã bỏ.
- **Số thứ tự và thứ tự từ theo sách**, vì thẻ không in số. Chỗ lệch duy nhất tới giờ:
  54. けが trên thẻ Riki đứng cuối bài tập 51-60 (nhãn "Tham khảo"), trong file vẫn là 54.
- Mặt chữ theo thẻ: 51. 引越し (bản N3 JUNBI viết 引っ越し). Viết giống câu ví dụ thì câu
  mới tìm ra chỗ tô và chỗ khoét.

## Mỗi bài tập là một cụm

Mỗi bài tập "Từ vựng X-Y" của Riki là một cụm `##`, chủ đề ghi tên bài tập rồi tới nội
dung — mở bài ra là bảng "Tóm tắt bài" cho biết bài tập nào học về gì:

```
## 01–10 = Từ vựng 1–10 · Giới tính, tuổi tác và vai vế
```

Phần nội dung sau dấu `·` do người soạn tự đặt theo nghĩa các từ, không phải của Riki.

## Các bài

| Thư mục      | Tên hiển thị | Trạng thái |
| ------------ | ------------ | ---------- |
| `01-danh-tu` | Danh từ      | 70 từ · bài tập Từ vựng 1–10 tới 61–70 (01–70), bảy cụm có chủ đề |

Bài tập mới (71–80…) thì viết NỐI vào cuối `01-danh-tu/vocabulary.txt` kèm mốc cụm `##`,
không tạo thư mục bài mới. Bài tập sang loại từ khác (động từ…) thì mở thư mục mới cùng
tên với bên N3 JUNBI (`02-dong-tu`).
