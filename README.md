# Riki Nihongo

Trang học tiếng Nhật cá nhân theo các học phần của Riki Nihongo. Hai học phần đã có nội
dung:

**N3 JUNBI** (`/n3-junbi`) — bảy phần:

| Phần                          | Đường dẫn               | Nội dung                                              |
| ----------------------------- | ----------------------- | ----------------------------------------------------- |
| Bài kiểm tra nhập môn N3      | `/n3-junbi/test`        | Đề đầu vào: làm cả bài rồi nộp, chấm theo từng kỹ năng  |
| Từ vựng                       | `/n3-junbi/vocabulary`  | Bảng từ + luyện tập bốn chiều                           |
| KANJI                         | `/n3-junbi/kanji`       | Thẻ chữ Hán: âm On/Kun, âm Hán Việt, số nét, từ ghép    |
| Ngữ pháp                      | `/n3-junbi/grammar`     | Trang lý thuyết: công thức, cách dùng, ví dụ — và đề thi thật |
| Đọc hiểu                      | `/n3-junbi/reading`     | Bài đọc + câu hỏi trả lời tại chỗ + bản dịch ẩn         |
| Nghe hiểu                     | `/n3-junbi/listening`   | Trình phát + câu hỏi + lời thoại ẩn                     |
| Ngữ pháp MIMIKARA OBOERU      | `/n3-junbi/mimikara`    | Như phần Ngữ pháp, theo giáo trình 耳から覚える          |

**BTVN CƠ BẢN (MỚI)** (`/btvn-co-ban`) — bài tập về nhà, hai phần:

- Từ vựng (`/btvn-co-ban/vocabulary`): bài "Danh từ" 01–70, chép theo thẻ từ vựng của các
  bài tập "Từ vựng 1-10" tới "61-70", mỗi bài tập một cụm.
- Kanji (`/btvn-co-ban/kanji`): Bài 1–3, mỗi bài 10 chữ, chép theo thẻ kanji của Riki
  ([cách chép](data-source/btvn-co-ban/kanji/README.md)).

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
- [Đề kiểm tra](data-source/n3-junbi/entrance-test/README.md) — file `.json`, dùng cho
  cả bài dạng đề nằm trong phần Ngữ pháp

Phần **Kiểm tra nhập môn** của N3 JUNBI có đề thật "Kiểm tra nhập môn N3" — 33 câu
theo đúng thứ tự đề: 文字語彙 20 câu (cách đọc 5, cách viết 5, điền từ 5, câu đồng
nghĩa 5), 文法 5 câu, 読解 8 câu theo bốn bài đọc. Đề chưa có phần 聴解 nên màn hình
kết quả chấm theo bốn kỹ năng: Kanji, Từ vựng, Ngữ pháp, Đọc hiểu. Mọi câu đều có
bản dịch tiếng Việt của câu hỏi, của từng lựa chọn và của bài đọc
([cách viết](data-source/n3-junbi/entrance-test/README.md)).

Phần **Từ vựng** của N3 JUNBI đã có nội dung thật: mục "Danh từ" gồm 120 từ của
第1課–第6課, mục "Động từ" gồm 20 từ của 第7課 (121–140), mục "Tính từ" gồm 22 từ của
第14課 (259–280) chia ba cụm, có bảng "Tóm tắt bài" ghi chủ đề từng cụm. Katakana và Phó
từ mới đặt chỗ, đang chờ nội dung. Bên BTVN, mục "Danh từ" có 70 từ chia bảy cụm theo bảy
bài tập, cũng có bảng "Tóm tắt bài".

Bài "Danh từ" còn có **bài tập về nhà** của từng buổi: `BTVN 1–10` (9 câu) và
`BTVN 11–20` (10 câu), chép theo đề BTVN của Riki. Mỗi BTVN là một bài dạng ĐỀ
**nằm trong** bài Danh từ chứ không đứng ngang hàng với nó — xem "Bài tập về nhà"
bên dưới.

Phần **Ngữ pháp** của N3 JUNBI có bài "Đề thi thật ôn tập N4 · Nhiệm vụ 2" — 30 câu
文法 chép theo các đề thật 07/2014 – 07/2017, mỗi câu có bản dịch của câu hỏi và của cả
bốn đáp án. Đây là bài dạng ĐỀ nằm giữa các bài lý thuyết, đúng như trên website Riki:
trang bài chỉ có nút bắt đầu, bấm vào là sang màn hình làm đề
([cách nạp](data-source/n3-junbi/grammar/README.md)).

Các thư mục `00-bai-mau` ở những phần còn lại là **bài mẫu** để kiểm tra đường ống
nội dung — xoá đi khi đã có bài thật.

## Bài tập về nhà

