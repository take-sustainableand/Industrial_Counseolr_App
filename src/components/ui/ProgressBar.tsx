export interface ProgressBarProps {
  current: number;
  total: number;
  showLabel?: boolean;
  variant?: 'primary' | 'accent';
}

const variantStyles = {
  primary: 'bg-primary',
  accent: 'bg-accent',
};

/**
 * 進捗バーコンポーネント
 */
export function ProgressBar({
  current,
  total,
  showLabel = true,
  variant = 'primary',
}: ProgressBarProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-sm text-text-secondary mb-1">
          <span>{current} / {total}</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="w-full h-2 bg-border rounded-full overflow-hidden">
        <div
          className={`h-full ${variantStyles[variant]} transition-all duration-300 ease-out rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
