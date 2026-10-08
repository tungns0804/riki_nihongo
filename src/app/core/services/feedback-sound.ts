import { Injectable, computed, signal } from '@angular/core';

import type { IconName } from '../../features/shared/icon/icon';
import type { MessageKey } from '../i18n/messages';
import { readJson, writeJson } from './local-storage';

const STORAGE_KEY = 'riki:sound';

/**
 * Một nốt trong tiếng báo: tần số (Hz), thời điểm vang lên tính từ lúc bấm (giây)
 * và độ dài (giây).
 */
interface Tone {
  readonly freq: number;
  readonly at: number;
  readonly duration: number;
}

/**
 * Đỉnh âm lượng của mỗi nốt, trên thang 0..1 của Web Audio — lấy nguyên từ
 * minano_nihongo, nơi nó được đo so với giọng đọc từ vựng: RMS khoảng −21 dBFS, thấp
 * hơn giọng người chừng 7–8 dB. Nghe rõ, nhưng đủ êm để ôn bài ban đêm.
 *
 * Bản đầu bên đó để 0.06: với loa vặn nhỏ ban đêm thì không nghe thấy gì.
 */
const PEAK_GAIN = 0.2;

/**
 * Giữ ở đỉnh một lúc rồi mới tắt dần. Không có quãng giữ này thì hàm mũ tụt nửa
 * biên độ sau mỗi hơn chục mili giây, nốt nhạc chỉ còn là một tiếng "tích" — tai
 * chưa kịp nghe ra cao độ, cũng chưa kịp nghe ra là đúng hay sai.
 */
const HOLD = 0.04;

/** Quãng năm đi lên, nhẹ và sáng: E5 → B5. */
const CORRECT: readonly Tone[] = [
  { freq: 659.25, at: 0, duration: 0.18 },
  { freq: 987.77, at: 0.11, duration: 0.34 },
];

/**
 * Quãng ba thứ đi xuống: G4 → E♭4. Trầm hơn tiếng đúng nên không chói, mà đi
 * xuống thì tai hiểu ngay là hỏng, không cần nhìn màn hình.
 *
 * Không xuống thấp hơn nữa dù nghe càng dịu: loa laptop và loa điện thoại gần như
 * không phát nổi dưới ~250 Hz, âm báo sẽ biến mất đúng trên máy hay dùng nhất.
 */
const WRONG: readonly Tone[] = [
  { freq: 392.0, at: 0, duration: 0.16 },
  { freq: 311.13, at: 0.12, duration: 0.34 },
];

/** Thời gian lên tới đỉnh âm lượng; có dốc lên thì loa không "tạch" một cái. */
const ATTACK = 0.012;

/**
 * Tiếng báo đúng / sai khi chấm một câu — chép nguyên từ riki_N4, bên đó lấy từ
 * minano_nihongo.
 *
 * Vì sao tổng hợp bằng Web Audio chứ không phát file mp3:
 *  - Chúng vang lên sau mỗi câu trả lời, tức là hàng trăm lần mỗi buổi. Dựng bằng
 *    vài dao động hình sin thì không tải gì, không chờ gì, và không có lần đầu bị
 *    trễ vì mạng.
 *  - Sóng sin không có hoạ âm nên nghe tròn và êm — đúng thứ cần cho người ôn bài
 *    ban đêm; file thu sẵn muốn dịu như vậy thì phải đi tìm và nghe thử từng cái.
 */
@Injectable({ providedIn: 'root' })
export class FeedbackSound {
  private readonly enabledRef = signal(readJson<boolean>(STORAGE_KEY, true));

  readonly enabled = this.enabledRef.asReadonly();

  readonly icon = computed<IconName>(() => (this.enabledRef() ? 'volume' : 'volume-off'));
  readonly titleKey = computed<MessageKey>(() =>
    this.enabledRef() ? 'sound.turnOff' : 'sound.turnOn',
  );

  /**
   * Tạo trễ ở lần phát đầu tiên chứ không dựng sẵn lúc khởi động: trình duyệt chặn
   * AudioContext mở ra khi trang chưa có thao tác nào của người dùng, và Chrome ghi
   * hẳn một cảnh báo ra console. Tiếng báo đầu tiên luôn đi ngay sau một cú bấm
   * hoặc một phím Enter, nên ở đó thì mở được.
   */
  private context: AudioContext | null = null;

  /** Phát tiếng đúng hoặc sai theo kết quả chấm. */
  verdict(correct: boolean): void {
    this.play(correct ? CORRECT : WRONG);
  }

  /** Bật thì phát luôn tiếng đúng để nghe thử — không phải mò vào luyện tập mới biết. */
  toggle(): void {
    const next = !this.enabledRef();
    this.enabledRef.set(next);
    writeJson(STORAGE_KEY, next);
    if (next) this.play(CORRECT);
  }

  private play(tones: readonly Tone[]): void {
    if (!this.enabledRef()) return;

    const context = this.ensureContext();
    if (context === null) return;

    // Tab để lâu không đụng tới thì trình duyệt ngủ đông AudioContext; không đánh
    // thức thì mọi nốt sau đó phát vào hư không.
    if (context.state === 'suspended') void context.resume();

    const start = context.currentTime;
    for (const tone of tones) this.playTone(context, tone, start);
  }

  private playTone(context: AudioContext, tone: Tone, start: number): void {
    const at = start + tone.at;
    const end = at + tone.duration;

    const oscillator = context.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.value = tone.freq;

    // Đường bao âm lượng: dốc lên rất nhanh, giữ một chút, rồi tắt dần. Cắt phụt
    // một cái thì loa kêu "tạch", mà đó mới là tiếng khó chịu nhất chứ không phải
    // nốt nhạc. Tắt dần theo hàm mũ nghe tự nhiên như gõ chuông, nhưng hàm mũ không
    // bao giờ chạm 0 nên phải hạ xuống một giá trị rất nhỏ rồi mới dừng hẳn.
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.linearRampToValueAtTime(PEAK_GAIN, at + ATTACK);
    gain.gain.setValueAtTime(PEAK_GAIN, at + ATTACK + HOLD);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);

    oscillator.connect(gain).connect(context.destination);
    oscillator.start(at);
    oscillator.stop(end);
    // Nốt đã dứt là rác: nhả ra để hàng trăm lần chấm câu không bỏ lại hàng trăm nút.
    oscillator.addEventListener('ended', () => {
      oscillator.disconnect();
      gain.disconnect();
    });
  }

  private ensureContext(): AudioContext | null {
    if (this.context !== null) return this.context;
    if (typeof AudioContext === 'undefined') return null;

    try {
      this.context = new AudioContext();
    } catch {
      // Hết khe AudioContext, hoặc trình duyệt cấm — im lặng bỏ tiếng báo chứ
      // không được làm hỏng việc chấm câu.
      return null;
    }
    return this.context;
  }
}
