import { createClient } from '../server';
import type { QuestionResponseDB } from '@/types';

/**
 * ランダムに問題を取得する
 */
export async function getRandomQuestions(limit: number = 10): Promise<QuestionResponseDB[]> {
  const supabase = await createClient();

  // 全問題数を取得
  const { count } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true });

  const totalCount = count || 0;

  // ランダムなオフセットを生成して取得
  const maxOffset = Math.max(0, totalCount - limit * 3);
  const randomOffset = Math.floor(Math.random() * maxOffset);

  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .range(randomOffset, randomOffset + limit * 3 - 1);

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
): Promise<QuestionResponseDB[]> {
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
 * 直近の回答が不正解だった問題のみを取得
 */
export async function getWeakQuestions(
  userId: string,
  limit: number = 10
): Promise<QuestionResponseDB[]> {
  const supabase = await createClient();

  // 各問題の最新回答を取得し、不正解だったものを抽出
  // SQLで直接DISTINCT ON相当の処理を行う
  const { data: allAnswers, error: answersError } = await supabase
    .from('answer_history')
    .select('question_id, is_correct, answered_at')
    .eq('user_id', userId)
    .order('answered_at', { ascending: false });

  if (answersError) throw answersError;

  // 各問題の最新回答を抽出（JavaScriptで処理）
  const latestAnswerByQuestion = new Map<number, boolean>();
  for (const answer of allAnswers || []) {
    // 最初に出現したものが最新（order by answered_at DESC なので）
    if (!latestAnswerByQuestion.has(answer.question_id)) {
      latestAnswerByQuestion.set(answer.question_id, answer.is_correct);
    }
  }

  // 最新回答が不正解だった問題IDを取得
  const wrongIds: number[] = [];
  for (const [questionId, isCorrect] of latestAnswerByQuestion) {
    if (!isCorrect) {
      wrongIds.push(questionId);
    }
  }

  // 不正解問題がない場合は空配列を返す
  if (wrongIds.length === 0) {
    return [];
  }

  // 不正解問題を取得
  const { data: wrongQuestions, error: wqError } = await supabase
    .from('questions')
    .select('*')
    .in('id', wrongIds);

  if (wqError) throw wqError;

  // シャッフルしてlimit件を返す
  const shuffled = (wrongQuestions || []).sort(() => Math.random() - 0.5);
  return shuffled.slice(0, limit).map(mapToQuestionResponse);
}

/**
 * ブックマークした問題を取得する
 */
export async function getBookmarkedQuestions(
  userId: string,
  limit: number = 10
): Promise<QuestionResponseDB[]> {
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
export async function getQuestionById(id: number): Promise<QuestionResponseDB | null> {
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
 * データベースの行をQuestionResponseDBに変換
 * フロントエンドでの互換性のためsnake_caseフィールドを返す
 */
function mapToQuestionResponse(row: Record<string, unknown>): QuestionResponseDB {
  return {
    id: row.id as number,
    chapter: row.chapter as number,
    chapter_title: row.chapter_title as string,
    category: row.category as string,
    problem_no: row.problem_no as number | null,
    problem_prompt: row.problem_prompt as string | null,
    statement_no: row.statement_no as number | null,
    statement_text: row.statement_text as string,
    answer: row.answer as '○' | '×',
    explanation: row.explanation as string | null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}
