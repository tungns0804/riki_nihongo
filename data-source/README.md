# data-source — nguồn nội dung của khoá N3 JUNBI

Mỗi thư mục con ở đây là MỘT phần học, đúng bảy phần của khoá:

| Thư mục         | Phần học                      | File dữ liệu                          |
| --------------- | ----------------------------- | ------------------------------------- |
| `entrance-test` | Bài kiểm tra nhập môn N3      | `test.json` (hoặc `de.json`)          |
| `vocabulary`    | Từ vựng                       | `vocabulary.txt` (hoặc `tu-vung.txt`) |
| `kanji`         | KANJI                         | `kanji.txt` (hoặc `chu-han.txt`)      |
| `grammar`       | Ngữ pháp                      | `grammar.json` (hoặc `ngu-phap.json`) |
| `reading`       | Đọc hiểu                      | `reading.json` (hoặc `doc-hieu.json`) |
| `listening`     | Nghe hiểu                     | `listening.json` (hoặc `nghe-hieu.json`) |
| `mimikara`      | Ngữ pháp MIMIKARA OBOERU      | `grammar.json`                        |

Trong mỗi phần, mỗi thư mục con là MỘT bài:

```
data-source/vocabulary/01-bai-1/
├── meta.json        (tuỳ chọn) tên hiển thị, mô tả, thứ tự
└── vocabulary.txt   nội dung bài
```

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

Sau khi thêm hoặc sửa nội dung:

```bash
npm run generate        # sinh lại public/content/
npm run generate:check  # chỉ kiểm tra, không ghi file
npm run generate:clean  # sinh lại và xoá file JSON không còn nguồn
```

Định dạng chi tiết của từng loại nằm trong `README.md` của chính thư mục phần học.

## Bài giữ chỗ

Thư mục bài **chỉ có `meta.json`**, chưa có file dữ liệu, là một **bài giữ chỗ**: nó
vẫn xuất hiện trong danh sách với nhãn "Chưa có nội dung" và không bấm vào được.

Dùng cách này để đặt sẵn lộ trình của cả phần học rồi đổ nội dung vào sau — người
học nhìn thấy sắp học những bài gì ngay từ đầu. Phần "Từ vựng" hiện đang ở trạng
thái đó: 11 bài từ `01-danh-tu-1` tới `11-pho-tu-2` mới có `meta.json`.

Lưu ý: chỉ thư mục KHÔNG có file dữ liệu nào mới được coi là giữ chỗ. Có file mà đặt
sai tên (`tuvung.text`, `grammar.txt`…) thì script báo lỗi — gõ nhầm tên file mà bị
hiểu thành "chưa có nội dung" thì cả bài biến mất trong im lặng.

Các bài `00-bai-mau` là bài mẫu để kiểm tra đường ống nội dung — xoá đi khi đã có
nội dung thật.
