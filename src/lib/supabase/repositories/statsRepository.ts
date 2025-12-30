import { createClient } from '../server';
import type { TodaySummary, CategoryAccuracy, DailySummaryResponse } from '@/types';

/**
 * 今日の学習サマリーを取得する
 */
export async function getTodaySummary(userId: string): Promise<TodaySummary> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('get_today_summary', {
    p_user_id: userId,
  });

  if (error) throw error;

  const row = data?.[0];
  if (!row) {
    return {
      totalAnswers: 0,
      correctCount: 0,
      accuracy: 0,
    };
  }

  return {
    totalAnswers: Number(row.total_answers),
    correctCount: Number(row.correct_count),
    accuracy: Number(row.accuracy),
  };
}

/**
 * 分野別正答率を取得する
 */
export async function getCategoryStats(userId: string): Promise<CategoryAccuracy[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('category_accuracy')
    .select('*')
    .eq('user_id', userId)
    .order('chapter', { ascending: true });

  if (error) throw error;

  return (data || []).map((row) => ({
    userId: row.user_id,
    chapter: row.chapter,
    chapterTitle: row.chapter_title,
    totalAnswers: Number(row.total_answers),
    correctCount: Number(row.correct_count),
    accuracy: Number(row.accuracy),
  }));
}

/**
 * 日別学習履歴を取得する
 */
export async function getDailyStats(
  userId: string,
  days: number = 7
): Promise<DailySummaryResponse[]> {
  const supabase = await createClient();

  // 指定日数前の日付を計算
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('daily_summary')
    .select('*')
    .eq('user_id', userId)
    .gte('study_date', startDateStr)
    .order('study_date', { ascending: true });

  if (error) throw error;

  return (data || []).map((row) => ({
    userId: row.user_id,
    studyDate: row.study_date,
    totalAnswers: Number(row.total_answers),
    correctCount: Number(row.correct_count),
    accuracy: Number(row.accuracy),
  }));
}

/**
 * 全体の統計を取得する（問題数、回答数など）
 */
export async function getOverallStats(userId: string): Promise<{
  totalQuestions: number;
  answeredQuestions: number;
  totalAnswers: number;
  overallAccuracy: number;
}> {
  const supabase = await createClient();

  // 全問題数を取得
  const { count: totalQuestions, error: questionsError } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true });

  if (questionsError) throw questionsError;

  // ユーザーの回答統計を取得
  const { data, error: historyError } = await supabase
    .from('answer_history')
    .select('question_id, is_correct')
    .eq('user_id', userId);

  if (historyError) throw historyError;

  const answeredQuestionIds = new Set((data || []).map((a) => a.question_id));
  const totalAnswers = data?.length || 0;
  const correctAnswers = (data || []).filter((a) => a.is_correct).length;

  return {
    totalQuestions: totalQuestions || 0,
    answeredQuestions: answeredQuestionIds.size,
    totalAnswers,
    overallAccuracy: totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 1000) / 10 : 0,
  };
}
