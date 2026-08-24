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
