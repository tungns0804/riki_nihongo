# Riki Nihongo — khoá N3 JUNBI

Trang học tiếng Nhật cá nhân cho khoá **N3 JUNBI**, gồm bảy phần:

| Phần                          | Đường dẫn     | Nội dung                                                        |
| ----------------------------- | ------------- | --------------------------------------------------------------- |
| Bài kiểm tra nhập môn N3      | `/test`       | Đề đầu vào, chấm điểm theo năm kỹ năng                            |
| Từ vựng                       | `/vocabulary` | Bảng từ + luyện tập bốn chiều                                     |
| KANJI                         | `/kanji`      | Thẻ chữ Hán: âm On/Kun, âm Hán Việt, số nét, từ ghép              |
| Ngữ pháp                      | `/grammar`    | Trang lý thuyết: công thức, cách dùng, ví dụ                      |
| Đọc hiểu                      | `/reading`    | Bài đọc + câu hỏi trả lời tại chỗ + bản dịch ẩn                   |
| Nghe hiểu                     | `/listening`  | Trình phát + câu hỏi + lời thoại ẩn                               |
| Ngữ pháp MIMIKARA OBOERU      | `/mimikara`   | Như phần Ngữ pháp, theo giáo trình 耳から覚える                    |

Trang chạy hoàn toàn trong trình duyệt: không có máy chủ, không có tài khoản. Tiến
độ học lưu trong `localStorage` của chính máy đang dùng.

## Bắt đầu

```bash
npm install
npm start           # sinh nội dung rồi chạy dev server ở http://localhost:4200
```

Các lệnh khác:

```bash
npm run build          # sinh nội dung rồi build ra dist/
npm run generate       # chỉ sinh public/content/ từ data-source/
npm run generate:clean # sinh lại và xoá file JSON không còn nguồn
npm run verify         # kiểm tra nội dung nguồn và phần đa ngôn ngữ
```

## Thêm bài học

Mọi nội dung nằm trong [`data-source/`](data-source/README.md) — mỗi phần một thư
mục, mỗi bài một thư mục con:

```
data-source/vocabulary/01-bai-1/
├── meta.json        tên hiển thị, mô tả, thứ tự (tuỳ chọn)
└── vocabulary.txt   nội dung bài
```

Chạy `npm run generate` là bài mới xuất hiện trên trang. Định dạng chi tiết của
từng loại nằm trong `README.md` của chính thư mục phần học:

- [Từ vựng](data-source/vocabulary/README.md) — file `.txt`, mỗi dòng một từ
- [Kanji](data-source/kanji/README.md) — file `.txt`, mỗi dòng một chữ
- [Ngữ pháp](data-source/grammar/README.md) và [Mimikara](data-source/mimikara/README.md) — file `.json`
- [Đọc hiểu](data-source/reading/README.md) — file `.json`
- [Nghe hiểu](data-source/listening/README.md) — file `.json`, âm thanh đặt trong `public/audio/`
- [Kiểm tra nhập môn](data-source/entrance-test/README.md) — file `.json`

Phần **Từ vựng** đã có nội dung thật: mục "Danh từ" gồm 120 từ của 第1課–第6課. Bốn
mục còn lại (Động từ, Tính từ, Katakana, Phó từ) mới đặt chỗ, đang chờ nội dung.

Các thư mục `00-bai-mau` / `de-1` ở những phần khác là **bài mẫu** để kiểm tra đường
ống nội dung — xoá đi khi đã có bài thật.

## Luyện tập

Bài từ vựng luyện được theo bốn chiều:

| Chiều | Câu hỏi | Đáp án |
| --- | --- | --- |
| Nhật → Việt | 男性 | Nam giới |
| Việt → Nhật | Nam giới | 男性 |
| Nhật → Cách đọc | 男性 | だんせい |
| **Điền từ vào câu** | 事件の（　　）を捕まえる。 | 犯人 |

Chiều cuối lấy chính câu ví dụ của giáo trình, khoét từ cần học ra rồi bắt điền lại —
đúng dạng đề 文字語彙 của kỳ thi. Gõ cách đọc thay cho kanji cũng tính đúng.

Chấm xong, mọi chiều đều hiện **toàn bộ câu ví dụ** của từ đó, có tô đậm từ đang học
trong câu. Bài kanji hiện danh sách từ ghép theo cùng cách.

Chọn một cụm (01–10, 11–20…) thì cả danh sách lẫn phần luyện tập chỉ còn cụm đó, và
ba đáp án nhiễu cũng lấy trong cụm.

## Ánh sáng ban đêm

Trang **bật sẵn** một lớp phủ tông ấm lên toàn màn hình, theo cách Night light của
Windows làm: giữ kênh đỏ, giảm kênh lục và lam (cỡ 4000K). Nút hình mặt trời lặn trên
header bật/tắt nó, độc lập với nút Sáng/Tối, và lựa chọn được nhớ trên máy. Độ đậm là
biến `--night-light` trong `src/styles.css`.

## Kiến trúc

Angular 20, standalone component, state bằng signal. Không có thư viện state
management nào khác, không có backend.

```
src/app/
├── app.ts / app.html / app.css     vỏ ứng dụng: header, menu bảy phần, nút lên đầu trang
├── app.routes.ts                   route của bảy phần + /practice + /result
├── core/
│   ├── course/course.config.ts     ĐỊNH NGHĨA KHOÁ HỌC: bảy phần, đường dẫn, biểu tượng
│   ├── i18n/                       từ điển vi/ja, đổi ngôn ngữ lúc chạy
│   ├── models/                     hình dạng dữ liệu học và dữ liệu luyện tập
│   ├── practice/build-questions.ts dựng câu hỏi từ nội dung bài
│   ├── services/                   tải nội dung, phiên luyện tập, tiến độ, tông màu
│   └── utils/                      chấm đáp án, chuẩn hoá chữ, trộn ngẫu nhiên
└── features/
    ├── home/                       trang chủ: lưới bảy phần
    ├── unit-list/                  danh sách bài — DÙNG CHUNG cho cả bảy phần
    ├── <loại>-detail/              màn hình chi tiết, mỗi loại nội dung một màn hình
    ├── entrance-test/              đề kiểm tra nhập môn
    ├── practice/ result/           màn hình làm bài và màn hình kết quả
    └── shared/                     khung thiết lập luyện tập, khối câu hỏi tại chỗ
```

Ba điểm đáng nhớ khi sửa về sau:

1. **Thêm một phần học** = thêm một dòng trong `core/course/course.config.ts`, một
   cặp route trong `app.routes.ts`, một dòng trong `MODULES` của
   `scripts/generate-content.mjs`, và các khoá `module.<id>.*` trong `core/i18n/messages.ts`.
2. **Danh sách bài dùng chung một component** (`features/unit-list`), phân biệt bằng
   `data.moduleId` của route. Màn hình chi tiết thì tách riêng theo hình dạng dữ liệu.
3. **Phần Mimikara dùng lại màn hình Ngữ pháp** vì cùng hình dạng dữ liệu; nó là hai
   phần trên giao diện vì là hai giáo trình khác nhau.

## Deploy

Push lên nhánh `main` là GitHub Actions tự build và deploy lên GitHub Pages
(`.github/workflows/deploy.yml`). Workflow tự bật Pages cho repo trong lần chạy đầu.

Trang chạy tại: https://tungns0804.github.io/riki_nihongo/
