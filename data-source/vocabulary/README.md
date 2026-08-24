# Định dạng bài từ vựng

File `vocabulary.txt`, mỗi dòng một từ:

```
ÂM HÁN VIỆT,TIẾNG NHẬT (CÁCH ĐỌC),NGHĨA TIẾNG VIỆT|CÂU VÍ DỤ|NGHĨA CÂU VÍ DỤ
```

- **Cách đọc** viết trong ngoặc ở cuối cột tiếng Nhật, là TUỲ CHỌN. Phần trong
  ngoặc được tách thành cột riêng nên khi luyện gõ đáp án vẫn chỉ cần gõ chữ chính.
- **Câu ví dụ** và **nghĩa câu ví dụ** viết sau dấu `|`, cũng tuỳ chọn. Dùng `|`
  chứ không thêm dấu phẩy để cột nghĩa vẫn chứa được dấu phẩy.
- **Âm Hán Việt** được phép để trống (từ katakana, trạng từ thuần kana): viết dấu
  phẩy ngay đầu dòng.
- Nhiều nghĩa tương đương ngăn nhau bằng `/` — khi luyện gõ, đúng MỘT nghĩa là đủ.
- Dòng bắt đầu bằng `#` là ghi chú, bị bỏ qua.

Ví dụ:

```
ĐẾ THIẾT,締め切り (しめきり),hạn chót/ kỳ hạn|レポートの締め切りは明日です。|Hạn nộp báo cáo là ngày mai.
,アイデア,ý tưởng
```

## Các bài của phần Từ vựng

Lộ trình đã đặt sẵn 11 bài, mới có `meta.json` và đang chờ nội dung:

| Thư mục          | Tên hiển thị |
| ---------------- | ------------ |
| `01-danh-tu-1`   | Danh từ 1    |
| `02-dong-tu-1`   | Động từ 1    |
| `03-tinh-tu-1`   | Tính từ 1    |
| `04-danh-tu-2`   | Danh từ 2    |
| `05-dong-tu-2`   | Động từ 2    |
| `06-katakana-1`  | Katakana 1   |
| `07-tinh-tu-2`   | Tính từ 2    |
| `08-pho-tu-1`    | Phó từ 1     |
| `09-danh-tu-3`   | Danh từ 3    |
| `10-katakana-2`  | Katakana 2   |
| `11-pho-tu-2`    | Phó từ 2     |

Thêm nội dung cho một bài = đặt file `vocabulary.txt` vào đúng thư mục của bài đó rồi
chạy `npm run generate`. Không phải sửa gì trong mã nguồn.
