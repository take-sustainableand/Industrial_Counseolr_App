'use client';

import { useRouter } from 'next/navigation';

export interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  rightElement?: React.ReactNode;
}

/**
 * ヘッダーコンポーネント
 */
export function Header({ title, showBackButton = false, rightElement }: HeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-10 bg-surface border-b border-border safe-area-pt">
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showBackButton && (
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 text-text-primary hover:text-text-secondary transition-colors"
              aria-label="戻る"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <h1 className="text-lg font-bold text-text-primary">{title}</h1>
        </div>
        {rightElement && <div>{rightElement}</div>}
      </div>
    </header>
  );
}
