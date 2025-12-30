'use client';

export interface BookmarkButtonProps {
  isBookmarked: boolean;
  onClick: () => void;
  disabled?: boolean;
}

/**
 * ブックマークボタンコンポーネント
 */
export function BookmarkButton({ isBookmarked, onClick, disabled = false }: BookmarkButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-2 rounded-lg transition-colors ${
        isBookmarked
          ? 'text-accent bg-accent/10'
          : 'text-text-secondary hover:text-accent hover:bg-accent/5'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      aria-label={isBookmarked ? 'ブックマークを解除' : 'ブックマークに追加'}
    >
      <svg
        className="w-6 h-6"
        fill={isBookmarked ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
        />
      </svg>
    </button>
  );
}
