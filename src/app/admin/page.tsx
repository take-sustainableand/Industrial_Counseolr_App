'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { BottomNav, BottomNavSpacer } from '@/components/layout/BottomNav';
import { CSVUploader } from '@/components/features/admin/CSVUploader';
import { QuestionList } from '@/components/features/admin/QuestionList';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useAuth } from '@/lib/hooks/useAuth';

/**
 * 管理ページ
 */
export default function AdminPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  // 管理者チェック
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setCheckingAdmin(false);
        return;
      }

      try {
        // user_profilesから管理者フラグを取得
        const res = await fetch('/api/auth/check-admin');
        if (res.ok) {
          const data = await res.json();
          setIsAdmin(data.isAdmin);
        } else {
          setIsAdmin(false);
        }
      } catch {
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    };

    checkAdmin();
  }, [user]);

  // 未認証の場合はログインページへ
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  if (authLoading || checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="管理" />
        <main className="max-w-md mx-auto px-4 py-6">
          <ErrorMessage
            message="管理者権限がありません"
            type="warning"
          />
        </main>
        <BottomNavSpacer />
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header title="管理" />

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        <CSVUploader />
        <QuestionList />
      </main>

      <BottomNavSpacer />
      <BottomNav />
    </div>
  );
}
