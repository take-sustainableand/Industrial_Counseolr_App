/**
 * 問題エンティティ（TypeScript規約：camelCase）
 */
export interface Question {
  id: number;
  chapter: number;
  chapterTitle: string;
  category: string;
  problemNo: number | null;
  problemPrompt: string | null;
  statementNo: number | null;
  statementText: string;
  answer: '○' | '×';
  explanation: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 問題エンティティ（データベーススキーマ：snake_case）
 * Supabaseからの直接レスポンス用
 */
export interface QuestionDB {
  id: number;
  chapter: number;
  chapter_title: string;
  chapter_name?: string; // 別名でも対応
  category: string;
  problem_no: number | null;
  problem_prompt: string | null;
  statement_no: number | null;
  statement_text: string;
  question_text?: string; // 別名でも対応
  answer: '○' | '×';
  correct_answer?: boolean; // CSV用の別形式
  explanation: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * 学習モードの種類
 */
export type StudyMode = 'random' | 'category' | 'weak' | 'bookmark';

/**
 * 問題（API レスポンス用）
 * Date型をstring型に変換したバージョン
 */
export interface QuestionResponse {
  id: number;
  chapter: number;
  chapterTitle: string;
  category: string;
  problemNo: number | null;
  problemPrompt: string | null;
  statementNo: number | null;
  statementText: string;
  answer: '○' | '×';
  explanation: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * 問題（API レスポンス用 snake_case版）
 */
export interface QuestionResponseDB {
  id: number;
  chapter: number;
  chapter_title: string;
  chapter_name?: string;
  category: string;
  problem_no: number | null;
  problem_prompt: string | null;
  statement_no: number | null;
  statement_text: string;
  question_text?: string;
  answer: '○' | '×';
  correct_answer?: boolean;
  explanation: string | null;
  created_at: string;
  updated_at: string;
}
