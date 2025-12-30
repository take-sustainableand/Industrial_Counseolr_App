import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { addBookmark, getBookmarks } from '@/lib/supabase/repositories/bookmarkRepository';
import { bookmarkSchema } from '@/lib/validations/schemas';

/**
 * ブックマーク一覧を取得するAPI
 * GET /api/bookmarks
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

    // ブックマーク一覧を取得
    const bookmarks = await getBookmarks(user.id);

    return NextResponse.json({ bookmarks });
  } catch (error) {
    console.error('Bookmarks GET API error:', error);
    return NextResponse.json(
      { error: 'ブックマークの取得に失敗しました' },
      { status: 500 }
    );
  }
}

/**
 * ブックマークを追加するAPI
 * POST /api/bookmarks
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // バリデーション
    const result = bookmarkSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'リクエストが不正です' },
        { status: 400 }
      );
    }

    const { questionId } = result.data;
    const supabase = await createServerClient();

    // ユーザー認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    // ブックマークを追加
    await addBookmark(user.id, questionId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Bookmarks POST API error:', error);
    return NextResponse.json(
      { error: 'ブックマークの追加に失敗しました' },
      { status: 500 }
    );
  }
}
