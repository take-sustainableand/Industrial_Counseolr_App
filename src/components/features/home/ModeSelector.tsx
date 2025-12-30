'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { StudyMode } from '@/types';

interface ModeOption {
  mode: StudyMode;
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color: string;
}

const modeOptions: ModeOption[] = [
  {
    mode: 'random',
    title: 'ランダム',
    description: '全分野からランダムに出題',
    href: '/study/random',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    color: 'text-primary',
  },
  {
    mode: 'category',
    title: '分野別',
    description: '分野を選んで学習',
    href: '/study/category',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    color: 'text-accent',
  },
  {
    mode: 'weak',
    title: '苦手問題',
    description: '間違えた問題を復習',
    href: '/study/weak',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    color: 'text-danger',
  },
  {
    mode: 'bookmark',
    title: 'ブックマーク',
    description: '保存した問題を復習',
    href: '/study/bookmark',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
    ),
    color: 'text-accent',
  },
];

/**
 * 学習モード選択コンポーネント
 */
export function ModeSelector() {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold">学習モード</h2>

      <div className="grid grid-cols-2 gap-3">
        {modeOptions.map((option) => (
          <Link key={option.mode} href={option.href}>
            <Card padding="md" className="h-full hover:border-primary transition-colors">
              <div className={`mb-2 ${option.color}`}>
                {option.icon}
              </div>
              <h3 className="font-bold">{option.title}</h3>
              <p className="text-sm text-text-secondary mt-1">
                {option.description}
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
