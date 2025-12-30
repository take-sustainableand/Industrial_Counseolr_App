'use client';

import { Card } from '@/components/ui/Card';
import { DailySummaryDB } from '@/types';

export interface DailyChartProps {
  data: DailySummaryDB[];
}

/**
 * 日別学習チャートコンポーネント
 */
export function DailyChart({ data }: DailyChartProps) {
  if (data.length === 0) {
    return (
      <Card className="text-center py-8">
        <p className="text-text-secondary">
          学習履歴がありません
        </p>
      </Card>
    );
  }

  // 最大値を計算（バーの高さ計算用）
  const maxCount = Math.max(...data.map((d) => d.question_count), 1);

  return (
    <Card>
      <h3 className="font-bold mb-4">日別学習数</h3>

      <div className="flex items-end justify-between gap-2 h-32">
        {data.map((day) => {
          const height = (day.question_count / maxCount) * 100;
          const date = new Date(day.study_date);
          const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];

          return (
            <div
              key={day.study_date}
              className="flex-1 flex flex-col items-center gap-1"
            >
              {/* 問題数 */}
              <span className="text-xs text-text-secondary">
                {day.question_count}
              </span>

              {/* バー */}
              <div
                className="w-full bg-primary/20 rounded-t relative overflow-hidden"
                style={{ height: `${Math.max(height, 4)}%` }}
              >
                <div
                  className="absolute bottom-0 left-0 right-0 bg-primary transition-all"
                  style={{ height: `${(day.correct_count / Math.max(day.question_count, 1)) * 100}%` }}
                />
              </div>

              {/* 曜日 */}
              <span className="text-xs text-text-secondary">
                {dayOfWeek}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-text-secondary">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-primary" />
          <span>正解</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-primary/20" />
          <span>不正解</span>
        </div>
      </div>
    </Card>
  );
}
