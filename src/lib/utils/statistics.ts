/**
 * 正答率を計算する
 *
 * @param correct - 正解数
 * @param total - 総回答数
 * @returns 正答率（パーセント）。0問の場合は0を返す
 *
 * @example
 * ```typescript
 * calculateAccuracy(8, 10) // => 80
 * calculateAccuracy(1, 3)  // => 33.3
 * calculateAccuracy(0, 0)  // => 0
 * ```
 */
export function calculateAccuracy(correct: number, total: number): number {
  if (total === 0) return 0;
  const accuracy = (correct / total) * 100;
  // 小数点第1位まで四捨五入
  return Math.round(accuracy * 10) / 10;
}

/**
 * ランダムに要素をシャッフルする（Fisher-Yates アルゴリズム）
 *
 * @param array - シャッフル対象の配列
 * @returns シャッフルされた新しい配列
 */
export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * 配列からランダムに指定数の要素を取得する
 *
 * @param array - 元の配列
 * @param count - 取得する要素数
 * @returns ランダムに選択された要素の配列
 */
export function getRandomItems<T>(array: T[], count: number): T[] {
  return shuffle(array).slice(0, count);
}
