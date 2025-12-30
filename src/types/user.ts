/**
 * ユーザープロフィールエンティティ
 */
export interface UserProfile {
  id: string;
  email: string;
  createdAt: Date;
}

/**
 * ユーザープロフィール（API レスポンス用）
 */
export interface UserProfileResponse {
  id: string;
  email: string;
  createdAt: string;
}
