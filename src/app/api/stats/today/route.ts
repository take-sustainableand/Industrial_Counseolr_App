import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getTodaySummary } from '@/lib/supabase/repositories/statsRepository';

/**
 * 今日の学習統計を取得するAPI
 * GET /api/stats/today
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

    // 今日の統計を取得
    const summary = await getTodaySummary(user.id);

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Today stats API error:', error);
    return NextResponse.json(
      { error: '統計の取得に失敗しました' },
      { status: 500 }
    );
  }
}
