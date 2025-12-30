import type { QuestionResponse } from './question';
import type { BookmarkResponse } from './bookmark';
import type { TodaySummary, CategoryAccuracy, DailySummaryResponse } from './stats';

/**
 * API エラーレスポンス
 */
export interface ApiError {
  error: string;
  field?: string;
  details?: unknown;
}

/**
 * 問題取得レスポンス
 */
export interface GetQuestionsResponse {
  questions: QuestionResponse[];
}

/**
 * 回答記録レスポンス
 */
export interface RecordAnswerResponse {
  id: string;
  questionId: number;
  isCorrect: boolean;
  answeredAt: string;
}

/**
 * ブックマーク一覧レスポンス
 */
export interface GetBookmarksResponse {
  bookmarks: BookmarkResponse[];
}

/**
 * 今日のサマリーレスポンス
 */
export type GetTodaySummaryResponse = TodaySummary;

/**
 * 分野別正答率レスポンス
 */
export interface GetCategoryStatsResponse {
  categories: CategoryAccuracy[];
}

/**
 * 日別履歴レスポンス
 */
export interface GetDailyStatsResponse {
  daily: DailySummaryResponse[];
}

/**
 * CSVアップロード結果レスポンス
 */
export interface UploadQuestionsResponse {
  added: number;
  updated: number;
  errors: Array<{
    row: number;
    message: string;
  }>;
}

/**
 * マジックリンク送信レスポンス
 */
export interface MagicLinkResponse {
  message: string;
}
