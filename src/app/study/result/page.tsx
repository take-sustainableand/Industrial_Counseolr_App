'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { SessionResult } from '@/components/features/study/SessionResult';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/lib/hooks/useAuth';
import { SessionResult as SessionResultType } from '@/types';

/**
 * セッション結果を取得するフック
 */
function useSessionResult() {
  const [result, setResult] = useState<SessionResultType | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('studyResult');
      if (stored) {
        setResult(JSON.parse(stored));
      }
    } catch {
      // パースエラーは無視
    }
    setIsLoaded(true);
  }, []);

  return { result, isLoaded };
}

/**
 * 学習結果ページ
 */
export default function ResultPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { result, isLoaded } = useSessionResult();

  // 未認証の場合はログインページへ
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  // 結果がない場合はホームへ
  useEffect(() => {
    if (isLoaded && !result) {
      router.push('/');
    }
  }, [isLoaded, result, router]);

  if (authLoading || !isLoaded || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header title="結果" />

      <main className="max-w-md mx-auto px-4 py-6">
        <SessionResult result={result} />
      </main>
    </div>
  );
}
