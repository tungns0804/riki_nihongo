# Riki Nihongo

Trang học tiếng Nhật cá nhân theo các học phần của Riki Nihongo. Hai học phần đã có nội
dung:

**N3 JUNBI** (`/n3-junbi`) — bảy phần:

| Phần                          | Đường dẫn               | Nội dung                                              |
| ----------------------------- | ----------------------- | ----------------------------------------------------- |
| Bài kiểm tra nhập môn N3      | `/n3-junbi/test`        | Đề đầu vào, chấm điểm theo năm kỹ năng                  |
| Từ vựng                       | `/n3-junbi/vocabulary`  | Bảng từ + luyện tập bốn chiều                           |
| KANJI                         | `/n3-junbi/kanji`       | Thẻ chữ Hán: âm On/Kun, âm Hán Việt, số nét, từ ghép    |
| Ngữ pháp                      | `/n3-junbi/grammar`     | Trang lý thuyết: công thức, cách dùng, ví dụ            |
| Đọc hiểu                      | `/n3-junbi/reading`     | Bài đọc + câu hỏi trả lời tại chỗ + bản dịch ẩn         |
| Nghe hiểu                     | `/n3-junbi/listening`   | Trình phát + câu hỏi + lời thoại ẩn                     |
| Ngữ pháp MIMIKARA OBOERU      | `/n3-junbi/mimikara`    | Như phần Ngữ pháp, theo giáo trình 耳から覚える          |

**BTVN CƠ BẢN (MỚI)** (`/btvn-co-ban`) — bài tập về nhà. Hiện có phần Từ vựng
(`/btvn-co-ban/vocabulary`): bài "Danh từ" 01–70, chép theo thẻ từ vựng của các bài tập
"Từ vựng 1-10" tới "61-70", mỗi bài tập một cụm.

Địa chỉ cũ chưa có tên học phần (`/vocabulary/01-danh-tu`) tự chuyển sang N3 JUNBI.

Trang chạy hoàn toàn trong trình duyệt: không có máy chủ, không có tài khoản. Tiến
độ học lưu trong `localStorage` của chính máy đang dùng, mỗi học phần một khoá riêng.

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

Mọi nội dung nằm trong [`data-source/`](data-source/README.md) — mỗi học phần một thư
mục, trong đó mỗi phần học một thư mục, mỗi bài một thư mục con:

```
data-source/n3-junbi/vocabulary/01-danh-tu/
├── meta.json        tên hiển thị, mô tả, thứ tự (tuỳ chọn)
└── vocabulary.txt   nội dung bài
```

Chạy `npm run generate` là bài mới xuất hiện trên trang. Định dạng chi tiết của
từng loại nằm trong `README.md` của thư mục phần học:

- [Từ vựng](data-source/n3-junbi/vocabulary/README.md) — file `.txt`, mỗi từ một khối
  (BTVN: [chỗ khác biệt](data-source/btvn-co-ban/vocabulary/README.md))
- [Kanji](data-source/n3-junbi/kanji/README.md) — file `.txt`, mỗi dòng một chữ
- [Ngữ pháp](data-source/n3-junbi/grammar/README.md) và [Mimikara](data-source/n3-junbi/mimikara/README.md) — file `.json`
- [Đọc hiểu](data-source/n3-junbi/reading/README.md) — file `.json`
- [Nghe hiểu](data-source/n3-junbi/listening/README.md) — file `.json`, âm thanh đặt trong `public/audio/`
- [Kiểm tra nhập môn](data-source/n3-junbi/entrance-test/README.md) — file `.json`

Phần **Từ vựng** của N3 JUNBI đã có nội dung thật: mục "Danh từ" gồm 120 từ của
第1課–第6課, mục "Động từ" gồm 20 từ của 第7課 (121–140), mục "Tính từ" gồm 22 từ của
第14課 (259–280) chia ba cụm, có bảng "Tóm tắt bài" ghi chủ đề từng cụm. Katakana và Phó
từ mới đặt chỗ, đang chờ nội dung. Bên BTVN, mục "Danh từ" có 70 từ chia bảy cụm theo bảy
bài tập, cũng có bảng "Tóm tắt bài".

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