Riki ra bài tập theo BUỔI HỌC, tức là theo từng cụm 10 từ của một bài từ vựng. Nên BTVN
là một **bài con**: `meta.json` của nó khai `"parent"` là id bài mẹ và `"group"` là cụm
mà nó ra đề.

```
data-source/n3-junbi/vocabulary/01-danh-tu-btvn-01-10/
├── meta.json   { "kind": "test", "parent": "01-danh-tu", "group": "01–10", "order": 101 }
└── test.json   viết như mọi đề khác (data-source/n3-junbi/entrance-test/README.md)
```

Bài con **không** hiện ở danh sách bài của phần Từ vựng — để hết ngang hàng thì danh sách
dài ra bằng số buổi học chứ không phải số loại từ. Nó hiện ngay trên dòng cụm của bảng
"Tóm tắt bài" trong bài mẹ, và breadcrumb đi đủ cấp
`… / Từ vựng / Danh từ / BTVN 1–10`. `order` đặt theo lối của Mimikara: thứ tự bài mẹ ×
100 ＋ số thứ tự BTVN (101, 102…), để "BTVN 101–110" không nhảy lên đứng trước "BTVN 11–20".

Mỗi câu hỏi viết thêm hai thứ mà đề thi không có, vì đây là bài tập để HỌC chứ không
phải để đo:

- `promptReading` — cách đọc cả câu bằng kana, giữ nguyên chỗ trống `（　　　）`. Hiện
  cùng chỗ ẩn/hiện với bản dịch (bộ sinh cảnh báo nếu dòng này còn sót chữ Hán).
- `choiceNotes` — mảng song song với `choices`, nói vì sao TỪNG lựa chọn đúng hay sai.
  Hiện ở màn hình kết quả sau khi chấm: ba mồi nhiễu của một câu 文字語彙 bao giờ cũng
  là ba từ dễ lẫn với đáp án, mà chỗ lẫn nằm ở đâu thì phải nói ra mới thấy — biết mình
  chọn sai chưa học được gì. Viết đủ bốn cái, thiếu một là bộ sinh cảnh báo.

## Làm đề

Một bài dạng ĐỀ nằm ở ba chỗ: cả phần **Kiểm tra nhập môn**; bài có `"kind": "test"`
trong một phần lý thuyết (phần Ngữ pháp có "Đề thi thật ôn tập N4"); và **BTVN** của một
cụm trong bài từ vựng. Cả ba đều mở bằng nút bắt đầu rồi sang cùng một màn hình, địa chỉ
`…/<bài>/test-run`.

Đề KHÔNG dùng màn hình luyện tập: đề thi thì làm cả bài rồi nộp, không phải
mỗi câu một thẻ chấm ngay. Màn hình riêng của nó (`features/test-run`) làm theo trang
làm bài của Riki:

- **Hàng tab theo kỹ năng** (Kanji · Từ vựng · Ngữ pháp · Đọc hiểu), mỗi tab hiện
  nhãn "Đang làm" / "Đã làm" hoặc số câu đã trả lời. Thanh trên đếm cả tab đang mở
  lẫn cả đề. Đề chỉ đo MỘT kỹ năng (đề ngữ pháp) thì không có hàng tab.
- **Câu lệnh 問題** in trong khung nét đứt trên đầu mỗi phần, đúng như đề giấy.
- Mỗi câu bốn lựa chọn xếp **hai cột** với vòng tròn kiểu radio; bấm lại lựa chọn
  đang chọn thì bỏ chọn. Viền thẻ đổi màu khi câu đã có đáp án, nhưng **không** nói
  gì về đúng sai.
- **Không chấm cho tới khi bấm NỘP BÀI.** Chấm ngay từng câu thì những câu sau của
  cùng một 問題 đã bị gợi ý mất rồi. Còn câu trống thì nút nộp hỏi lại một nhịp.
- Phần 読解: các câu dùng chung một bài đọc được gom lại, bài đọc in **một lần** cho
  cả nhóm.
- Nút **toàn màn hình** cho lúc muốn làm bài mà không thấy gì khác.

Mỗi câu có thêm hai thứ để học, không dính gì tới phần chấm. Trang không in câu dẫn
tiếng Việt nào ở từng câu — câu lệnh 問題 đã nói phần đó hỏi gì.

**Bản dịch** — nghĩa tiếng Việt của câu hỏi và của **cả bốn đáp án**, ở mọi phần (phần
chọn cách đọc / chọn chữ Hán thì mồi nhiễu ghi "không có từ này", kèm nghĩa chữ Hán
khi đáng học). Mỗi câu một nút **Hiện bản dịch / Ẩn bản dịch**, bài đọc có nút riêng,
và nút trên thanh đầu **Hiện tất cả / Ẩn tất cả**. Mặc định ẩn: đọc nghĩa đáp án là
gần như đọc được đáp án, nên mở lúc nào là do người học chọn. Nút "tất cả" chỉ mở /
đóng hết từng câu chứ không đè lên chúng, nên đang "hiện tất cả" vẫn ẩn riêng được
từng câu.

