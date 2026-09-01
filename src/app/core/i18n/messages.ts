/**
 * Toàn bộ chữ hiển thị của ứng dụng, hai ngôn ngữ đặt cạnh nhau để dễ soát.
 *
 * Quy ước:
 *  - Khoá đặt theo màn hình: `home.*`, `unit.*`, `practice.*`, `result.*`, `test.*`.
 *  - Khoá của bảy phần học đặt theo id module: `module.vocabulary.label`, …
 *    (xem `core/course/course.config.ts`).
 *  - Chỗ cần chèn giá trị dùng `{ten}`, ví dụ `Câu {current}/{total}`. Tên tham số
 *    phải GIỐNG NHAU ở cả hai ngôn ngữ — scripts/verify-i18n.mjs kiểm tra điều đó.
 *  - Vài khoá có vi và ja giống hệt nhau (N3, JUNBI…) là cố ý: đó là tên riêng,
 *    giữ nguyên ở cả hai ngôn ngữ.
 *
 * KHÔNG dịch nội dung bài học (nghĩa tiếng Việt của từ vựng) — đó là dữ liệu học,
 * không phải giao diện.
 */

export const LANGUAGES = ['vi', 'ja'] as const;
export type Language = (typeof LANGUAGES)[number];

export const LANGUAGE_NAME: Record<Language, string> = {
  vi: 'Tiếng Việt',
  ja: '日本語',
};

/** Nhãn ngắn hiện trên nút chuyển ngôn ngữ. */
export const LANGUAGE_SHORT: Record<Language, string> = {
  vi: 'VI',
  ja: '日本',
};

type Entry = { vi: string; ja: string };

