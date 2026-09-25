# data-source — nguồn nội dung của Riki Nihongo

Ba cấp thư mục: **học phần** → **phần học** → **bài**.

```
data-source/
├── n3-junbi/                     N3 JUNBI — bảy phần học
│   ├── vocabulary/
│   │   ├── README.md             định dạng file từ vựng
│   │   └── 01-danh-tu/           một bài
│   ├── kanji/ grammar/ …
│   └── mimikara/
├── btvn-co-ban/                  BTVN CƠ BẢN (MỚI) — Từ vựng và Kanji
│   ├── vocabulary/
│   │   └── 01-danh-tu/
│   └── kanji/
│       └── 01-bai-1/ 02-bai-2/ …
└── btvn-n4-chuyen-sau/           BTVN N4 CHUYÊN SÂU — mỗi bài là một đề
    ├── vocabulary/
    │   └── 01-danh-tu/
    └── kanji/
        └── 02-buoi-2/
```

Tên thư mục học phần là `id` trong `COURSES` (`src/app/core/course/course.config.ts`),
và cũng là đoạn đầu địa chỉ trang: `data-source/btvn-co-ban/vocabulary/01-danh-tu/` hiện
ở `/btvn-co-ban/vocabulary/01-danh-tu`. Hai học phần được phép có bài trùng id; danh mục,
tiến độ và phiên luyện của mỗi học phần tách riêng.

Học phần có những phần học nào thì khai ở `modules` của học phần đó, ở CẢ HAI chỗ:
`COURSES` trong `course.config.ts` và `COURSES` trong `scripts/generate-content.mjs`.
Thư mục đặt ở cấp học phần mà không phải học phần nào thì script báo lỗi.

## Phần học

Thư mục phần học dùng tên cố định:

| Thư mục         | Phần học                      | File dữ liệu                          |
| --------------- | ----------------------------- | ------------------------------------- |
| `entrance-test` | Bài kiểm tra nhập môn N3      | `test.json` (hoặc `de.json`)          |
| `vocabulary`    | Từ vựng                       | `vocabulary.txt` (hoặc `tu-vung.txt`) |
| `kanji`         | KANJI                         | `kanji.txt` (hoặc `chu-han.txt`)      |
| `grammar`       | Ngữ pháp                      | `grammar.json` (hoặc `ngu-phap.json`) |
| `reading`       | Đọc hiểu                      | `reading.json` (hoặc `doc-hieu.json`) |
| `listening`     | Nghe hiểu                     | `listening.json` (hoặc `nghe-hieu.json`) |
| `mimikara`      | Ngữ pháp MIMIKARA OBOERU      | `grammar.json`                        |

Định dạng chi tiết của từng loại nằm trong `README.md` của thư mục phần học bên N3 JUNBI
(`n3-junbi/vocabulary/README.md`…). Học phần khác dùng chung định dạng đó, chỉ ghi thêm
chỗ khác biệt trong README của chính nó (xem `btvn-co-ban/vocabulary/README.md`).

## Bài

Trong mỗi phần, mỗi thư mục con là MỘT bài:

```
data-source/n3-junbi/vocabulary/01-danh-tu/
├── meta.json        (tuỳ chọn) tên hiển thị, mô tả, thứ tự
└── vocabulary.txt   nội dung bài
```

Một "bài" là một mục người học bấm vào, KHÔNG phải một buổi học: danh sách bài chép
đúng danh sách bài trên web Riki. Phần Từ vựng chia theo loại từ (Danh từ, Động từ,
Tính từ, Katakana, Phó từ, Danh từ 2) — bấm vào "Danh từ" là thấy toàn bộ danh từ của
bài đó, chứ không phải "Danh từ phần 1", "Danh từ phần 2". Buổi học hay bài tập 10 từ
là một CỤM trong bài (dòng `##`, xem README của phần Từ vựng).

Riki tự mở thêm bài mới khi giáo trình quay lại một loại từ đã học ("Danh từ 2" gồm
311–318) — lúc đó cũng tạo bài mới ở đây, không dồn vào bài cũ.

`meta.json`:

```json
{
  "name": "Bài 1 · Từ vựng",
  "description": "40 từ đầu tiên của khoá",
  "order": 1
}
```

Không có `meta.json` thì tên lấy theo tên thư mục và thứ tự lấy theo số ở đầu tên
thư mục (`01-bai-1` → 1). Đặt tên thư mục có số ở đầu là đủ dùng.

### Bài dạng ĐỀ trong phần lý thuyết

Thêm `"kind": "test"` vào `meta.json` thì bài đó là một **đề** chứ không phải bài lý
thuyết: file dữ liệu là `test.json` ([định dạng](n3-junbi/entrance-test/README.md)),
trang bài chỉ có nút bắt đầu, và bấm vào là sang màn hình làm đề — làm cả bài rồi nộp.

```json
{
  "name": "Đề thi thật ôn tập N4 · Nhiệm vụ 2",
  "kind": "test",
  "order": 2
}
```

Chỉ đặt được trong bốn phần có trang bài biết hiện khung "bắt đầu làm đề" — `grammar`,
`mimikara`, `vocabulary`, `kanji` — và `"test"` là giá trị DUY NHẤT được khai khác phần
học. Đặt vào phần khác thì script báo lỗi ngay, vì bài vẫn sinh ra được nhưng mở lên chỉ
thấy trang trống.

Vì sao cần: trên website Riki, "ĐỀ THI THẬT ÔN TẬP N4" là một bài nằm giữa các bài của
phần NGỮ PHÁP chứ không phải một phần riêng, nên nó phải nằm đúng chỗ ấy trong menu.

Sau khi thêm hoặc sửa nội dung:

```bash
npm run generate        # sinh lại public/content/<học phần>/
npm run generate:check  # chỉ kiểm tra, không ghi file
npm run generate:clean  # sinh lại và xoá file JSON không còn nguồn
```

## Bài giữ chỗ

Thư mục bài **chỉ có `meta.json`**, chưa có file dữ liệu, là một **bài giữ chỗ**: nó
vẫn xuất hiện trong danh sách với nhãn "Chưa có nội dung" và không bấm vào được.

Dùng cách này để đặt sẵn lộ trình của cả phần học rồi đổ nội dung vào sau — người
học nhìn thấy sắp học những mục nào ngay từ đầu. Hai mục Katakana, Phó từ của phần Từ
vựng N3 JUNBI đang ở trạng thái đó.

Lưu ý: chỉ thư mục KHÔNG có file dữ liệu nào mới được coi là giữ chỗ. Có file mà đặt
sai tên (`tuvung.text`, `grammar.txt`…) thì script báo lỗi — gõ nhầm tên file mà bị
hiểu thành "chưa có nội dung" thì cả bài biến mất trong im lặng.

Các bài `00-bai-mau` là bài mẫu để kiểm tra đường ống nội dung — xoá đi khi đã có
nội dung thật.
