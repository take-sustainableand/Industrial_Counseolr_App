'use client';

import { Button } from './Button';

export interface ErrorMessageProps {
  message: string;
  type?: 'error' | 'warning' | 'info';
  onRetry?: () => void;
}

const typeStyles = {
  error: 'bg-danger/10 border-danger text-danger',
  warning: 'bg-accent/10 border-accent text-accent',
  info: 'bg-primary/10 border-primary text-primary',
};

/**
 * エラーメッセージコンポーネント
 */
export function ErrorMessage({
  message,
  type = 'error',
  onRetry,
}: ErrorMessageProps) {
  return (
    <div
      className={`rounded-xl border p-4 ${typeStyles[type]}`}
      role="alert"
    >
      <p className="text-sm">{message}</p>
      {onRetry && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRetry}
          className="mt-2"
        >
          再試行
        </Button>
      )}
    </div>
  );
}

/**
 * 空状態メッセージ
 */
export function EmptyState({
  message,
  icon,
}: {
  message: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && <div className="mb-4 text-text-secondary">{icon}</div>}
      <p className="text-text-secondary">{message}</p>
    </div>
  );
}
