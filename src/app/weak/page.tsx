'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { BottomNav, BottomNavSpacer } from '@/components/layout/BottomNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage, EmptyState } from '@/components/ui/ErrorMessage';
import { useAuth } from '@/lib/hooks/useAuth';
import { QuestionDB } from '@/types';

/**
 * 苦手問題一覧ページ
 */
export default function WeakPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [questions, setQuestions] = useState<QuestionDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 苦手問題を取得
  useEffect(() => {
    const fetchWeakQuestions = async () => {
      try {
        const res = await fetch('/api/questions/weak?count=50');
        if (!res.ok) {
          throw new Error('苦手問題の取得に失敗しました');
        }
        const data = await res.json();
        setQuestions(data.questions ?? []);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'エラーが発生しました';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchWeakQuestions();
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

  return (
    <div className="min-h-screen bg-background">
      <Header title="苦手問題" />

      <main className="max-w-md mx-auto px-4 py-6">
        {error ? (
          <ErrorMessage
            message={error}
            onRetry={() => window.location.reload()}
          />
        ) : questions.length === 0 ? (
          <EmptyState
            message="苦手問題がありません。学習を続けると、間違えた問題がここに表示されます。"
            icon={
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-text-secondary">
                {questions.length}問の苦手問題があります
              </p>
              <Link href="/study/weak">
                <Button variant="primary" size="sm">
                  復習する
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {questions.map((question) => {
                const questionText = question.question_text || question.statement_text;
                const chapterName = question.chapter_name || question.chapter_title;
                const isCorrect = question.correct_answer !== undefined
                  ? question.correct_answer
                  : question.answer === '○';
                return (
                  <Card key={question.id}>
                    <div className="flex items-start gap-2">
                      <span className="text-danger font-bold text-lg">×</span>
                      <div className="flex-1">
                        <p className="text-sm line-clamp-2">
                          {questionText}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                            {chapterName}
                          </span>
                          <span className="text-xs text-text-secondary">
                            正解: {isCorrect ? '○' : '×'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <BottomNavSpacer />
      <BottomNav />
    </div>
  );
}
