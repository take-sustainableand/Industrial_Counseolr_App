'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { use } from 'react';
import { Header } from '@/components/layout/Header';
import { QuestionCard } from '@/components/features/study/QuestionCard';
import { AnswerButtons } from '@/components/features/study/AnswerButtons';
import { AnswerResult } from '@/components/features/study/AnswerResult';
import { StudyProgress } from '@/components/features/study/StudyProgress';
import { BookmarkButton } from '@/components/features/study/BookmarkButton';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useAuth } from '@/lib/hooks/useAuth';
import { useStudySession } from '@/lib/hooks/useStudySession';
import { useBookmark } from '@/lib/hooks/useBookmark';
import { StudyMode } from '@/types';

const MODE_TITLES: Record<StudyMode, string> = {
  random: 'ランダム',
  category: '分野別',
  weak: '苦手問題',
  bookmark: 'ブックマーク',
};

/**
 * 学習ページ
 */
export default function StudyPage({
  params,
}: {
  params: Promise<{ mode: string }>;
}) {
  const { mode: modeParam } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const chapterId = searchParams.get('chapterId');

  const { user, loading: authLoading } = useAuth();
  const {
    currentQuestion,
    currentIndex,
    totalQuestions,
    correctCount,
    isCompleted,
    isLoading,
    error,
    startSession,
    submitAnswer,
    nextQuestion,
    getResult,
  } = useStudySession();

  const {
    isBookmarked,
    toggleBookmark,
    fetchBookmarkStatuses,
    loading: bookmarkLoading,
  } = useBookmark();

  const [hasAnswered, setHasAnswered] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(false);

  const mode = modeParam as StudyMode;
  const title = MODE_TITLES[mode] || '学習';

  // セッション開始
  useEffect(() => {
    if (!authLoading && user && !isLoading && !currentQuestion && !error) {
      startSession(mode, chapterId ?? undefined);
    }
  }, [authLoading, user, mode, chapterId, isLoading, currentQuestion, error, startSession]);

  // ブックマーク状態を取得
  useEffect(() => {
    if (currentQuestion) {
      fetchBookmarkStatuses([currentQuestion.id]);
    }
  }, [currentQuestion, fetchBookmarkStatuses]);

  // 未認証の場合はログインページへ
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  // 完了時に結果ページへ
  useEffect(() => {
    if (isCompleted) {
      const result = getResult();
      sessionStorage.setItem('studyResult', JSON.stringify(result));
      router.push('/study/result');
    }
  }, [isCompleted, getResult, router]);

  const handleAnswer = useCallback(
    async (answer: boolean) => {
      if (!currentQuestion) return;

      // correct_answer (boolean) または answer ('○' | '×') を使用
      const correctAnswer = currentQuestion.correct_answer !== undefined
        ? currentQuestion.correct_answer
        : currentQuestion.answer === '○';
      const isCorrect = answer === correctAnswer;
      setLastAnswerCorrect(isCorrect);
      setHasAnswered(true);
      await submitAnswer(isCorrect);
    },
    [currentQuestion, submitAnswer]
  );

  const handleNext = useCallback(() => {
    setHasAnswered(false);
    nextQuestion();
  }, [nextQuestion]);

  const handleBookmarkToggle = useCallback(() => {
    if (currentQuestion) {
      toggleBookmark(currentQuestion.id);
    }
  }, [currentQuestion, toggleBookmark]);

  // ローディング
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // エラー
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header title={title} showBackButton />
        <main className="max-w-md mx-auto px-4 py-6">
          <ErrorMessage
            message={error}
            onRetry={() => startSession(mode, chapterId ?? undefined)}
          />
        </main>
      </div>
    );
  }

  // 問題がない
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-background">
        <Header title={title} showBackButton />
        <main className="max-w-md mx-auto px-4 py-6">
          <ErrorMessage
            message="問題がありません"
            type="info"
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        title={title}
        showBackButton
        rightElement={
          <BookmarkButton
            isBookmarked={isBookmarked(currentQuestion.id)}
            onClick={handleBookmarkToggle}
            disabled={bookmarkLoading}
          />
        }
      />

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        <StudyProgress
          current={currentIndex}
          total={totalQuestions}
          correctCount={correctCount}
        />

        <QuestionCard
          question={currentQuestion}
          showAnswer={hasAnswered}
        />

        {hasAnswered ? (
          <AnswerResult
            isCorrect={lastAnswerCorrect}
            onNext={handleNext}
            isLast={currentIndex >= totalQuestions - 1}
          />
        ) : (
          <AnswerButtons onAnswer={handleAnswer} />
        )}
      </main>
    </div>
  );
}