Với động từ, chỗ bị khoét là **dạng chia trong câu** chứ không phải dạng từ điển:
`父は働きすぎて（　　）しまった。` → `倒れて` (gõ `たおれて` cũng được). Ba đáp án nhiễu
được ưu tiên chọn cùng dạng chia (`倒して・殴って・起こして`), để không loại được đáp án
chỉ nhờ ngữ pháp.

Ở ba chiều hỏi về từ, **mỗi câu có hai phần trên cùng một thẻ**: trả lời 倒れる xong thì
ngay bên dưới hiện một câu ví dụ của chính 倒れる bị khoét chỗ trống để điền luôn — nhớ
nghĩa chưa đủ, phải đặt được từ vào câu. Câu ví dụ chọn ngẫu nhiên mỗi phiên. Số câu đếm
theo thẻ ("10 câu" là 10 từ), và một câu chỉ tính đúng khi đúng cả hai phần; màn kết quả
chỉ ra phần nào sai. Gõ đáp án thì Enter đưa con trỏ lần lượt từ ô từ, xuống ô câu ví dụ,
tới nút sang câu sau.

Chấm xong cả thẻ thì hiện **toàn bộ câu ví dụ** của từ đó, có tô đậm từ đang học trong
câu — hiện sớm hơn thì câu điền chỉ còn là chép lại chỗ vừa đọc. Bài kanji hiện danh
sách từ ghép theo cùng cách.

Trang luyện tập và trang kết quả nằm dưới địa chỉ của bài đang luyện, ví dụ
`/n3-junbi/vocabulary/02-dong-tu/practice`, nên mục menu của phần đó vẫn sáng. F5 giữa
chừng thì về lại trang bài để bắt đầu lại.

Chọn một cụm (01–10, 11–20…) thì cả danh sách lẫn phần luyện tập chỉ còn cụm đó, và
ba đáp án nhiễu cũng lấy trong cụm.

## Giao diện

Khung ứng dụng giống minano_nihongo (vốn theo bố cục ByeTOEIC): menu các phần học nằm ở
**thanh bên trái** — đủ nhãn từ khổ 1480px, thu thành dải chữ Hán (試 語 漢 文 読 聴 耳)
từ 768px, và thành dải chip cuộn ngang dưới thanh trên cùng trên điện thoại. Thanh
trên cùng chỉ còn breadcrumb (`Riki Nihongo / N3 JUNBI ▾ / Từ vựng`) và hai nút ngôn ngữ,
giao diện.

Website Riki có năm học phần: **N3 JUNBI**, **BTVN CƠ BẢN (MỚI)**, BTVN N4 CHUYÊN SÂU, N3
TAISAKU, N3 LUYỆN ĐỀ. Trang gốc là trang chọn học phần; bấm một học phần thì vào trang của
nó (`/n3-junbi`, `/btvn-co-ban`). Thanh bên và breadcrumb luôn theo đúng cấp đang đứng:
ở trang gốc thanh bên liệt kê các học phần và breadcrumb chỉ có `Riki Nihongo`; trong một
học phần thanh bên là các phần học của nó (BTVN chỉ có Từ vựng) và breadcrumb đi đủ cấp
`Riki Nihongo / BTVN CƠ BẢN (MỚI) ▾ / Từ vựng / Danh từ / Luyện tập`, cấp nào có trang thì
bấm được. Nút học phần ▾ trong breadcrumb đổi học phần. Ba học phần chưa làm gắn nhãn "Sắp có" (`COURSES`
trong `course.config.ts`).

Nút giao diện xoay vòng **Tự động → Sáng → Tối → Đèn đêm**, và trang mở lần đầu là
**Đèn đêm**. Sáng và tối dùng bảng màu ByeTOEIC của minano_nihongo: nền trắng ngà / navy,
xanh Mekong (`--brand`) cho khung ứng dụng, xanh lá (`--accent`) cho nút và lựa chọn
trong nội dung. Đèn đêm làm theo Night light của Windows: nền giấy ngà, chữ nâu đậm,
thương hiệu nâu gỗ và màu nhấn cam đất thay cho hai màu xanh — bớt ánh sáng xanh mà
vẫn đủ sáng để đọc. Bảng này viết riêng dưới `:root[data-theme='night']` trong
`src/styles.css`. Font Montserrat (chữ) và Quicksand (tiêu đề) tải từ Google Fonts, rơi
về Segoe UI khi không tải được.

