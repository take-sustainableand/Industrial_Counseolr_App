import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * 保護されたルート（認証必須）
 */
export const PROTECTED_ROUTES = ['/', '/study', '/history', '/weak', '/admin'];

/**
 * 公開ルート（認証不要）
 */
export const PUBLIC_ROUTES = ['/login', '/auth'];

/**
 * 認証ミドルウェア用のSupabaseクライアントを作成し、セッションを更新する
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // セッションを更新（重要: getUser()を呼ぶことでセッションが更新される）
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 認証が必要なパスの設定
  const protectedPaths = ['/', '/study', '/history', '/weak', '/admin'];
  const isProtectedPath = protectedPaths.some(
    (path) =>
      request.nextUrl.pathname === path ||
      request.nextUrl.pathname.startsWith(`${path}/`)
  );

  // 未認証ユーザーを/loginにリダイレクト
  if (!user && isProtectedPath) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // 認証済みユーザーが/loginにアクセスした場合はホームにリダイレクト
  if (user && request.nextUrl.pathname === '/login') {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
