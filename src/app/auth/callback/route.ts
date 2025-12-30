import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

/**
 * 認証コールバックハンドラー
 * マジックリンクのクリック後にリダイレクトされる
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // 認証成功：リダイレクト先へ
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // 認証失敗：ログインページへリダイレクト（エラーパラメータ付き）
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
