import { NavBar } from '../ui/NavBar';

/**
 * 下部ナビゲーション付きレイアウト
 */
export function BottomNav() {
  return <NavBar />;
}

/**
 * 下部ナビゲーション用のスペーサー
 * ナビゲーションバーの高さ分のマージンを確保
 */
export function BottomNavSpacer() {
  return <div className="h-20" />;
}
