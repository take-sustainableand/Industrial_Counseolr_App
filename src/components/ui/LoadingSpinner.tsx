export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

/**
 * ローディングスピナーコンポーネント
 */
export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizeStyles[size]} animate-spin rounded-full border-2 border-border border-t-primary`}
      />
    </div>
  );
}

/**
 * 全画面ローディング
 */
export function FullPageLoading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <LoadingSpinner size="lg" />
    </div>
  );
}
