'use client';

import { useState, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface UploadResult {
  success: boolean;
  insertedCount?: number;
  errors?: { row: number; message: string }[];
  error?: string;
}

/**
 * CSVアップロードコンポーネント
 */
export function CSVUploader() {
  const [csvText, setCsvText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        setCsvText(text);
        setResult(null);
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleUpload = async () => {
    if (!csvText.trim()) {
      setResult({ success: false, error: 'CSVデータを入力してください' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/admin/questions/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv: csvText }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResult({
          success: false,
          error: data.error,
          errors: data.details,
        });
      } else {
        setResult({
          success: true,
          insertedCount: data.insertedCount,
          errors: data.errors,
        });
        setCsvText('');
      }
    } catch {
      setResult({ success: false, error: 'アップロードに失敗しました' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <h3 className="font-bold mb-4">問題CSVアップロード</h3>

      <div className="space-y-4">
        {/* ファイル選択 */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
          >
            CSVファイルを選択
          </Button>
        </div>

        {/* テキストエリア */}
        <div>
          <label className="block text-sm font-medium mb-1">
            CSVデータ（直接入力も可）
          </label>
          <textarea
            value={csvText}
            onChange={(e) => {
              setCsvText(e.target.value);
              setResult(null);
            }}
            placeholder="chapter_id,chapter_name,question_text,correct_answer,explanation"
            className="w-full h-40 px-3 py-2 rounded-lg border border-border bg-surface text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* フォーマット説明 */}
        <div className="p-3 rounded-lg bg-background text-xs text-text-secondary">
          <p className="font-medium mb-1">CSVフォーマット:</p>
          <p>chapter_id,chapter_name,question_text,correct_answer,explanation</p>
          <p className="mt-1">correct_answer: 1=○, 0=×</p>
        </div>

        {/* 結果表示 */}
        {result && (
          <div
            className={`p-3 rounded-lg ${
              result.success ? 'bg-primary/10 text-primary' : 'bg-danger/10 text-danger'
            }`}
          >
            {result.success ? (
              <p>{result.insertedCount}件の問題を登録しました</p>
            ) : (
              <p>{result.error}</p>
            )}

            {result.errors && result.errors.length > 0 && (
              <div className="mt-2 text-xs">
                <p className="font-medium">エラー詳細:</p>
                <ul className="list-disc list-inside mt-1">
                  {result.errors.slice(0, 5).map((err, i) => (
                    <li key={i}>
                      行{err.row}: {err.message}
                    </li>
                  ))}
                  {result.errors.length > 5 && (
                    <li>他 {result.errors.length - 5} 件のエラー</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* アップロードボタン */}
        <Button
          variant="primary"
          className="w-full"
          onClick={handleUpload}
          disabled={loading || !csvText.trim()}
        >
          {loading ? 'アップロード中...' : 'アップロード'}
        </Button>
      </div>
    </Card>
  );
}
