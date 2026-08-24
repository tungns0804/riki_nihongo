/** Trộn mảng theo thuật toán Fisher-Yates. Không sửa mảng gốc. */
export function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Lấy ngẫu nhiên tối đa `count` phần tử khác nhau. */
export function pickRandom<T>(items: readonly T[], count: number): T[] {
  if (count <= 0) return [];
  return shuffle(items).slice(0, count);
}
