'use client';

import { Button } from '@/components/ui/Button';

export interface AnswerButtonsProps {
  onAnswer: (answer: boolean) => void;
  disabled?: boolean;
}

/**
 * 回答ボタンコンポーネント
 */
export function AnswerButtons({ onAnswer, disabled = false }: AnswerButtonsProps) {
  return (
    <div className="flex gap-4">
      <Button
        variant="correct"
        size="lg"
        className="flex-1"
        onClick={() => onAnswer(true)}
        disabled={disabled}
      >
        <span className="text-2xl mr-2">○</span>
        正しい
      </Button>
      <Button
        variant="incorrect"
        size="lg"
        className="flex-1"
        onClick={() => onAnswer(false)}
        disabled={disabled}
      >
        <span className="text-2xl mr-2">×</span>
        誤り
      </Button>
    </div>
  );
}
