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

| Thư mục          | Tên hiển thị | Trạng thái |
| ---------------- | ------------ | ---------- |
| `01-danh-tu-1`   | Danh từ 1    | 40 từ · 第1課 (01–20) + 第2課 (21–40) |
| `02-dong-tu-1`   | Động từ 1    | chờ nội dung |
| `03-tinh-tu-1`   | Tính từ 1    | chờ nội dung |
| `04-danh-tu-2`   | Danh từ 2    | 40 từ · 第3課 (41–60) + 第4課 (61–80) |
| `05-dong-tu-2`   | Động từ 2    | chờ nội dung |
| `06-katakana-1`  | Katakana 1   | chờ nội dung |
| `07-tinh-tu-2`   | Tính từ 2    | chờ nội dung |
| `08-pho-tu-1`    | Phó từ 1     | chờ nội dung |
| `09-danh-tu-3`   | Danh từ 3    | 40 từ · 第5課 (81–100) + 第6課 (101–120) |
| `10-katakana-2`  | Katakana 2   | chờ nội dung |
| `11-pho-tu-2`    | Phó từ 2     | chờ nội dung |

Thêm nội dung cho một bài = đặt file `vocabulary.txt` vào đúng thư mục của bài đó rồi
chạy `npm run generate`. Không phải sửa gì trong mã nguồn.
