import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { removeBookmark } from '@/lib/supabase/repositories/bookmarkRepository';

/**
 * ブックマークを削除するAPI
 * DELETE /api/bookmarks/[questionId]
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    const { questionId } = await params;

    const supabase = await createServerClient();

    // ユーザー認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    // ブックマークを削除
    await removeBookmark(user.id, parseInt(questionId, 10));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Bookmark DELETE API error:', error);
    return NextResponse.json(
      { error: 'ブックマークの削除に失敗しました' },
      { status: 500 }
    );
  }
}
