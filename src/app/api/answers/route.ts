import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { recordAnswer } from '@/lib/supabase/repositories/answerRepository';
import { answerSchema } from '@/lib/validations/schemas';

/**
 * 回答を記録するAPI
 * POST /api/answers
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // バリデーション
    const result = answerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'リクエストが不正です' },
        { status: 400 }
      );
    }

    const { questionId, isCorrect } = result.data;
    const supabase = await createServerClient();

    // ユーザー認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    // 回答を記録
    await recordAnswer(user.id, questionId, isCorrect);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Answer API error:', error);
    return NextResponse.json(
      { error: '回答の記録に失敗しました' },
      { status: 500 }
    );
  }
}
