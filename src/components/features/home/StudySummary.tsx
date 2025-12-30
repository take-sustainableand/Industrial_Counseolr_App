'use client';

import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { TodaySummaryDB } from '@/types';
import { formatAccuracy } from '@/lib/utils/formatters';

export interface StudySummaryProps {
  summary: TodaySummaryDB | null;
  loading?: boolean;
}

/**
 * 今日の学習サマリーコンポーネント
 */
export function StudySummary({ summary, loading = false }: StudySummaryProps) {
  if (loading) {
    return (
      <Card>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-border rounded w-1/3" />
          <div className="h-4 bg-border rounded w-1/2" />
          <div className="h-2 bg-border rounded w-full" />
        </div>
      </Card>
    );
  }

  const questionCount = summary?.question_count ?? 0;
  const correctCount = summary?.correct_count ?? 0;
  const accuracy = summary?.accuracy ?? 0;

  return (
    <Card>
      <h2 className="text-lg font-bold mb-4">今日の学習</h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-text-secondary">解答数</span>
          <span className="text-2xl font-bold text-primary">{questionCount}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-text-secondary">正解数</span>
          <span className="text-2xl font-bold text-primary">{correctCount}</span>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-text-secondary">正答率</span>
            <span className="text-lg font-bold">{formatAccuracy(accuracy)}</span>
          </div>
          <ProgressBar current={accuracy} total={100} showLabel={false} />
        </div>
      </div>

      {questionCount === 0 && (
        <p className="mt-4 text-sm text-text-secondary text-center">
          今日はまだ問題を解いていません。
          <br />
          学習を始めましょう！
        </p>
      )}
    </Card>
  );
}
