'use client';

import { useState, useCallback } from 'react';

export interface UseBookmarkReturn {
  bookmarkedIds: Set<number>;
  isBookmarked: (questionId: number) => boolean;
  toggleBookmark: (questionId: number) => Promise<void>;
  fetchBookmarkStatuses: (questionIds: number[]) => Promise<void>;
  loading: boolean;
  initialLoaded: boolean;
  error: string | null;
}

/**
 * ブックマーク状態を管理するカスタムフック
 */
export function useBookmark(): UseBookmarkReturn {
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * ブックマーク状態をチェック
   */
  const isBookmarked = useCallback(
    (questionId: number) => bookmarkedIds.has(questionId),
    [bookmarkedIds]
  );

  /**
   * ブックマーク状態を切り替え
   */
  const toggleBookmark = useCallback(async (questionId: number) => {
    setLoading(true);
    setError(null);

    const currentlyBookmarked = bookmarkedIds.has(questionId);

    try {
      if (currentlyBookmarked) {
        // ブックマーク解除
        const res = await fetch(`/api/bookmarks/${questionId}`, {
          method: 'DELETE',
        });

        if (!res.ok) {
          throw new Error('ブックマークの解除に失敗しました');
        }

        setBookmarkedIds((prev) => {
          const next = new Set(prev);
          next.delete(questionId);
          return next;
        });
      } else {
        // ブックマーク追加
        const res = await fetch('/api/bookmarks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ questionId }),
        });

        if (!res.ok) {
          throw new Error('ブックマークの追加に失敗しました');
        }

        setBookmarkedIds((prev) => new Set(prev).add(questionId));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'エラーが発生しました';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [bookmarkedIds]);

  /**
   * 複数の問題のブックマーク状態を取得
   */
  const fetchBookmarkStatuses = useCallback(async (questionIds: number[]) => {
    if (questionIds.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/bookmarks', {
        method: 'GET',
      });

      if (!res.ok) {
        throw new Error('ブックマーク状態の取得に失敗しました');
      }

      const data = await res.json();
      const bookmarkedSet = new Set<number>(
        data.bookmarks?.map((b: { question_id: number }) => b.question_id) ?? []
      );

      // 全てのブックマーク状態を設定（フィルタしない）
      setBookmarkedIds(bookmarkedSet);
      setInitialLoaded(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'エラーが発生しました';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    bookmarkedIds,
    isBookmarked,
    toggleBookmark,
    fetchBookmarkStatuses,
    loading,
    initialLoaded,
    error,
  };
}
