import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getDailyStats } from '@/lib/supabase/repositories/statsRepository';

/**
 * 日別統計を取得するAPI
 * GET /api/stats/daily?days=7
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') ?? '7', 10);

    const supabase = await createServerClient();

    // ユーザー認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    // 日別統計を取得
    const stats = await getDailyStats(user.id, days);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Daily stats API error:', error);
    return NextResponse.json(
      { error: '統計の取得に失敗しました' },
      { status: 500 }
    );
  }
}
