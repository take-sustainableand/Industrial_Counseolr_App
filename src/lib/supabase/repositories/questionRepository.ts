import { createClient } from '../server';
import type { QuestionResponse } from '@/types';

/**
 * ランダムに問題を取得する
 */
export async function getRandomQuestions(limit: number = 10): Promise<QuestionResponse[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .limit(limit * 3); // ランダム選択のため多めに取得

  if (error) throw error;

  // シャッフルしてlimit件を返す
  const shuffled = (data || []).sort(() => Math.random() - 0.5);
  return shuffled.slice(0, limit).map(mapToQuestionResponse);
}

/**
 * 分野別に問題を取得する
 */
export async function getQuestionsByChapter(
  chapterId: number,
  limit: number = 10
): Promise<QuestionResponse[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('chapter', chapterId)
    .limit(limit * 2);

  if (error) throw error;

  const shuffled = (data || []).sort(() => Math.random() - 0.5);
  return shuffled.slice(0, limit).map(mapToQuestionResponse);
}

/**
 * 苦手問題を取得する
 */
export async function getWeakQuestions(
  userId: string,
  limit: number = 10
): Promise<QuestionResponse[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('get_weak_questions', {
    p_user_id: userId,
    p_limit: limit,
  });

  if (error) throw error;

  return (data || []).map(mapToQuestionResponse);
}

/**
 * ブックマークした問題を取得する
 */
export async function getBookmarkedQuestions(
  userId: string,
  limit: number = 10
): Promise<QuestionResponse[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('bookmarks')
    .select('question_id, questions(*)')
    .eq('user_id', userId)
    .limit(limit);

  if (error) throw error;

  // Supabaseの結合結果からquestionオブジェクトを抽出
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const questions: Record<string, unknown>[] = ((data || []) as any[])
    .map((b) => b.questions)
    .filter((q): q is Record<string, unknown> => q !== null && typeof q === 'object' && !Array.isArray(q));

  const shuffled = questions.sort(() => Math.random() - 0.5);
  return shuffled.map(mapToQuestionResponse);
}

/**
 * 分野一覧を取得する
 */
export async function getChapters(): Promise<
  Array<{ chapter: number; chapterTitle: string; questionCount: number }>
> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('get_chapters');

  if (error) throw error;

  return (data || []).map((c: { chapter: number; chapter_title: string; question_count: number }) => ({
    chapter: c.chapter,
    chapterTitle: c.chapter_title,
    questionCount: c.question_count,
  }));
}

/**
 * 問題を1件取得する
 */
export async function getQuestionById(id: number): Promise<QuestionResponse | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return mapToQuestionResponse(data);
}

/**
 * データベースの行をQuestionResponseに変換
 */
function mapToQuestionResponse(row: Record<string, unknown>): QuestionResponse {
  return {
    id: row.id as number,
    chapter: row.chapter as number,
    chapterTitle: row.chapter_title as string,
    category: row.category as string,
    problemNo: row.problem_no as number | null,
    problemPrompt: row.problem_prompt as string | null,
    statementNo: row.statement_no as number | null,
    statementText: row.statement_text as string,
    answer: row.answer as '○' | '×',
    explanation: row.explanation as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}
