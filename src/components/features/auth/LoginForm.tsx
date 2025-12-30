'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/lib/hooks/useAuth';
import { emailSchema } from '@/lib/validations/schemas';

type FormState = 'idle' | 'loading' | 'success' | 'error';

/**
 * ログインフォームコンポーネント
 * マジックリンク認証を使用
 */
export function LoginForm() {
  const [email, setEmail] = useState('');
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { signInWithMagicLink } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // バリデーション
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setErrorMessage('有効なメールアドレスを入力してください');
      return;
    }

    setFormState('loading');

    const { success, error } = await signInWithMagicLink(email);

    if (success) {
      setFormState('success');
    } else {
      setFormState('error');
      setErrorMessage(error || 'エラーが発生しました');
    }
  };

  if (formState === 'success') {
    return (
      <Card className="text-center">
        <div className="mb-4">
          <svg
            className="w-16 h-16 mx-auto text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold mb-2">メールを送信しました</h2>
        <p className="text-text-secondary">
          {email} にログインリンクを送信しました。
          <br />
          メールを確認してリンクをクリックしてください。
        </p>
        <Button
          variant="ghost"
          className="mt-4"
          onClick={() => {
            setFormState('idle');
            setEmail('');
          }}
        >
          別のメールアドレスで試す
        </Button>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-xl font-bold text-center mb-6">ログイン</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium mb-1"
          >
            メールアドレス
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            disabled={formState === 'loading'}
            autoComplete="email"
            required
          />
        </div>

        {errorMessage && (
          <div className="p-3 rounded-lg bg-danger/10 text-danger text-sm">
            {errorMessage}
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={formState === 'loading'}
        >
          {formState === 'loading' ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              送信中...
            </span>
          ) : (
            'ログインリンクを送信'
          )}
        </Button>
      </form>

      <p className="mt-4 text-sm text-text-secondary text-center">
        パスワードは不要です。
        <br />
        メールに届くリンクをクリックするだけでログインできます。
      </p>
    </Card>
  );
}
