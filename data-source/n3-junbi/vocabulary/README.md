# Định dạng bài từ vựng

File `vocabulary.txt`. Mỗi từ là một KHỐI: một dòng tiêu đề, rồi các dòng ví dụ và
ghi chú của chính từ đó.

```
101. 判 (はん) = Con dấu
・書類に判を押す。| Đóng dấu vào giấy tờ.
合: 判子を押す (はんこをおす) = Đóng dấu
類: 判子 (はんこ)・印 (いん)・印鑑 (いんかん)
```

Bốn loại dòng:

| Dòng | Cách viết | Ghi chú |
| --- | --- | --- |
| **Mốc cụm** | `## 01–10` | Áp cho mọi từ phía sau, tới mốc kế tiếp |
| **Tiêu đề** | `[SỐ.] TỪ (CÁCH ĐỌC) = NGHĨA` | Bắt đầu một từ mới |
| **Ví dụ** | bắt đầu bằng `・` hoặc `-` | Bản dịch viết sau dấu `\|`, tuỳ chọn |
| **Cách đọc câu** | `読: <kana>` | Thuộc về câu ví dụ ngay phía trên |
| **Ngữ pháp câu** | `文法: <mẫu>` | Thuộc về câu ví dụ ngay phía trên |
| **Ghi chú** | `NHÃN : nội dung` | Nhãn giữ nguyên như trong sách |

## Ba dòng phụ của một câu ví dụ

```
・上司に[相談]してから決定する。| Bàn với sếp rồi mới quyết định.
読: じょうしにそうだんしてからけっていする。
文法: ～てから = sau khi ~ (việc trước xong mới tới việc sau)
```

- **Bản dịch** viết ngay trên dòng câu, sau dấu `|`.
- **`読:`** là cách đọc CẢ CÂU bằng kana, không phải chỉ chú âm vài chữ khó như bản in:
  đọc trôi được cả câu mới là đọc được. Viết y như phần Ngữ pháp đang làm. Dòng này còn
  sót chữ Hán thì `npm run generate` báo cảnh báo — chép thiếu là lỗi im lặng, câu vẫn
  hiện bình thường.
- **`文法:`** chỉ ra mẫu ngữ pháp dùng trong câu. Tài liệu 文字語彙 chỉ dạy từ, nên câu ví
  dụ hay dùng mẫu người học chưa gặp (`～た方がいい`, `～そうだ`, `～ておく`) — biết nghĩa
  từng từ mà không biết mẫu thì vẫn không hiểu câu. Câu không có mẫu nào đáng chú thì bỏ
  dòng này.

Hai nhãn `読` và `文法` được DÀNH RIÊNG cho câu ví dụ: mọi nhãn khác (`合`, `対`, `関`…)
thuộc về TỪ, mà trong file chúng cũng viết sau các câu ví dụ nên không phân biệt được
bằng vị trí. Giáo trình không dùng hai nhãn này làm ghi chú của từ.

Ba dòng phụ hiện ở cả bảng từ của trang bài lẫn danh sách câu ví dụ sau khi chấm trong
màn hình luyện tập.

## Cụm từ

Giáo trình chia mỗi buổi 10 từ, và bài tập cũng ra theo đúng cụm đó. Đánh dấu cụm
bằng dòng `##`:

```
# nguồn: bai-12-tu-vung-cai-thien-11-20.pdf
## 11–20
11. 友人 (ゆうじん) = HỮU NHÂN ; Bạn bè
...
```

Trên giao diện, cụm thành một hàng nút trong khung thiết lập luyện tập: bấm `11–20`
là danh sách chỉ còn 10 từ đó và phần luyện tập cũng chỉ hỏi trong 10 từ đó — kể cả
ba đáp án nhiễu của câu trắc nghiệm cũng lấy trong cụm, để không chọn đúng chỉ nhờ
loại trừ những từ chưa học.

Bài không có dòng `##` nào thì không chia cụm, hàng nút này tự ẩn.

### Chủ đề của cụm

Sau nhãn cụm có thể viết chủ đề, ngăn bằng dấu `=`:

```
# nguồn: bai-142-tu-vung-cai-thien-266-273.pdf
## 266–273 = Bài 14.2 · Cảm giác, cảm xúc và tính cách
```

Chỉ cần MỘT cụm có chủ đề là đầu trang bài hiện bảng **Tóm tắt bài**: mỗi cụm một hàng
gồm nút cụm, chủ đề và các mặt chữ của cụm — mở bài ra là biết bài học về gì. Bảng không
kèm nghĩa, vì nghĩa đã nằm trong bảng từ ngay bên dưới. Bấm nút cụm trong bảng cũng chọn
cụm đó cho danh sách và khung luyện tập. Bài không cụm nào có chủ đề (Động từ) thì không
hiện bảng, vì bảng chỉ lặp lại danh sách từ.

- **Số thứ tự** là số của từ trong giáo trình (01–120). Bỏ trống cũng được, nhưng có
  số thì đối chiếu với bản PDF nhanh hơn nhiều.
- **Cách đọc** viết trong ngoặc, tuỳ chọn — từ katakana hay từ thuần kana thì bỏ.
- **Nhiều nghĩa** ngăn nhau bằng `/`: `= Cao nhất/ Tuyệt nhất/ Rất`. Khi luyện gõ,
  đúng MỘT nghĩa là được.
- **Âm Hán Việt** (nếu có) viết trước nghĩa, ngăn bằng dấu `;`:
  `1. 締め切り (しめきり) = ĐẾ THIẾT ; hạn chót/ kỳ hạn`
