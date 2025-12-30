/**
 * 回答履歴エンティティ
 */
export interface AnswerHistory {
  id: string;
  userId: string;
  questionId: number;
  isCorrect: boolean;
  answeredAt: Date;
}

/**
 * 回答履歴（API レスポンス用）
 */
export interface AnswerHistoryResponse {
  id: string;
  userId: string;
  questionId: number;
  isCorrect: boolean;
  answeredAt: string;
}

/**
 * 回答記録リクエスト
 */
export interface RecordAnswerRequest {
  questionId: number;
  isCorrect: boolean;
}
