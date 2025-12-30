'use client';

import { useState, useEffect, useCallback } from 'react';
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js';
import { createBrowserClient } from '@/lib/supabase/client';

export interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithMagicLink: (email: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

/**
 * 認証状態を管理するカスタムフック
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserClient();

  useEffect(() => {
    // 現在のセッションを取得
    const getSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error('Session error:', sessionError);
          setError('セッションの取得に失敗しました');
        } else {
          setUser(session?.user ?? null);
        }
      } catch (err) {
        console.error('Session fetch error:', err);
        setError('セッションの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user ?? null);
        setLoading(false);

        if (event === 'SIGNED_OUT') {
          setError(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  /**
   * マジックリンクでサインイン
   */
  const signInWithMagicLink = useCallback(
    async (email: string): Promise<{ success: boolean; error?: string }> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/auth/magic-link', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (!response.ok) {
          const errorMessage = data.error || 'マジックリンクの送信に失敗しました';
          setError(errorMessage);
          return { success: false, error: errorMessage };
        }

        return { success: true };
      } catch {
        const errorMessage = 'ネットワークエラーが発生しました';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * サインアウト
   */
  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        setError('サインアウトに失敗しました');
      }
    } catch {
      setError('サインアウトに失敗しました');
    } finally {
      setLoading(false);
    }
  }, [supabase.auth]);

  return {
    user,
    loading,
    error,
    signInWithMagicLink,
    signOut,
  };
}
