'use client';

import { useState, useCallback, useMemo } from 'react';
import { QuestionDB, StudyMode, SessionResult } from '@/types';
import { calculateAccuracy } from '@/lib/utils/statistics';

export interface UseStudySessionReturn {
  questions: QuestionDB[];
  currentIndex: number;
  currentQuestion: QuestionDB | null;
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  isCompleted: boolean;
  isLoading: boolean;
  error: string | null;
  startSession: (mode: StudyMode, chapterId?: string) => Promise<void>;
  submitAnswer: (isCorrect: boolean) => Promise<void>;
  nextQuestion: () => void;
  getResult: () => SessionResult;
  reset: () => void;
}

/**
 * 学習セッションを管理するカスタムフック
 */
export function useStudySession(): UseStudySessionReturn {
  const [questions, setQuestions] = useState<QuestionDB[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: number; isCorrect: boolean }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionMode, setSessionMode] = useState<StudyMode | null>(null);

  const currentQuestion = useMemo(() => {
    return questions[currentIndex] ?? null;
  }, [questions, currentIndex]);

  const totalQuestions = questions.length;
  const answeredCount = answers.length;
  const correctCount = answers.filter((a) => a.isCorrect).length;
  const isCompleted = answeredCount >= totalQuestions && totalQuestions > 0;

  /**
   * セッションを開始
   */
  const startSession = useCallback(async (mode: StudyMode, chapterId?: string) => {
    setIsLoading(true);
    setError(null);
    setQuestions([]);
    setCurrentIndex(0);
    setAnswers([]);
    setSessionMode(mode);

    try {
      let url: string;
      switch (mode) {
        case 'random':
          url = '/api/questions/random';
          break;
        case 'category':
          if (!chapterId) throw new Error('分野が指定されていません');
          url = `/api/questions/category/${chapterId}`;
          break;
        case 'weak':
          url = '/api/questions/weak';
          break;
        case 'bookmark':
          url = '/api/questions/bookmarks';
          break;
        default:
          throw new Error('無効な学習モードです');
      }

      const res = await fetch(url);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '問題の取得に失敗しました');
      }

      const data = await res.json();
      if (!data.questions || data.questions.length === 0) {
        throw new Error('問題がありません');
      }

      setQuestions(data.questions);
    } catch (err) {
      const message = err instanceof Error ? err.message : '問題の取得に失敗しました';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 回答を送信
   */
  const submitAnswer = useCallback(async (isCorrect: boolean) => {
    if (!currentQuestion) return;

    // 回答を記録
    setAnswers((prev) => [
      ...prev,
      { questionId: currentQuestion.id, isCorrect },
    ]);

    // サーバーに回答を記録
    try {
      await fetch('/api/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          isCorrect,
        }),
      });
    } catch (err) {
      console.error('Failed to record answer:', err);
    }
  }, [currentQuestion]);

  /**
   * 次の問題へ
   */
  const nextQuestion = useCallback(() => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, totalQuestions]);

  /**
   * 結果を取得
   */
  const getResult = useCallback((): SessionResult => {
    const incorrectIds = answers
      .filter((a) => !a.isCorrect)
      .map((a) => a.questionId);

    return {
      mode: sessionMode || 'random',
      totalQuestions,
      correctCount,
      accuracy: calculateAccuracy(correctCount, totalQuestions),
      incorrectQuestionIds: incorrectIds,
      answeredQuestions: questions.map((q, index) => ({
        isCorrect: answers[index]?.isCorrect ?? false,
        question: {
          id: q.id,
          question_text: q.question_text || q.statement_text,
          correct_answer: q.correct_answer !== undefined ? q.correct_answer : q.answer === '○',
          chapter_name: q.chapter_name || q.chapter_title,
        },
      })),
    };
  }, [totalQuestions, correctCount, sessionMode, questions, answers]);

  /**
   * セッションをリセット
   */
  const reset = useCallback(() => {
    setQuestions([]);
    setCurrentIndex(0);
    setAnswers([]);
    setError(null);
    setSessionMode(null);
  }, []);

  return {
    questions,
    currentIndex,
    currentQuestion,
    totalQuestions,
    answeredCount,
    correctCount,
    isCompleted,
    isLoading,
    error,
    startSession,
    submitAnswer,
    nextQuestion,
    getResult,
    reset,
  };
}