Khung thiết lập luyện tập xếp mỗi nhóm thành một hàng, nhãn bên trái và nút dạng viên
thuốc co theo nội dung (lớp `.setup` trong `src/styles.css`), như minano_nihongo.

Bấm qua lại giữa các màn hình thì một vệt mảnh chạy ngay dưới header trong lúc tải
màn hình mới (chỉ hiện khi phải chờ quá 120ms), và trang chi tiết hiện khung xám đúng
hình bố cục trong lúc chờ dữ liệu — cùng cơ chế với minano_nihongo.

## Kiến trúc

Angular 20, standalone component, state bằng signal. Không có thư viện state
management nào khác, không có backend.

```
src/app/
├── app.ts / app.html / app.css     vỏ ứng dụng: thanh bên, thanh trên, nút lên đầu trang
├── app.routes.ts                   route dựng từ COURSES × MODULES: /<học phần>/<phần>/<bài>
├── core/
│   ├── course/course.config.ts     ĐỊNH NGHĨA HỌC PHẦN VÀ PHẦN HỌC: đường dẫn, biểu tượng
│   ├── i18n/                       từ điển vi/ja, đổi ngôn ngữ lúc chạy
│   ├── models/                     hình dạng dữ liệu học và dữ liệu luyện tập
│   ├── practice/build-questions.ts dựng câu hỏi từ nội dung bài
│   ├── services/                   tải nội dung, phiên luyện tập, tiến độ, tông màu
│   └── utils/                      chấm đáp án, chuẩn hoá chữ, trộn ngẫu nhiên
└── features/
    ├── course-list/                trang gốc: năm học phần
    ├── home/                       trang của một học phần: lưới các phần học
    ├── unit-list/                  danh sách bài — DÙNG CHUNG cho mọi phần
    ├── <loại>-detail/              màn hình chi tiết, mỗi loại nội dung một màn hình
    ├── entrance-test/              đề kiểm tra nhập môn
    ├── practice/ result/           màn hình làm bài và màn hình kết quả
    └── shared/                     bộ chọn học phần, khung thiết lập luyện tập, khối câu hỏi
```

Những điểm đáng nhớ khi sửa về sau:

1. **Mở một học phần** = đổi `status` thành `'active'` và khai `modules` của nó trong
   `COURSES` (`core/course/course.config.ts`), thêm cùng học phần vào `COURSES` của
   `scripts/generate-content.mjs`, thêm khoá `course.<id>.desc`, rồi đặt nội dung vào
   `data-source/<id>/`. Route tự có.
2. **Thêm một phần học** = thêm một dòng `MODULES` trong `course.config.ts` và trong
   script, các khoá `module.<id>.*` trong `core/i18n/messages.ts`, rồi thêm id vào
   `modules` của học phần cần nó. Hình dạng dữ liệu mới thì thêm màn hình vào `DETAIL`
   của `app.routes.ts`.
3. **Mỗi học phần một bộ store.** `ContentStore`, `ProgressStore`, `PracticeSessionStore`
   cấp ở route cha của học phần chứ không ở gốc, vì id bài trùng nhau giữa các học phần.
   Component vẫn `inject` như thường; học phần đang mở lấy qua token `COURSE`. Tiến độ N3
   JUNBI giữ khoá `riki:progress` có từ trước, học phần khác là `riki:progress:<id>`.
4. **Danh sách bài dùng chung một component** (`features/unit-list`), phân biệt bằng
   `data.moduleId` của route. Màn hình chi tiết thì tách riêng theo hình dạng dữ liệu.
5. **Phần Mimikara dùng lại màn hình Ngữ pháp** vì cùng hình dạng dữ liệu; nó là hai
   phần trên giao diện vì là hai giáo trình khác nhau.

## Deploy

Push lên nhánh `main` là GitHub Actions tự build và deploy lên GitHub Pages
(`.github/workflows/deploy.yml`). Workflow tự bật Pages cho repo trong lần chạy đầu.

Trang chạy tại: https://tungns0804.github.io/riki_nihongo/