export const MESSAGES = {
  // ── Chung ──────────────────────────────────────────────────────────────
  'common.retry': { vi: 'Thử lại', ja: '再試行' },
  'common.backHome': { vi: '← Về trang chủ', ja: '← ホームへ' },
  'common.backToList': { vi: '← Về danh sách', ja: '← 一覧へ' },
  'common.all': { vi: 'Tất cả', ja: 'すべて' },
  'common.loading': { vi: 'Đang tải…', ja: '読み込み中…' },

  // ── Vỏ ứng dụng ────────────────────────────────────────────────────────
  'app.name': { vi: 'Riki Nihongo', ja: 'Riki Nihongo' },
  'app.title': { vi: 'Riki Nihongo — N3 JUNBI', ja: 'Riki Nihongo — N3 JUNBI' },
  'app.tagline': {
    vi: 'Lộ trình chuẩn bị cho kỳ thi N3',
    ja: 'N3受験のための準備コース',
  },
  'app.nav': { vi: 'Điều hướng chính', ja: 'メインナビゲーション' },
  'app.language.switch': { vi: 'Chuyển sang {name}', ja: '{name}に切り替える' },
  'app.skipToContent': { vi: 'Tới nội dung chính', ja: 'メインコンテンツへ' },
  'app.backToTop': { vi: 'Lên đầu trang', ja: 'ページの先頭へ' },

  // ── Giao diện sáng/tối ─────────────────────────────────────────────────
  'theme.system': { vi: 'Tự động', ja: '自動' },
  'theme.light': { vi: 'Sáng', ja: 'ライト' },
  'theme.dark': { vi: 'Tối', ja: 'ダーク' },
  'theme.title': {
    vi: 'Giao diện: {current} — bấm để chuyển sang {next}',
    ja: 'テーマ: {current} — クリックで{next}に切り替え',
  },

  // ── Khoá học ───────────────────────────────────────────────────────────
  'course.name': { vi: 'N3 JUNBI', ja: 'N3 JUNBI' },

  // ── Bảy phần học ───────────────────────────────────────────────────────
  'module.entrance-test.label': { vi: 'Bài kiểm tra nhập môn N3', ja: 'N3入門テスト' },
  'module.entrance-test.short': { vi: 'Kiểm tra', ja: 'テスト' },
  'module.entrance-test.desc': {
    vi: 'Đo trình độ trước khi vào khoá: từ vựng, kanji, ngữ pháp, đọc và nghe.',
    ja: '受講前の実力診断：語彙・漢字・文法・読解・聴解。',
  },
  'module.entrance-test.unit': { vi: '{count} đề', ja: '{count}回分' },

  'module.vocabulary.label': { vi: 'Từ vựng', ja: '語彙' },
  'module.vocabulary.short': { vi: 'Từ vựng', ja: '語彙' },
  'module.vocabulary.desc': {
    vi: 'Từ vựng N3 chia theo loại từ, kèm cách đọc, nghĩa, câu ví dụ và ghi chú cách dùng.',
    ja: 'N3語彙を品詞別に。読み方・意味・例文・使い方つき。',
  },
  // Đơn vị của phần này là NHÓM TỪ (danh từ, động từ…) chứ không phải bài học:
  // một nhóm gom hết từ cùng loại của cả khoá.
  'module.vocabulary.unit': { vi: '{count} nhóm từ', ja: '{count}グループ' },

  'module.kanji.label': { vi: 'KANJI', ja: '漢字' },
  'module.kanji.short': { vi: 'Kanji', ja: '漢字' },
  'module.kanji.desc': {
    vi: 'Chữ Hán N3: âm On, âm Kun, âm Hán Việt, số nét và từ ghép thường gặp.',
    ja: 'N3漢字：音読み・訓読み・漢越音・画数・よく出る熟語。',
  },
  'module.kanji.unit': { vi: '{count} bài', ja: '{count}課' },

  'module.grammar.label': { vi: 'Ngữ pháp', ja: '文法' },
  'module.grammar.short': { vi: 'Ngữ pháp', ja: '文法' },
  'module.grammar.desc': {
    vi: 'Mẫu ngữ pháp N3: công thức, cách dùng và ví dụ cho từng cách dùng.',
    ja: 'N3文法：接続の形・用法・用法ごとの例文。',
  },
  'module.grammar.unit': { vi: '{count} bài', ja: '{count}課' },

  'module.reading.label': { vi: 'Đọc hiểu', ja: '読解' },
  'module.reading.short': { vi: 'Đọc hiểu', ja: '読解' },
  'module.reading.desc': {
    vi: 'Bài đọc theo độ dài tăng dần, kèm câu hỏi và từ vựng của bài.',
    ja: '短文から長文へ。設問と本文語彙つき。',
  },
  'module.reading.unit': { vi: '{count} bài đọc', ja: '{count}本' },

  'module.listening.label': { vi: 'Nghe hiểu', ja: '聴解' },
  'module.listening.short': { vi: 'Nghe hiểu', ja: '聴解' },
  'module.listening.desc': {
    vi: 'Bài nghe kèm câu hỏi, lời thoại hiện ra sau khi đã trả lời.',
    ja: '設問つきの聴解。スクリプトは解答後に表示。',
  },
  'module.listening.unit': { vi: '{count} bài nghe', ja: '{count}本' },

  'module.mimikara.label': { vi: 'Ngữ pháp MIMIKARA OBOERU', ja: '文法 みみから覚える' },
  'module.mimikara.short': { vi: 'Mimikara', ja: 'みみから' },
  'module.mimikara.desc': {
    vi: 'Ngữ pháp theo giáo trình 耳から覚える, học qua mẫu câu và âm thanh.',
    ja: '『耳から覚える』に沿った文法。例文と音声で覚える。',
  },
  'module.mimikara.unit': { vi: '{count} bài', ja: '{count}課' },

  // ── Trang chủ ──────────────────────────────────────────────────────────
  'home.title': { vi: 'Khoá N3 JUNBI', ja: 'N3 JUNBI コース' },
  'home.subtitle': {
    vi: 'Chọn một phần để bắt đầu. Mỗi phần có danh sách bài riêng và chế độ luyện tập riêng.',
    ja: 'パートを選んで始めましょう。各パートに独自のレッスン一覧と練習モードがあります。',
  },
  'home.moduleCount': { vi: '{count} phần học', ja: '{count}パート' },
  'home.unitCount': { vi: '{count} bài', ja: '{count}課' },
  'home.studiedCount': { vi: 'Đã luyện {count} bài', ja: '{count}課 練習済み' },
  'home.pending': { vi: 'Chưa nạp nội dung', ja: '教材未登録' },
  'home.empty.title': { vi: 'Khoá học chưa có nội dung', ja: 'まだ教材がありません' },
  'home.empty.text': {
    vi: 'Cấu trúc đã dựng xong. Đặt bài học vào thư mục data-source/ rồi chạy npm run generate để nạp nội dung vào trang.',
    ja: '構成は完成しています。data-source/ に教材を置き、npm run generate を実行してください。',
  },

  // ── Danh sách bài của một phần ─────────────────────────────────────────
  'unit.count': { vi: '{count} bài', ja: '{count}課' },
  'unit.itemCount': { vi: '{count} mục', ja: '{count}項目' },
  'unit.search': { vi: 'Tìm bài…', ja: 'レッスンを検索…' },
  'unit.search.aria': { vi: 'Tìm bài trong phần này', ja: 'このパート内でレッスンを検索' },
  'unit.search.clear': { vi: 'Xoá từ khoá', ja: 'キーワードを消す' },
  'unit.noMatch.title': {
    vi: 'Không có bài nào khớp {term}',
    ja: '{term} に一致するレッスンはありません',
  },
  'unit.noMatch.text': {
    vi: 'Thử một từ khoá ngắn hơn, hoặc xoá từ khoá để xem lại toàn bộ.',
    ja: 'キーワードを短くするか、消して全件を表示してください。',
  },
  'unit.noMatch.reset': { vi: 'Xoá bộ lọc', ja: 'フィルターを消す' },
  'unit.empty.title': { vi: 'Phần này chưa có bài nào', ja: 'このパートにはまだレッスンがありません' },
  'unit.empty.text': {
    vi: 'Thêm thư mục bài vào data-source/{folder}/ rồi chạy npm run generate.',
    ja: 'data-source/{folder}/ にレッスンを追加して npm run generate を実行してください。',
  },
  'unit.notFound': { vi: 'Không tìm thấy bài học', ja: 'レッスンが見つかりません' },
  'unit.pending': { vi: 'Chưa có nội dung', ja: '教材未登録' },
  'unit.pendingCount': { vi: '{count} bài đang chờ nội dung', ja: '{count}課は教材待ち' },
  'unit.progress': { vi: 'Kết quả tốt nhất: {percent}%', ja: '最高スコア：{percent}%' },

  // ── Danh sách từ trong một bài ─────────────────────────────────────────
  'vocab.search': { vi: 'Tìm từ, cách đọc hoặc nghĩa…', ja: '単語・読み方・意味で検索…' },
  'vocab.search.aria': { vi: 'Tìm từ trong bài này', ja: 'この課の単語を検索' },
  'vocab.shown': { vi: 'Hiện {shown}/{total} từ', ja: '{total}語中{shown}語' },
  'vocab.group': { vi: 'Cụm {name}', ja: 'グループ {name}' },
  'vocab.noMatch': {
    vi: 'Không có từ nào khớp {term}',
    ja: '{term} に一致する単語はありません',
  },

  // ── Kanji ──────────────────────────────────────────────────────────────
  'kanji.onyomi': { vi: 'Âm On', ja: '音読み' },
  'kanji.kunyomi': { vi: 'Âm Kun', ja: '訓読み' },
  'kanji.strokes': { vi: '{count} nét', ja: '{count}画' },
  'kanji.words': { vi: 'Từ ghép', ja: '熟語' },

  // ── Ngữ pháp (dùng chung cho cả Mimikara) ──────────────────────────────
  'grammar.structure': { vi: 'Công thức', ja: '接続' },
  'grammar.notes': { vi: 'Lưu ý', ja: '注意' },
  'grammar.toc': { vi: 'Mục lục', ja: '目次' },

  // ── Đọc hiểu ───────────────────────────────────────────────────────────
  'reading.passage': { vi: 'Bài đọc', ja: '本文' },
  'reading.questions': { vi: 'Câu hỏi', ja: '設問' },
  'reading.vocabulary': { vi: 'Từ vựng trong bài', ja: '本文語彙' },
  'reading.showTranslation': { vi: 'Hiện bản dịch', ja: '翻訳を表示' },
  'reading.hideTranslation': { vi: 'Ẩn bản dịch', ja: '翻訳を隠す' },

  // ── Nghe hiểu ──────────────────────────────────────────────────────────
  'listening.script': { vi: 'Lời thoại', ja: 'スクリプト' },
  'listening.showScript': { vi: 'Hiện lời thoại', ja: 'スクリプトを表示' },
  'listening.hideScript': { vi: 'Ẩn lời thoại', ja: 'スクリプトを隠す' },
  'listening.noAudio': {
    vi: 'Bài này chưa có file âm thanh.',
    ja: 'この課には音声ファイルがまだありません。',
  },

  // ── Bài kiểm tra nhập môn ──────────────────────────────────────────────
  'test.subtitle': {
    vi: 'Làm một lượt để biết mình đang ở đâu trước khi vào khoá. Kết quả chấm theo từng kỹ năng.',
    ja: '受講前に一度解いて現在地を確認しましょう。技能別に採点されます。',
  },
  'test.questionCount': { vi: '{count} câu', ja: '{count}問' },
  'test.start': { vi: 'Bắt đầu làm bài', ja: 'テストを始める' },
  'test.empty.title': { vi: 'Chưa có đề kiểm tra', ja: 'テストがまだありません' },
  'test.empty.text': {
    vi: 'Đặt đề vào data-source/entrance-test/ rồi chạy npm run generate.',
    ja: 'data-source/entrance-test/ に問題を置き、npm run generate を実行してください。',
  },

  // ── Luyện tập ──────────────────────────────────────────────────────────
  'practice.setup': { vi: 'Thiết lập luyện tập', ja: '練習の設定' },
  'practice.mode': { vi: 'Kiểu trả lời', ja: '解答方式' },
  'practice.mode.choice': { vi: 'Trắc nghiệm', ja: '選択式' },
  'practice.mode.typing': { vi: 'Gõ đáp án', ja: '入力式' },
  'practice.direction': { vi: 'Chiều hỏi', ja: '出題の向き' },
  'practice.direction.jpToVi': { vi: 'Nhật → Việt', ja: '日本語 → ベトナム語' },
  'practice.direction.viToJp': { vi: 'Việt → Nhật', ja: 'ベトナム語 → 日本語' },
  'practice.direction.jpToReading': { vi: 'Nhật → Cách đọc', ja: '日本語 → 読み方' },
  'practice.group': { vi: 'Cụm từ', ja: 'グループ' },
  'practice.count': { vi: 'Số câu', ja: '問題数' },
  'practice.start': { vi: 'Bắt đầu luyện', ja: '練習を始める' },
  'practice.progress': { vi: 'Câu {current}/{total}', ja: '{current}/{total}問' },
  'practice.check': { vi: 'Kiểm tra', ja: '答え合わせ' },
  'practice.next': { vi: 'Câu tiếp theo', ja: '次の問題' },
  'practice.finish': { vi: 'Xem kết quả', ja: '結果を見る' },
  'practice.correct': { vi: 'Chính xác', ja: '正解' },
  'practice.wrong': { vi: 'Chưa đúng', ja: '不正解' },
  'practice.answerWas': { vi: 'Đáp án: {answer}', ja: '正解：{answer}' },
  'practice.typeHere': { vi: 'Gõ đáp án rồi nhấn Enter', ja: '答えを入力して Enter' },
  'practice.quit': { vi: 'Dừng luyện', ja: '練習をやめる' },
  'practice.noQuestion': {
    vi: 'Không dựng được câu hỏi nào từ bài này.',
    ja: 'この課からは問題を作れませんでした。',
  },

  // ── Kết quả ────────────────────────────────────────────────────────────
  'result.percent': { vi: '{percent}%', ja: '{percent}%' },
  'result.score': { vi: '{correct}/{total} câu đúng', ja: '{total}問中{correct}問正解' },
  'result.again': { vi: 'Luyện lại', ja: 'もう一度' },
  'result.review': { vi: 'Xem lại từng câu', ja: '問題を振り返る' },
  'result.yourAnswer': { vi: 'Bạn trả lời: {answer}', ja: 'あなたの解答：{answer}' },
  'result.skipped': { vi: 'Bỏ qua', ja: '未解答' },
  'result.bySkill': { vi: 'Theo kỹ năng', ja: '技能別' },

  // ── Lỗi ────────────────────────────────────────────────────────────────
  'error.contentIndex': {
    vi: 'Không tải được danh mục nội dung. Kiểm tra kết nối rồi thử lại.',
    ja: '教材の目次を読み込めませんでした。接続を確認して再試行してください。',
  },
  'error.unitNotFound': {
    vi: 'Bài học không tồn tại hoặc đã bị đổi tên.',
    ja: 'レッスンが存在しないか、名前が変更されています。',
  },

  // ── Tiêu đề tab trình duyệt ────────────────────────────────────────────
  'route.test': { vi: 'Kiểm tra nhập môn', ja: '入門テスト' },
  'route.unit': { vi: 'Bài học', ja: 'レッスン' },
  'route.practice': { vi: 'Luyện tập', ja: '練習' },
  'route.result': { vi: 'Kết quả', ja: '結果' },
} as const satisfies Record<string, Entry>;

export type MessageKey = keyof typeof MESSAGES;
