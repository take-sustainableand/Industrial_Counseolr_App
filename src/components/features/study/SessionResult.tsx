'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SessionResult as SessionResultType, StudyMode } from '@/types';
import { formatAccuracy } from '@/lib/utils/formatters';

const MODE_TITLES: Record<StudyMode, string> = {
  random: 'ランダム',
  category: '分野別',
  weak: '苦手問題',
  bookmark: 'ブックマーク',
};

export interface SessionResultProps {
  result: SessionResultType;
}

/**
 * 学習セッション結果コンポーネント
 */
export function SessionResult({ result }: SessionResultProps) {
  const { totalQuestions, correctCount, accuracy, mode } = result;
  const incorrectCount = totalQuestions - correctCount;

  // 評価メッセージ
  const getMessage = () => {
    if (accuracy >= 90) return '素晴らしい！';
    if (accuracy >= 70) return 'よくできました！';
    if (accuracy >= 50) return 'もう少し頑張りましょう';
    return '復習が必要です';
  };

  // 評価色
  const getResultColor = () => {
    if (accuracy >= 70) return 'text-primary';
    if (accuracy >= 50) return 'text-accent';
    return 'text-danger';
  };

  return (
    <div className="space-y-6">
      {/* 結果サマリー */}
      <Card padding="lg" className="text-center">
        <h2 className="text-xl font-bold mb-4">
          {MODE_TITLES[mode]}モード 結果
        </h2>

        <div className={`text-4xl font-bold mb-2 ${getResultColor()}`}>
          {formatAccuracy(accuracy)}
        </div>

        <p className="text-lg text-text-secondary mb-6">
          {getMessage()}
        </p>

        <ProgressBar current={accuracy} total={100} showLabel={false} />

        <div className="flex justify-center gap-8 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{correctCount}</div>
            <div className="text-sm text-text-secondary">正解</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-danger">{incorrectCount}</div>
            <div className="text-sm text-text-secondary">不正解</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-text-primary">{totalQuestions}</div>
            <div className="text-sm text-text-secondary">問題数</div>
          </div>
        </div>
      </Card>

      {/* アクションボタン */}
      <div className="space-y-3">
        <Link href={`/study/${mode}`}>
          <Button variant="primary" size="lg" className="w-full">
            もう一度チャレンジ
          </Button>
        </Link>

        <Link href="/">
          <Button variant="secondary" size="lg" className="w-full">
            ホームに戻る
          </Button>
        </Link>
      </div>

      {/* 不正解問題があれば表示 */}
      {incorrectCount > 0 && (
        <Card>
          <h3 className="font-bold mb-3">間違えた問題</h3>
          <div className="space-y-3">
            {result.answeredQuestions
              .filter((aq) => !aq.isCorrect)
              .slice(0, 5)
              .map((aq) => (
                <div
                  key={aq.question.id}
                  className="p-3 rounded-lg bg-background"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-danger font-bold">×</span>
                    <div>
                      <p className="text-sm line-clamp-2">
                        {aq.question.question_text}
                      </p>
                      <p className="text-xs text-text-secondary mt-1">
                        正解: {aq.question.correct_answer ? '○' : '×'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            {incorrectCount > 5 && (
              <p className="text-sm text-text-secondary text-center">
                他 {incorrectCount - 5} 問
              </p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
