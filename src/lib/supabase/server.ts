import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * サーバー用Supabaseクライアントを作成
 *
 * Server Components、API Routes、Server Actionsで使用する
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Componentから呼ばれた場合は無視
            // set はServer ActionsかRoute Handlerでのみ可能
          }
        },
      },
    }
  );
}

/**
 * createServerClient エイリアス
 * 後方互換性のため
 */
export { createClient as createServerClient };
