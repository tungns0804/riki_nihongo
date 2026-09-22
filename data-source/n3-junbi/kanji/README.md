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

## Nguồn và cách chép

Nguồn là **thẻ kanji** của từng "Bài N" trong phần KANJI trên website Riki, lấy từ ảnh
chụp màn hình. Cách chuẩn hoá giống hệt bên BTVN CƠ BẢN — xem
[`btvn-co-ban/kanji/README.md`](../../btvn-co-ban/kanji/README.md): âm On viết katakana,
chỗ ngắt đuôi âm Kun viết `.`, nhiều âm ngăn bằng `・`, thẻ thiếu gì thì để trống.

Màn hình DANH SÁCH của website chỉ hiện chữ, âm Hán Việt, 音 và 訓; nghĩa của chữ, số nét
và từ ghép nằm sau nút "Tham khảo". Chép từ ảnh danh sách thì ba cột đó để trống, bổ sung
sau khi có ảnh thẻ chi tiết.

## Các bài

| Thư mục    | Tên   | Chữ                            |
| ---------- | ----- | ------------------------------ |
| `01-bai-1` | Bài 1 | 仕 任 信 伸 付 代 件 位 倍 保 個 |
| `02-bai-2` | Bài 2 | 仲 借 供 他 候 価 便 停 係 優    |

`meta.json` của mỗi bài ghi `description` là một dòng **tóm tắt bài học gì** — trang bài
hiện nó ngay dưới tên bài, nên đọc một dòng đó là biết bài gồm những chữ nào và chúng
giống nhau ở đâu (Bài 1: cả 11 chữ đều mang bộ Nhân đứng 亻).

Bài mới thì tạo thư mục `03-bai-3/` gồm `meta.json` (`"name": "Bài 3"`, `"order": 3`) và
`kanji.txt`, rồi chạy `npm run generate`.
