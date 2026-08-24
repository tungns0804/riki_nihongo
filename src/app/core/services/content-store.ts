import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import type { MessageKey } from '../i18n/messages';
import {
  ModuleId,
  Unit,
  UnitIndexEntry,
  countItems,
  isModuleId,
} from '../models/content.model';
import {
  sanitizeGrammarPoints,
  sanitizeKanji,
  sanitizeListeningTracks,
  sanitizeReadingPassages,
  sanitizeTestSections,
  sanitizeVocabulary,
  sanitizeUnitKind,
} from './content-sanitize';

const CONTENT_BASE = 'content/';

export type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';

/** Ghép đường dẫn tài nguyên theo <base href> để chạy đúng cả khi deploy vào thư mục con. */
function assetUrl(path: string): string {
  const base = typeof document !== 'undefined' && document.baseURI ? document.baseURI : '/';
  return new URL(path, base).href;
}

/**
 * Nguồn nội dung của khoá học.
 *
 * Tải `content/index.json` một lần rồi giữ lại; nội dung từng bài tải lười khi mở
 * bài đó và nhớ luôn cho lần sau. Danh mục nhẹ (vài KB) còn nội dung thì không:
 * một bài từ vựng 50 từ kèm ví dụ đã hơn 20KB, mà một phần có thể có vài chục bài.
 */
@Injectable({ providedIn: 'root' })
export class ContentStore {
  private readonly http = inject(HttpClient);

  private readonly entries = signal<UnitIndexEntry[]>([]);

  /** Nội dung bài đã tải, tránh gọi mạng lại khi quay lại cùng một bài. */
  private readonly loaded = new Map<string, Unit>();
  private indexRequest: Promise<void> | null = null;

  readonly status = signal<LoadStatus>('idle');
  /** Khoá thông điệp lỗi, để hiển thị theo ngôn ngữ đang chọn. */
  readonly errorKey = signal<MessageKey | null>(null);

  /** Toàn bộ danh mục, đã sắp theo `order` rồi tới tên. */
  readonly units = this.entries.asReadonly();

  /** Số bài của từng phần, kể cả bài mới đặt chỗ. */
  readonly countByModule = computed(() => countBy(this.entries()));

  /**
   * Số bài ĐÃ CÓ nội dung của từng phần.
   *
   * Tách khỏi con số trên vì hai câu hỏi khác nhau: "phần này gồm những bài gì" thì
   * đếm cả bài giữ chỗ, còn "học được bao nhiêu rồi" thì không. Trang chủ hiện cả hai.
   */
  readonly readyCountByModule = computed(() =>
    countBy(this.entries().filter((entry) => entry.itemCount > 0)),
  );

  readonly totalUnits = computed(() => this.entries().length);

  readonly totalReadyUnits = computed(
    () => this.entries().filter((entry) => entry.itemCount > 0).length,
  );

  /** Danh sách bài của một phần. */
  unitsOf(moduleId: ModuleId): UnitIndexEntry[] {
    return this.entries().filter((entry) => entry.moduleId === moduleId);
  }

  /** Tải `content/index.json`. Gọi nhiều lần chỉ thực sự chạy một lần. */
  loadIndex(force = false): Promise<void> {
    if (force) {
      this.indexRequest = null;
      this.loaded.clear();
    }
    this.indexRequest ??= this.fetchIndex();
    return this.indexRequest;
  }

  private async fetchIndex(): Promise<void> {
    this.status.set('loading');
    this.errorKey.set(null);

    try {
      const file = await firstValueFrom(
        this.http.get<unknown>(assetUrl(`${CONTENT_BASE}index.json`)),
      );
      this.entries.set(sanitizeIndex(file));
      this.status.set('ready');
    } catch {
      this.entries.set([]);
      this.status.set('error');
      this.errorKey.set('error.contentIndex');
    }
  }

  /** Lấy nội dung đầy đủ của một bài. Trả về null nếu không có bài đó. */
  async getUnit(moduleId: ModuleId, id: string): Promise<Unit | null> {
    await this.loadIndex();

    const cached = this.loaded.get(id);
    if (cached) return cached;

    const entry = this.entries().find(
      (item) => item.id === id && item.moduleId === moduleId,
    );
    if (!entry) return null;

    try {
      const raw = await firstValueFrom(
        this.http.get<unknown>(assetUrl(`${CONTENT_BASE}${entry.file}`)),
      );
      const unit = sanitizeUnit(raw, entry);
      if (!unit) return null;
      this.loaded.set(id, unit);
      return unit;
    } catch {
      return null;
    }
  }
}

