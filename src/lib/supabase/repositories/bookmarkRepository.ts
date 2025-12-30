import { createClient } from '../server';
import type { BookmarkResponse } from '@/types';

/**
 * ブックマークを追加する（既に存在する場合は何もしない）
 */
export async function addBookmark(
  userId: string,
  questionId: number
): Promise<BookmarkResponse | null> {
  const supabase = await createClient();

  // まず既存のブックマークを確認
  const { data: existing } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('user_id', userId)
    .eq('question_id', questionId)
    .single();

  // 既に存在する場合はそのまま返す
  if (existing) {
    return {
      id: existing.id,
      userId: existing.user_id,
      questionId: existing.question_id,
      createdAt: existing.created_at,
    };
  }

  // 存在しない場合は追加
  const { data, error } = await supabase
    .from('bookmarks')
    .insert({
      user_id: userId,
      question_id: questionId,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    userId: data.user_id,
    questionId: data.question_id,
    createdAt: data.created_at,
  };
}

/**
 * ブックマークを削除する
 */
export async function removeBookmark(
  userId: string,
  questionId: number
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('user_id', userId)
    .eq('question_id', questionId);

  if (error) throw error;
}

/**
 * ブックマーク一覧を取得する
 */
export async function getBookmarks(userId: string): Promise<BookmarkResponse[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    questionId: row.question_id,
    createdAt: row.created_at,
  }));
}

/**
 * 特定の問題がブックマークされているか確認
 */
export async function isBookmarked(
  userId: string,
  questionId: number
): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('user_id', userId)
    .eq('question_id', questionId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return false;
    throw error;
  }

  return !!data;
}

/**
 * 複数の問題のブックマーク状態を取得
 */
export async function getBookmarkStatuses(
  userId: string,
  questionIds: number[]
): Promise<Record<number, boolean>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('bookmarks')
    .select('question_id')
    .eq('user_id', userId)
    .in('question_id', questionIds);

  if (error) throw error;

  const bookmarkedIds = new Set((data || []).map((b) => b.question_id));
  const result: Record<number, boolean> = {};
  questionIds.forEach((id) => {
    result[id] = bookmarkedIds.has(id);
  });
  return result;
}
