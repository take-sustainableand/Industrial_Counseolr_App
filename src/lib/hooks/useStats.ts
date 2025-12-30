'use client';

import { useState, useEffect, useCallback } from 'react';
import { TodaySummary, CategoryAccuracy, DailySummaryResponse } from '@/types';

export interface UseStatsReturn {
  todaySummary: TodaySummary | null;
  categoryStats: CategoryAccuracy[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * 学習統計を取得するカスタムフック
 */
export function useStats(): UseStatsReturn {
  const [todaySummary, setTodaySummary] = useState<TodaySummary | null>(null);
  const [categoryStats, setCategoryStats] = useState<CategoryAccuracy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 並行してデータを取得
      const [todayRes, categoriesRes] = await Promise.all([
        fetch('/api/stats/today'),
        fetch('/api/stats/categories'),
      ]);

      if (!todayRes.ok) {
        throw new Error('今日の統計の取得に失敗しました');
      }

      if (!categoriesRes.ok) {
        throw new Error('カテゴリ統計の取得に失敗しました');
      }

      const todayData = await todayRes.json();
      const categoriesData = await categoriesRes.json();

      setTodaySummary(todayData);
      setCategoryStats(categoriesData);
    } catch (err) {
      const message = err instanceof Error ? err.message : '統計の取得に失敗しました';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    todaySummary,
    categoryStats,
    loading,
    error,
    refetch: fetchStats,
  };
}

export interface UseDailyStatsReturn {
  dailyStats: DailySummaryResponse[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * 日別統計を取得するカスタムフック
 */
export function useDailyStats(days: number = 7): UseDailyStatsReturn {
  const [dailyStats, setDailyStats] = useState<DailySummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDailyStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/stats/daily?days=${days}`);

      if (!res.ok) {
        throw new Error('日別統計の取得に失敗しました');
      }

      const data = await res.json();
      setDailyStats(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : '統計の取得に失敗しました';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchDailyStats();
  }, [fetchDailyStats]);

  return {
    dailyStats,
    loading,
    error,
    refetch: fetchDailyStats,
  };
}
