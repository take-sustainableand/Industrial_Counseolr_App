import type { StudyMode } from './question';

/**
 * 日別サマリー
 */
export interface DailySummary {
  userId: string;
  studyDate: Date;
  totalAnswers: number;
  correctCount: number;
  accuracy: number;
}

/**
 * 日別サマリー（API レスポンス用）
 */
export interface DailySummaryResponse {
  userId: string;
  studyDate: string;
  totalAnswers: number;
  correctCount: number;
  accuracy: number;
}

/**
 * 日別サマリー（データベース snake_case版）
 */
export interface DailySummaryDB {
  user_id: string;
  study_date: string;
  question_count: number;
  correct_count: number;
  accuracy?: number;
}

/**
 * 分野別正答率
 */
export interface CategoryAccuracy {
  userId: string;
  chapter: number;
  chapterTitle: string;
  totalAnswers: number;
  correctCount: number;
  accuracy: number;
}

/**
 * 分野別正答率（データベース snake_case版）
 */
export interface CategoryAccuracyDB {
  user_id?: string;
  chapter_id: string;
  chapter_name: string;
  question_count: number;
  correct_count: number;
  accuracy?: number;
}

/**
 * 今日のサマリー（シンプル版）
 */
export interface TodaySummary {
  totalAnswers: number;
  correctCount: number;
  accuracy: number;
}

/**
 * 今日のサマリー（データベース snake_case版）
 */
export interface TodaySummaryDB {
  question_count: number;
  correct_count: number;
  accuracy?: number;
}

/**
 * 回答済み問題（簡易版）
 */
export interface AnsweredQuestionSimple {
  questionId: number;
  isCorrect: boolean;
}

/**
 * 回答済み問題（詳細版 - 結果表示用）
 */
export interface AnsweredQuestion {
  isCorrect: boolean;
  question: {
    id: number;
    question_text: string;
    correct_answer: boolean;
    chapter_name?: string;
  };
}

/**
 * 学習セッション結果
 */
export interface SessionResult {
  mode: StudyMode;
  totalQuestions: number;
  correctCount: number;
  accuracy: number;
  incorrectQuestionIds: number[];
  answeredQuestions: AnsweredQuestion[];
}