- **Nhãn ghi chú** dùng đúng ký hiệu của giáo trình: `合` từ ghép · `対` trái nghĩa ·
  `関` từ liên quan · `連` cách nói đi kèm · `類` từ đồng nghĩa · `使い方` / `使い分け`
  cách dùng và phân biệt. Nhãn nào cũng được, không cần khai báo trước.
- Dòng bắt đầu bằng `#` là ghi chú của file, bị bỏ qua.

Một từ có thể có nhiều dòng ví dụ và nhiều dòng ghi chú, mỗi thứ một dòng. Giao diện
hiện từ ở cột trái, ví dụ và ghi chú ở cột phải — cùng bố cục với bản PDF.

## Động từ

Động từ cần thêm ba cách viết:

```
127. (が)倒れる (たおれる) = ĐẢO ; Đổ/ Ngất, bất tỉnh/ Đổ bệnh
・台風で木が[倒れた]。
・父は働きすぎて[倒れて]しまった。

129. (が)起きる/起こる (おきる/おこる) = KHỞI ; Thức dậy/ Thức/ Xảy ra
・最近なかなかやる気が[起きない]・[起こらない]。
```

- **`[ ]` trong câu ví dụ** đánh dấu dạng của từ trong câu — chữ in đỏ gạch chân của
  sách. Động từ trong câu gần như không bao giờ đứng ở dạng từ điển (`渇く` nhưng câu
  viết `のどが渇いた`), nên máy không tự tìm được chỗ đó. Chỗ đánh dấu được tô trong
  danh sách, và là chỗ bị khoét ở chiều luyện **Điền từ vào câu**: đáp án là đúng dạng
  trong câu (`渇いた`), gõ cách đọc (`かわいた`) cũng tính đúng.
- Câu **không** có `[ ]` thì tự tìm nguyên mặt chữ trong câu — đủ cho danh từ. Không
  thấy thì câu vẫn hiện, chỉ không tô và không khoét.
- Câu đánh dấu **hai chỗ** được tô cả hai nhưng không đem khoét: khoét một chỗ thì
  chỗ kia đọc lộ đáp án.
- **`(が)` / `(を)`** trước mặt chữ là trợ từ đi kèm — cách sách phân biệt tự động từ
  với tha động từ. Nó hiện nhỏ trước mặt chữ và trong câu hỏi, nhưng không phải gõ khi
  trả lời.
- **Nhiều mặt chữ cho một mục** (`起きる/起こる`) ngăn bằng `/`, cách đọc cũng ngăn như
  vậy và theo đúng thứ tự. Gõ một trong hai là đúng.

## Tính từ

Tính từ cũng đánh dấu `[ ]` trong câu như động từ — tính từ đổi đuôi theo chỗ đứng
(`幸せな一生` / `幸せに暮らす` / `私は幸せだ`) — thêm hai quy ước:

```
259. 幸せな (しあわせな) = HẠNH ; Hạnh phúc
・[幸せに]暮らす。

260. 得意な (とくいな) = ĐẮC Ý ; Giỏi/ Tự hào
# 意味① Giỏi: ba câu đầu. 意味② Tự hào: câu cuối.
```

- **Mặt chữ giữ đuôi `な`** như sách in, và **cách đọc cũng viết kèm đuôi**: `しあわせな`,
  không phải `しあわせ`. Cách đọc của dạng trong câu suy ra bằng cách thay phần kana cuối
  của mặt chữ, nên cách đọc phải kết thúc bằng đúng phần kana đó. Viết `幸せな (しあわせ)`
  thì không suy được, và gõ `しあわせに` vào chỗ trống sẽ bị chấm sai.
- **Nhiều nghĩa (意味①②③)** viết theo thứ tự, ngăn bằng `/`. Giao diện hiện ví dụ thành
  một danh sách liền, nên câu nào thuộc nghĩa nào thì ghi bằng dòng `#` ngay trên.

## Các bài của phần Từ vựng

Danh sách bài chép đúng danh sách trên web Riki: mỗi bài là MỘT LOẠI TỪ và không tự
tách một bài của Riki thành nhiều phần đánh số. Riki mở bài mới khi giáo trình quay lại
một loại từ đã học, nên phần này có cả "Danh từ" (01–120) lẫn "Danh từ 2" (311–318) —
đó là hai bài của Riki chứ không phải một bài bị cắt đôi.

| Thư mục        | Tên hiển thị | Trạng thái |
| -------------- | ------------ | ---------- |
| `01-danh-tu`   | Danh từ      | 120 từ · 第1課–第6課 (01–120), chia 12 cụm 10 từ, có chủ đề |
| `02-dong-tu`   | Động từ      | 20 từ · 第7課 (121–140), chia 2 cụm 10 từ |
| `03-tinh-tu`   | Tính từ      | 34 từ · 第14課 (259–280) chia 3 cụm 259–265 (bài 14.1), 266–273 (bài 14.2), 274–280 (bài 14.3); thêm cụm 299–310 (sáu cặp tự/tha động từ sinh ra từ tính từ), có chủ đề |
| `04-katakana`  | Katakana     | chờ nội dung |
| `05-pho-tu`    | Phó từ       | chờ nội dung |
| `06-danh-tu-2` | Danh từ 2    | 8 từ · 311–318, một cụm "Chăm sóc, biết ơn và phép xã giao", có chủ đề |

Thêm nội dung cho một bài = đặt file `vocabulary.txt` vào đúng thư mục của bài đó rồi
chạy `npm run generate`. Động từ mới của 第8課 trở đi thì viết nối vào cuối
`02-dong-tu/vocabulary.txt`, kèm mốc cụm `##` mới. Không phải sửa gì trong mã nguồn.
