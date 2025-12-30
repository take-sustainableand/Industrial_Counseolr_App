import { type NextRequest } from 'next/server';
import { updateSession, PROTECTED_ROUTES, PUBLIC_ROUTES } from '@/lib/supabase/middleware';

/**
 * Next.js ミドルウェア
 * 認証状態の管理とルート保護を行う
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 認証が不要なルートはスルー
  if (isPublicRoute(pathname)) {
    return updateSession(request);
  }

  // 保護されたルートの認証チェック
  if (isProtectedRoute(pathname)) {
    return updateSession(request);
  }

  // デフォルト：セッションを更新
  return updateSession(request);
}

/**
 * 公開ルートかどうかを判定
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route: string) => pathname.startsWith(route));
}

/**
 * 保護されたルートかどうかを判定
 */
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route: string) => pathname.startsWith(route));
}

/**
 * ミドルウェアを適用するパスの設定
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     * - manifest.json (PWA manifest)
     */
    '/((?!_next/static|_next/image|favicon.ico|images|manifest.json).*)',
  ],
};
