import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getBookmarkedQuestions } from '@/lib/supabase/repositories/questionRepository';

const DEFAULT_COUNT = 10;

/**
 * ブックマーク問題を取得するAPI
 * GET /api/questions/bookmarks?count=10
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const count = parseInt(searchParams.get('count') ?? String(DEFAULT_COUNT), 10);

    const supabase = await createServerClient();

    // ユーザー認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    // ブックマーク問題を取得
    const questions = await getBookmarkedQuestions(user.id, count);

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Bookmark questions API error:', error);
    return NextResponse.json(
      { error: '問題の取得に失敗しました' },
      { status: 500 }
    );
  }
}
