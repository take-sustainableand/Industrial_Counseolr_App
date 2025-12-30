import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

/**
 * 管理者チェックAPI
 * GET /api/auth/check-admin
 */
export async function GET() {
  try {
    const supabase = await createServerClient();

    // ユーザー認証チェック
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { isAdmin: false },
        { status: 401 }
      );
    }

    // 管理者チェック
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    return NextResponse.json({
      isAdmin: profile?.is_admin ?? false,
    });
  } catch (error) {
    console.error('Check admin API error:', error);
    return NextResponse.json(
      { isAdmin: false },
      { status: 500 }
    );
  }
}
