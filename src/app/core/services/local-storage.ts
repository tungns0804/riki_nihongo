/**
 * Bọc localStorage để không bao giờ làm sập ứng dụng khi trình duyệt chặn
 * (chế độ ẩn danh, quota đầy, cookie bị tắt...).
 */

function storage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

export function readJson<T>(key: string, fallback: T): T {
  const store = storage();
  if (!store) return fallback;
  try {
    const raw = store.getItem(key);
    if (raw === null) return fallback;
    const parsed = JSON.parse(raw) as T;
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown): boolean {
  const store = storage();
  if (!store) return false;
  try {
    store.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeKey(key: string): void {
  const store = storage();
  if (!store) return;
  try {
    store.removeItem(key);
  } catch {
    /* bỏ qua */
  }
}
