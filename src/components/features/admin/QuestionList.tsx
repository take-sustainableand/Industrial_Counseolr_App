'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface QuestionSummary {
  chapter_id: string;
  chapter_name: string;
  question_count: number;
}

/**
 * 問題一覧コンポーネント
 */
export function QuestionList() {
  const [chapters, setChapters] = useState<QuestionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const res = await fetch('/api/questions/chapters');
        if (res.ok) {
          const data = await res.json();
          setChapters(data.chapters ?? []);
          setTotalCount(
            (data.chapters ?? []).reduce(
              (acc: number, ch: QuestionSummary) => acc + ch.question_count,
              0
            )
          );
        }
      } catch (err) {
        console.error('Failed to fetch chapters:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchChapters();
  }, []);

  if (loading) {
    return (
      <Card className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="font-bold mb-4">登録済み問題</h3>

      {chapters.length === 0 ? (
        <p className="text-text-secondary text-center py-4">
          問題が登録されていません
        </p>
      ) : (
        <>
          <div className="mb-4 p-3 rounded-lg bg-background">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">合計</span>
              <span className="font-bold text-lg">{totalCount}問</span>
            </div>
          </div>

          <div className="space-y-2">
            {chapters.map((chapter) => (
              <div
                key={chapter.chapter_id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-background transition-colors"
              >
                <span className="text-sm">{chapter.chapter_name}</span>
                <span className="text-sm text-text-secondary">
                  {chapter.question_count}問
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
