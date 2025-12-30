'use client';

export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { SessionResult } from '@/components/features/study/SessionResult';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/lib/hooks/useAuth';
import { SessionResult as SessionResultType } from '@/types';
import { useSyncExternalStore } from 'react';

/**
 * セッション結果を取得するフック
 * useSyncExternalStoreを使用してESLintルールに準拠
 */
function useSessionResult() {
  const getSnapshot = (): SessionResultType | null => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = sessionStorage.getItem('studyResult');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  const getServerSnapshot = (): SessionResultType | null => null;

  const subscribe = (callback: () => void): (() => void) => {
    // sessionStorageはstorageイベントをトリガーしないため、変更はない
    // これは初回読み込み用のみ
    window.addEventListener('storage', callback);
    return () => window.removeEventListener('storage', callback);
  };

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * 学習結果ページ
 */
export default function ResultPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const result = useSessionResult();

  // 未認証の場合はログインページへ
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  // 結果がない場合はホームへ（クライアントサイドのみ）
  useEffect(() => {
    if (typeof window !== 'undefined' && !authLoading && !result) {
      // 少し待ってからリダイレクト（hydration完了を待つ）
      const timeout = setTimeout(() => {
        if (!sessionStorage.getItem('studyResult')) {
          router.push('/');
        }
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [authLoading, result, router]);

  if (authLoading || !result) {
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
