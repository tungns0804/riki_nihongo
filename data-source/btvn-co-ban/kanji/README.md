# BTVN CƠ BẢN (MỚI) — Kanji

Định dạng file giống hệt phần Kanji của N3 JUNBI: xem
[`n3-junbi/kanji/README.md`](../../n3-junbi/kanji/README.md). Mỗi dòng một chữ:

```
CHỮ,ÂM HÁN VIỆT,NGHĨA,ÂM ON,ÂM KUN,SỐ NÉT|TỪ GHÉP (CÁCH ĐỌC)=NGHĨA;…
```

## Nguồn và cách chép

Nguồn là **thẻ kanji** của từng "Bài N" trên website Riki, lấy từ ảnh chụp màn hình. Mỗi
thẻ có: chữ, âm Hán Việt, 音 (âm On), 訓 (âm Kun) và vài từ ghép kèm furigana, nghĩa. Thẻ
không có nghĩa riêng của chữ và không có số nét, nên hai cột đó để trống.

Chép đúng thẻ, chỉ chuẩn hoá cách viết cho khớp định dạng:

- **Chỗ ngắt đuôi của âm Kun** thẻ viết `・` (`まか・せる`); ở đây viết `.` (`まか.せる`),
  vì `・` trong file là dấu ngăn HAI âm khác nhau.
- **Nhiều âm** thẻ viết cách nhau bằng khoảng trắng hoặc `／`; ở đây ngăn bằng `・`
  (`ベン・ビン`, `の.びる・の.ばす`).
- **Âm On viết katakana.** Thẻ 代 ghi `だい`, thẻ 他 ghi `た` → `ダイ`, `タ`.
- **Thẻ 仲 ghi đảo** (音: なか, 訓: チュウ) → âm On `チュウ`, âm Kun `なか`.
- **Chữ dính** trên thẻ (`Duỗichân`) đã tách lại.
- **Cách đọc của từ ghép** ghi đủ cả từ (`髪が伸びる (かみがのびる)`), dù furigana trên thẻ
  chỉ đặt trên chữ Hán.
- Chỗ nào thẻ thiếu thì để trống, không tự thêm: thẻ 伸 không có âm On (シン).

Nghĩa của từ ghép giữ nguyên thẻ, kể cả chỗ dịch lỏng (供給 = "Cung cầu", 候補 = "Ứng cử").
Mỗi chỗ chuẩn hoá có dòng `#` ngay trên chữ đó trong file.

## Các bài

Mỗi "Bài N" của Riki là MỘT thư mục:

| Thư mục     | Tên   | Chữ |
| ----------- | ----- | --- |
| `01-bai-1`  | Bài 1 | 任 信 伸 付 代 件 位 倍 保 個 |
| `02-bai-2`  | Bài 2 | 仲 借 供 他 候 価 便 停 係 優 |
| `03-bai-3`  | Bài 3 | 徒 術 得 役 投 般 段 直 値 置 |
| `04-bai-4`  | Bài 4 | 拾 捨 押 指 探 接 打 折 払 担 授 |
| `05-bai-5`  | Bài 5 | 意 億 念 悪 恋 変 怒 愛 |
| `06-bai-6`  | Bài 6 | 悲 性 悩 情 精 支 技 席 度 渡 |
| `07-bai-7`  | Bài 7 | 幸 報 洗 汚 活 液 流 涙 深 |
| `08-bai-8`  | Bài 8 | 消 法 決 浅 満 演 混 湿 温 塩 |

Bài mới thì tạo thư mục `09-bai-9/` gồm `meta.json` (`"name": "Bài 9"`, `"order": 9`) và
`kanji.txt`, rồi chạy `npm run generate`.
