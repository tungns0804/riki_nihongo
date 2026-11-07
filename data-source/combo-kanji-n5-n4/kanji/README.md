# Combo Kanji N5-N4 — Kanji

Khoá kanji sơ cấp của Riki, chỉ có một phần Kanji. Mỗi bài là một bảng **thẻ kanji** 5 chữ
(`kanji.txt`, định dạng ở [`n3-junbi/kanji/README.md`](../../n3-junbi/kanji/README.md)); đề
trắc nghiệm của bài là bài **con** của nó, như BTVN bên N3 JUNBI.

## Các bài

Phạm vi N5 là 25 bài, 125 chữ, chép từ PDF "Khoá học Online N5 – Kanji" (BUỔI 01–25):

| Thư mục           | Tên                     | Chữ            | Đề (bài con)  |
| ----------------- | ----------------------- | -------------- | ------------- |
| `01-so-dem`       | Bài 1 · Số đếm          | 一 二 三 四 五 |               |
| `02-so-dem`       | Bài 2 · Số đếm          | 六 七 八 九 十 | `01-chu-so`   |
| `03-don-vi-dem`   | Bài 3 · Đơn vị đếm      | 百 千 万 円 何 | `03-bai-3`    |
| `04-thoi-gian`    | Bài 4 · Thời gian       | 日 月 火 水 木 | `05-bai-5`    |
| `05-thoi-gian`    | Bài 5 · Thời gian       | 金 土 今 年 夕 |               |
| `06-thoi-gian`    | Bài 6 · Thời gian       | 時 分 半 間 週 | `06-bai-6`    |
| `07-truong-hoc`   | Bài 7 · Trường học      | 学 生 先 友 名 | `07-bai-7`    |
| `08-truong-hoc`   | Bài 8 · Trường học      | 大 小 字 本 校 |               |
| `09-du-lich`      | Bài 9 · Du lịch 1       | 行 来 帰 国 人 |               |
| `10-gia-dinh`     | Bài 10 · Gia đình       | 父 母 子 男 女 |               |
| `11-vi-tri`       | Bài 11 · Vị trí 1       | 上 下 右 左 中 |               |
| `12-vi-tri`       | Bài 12 · Vị trí 2       | 後 前 外 入 出 |               |
| `13-phuong-huong` | Bài 13 · Phương hướng   | 南 西 東 北 方 |               |
| `14-bo-phan`      | Bài 14 · Bộ phận        | 口 目 耳 手 足 | `14-bai-14`   |
| `15-dong-vat`     | Bài 15 · Động vật       | 牛 魚 犬 鳥 馬 |               |
| `16-thien-nhien`  | Bài 16 · Thiên nhiên 1  | 山 川 田 海 空 |               |
| `17-thien-nhien`  | Bài 17 · Thiên nhiên 2  | 花 雨 天 員 者 |               |
| `18-dong-tu`      | Bài 18 · Động từ 1      | 見 聞 書 食 飲 |               |
| `19-dong-tu`      | Bài 19 · Động từ 2      | 買 言 読 話 休 |               |
| `20-tinh-tu`      | Bài 20 · Tính từ 1      | 高 安 長 気 元 |               |
| `21-tinh-tu`      | Bài 21 · Tính từ 2      | 新 古 少 多 明 |               |
| `22-do-an`        | Bài 22 · Đồ ăn          | 米 肉 茶 物 好 |               |
| `23-phuong-tien`  | Bài 23 · Phương tiện    | 電 車 自 寺 町 |               |
| `24-dia-diem`     | Bài 24 · Địa điểm       | 会 社 病 院 店 |               |
| `25-chu-khac`     | Bài 25 · Các chữ khác   | 毎 回 午 同 立 |               |

Khung tiêu đề BUỔI 17 in 花 雨 天 員 仕 nhưng thẻ thứ năm là 者 — chép theo thẻ. File
`bai25_2.pdf` đi kèm BUỔI 25 là tài liệu ngữ pháp N5 (～たら, ～ても), không có thẻ kanji.

