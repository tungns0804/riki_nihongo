# Định dạng bài kanji

File `kanji.txt`, mỗi dòng một chữ:

```
CHỮ,ÂM HÁN VIỆT,NGHĨA,ÂM ON,ÂM KUN,SỐ NÉT|TỪ GHÉP (CÁCH ĐỌC)=NGHĨA;TỪ GHÉP…
```

- Nhiều **âm On** hoặc **âm Kun** ngăn nhau bằng dấu `・` (dấu chấm giữa của tiếng
  Nhật), không dùng dấu phẩy vì dấu phẩy đã là dấu ngăn cột.
- Chỗ ngắt trong âm Kun viết bằng dấu chấm như từ điển: `けわ.しい`.
- **Từ ghép** viết sau dấu `|`, các từ ngăn nhau bằng `;`.
- Số nét để trống thì không hiện huy hiệu số nét.

Ví dụ:

```
険,HIỂM,hiểm/ nguy hiểm,ケン,けわ.しい,11|危険 (きけん)=nguy hiểm;保険 (ほけん)=bảo hiểm
```
