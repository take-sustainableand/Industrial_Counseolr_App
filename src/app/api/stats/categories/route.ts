import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getCategoryStats } from '@/lib/supabase/repositories/statsRepository';

/**
 * カテゴリ別統計を取得するAPI
 * GET /api/stats/categories
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

    // カテゴリ別統計を取得
    const stats = await getCategoryStats(user.id);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Category stats API error:', error);
    return NextResponse.json(
      { error: '統計の取得に失敗しました' },
      { status: 500 }
    );
  }
}