Thư mục bài thẻ đặt theo chủ đề chứ không theo kiểu `03-bai-3`, vì các đề có trước thẻ
đã giữ những id đó — đổi id đề thì mất kết quả làm bài đã lưu (tiến độ lưu theo id bài).

## Thẻ kanji (`kanji.txt`)

Mỗi thẻ trong PDF có: chữ, âm Hán Việt, 音, 訓, các từ ghép kèm furigana và nghĩa, "Ý nghĩa",
câu cách nhớ và một hai câu ví dụ có chữ gạch chân. Chép như sau:

- **NGHĨA** là dòng "Ý nghĩa", viết thường, nhiều nghĩa ngăn bằng `/` (cột này không được
  có dấu phẩy). Hai chỗ thêm: 学 (thẻ ghi "Học sinh") thành `học/ học sinh`; 間 (thẻ ghi
  "Thời gian", trùng 時) thành `thời gian/ ở giữa` — luyện Việt → Nhật cần nghĩa không trùng.
- **Âm On viết katakana**, âm Kun viết hiragana; nhiều âm ngăn bằng `・`. Thẻ ghi biến âm
  (にっ, び, ろっ…) như một âm riêng thì giữ.
- **Âm Kun của động từ, tính từ** thẻ chỉ ghi phần gốc (上: あ, 生: う, 足: た); ở đây ghi
  dạng từ điển có dấu `.` ngắt đuôi (`あ.げる`, `う.まれる`, `た.りる`), lấy theo chính từ
  ghép trên thẻ. 来 thẻ ghi き (来ます) — ghi `く.る・き`.
- **Thẻ không có 音** (何, 夕, 右, 左, 耳, 足, 魚, 犬, 鳥, 馬) thì cột âm On để trống.
- **Số nét** PDF không in, để trống.
- **Từ ghép** chép cả cột 音 lẫn 訓 của thẻ, giữ dạng ます như thẻ (`行きます (いきます)=Đi`).
  Mục **Âm đặc biệt** dưới thẻ (今年, 今日, 大人, 一人, お父さん, お母さん, 上手, 下手) chép
  vào từ ghép của chữ đó, nghĩa ghi thêm `(âm đặc biệt)`. Chú thích (*) của 一日 (ついたち)
  cũng thành một từ ghép.
- **Cách nhớ** (`覚:`) chép nguyên văn; thẻ có hai cách nhớ thì viết `1) … 2) …` trên một dòng.
- **Câu ví dụ** chép nguyên văn, dấu cách giữa các từ viết bằng dấu cách toàn khổ `　`. Câu
  hội thoại A/B viết trên một dòng: `A：… 　B：…`. Bản dịch và dòng `読:` (đọc cả câu bằng
  kana) là phần thêm vào — PDF chỉ chú âm vài chữ.
- **Lỗi trên PDF** thì sửa và ghi bằng dòng `#` ngay trên chữ đó: furigana sai (金曜日
  きんようひ, 生年月日 せいねんがっび, 5分 ぶん, 会います かい), nghĩa sai (六月 "6 tháng"),
  chữ thừa (食べしました), thiếu chữ (いい天気から → いい天気だから), nghĩa từ ghép sai
  (多分 "Phần lớn" → "Có lẽ"). Câu ví dụ đúng chữ nhưng nói không tự nhiên (夢は医者に
  なりたい, 友達に会っているね) thì giữ nguyên và ghi cách nói chuẩn ở dòng `注:`.

## Đề

Đề là bài con của bài thẻ: `meta.json` khai `"kind": "test"` và `"parent"` là id bài thẻ, dữ
liệu nằm trong `test.json` (định dạng ở
[`n3-junbi/entrance-test/README.md`](../../n3-junbi/entrance-test/README.md)), mỗi câu có
`choicesVietnamese` và `choiceNotes`. Đề hiện thành nút trong khung "Bài tập về nhà" trên
trang bài thẻ.

