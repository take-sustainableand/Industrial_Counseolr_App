import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { parseCSV } from '@/lib/utils/csvParser';

/**
 * CSV問題アップロードAPI
 * POST /api/admin/questions/upload
 */
export async function POST(request: Request) {
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

    // 管理者チェック（user_profilesのis_adminをチェック）
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json(
        { error: '管理者権限が必要です' },
        { status: 403 }
      );
    }

    // リクエストボディからCSVテキストを取得
    const body = await request.json();
    const { csv } = body;

    if (!csv || typeof csv !== 'string') {
      return NextResponse.json(
        { error: 'CSVデータが必要です' },
        { status: 400 }
      );
    }

    // CSVをパース
    const parseResult = parseCSV(csv);

    if (parseResult.errors.length > 0 && parseResult.questions.length === 0) {
      return NextResponse.json(
        {
          error: 'CSVのパースに失敗しました',
          details: parseResult.errors,
        },
        { status: 400 }
      );
    }

    // 問題をデータベースに挿入
    const { error: insertError } = await supabase
      .from('questions')
      .insert(parseResult.questions);

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json(
        { error: '問題の登録に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      insertedCount: parseResult.questions.length,
      errors: parseResult.errors,
    });
  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