**Ô tự viết** — LUÔN có sẵn dưới mọi câu (không phải bật), **không tính điểm**. Gõ lại
câu tiếng Nhật để luyện chữ Hán, hoặc tự dịch sang tiếng Việt, rồi bấm "So với bản gốc":

- Viết **tiếng Nhật**: báo khớp / chưa khớp và tô từng chữ viết thiếu hoặc viết khác.
  So bằng LCS nên thiếu một chữ ở đầu câu không làm lệch cả phần sau (`diffAgainst`
  trong `core/utils/text.ts`). Khoảng trắng và ngoặc 「」 bị bỏ qua — đề in có dấu cách
  giữa các từ và dùng 「」 thay cho gạch chân, người gõ thì không.
- Viết **tiếng Việt**: KHÔNG chấm khớp (một câu dịch có nhiều cách đúng), chỉ hiện câu
  gốc và bản dịch tham khảo để tự đối chiếu.

Xong bài thì sang màn hình kết quả dùng chung với luyện tập: điểm tổng, điểm từng kỹ
năng, và danh sách từng câu để xem lại. Câu nào có `choiceNotes` thì phần xem lại in cả
bốn lựa chọn kèm dấu ✔ / ✘ và lời giải thích của từng cái, rồi tới `explanation` chốt
lại ý chính — đây mới là chỗ học được gì sau khi chấm.

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

Trang một bài từ vựng là một **bảng gọn** như bảng từ của minano_nihongo — mỗi từ một hàng:
số, Hán Việt, từ, cách đọc, nghĩa, ví dụ — và mặc định chỉ hiện **một cụm**, nhớ cụm đang
xem cho lần mở sau. Thanh dính trên bảng có ô tìm (tìm trong cả bài), ô chọn cụm ‹ ▾ ›, và
cuối bảng có nút "Học tiếp cụm sau". Dưới 720px mỗi hàng đổi thành một thẻ.

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
    ├── entrance-test/              danh sách đề kiểm tra nhập môn (nút bắt đầu)
    ├── test-run/                   MÀN HÌNH LÀM ĐỀ: tab theo kỹ năng, nộp bài mới chấm
    ├── practice/ result/           màn hình luyện tập và màn hình kết quả (dùng chung)
    └── shared/                     bộ chọn học phần, khung thiết lập luyện tập, khung
                                    bắt đầu làm đề, khối câu hỏi
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
6. **Đề có màn hình riêng và ĐOẠN ĐỊA CHỈ riêng.** `…/<bài>/practice` là luyện tập,
   `…/<bài>/test-run` là làm đề (`/n3-junbi/test/de-1/test-run`,
   `/n3-junbi/grammar/02-de-thi-that-n4-nhiem-vu-2/test-run`) — hai đoạn khác nhau vì
   không suy được màn hình từ phần học nữa: phần Ngữ pháp có cả bài lý thuyết lẫn bài
   dạng đề. Nhờ vậy breadcrumb và tiêu đề tab cũng gọi đúng tên màn hình. Cả hai vẫn
   qua `practiceGuard` và vẫn kết thúc ở `features/result`. Đề chấm MỘT LƯỢT lúc nộp
   bằng `PracticeSessionStore.submitAll`, nhận map theo id câu chứ không theo thứ tự —
   trang làm đề xếp câu theo phần và theo bài đọc, còn phiên giữ một danh sách phẳng.
7. **Loại bài theo BÀI chứ không theo phần học.** `meta.json` khai `"kind": "test"` thì
   bài đó là đề dù nằm trong phần Ngữ pháp; trang bài khi ấy hiện `shared/test-start`
   thay cho khung thiết lập luyện tập. Chỉ `grammar`, `mimikara` và `vocabulary` nhận
   được (bộ sinh chặn chỗ khác), vì chỉ màn hình của chúng biết hiện một đề.
8. **Bài con (`parent`) không có route riêng**, vẫn là `…/vocabulary/<id>` như mọi bài.
   Thứ đổi là chỗ nó xuất hiện: `ContentStore.unitsOf` bỏ bài con ra khỏi danh sách
   phần học, `childrenOf` trả chúng về cho trang bài mẹ, và `UnitDirectory` giữ thêm
   `parent` để breadcrumb của vỏ ứng dụng chèn được cấp bài mẹ vào giữa.

## Deploy

Push lên nhánh `main` là GitHub Actions tự build và deploy lên GitHub Pages
(`.github/workflows/deploy.yml`). Workflow tự bật Pages cho repo trong lần chạy đầu.

Trang chạy tại: https://tungns0804.github.io/riki_nihongo/
