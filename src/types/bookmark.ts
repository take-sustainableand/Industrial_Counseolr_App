/**
 * ブックマークエンティティ
 */
export interface Bookmark {
  id: string;
  userId: string;
  questionId: number;
  createdAt: Date;
}

/**
 * ブックマーク（API レスポンス用）
 */
export interface BookmarkResponse {
  id: string;
  userId: string;
  questionId: number;
  createdAt: string;
}

/**
 * ブックマーク追加リクエスト
 */
export interface AddBookmarkRequest {
  questionId: number;
}