| Thư mục     | Tên               | Bài mẹ          | Nội dung                                                     |
| ----------- | ----------------- | --------------- | ------------------------------------------------------------ |
| `01-chu-so` | Đề chữ số 一〜十  | `02-so-dem`     | 20 câu: đọc 10 từ có chữ số, chọn chữ Hán cho 10 từ          |
| `03-bai-3`  | Đề 百 千 万 円 何 | `03-don-vi-dem` | 20 câu: số tiền, số lượng                                    |
| `05-bai-5`  | Đề 日 月 火 水 木 | `04-thoi-gian`  | 20 câu: thứ trong tuần, 花火, お正月…                         |
| `06-bai-6`  | Đề 時 分 半 間 週 | `06-thoi-gian`  | 20 câu: giờ giấc, thời gian                                  |
| `07-bai-7`  | Đề 先 生 学 友 名 | `07-truong-hoc` | 20 câu: 先生, 友達, 名前, 学校…                                |
| `14-bai-14` | Đề 口 目 耳 手 足 | `14-bo-phan`    | 20 câu: 目的, 人口, 悪口, 下手, 窓口, 足りる, 入口…             |

Đề đặt tên theo chữ chứ không theo số bài, vì số không khớp: đề `05-bai-5` lúc dán vào ghi
"Bài 5" nhưng hỏi 日 月 火 水 木 — chữ của BUỔI 04 trong PDF — nên gắn vào Bài 4. Đề "Chữ số"
hỏi cả 一〜十 nên gắn vào Bài 2, bài học xong chữ số.

### Bảng tóm tắt

Mỗi đề có `summary` — bảng "Tóm tắt bài" hiện trên khung bắt đầu: mỗi chữ một dòng
`{ "title": "百", "meaning": "BÁCH · trăm", "lines": ["ひゃく — …", "びゃく — 三百…"] }`.
`lines` ghi các cách đọc kèm ví dụ lấy từ chính đề, nhất là chỗ biến âm (ひゃく／びゃく／ぴゃく,
くち／ぐち), vì đề kanji sơ cấp hỏi đúng những chỗ đó.

### Cách chép đề

- Mỗi 問題 một `section`, `skill` đều là `kanji`. Đề không in câu lệnh nên không có
  `instructions`.
- Từ đang hỏi đánh dấu bằng 「」 thay cho gạch chân, như quy ước của
  [đề kiểm tra](../../n3-junbi/entrance-test/README.md#dấu-「」-thay-cho-gạch-chân):
  `うちから　かいしゃまで　でんしゃで　「二十分」です。` Đề dán vào mất gạch chân thì suy từ
  đang hỏi theo bốn lựa chọn (`まど「ぐち」`, `お「てあらい」`).
- **Không có `promptReading`**: câu đề ở trình độ này đã viết bằng hiragana, chỉ còn đúng
  chữ đang hỏi là chữ Hán — viết cách đọc ra là lộ đáp án.
- Dấu cách giữa các từ giữ như đề in, viết bằng dấu cách toàn khổ `　`.
- Lỗi gõ thấy rõ thì sửa và ghi ở cuối `explanation`: `でんわばんご` → `でんわばんごう`,
  `なんほん` → `なんぼん`. Lựa chọn sai cố ý (`丸つ` — chữ 丸 trông giống 九) thì giữ nguyên.

Đáp án do tôi chấm vì đề không in đáp án.

## Thêm bài

Bài thẻ mới: thư mục `26-<chu-de>/` gồm `meta.json` (`"name": "Bài 26 · …"`, `"order": 26`)
và `kanji.txt`. Đề mới của bài N: thư mục `NN-bai-N/` gồm `meta.json` (`"kind": "test"`,
`"parent"`: id bài thẻ, `"order"`: N×100+1) và `test.json`. Rồi chạy `npm run generate`.
