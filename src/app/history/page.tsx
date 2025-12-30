'use client';

export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { BottomNav, BottomNavSpacer } from '@/components/layout/BottomNav';
import { DailyChart } from '@/components/features/history/DailyChart';
import { CategoryStats } from '@/components/features/history/CategoryStats';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useAuth } from '@/lib/hooks/useAuth';
import { useStats, useDailyStats } from '@/lib/hooks/useStats';

/**
 * 学習履歴ページ
 */
export default function HistoryPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { categoryStats, loading: statsLoading, error: statsError, refetch } = useStats();
  const { dailyStats, loading: dailyLoading, error: dailyError } = useDailyStats(7);

  // 未認証の場合はログインページへ
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  if (authLoading || statsLoading || dailyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const error = statsError || dailyError;

  return (
    <div className="min-h-screen bg-background">
      <Header title="学習履歴" />

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {error ? (
          <ErrorMessage
            message={error}
            onRetry={refetch}
          />
        ) : (
          <>
            <DailyChart data={dailyStats} />
            <CategoryStats data={categoryStats} />
          </>
        )}
      </main>

      <BottomNavSpacer />
      <BottomNav />
    </div>
  );
}