/** Đếm số bài theo từng phần. */
function countBy(entries: readonly UnitIndexEntry[]): Record<ModuleId, number> {
  const result = {} as Record<ModuleId, number>;
  for (const entry of entries) {
    result[entry.moduleId] = (result[entry.moduleId] ?? 0) + 1;
  }
  return result;
}

/**
 * Đọc danh mục.
 *
 * Mọi trường đều được kiểm kiểu trước khi nhận: file trong `public/` có thể do
 * script sinh ra, do người dùng sửa tay, hoặc là bản cũ còn sót lại từ lần deploy
 * trước — một trường sai kiểu không được phép làm trắng cả trang.
 */
function sanitizeIndex(raw: unknown): UnitIndexEntry[] {
  const modules: unknown = (raw as { modules?: unknown } | null)?.modules;
  if (!Array.isArray(modules)) return [];

  const entries = modules.flatMap((group): UnitIndexEntry[] => {
    if (!group || typeof group !== 'object') return [];
    const { id, units } = group as Record<string, unknown>;
    if (!isModuleId(id) || !Array.isArray(units)) return [];

    return units.flatMap((item): UnitIndexEntry[] => {
      if (!item || typeof item !== 'object') return [];
      const entry = item as Record<string, unknown>;
      const unitId = entry['id'];
      const file = entry['file'];
      if (typeof unitId !== 'string' || !unitId) return [];
      if (typeof file !== 'string' || !file) return [];

      return [
        {
          id: unitId,
          moduleId: id,
          name: typeof entry['name'] === 'string' && entry['name'] ? (entry['name'] as string) : unitId,
          description: typeof entry['description'] === 'string' ? (entry['description'] as string) : '',
          kind: sanitizeUnitKind(entry['kind']),
          itemCount: typeof entry['itemCount'] === 'number' ? (entry['itemCount'] as number) : 0,
          order: typeof entry['order'] === 'number' ? (entry['order'] as number) : 0,
          file,
        },
      ];
    });
  });

  // Sắp một lần ở đây thay vì ở từng màn hình: mọi nơi hiện danh sách bài đều muốn
  // cùng một thứ tự, và thứ tự đó là thứ tự HỌC chứ không phải thứ tự chữ cái.
  return entries.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, 'vi'));
}

/** Đọc nội dung một bài, ghép với thông tin đã có sẵn trong danh mục. */
function sanitizeUnit(raw: unknown, entry: UnitIndexEntry): Unit | null {
  if (!raw || typeof raw !== 'object') return null;
  const data = raw as Record<string, unknown>;

  // Loại bài lấy theo DANH MỤC chứ không theo file nội dung: danh mục là thứ đã
  // quyết định bài này nằm ở phần nào, hai chỗ lệch nhau thì tin danh mục.
  const kind = entry.kind;

  const unit: Unit = {
    id: entry.id,
    moduleId: entry.moduleId,
    name: typeof data['name'] === 'string' && data['name'] ? (data['name'] as string) : entry.name,
    description:
      typeof data['description'] === 'string' ? (data['description'] as string) : entry.description,
    kind,
    itemCount: 0,
    order: entry.order,
    words: kind === 'vocabulary' ? sanitizeVocabulary(data['words']) : [],
    kanji: kind === 'kanji' ? sanitizeKanji(data['kanji']) : [],
    points: kind === 'grammar' ? sanitizeGrammarPoints(data['points']) : [],
    passages: kind === 'reading' ? sanitizeReadingPassages(data['passages']) : [],
    tracks: kind === 'listening' ? sanitizeListeningTracks(data['tracks']) : [],
    sections: kind === 'test' ? sanitizeTestSections(data['sections']) : [],
  };

  unit.itemCount = countItems(unit);
  // Bài rỗng vẫn trả về: màn hình chi tiết có khung "chưa có nội dung" riêng, còn
  // trả null thì người dùng chỉ thấy "không tìm thấy bài học" — sai nguyên nhân.
  return unit;
}
