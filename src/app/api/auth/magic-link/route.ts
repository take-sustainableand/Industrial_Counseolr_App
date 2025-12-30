import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { emailSchema } from '@/lib/validations/schemas';

/**
 * マジックリンク送信API
 * POST /api/auth/magic-link
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // バリデーション
    const result = emailSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: '有効なメールアドレスを入力してください' },
        { status: 400 }
      );
    }

    const email = result.data.email;
    const supabase = await createServerClient();

    // マジックリンクを送信
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${request.nextUrl.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error('Magic link error:', error);
      return NextResponse.json(
        { error: 'メールの送信に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Magic link API error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
