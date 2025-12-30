import { LoginForm } from '@/components/features/auth/LoginForm';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">産カウ問題集</h1>
          <p className="text-text-secondary">
            産業カウンセラー試験対策アプリ
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
