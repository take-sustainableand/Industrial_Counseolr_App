import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr';

// ビルド時のフォールバック用ダミーURL（実際には使用されない）
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

/**
 * ブラウザ用Supabaseクライアントを作成
 *
 * クライアントコンポーネントで使用する
 * ビルド時には環境変数がない場合があるため、フォールバックを使用
 */
export function createClient() {
  return createSupabaseBrowserClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );
}

/**
 * createBrowserClient エイリアス
 * 後方互換性のため
 */
export { createClient as createBrowserClient };
