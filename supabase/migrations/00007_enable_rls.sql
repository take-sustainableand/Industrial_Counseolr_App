-- Row Level Security (RLS) の有効化

-- user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- questions
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view questions"
  ON questions FOR SELECT
  USING (auth.role() = 'authenticated');

-- 管理者のみ問題を追加・更新・削除可能（service_role経由）
CREATE POLICY "Service role can manage questions"
  ON questions FOR ALL
  USING (auth.role() = 'service_role');

-- answer_history
ALTER TABLE answer_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own answer history"
  ON answer_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own answer history"
  ON answer_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- bookmarks
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookmarks"
  ON bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks"
  ON bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks"
  ON bookmarks FOR DELETE
  USING (auth.uid() = user_id);
