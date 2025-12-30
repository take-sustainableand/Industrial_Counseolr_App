'use client';

import { Button } from '@/components/ui/Button';

export interface AnswerResultProps {
  isCorrect: boolean;
  onNext: () => void;
  isLast: boolean;
}

/**
 * 回答結果表示コンポーネント
 */
export function AnswerResult({ isCorrect, onNext, isLast }: AnswerResultProps) {
  return (
    <div className="space-y-4">
      {/* 結果表示 */}
      <div
        className={`p-4 rounded-xl text-center ${
          isCorrect
            ? 'bg-primary/10 text-primary'
            : 'bg-danger/10 text-danger'
        }`}
      >
        <span className="text-4xl block mb-2">
          {isCorrect ? '○' : '×'}
        </span>
        <span className="text-xl font-bold">
          {isCorrect ? '正解！' : '不正解'}
        </span>
      </div>

      {/* 次へボタン */}
      <Button
        variant="primary"
        size="lg"
        className="w-full"
        onClick={onNext}
      >
        {isLast ? '結果を見る' : '次の問題へ'}
      </Button>
    </div>
  );
}
