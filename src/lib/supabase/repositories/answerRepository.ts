import { createClient } from '../server';
import type { AnswerHistoryResponse } from '@/types';

/**
 * 回答を記録する
 */
export async function recordAnswer(
  userId: string,
  questionId: number,
  isCorrect: boolean
): Promise<AnswerHistoryResponse> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('answer_history')
    .insert({
      user_id: userId,
      question_id: questionId,
      is_correct: isCorrect,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    userId: data.user_id,
    questionId: data.question_id,
    isCorrect: data.is_correct,
    answeredAt: data.answered_at,
  };
}

/**
 * 回答履歴を取得する
 */
export async function getAnswerHistory(
  userId: string,
  limit: number = 100
): Promise<AnswerHistoryResponse[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('answer_history')
    .select('*')
    .eq('user_id', userId)
    .order('answered_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data || []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    questionId: row.question_id,
    isCorrect: row.is_correct,
    answeredAt: row.answered_at,
  }));
}

/**
 * 特定の問題の最新回答を取得する
 */
export async function getLastAnswer(
  userId: string,
  questionId: number
): Promise<AnswerHistoryResponse | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('answer_history')
    .select('*')
    .eq('user_id', userId)
    .eq('question_id', questionId)
    .order('answered_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return {
    id: data.id,
    userId: data.user_id,
    questionId: data.question_id,
    isCorrect: data.is_correct,
    answeredAt: data.answered_at,
  };
}
