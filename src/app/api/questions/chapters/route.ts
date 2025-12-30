import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getChapters } from '@/lib/supabase/repositories/questionRepository';

/**
 * 分野一覧を取得するAPI
 * GET /api/questions/chapters
 */
export async function GET() {
  try {
    const supabase = await createServerClient();

    // ユーザー認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    // 分野一覧を取得
    const chapters = await getChapters();

    return NextResponse.json({ chapters });
  } catch (error) {
    console.error('Chapters API error:', error);
    return NextResponse.json(
      { error: '分野の取得に失敗しました' },
      { status: 500 }
    );
  }
}
