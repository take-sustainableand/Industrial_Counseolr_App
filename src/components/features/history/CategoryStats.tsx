'use client';

import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { CategoryAccuracyDB } from '@/types';
import { formatAccuracy } from '@/lib/utils/formatters';

export interface CategoryStatsProps {
  data: CategoryAccuracyDB[];
}

/**
 * カテゴリ別統計コンポーネント
 */
export function CategoryStats({ data }: CategoryStatsProps) {
  if (data.length === 0) {
    return (
      <Card className="text-center py-8">
        <p className="text-text-secondary">
          統計データがありません
        </p>
      </Card>
    );
  }

  // 正答率でソート
  const sortedData = [...data].sort((a, b) => (a.accuracy ?? 0) - (b.accuracy ?? 0));

  return (
    <Card>
      <h3 className="font-bold mb-4">分野別正答率</h3>

      <div className="space-y-4">
        {sortedData.map((category) => {
          // 正答率に応じた色
          const accuracy = category.accuracy ?? 0;
          const getAccuracyColor = () => {
            if (accuracy >= 70) return 'text-primary';
            if (accuracy >= 50) return 'text-accent';
            return 'text-danger';
          };

          return (
            <div key={category.chapter_id}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium truncate flex-1 mr-2">
                  {category.chapter_name}
                </span>
                <span className={`text-sm font-bold ${getAccuracyColor()}`}>
                  {formatAccuracy(accuracy)}
                </span>
              </div>
              <ProgressBar
                current={accuracy}
                total={100}
                showLabel={false}
              />
              <div className="flex justify-between text-xs text-text-secondary mt-1">
                <span>{category.correct_count}/{category.question_count}問</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
