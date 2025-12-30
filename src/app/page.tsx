'use client';

export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { BottomNav, BottomNavSpacer } from '@/components/layout/BottomNav';
import { StudySummary } from '@/components/features/home/StudySummary';
import { ModeSelector } from '@/components/features/home/ModeSelector';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useAuth } from '@/lib/hooks/useAuth';
import { useStats } from '@/lib/hooks/useStats';

/**
 * ホームページ
 */
export default function HomePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { todaySummary, loading: statsLoading, error, refetch } = useStats();

  // 未認証の場合はログインページへリダイレクト
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  // 認証チェック中
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // 未認証（リダイレクト前）
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header title="産カウ問題集" />

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {error ? (
          <ErrorMessage
            message={error}
            onRetry={refetch}
          />
        ) : (
          <StudySummary
            summary={todaySummary}
            loading={statsLoading}
          />
        )}

        <ModeSelector />
      </main>

      <BottomNavSpacer />
      <BottomNav />
    </div>
  );
}
