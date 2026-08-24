# Định dạng bài từ vựng

File `vocabulary.txt`. Mỗi từ là một KHỐI: một dòng tiêu đề, rồi các dòng ví dụ và
ghi chú của chính từ đó.

```
101. 判 (はん) = Con dấu
・書類に判を押す。| Đóng dấu vào giấy tờ.
合: 判子を押す (はんこをおす) = Đóng dấu
類: 判子 (はんこ)・印 (いん)・印鑑 (いんかん)
```

Ba loại dòng:

| Dòng | Cách viết | Ghi chú |
| --- | --- | --- |
| **Tiêu đề** | `[SỐ.] TỪ (CÁCH ĐỌC) = NGHĨA` | Bắt đầu một từ mới |
| **Ví dụ** | bắt đầu bằng `・` hoặc `-` | Bản dịch viết sau dấu `\|`, tuỳ chọn |
| **Ghi chú** | `NHÃN : nội dung` | Nhãn giữ nguyên như trong sách |

- **Số thứ tự** là số của từ trong giáo trình (01–120). Bỏ trống cũng được, nhưng có
  số thì đối chiếu với bản PDF nhanh hơn nhiều.
- **Cách đọc** viết trong ngoặc, tuỳ chọn — từ katakana hay từ thuần kana thì bỏ.
- **Nhiều nghĩa** ngăn nhau bằng `/`: `= Cao nhất/ Tuyệt nhất/ Rất`. Khi luyện gõ,
  đúng MỘT nghĩa là được.
- **Âm Hán Việt** (nếu có) viết trước nghĩa, ngăn bằng dấu `;`:
  `1. 締め切り (しめきり) = ĐẾ THIẾT ; hạn chót/ kỳ hạn`
- **Nhãn ghi chú** dùng đúng ký hiệu của giáo trình: `合` từ ghép · `対` trái nghĩa ·
  `関` từ liên quan · `連` cách nói đi kèm · `類` từ đồng nghĩa · `使い方` / `使い分け`
  cách dùng và phân biệt. Nhãn nào cũng được, không cần khai báo trước.
- Dòng bắt đầu bằng `#` là ghi chú của file, bị bỏ qua.

Một từ có thể có nhiều dòng ví dụ và nhiều dòng ghi chú, mỗi thứ một dòng. Giao diện
hiện từ ở cột trái, ví dụ và ghi chú ở cột phải — cùng bố cục với bản PDF.

## Các bài của phần Từ vựng

Mỗi bài là MỘT LOẠI TỪ, chứa toàn bộ từ của loại đó — không tách thành nhiều phần
đánh số. Bấm vào "Danh từ" là thấy hết danh từ của khoá.

| Thư mục        | Tên hiển thị | Trạng thái |
| -------------- | ------------ | ---------- |
| `01-danh-tu`   | Danh từ      | 120 từ · 第1課–第6課 (01–120) |
| `02-dong-tu`   | Động từ      | chờ nội dung |
| `03-tinh-tu`   | Tính từ      | chờ nội dung |
| `04-katakana`  | Katakana     | chờ nội dung |
| `05-pho-tu`    | Phó từ       | chờ nội dung |

Thêm nội dung cho một bài = đặt file `vocabulary.txt` vào đúng thư mục của bài đó rồi
chạy `npm run generate`. Không phải sửa gì trong mã nguồn.
