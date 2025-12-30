'use client';

/**
 * グローバルエラーバウンダリ
 * アプリ全体で発生した予期しないエラーをキャッチして表示
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ja">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              エラーが発生しました
            </h2>
            <p className="text-gray-600 mb-6">
              予期しないエラーが発生しました。
              <br />
              再試行するか、しばらく経ってからもう一度お試しください。
            </p>
            {process.env.NODE_ENV === 'development' && error.message && (
              <p className="text-sm text-gray-500 mb-4 p-2 bg-gray-100 rounded">
                {error.message}
              </p>
            )}
            <button
              onClick={() => reset()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              再試行
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
