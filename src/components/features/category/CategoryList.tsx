'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/Card';

interface Chapter {
  chapter_id: string;
  chapter_name: string;
  question_count: number;
}

export interface CategoryListProps {
  chapters: Chapter[];
}

/**
 * 分野一覧コンポーネント
 */
export function CategoryList({ chapters }: CategoryListProps) {
  if (chapters.length === 0) {
    return (
      <Card className="text-center py-8">
        <p className="text-text-secondary">
          分野がありません
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {chapters.map((chapter) => (
        <Link
          key={chapter.chapter_id}
          href={`/study/category?chapterId=${chapter.chapter_id}`}
        >
          <Card className="hover:border-primary transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold">{chapter.chapter_name}</h3>
                <p className="text-sm text-text-secondary">
                  {chapter.question_count}問
                </p>
              </div>
              <svg
                className="w-5 h-5 text-text-secondary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
