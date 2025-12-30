'use client';

import { Card } from '@/components/ui/Card';
import { QuestionDB } from '@/types';

export interface QuestionCardProps {
  question: QuestionDB;
  showAnswer?: boolean;
}

/**
 * 問題カードコンポーネント
 */
export function QuestionCard({ question, showAnswer = false }: QuestionCardProps) {
  // データベースのフィールド名に対応
  const chapterName = question.chapter_name || question.chapter_title;
  const questionText = question.question_text || question.statement_text;
  // answer は '○' | '×' の文字列、correct_answer は boolean
  const isCorrect = question.correct_answer !== undefined
    ? question.correct_answer
    : question.answer === '○';

  return (
    <Card padding="lg">
      <div className="space-y-4">
        {/* 分野タグ */}
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
            {chapterName}
          </span>
        </div>

        {/* 問題文 */}
        <div className="text-lg leading-relaxed">
          {questionText}
        </div>

        {/* 正解表示 */}
        {showAnswer && (
          <div className="pt-4 border-t border-border">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-text-secondary">正解:</span>
              <span
                className={`text-lg font-bold ${
                  isCorrect ? 'text-primary' : 'text-danger'
                }`}
              >
                {isCorrect ? '○' : '×'}
              </span>
            </div>

            {/* 解説 */}
            {question.explanation && (
              <div className="mt-3 p-3 rounded-lg bg-background">
                <span className="text-sm font-medium text-text-secondary block mb-1">
                  解説:
                </span>
                <p className="text-sm text-text-primary leading-relaxed">
                  {question.explanation}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
