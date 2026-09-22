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
và từ ghép nằm sau nút "Tham khảo". Phần **từ ghép** của Bài 1 vì vậy lấy từ thẻ chi tiết
của đúng những chữ đó bên `btvn-co-ban/kanji/` — cùng một website, cùng một bộ thẻ.

## Các bài

| Thư mục          | Tên        | Nội dung                                          |
| ---------------- | ---------- | ------------------------------------------------- |
| `01-bai-1`       | Bài 1      | 21 chữ bộ Nhân đứng 亻 (gộp Bài 1 và Bài 2 của website) |
| `01-bai-1-btvn`  | BTVN Bài 1 | Đề 20 câu, bài CON của `01-bai-1`                 |

`meta.json` của mỗi bài ghi `description` là một dòng **tóm tắt bài học gì** — trang bài
hiện nó ngay dưới tên bài, nên đọc một dòng đó là biết bài gồm những chữ nào và chúng
giống nhau ở đâu.

## Bài tập về nhà

BTVN là bài **con** của một bài kanji, đúng như BTVN bên phần Từ vựng: `meta.json` khai
`"kind": "test"` và `"parent"` là id bài mẹ, file dữ liệu tên `test.json`. Bài con không
hiện ở danh sách phần KANJI mà hiện thành một nút trên trang bài mẹ, và breadcrumb đi qua
bài mẹ. Cách viết câu hỏi (`promptReading`, `choicesVietnamese`, `choiceNotes`…) xem mục
"Bài tập về nhà" trong README ở gốc dự án.

Bài kanji không chia cụm như bài từ vựng nên `"group"` để trống: một bài mẹ, một BTVN.

Bài mới thì tạo thư mục `02-bai-2/` gồm `meta.json` (`"name": "Bài 2"`, `"order": 2`) và
`kanji.txt`, rồi chạy `npm run generate`.
