'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useAuth } from '@/lib/hooks/useAuth';

interface Chapter {
  chapter: number;
  chapterTitle: string;
  questionCount: number;
}

/**
 * 分野選択ページ
 */
export default function CategorySelectPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 分野一覧を取得
  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const res = await fetch('/api/questions/chapters');
        if (!res.ok) {
          throw new Error('分野の取得に失敗しました');
        }
        const data = await res.json();
        setChapters(data.chapters ?? []);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'エラーが発生しました';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchChapters();
    }
  }, [user]);

  // 未認証の場合はログインページへ
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header title="分野選択" showBackButton />
        <main className="max-w-md mx-auto px-4 py-6">
          <ErrorMessage message={error} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header title="分野選択" showBackButton />

      <main className="max-w-md mx-auto px-4 py-6">
        <p className="text-text-secondary mb-4">
          学習したい分野を選んでください
        </p>

        {chapters.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-text-secondary">
              分野がありません
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {chapters.map((chapter) => (
              <Link
                key={chapter.chapter}
                href={`/study/category?chapterId=${chapter.chapter}`}
              >
                <Card className="hover:border-primary transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold">{chapter.chapterTitle}</h3>
                      <p className="text-sm text-text-secondary">
                        {chapter.questionCount}問
                      </p>
                    </div>
                    <svg
                      className="w-5 h-5 text-text-secondary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
