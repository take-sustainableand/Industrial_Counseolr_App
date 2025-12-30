'use client';

import { ProgressBar } from '@/components/ui/ProgressBar';
import { formatProgress } from '@/lib/utils/formatters';

export interface StudyProgressProps {
  current: number;
  total: number;
  correctCount: number;
}

/**
 * 学習進捗表示コンポーネント
 */
export function StudyProgress({ current, total, correctCount }: StudyProgressProps) {
  const progress = total > 0 ? ((current + 1) / total) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-text-secondary">
          {formatProgress(current + 1, total)}
        </span>
        <span className="text-primary font-medium">
          正解: {correctCount}問
        </span>
      </div>
      <ProgressBar current={progress} total={100} showLabel={false} />
    </div>
  );
}
