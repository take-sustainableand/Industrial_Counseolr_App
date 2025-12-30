/**
 * 正答率をパーセント形式でフォーマットする
 *
 * @param accuracy - 正答率（数値）
 * @returns フォーマットされた文字列（例: "80%"）
 */
export function formatAccuracy(accuracy: number): string {
  return `${accuracy}%`;
}

/**
 * 日付を日本語形式でフォーマットする
 *
 * @param date - 日付
 * @returns フォーマットされた文字列（例: "1月15日"）
 */
export function formatDateJa(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}月${day}日`;
}

/**
 * 日付をISO形式（YYYY-MM-DD）でフォーマットする
 *
 * @param date - 日付
 * @returns フォーマットされた文字列（例: "2025-01-15"）
 */
export function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 問題数をフォーマットする
 *
 * @param count - 問題数
 * @returns フォーマットされた文字列（例: "10問"）
 */
export function formatQuestionCount(count: number): string {
  return `${count}問`;
}

/**
 * 進捗をフォーマットする
 *
 * @param current - 現在の番号
 * @param total - 全体の数
 * @returns フォーマットされた文字列（例: "3 / 10"）
 */
export function formatProgress(current: number, total: number): string {
  return `${current} / ${total}`;
}
