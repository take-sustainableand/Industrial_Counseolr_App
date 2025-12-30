/**
 * バリデーションエラー
 * 入力値の検証に失敗した場合に使用
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public value: unknown
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * リソース未存在エラー
 * 指定されたリソースが見つからない場合に使用
 */
export class NotFoundError extends Error {
  constructor(resource: string, id: string | number) {
    super(`${resource} not found: ${id}`);
    this.name = 'NotFoundError';
  }
}

/**
 * 認証エラー
 * ユーザーが認証されていない場合に使用
 */
export class AuthenticationError extends Error {
  constructor(message: string = '認証が必要です') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

/**
 * 認可エラー
 * ユーザーに操作権限がない場合に使用
 */
export class AuthorizationError extends Error {
  constructor(message: string = 'この操作を行う権限がありません') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

/**
 * データベースエラー
 * データベース操作に失敗した場合に使用
 */
export class DatabaseError extends Error {
  constructor(
    message: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

/**
 * エラーがValidationErrorかどうかを判定
 */
export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

/**
 * エラーがNotFoundErrorかどうかを判定
 */
export function isNotFoundError(error: unknown): error is NotFoundError {
  return error instanceof NotFoundError;
}

/**
 * エラーがAuthenticationErrorかどうかを判定
 */
export function isAuthenticationError(error: unknown): error is AuthenticationError {
  return error instanceof AuthenticationError;
}

/**
 * エラーメッセージを取得
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return '予期しないエラーが発生しました';
}
