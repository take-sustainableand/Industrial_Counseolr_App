-- 問題テーブル
CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY,
  chapter INTEGER NOT NULL,
  chapter_title VARCHAR(255) NOT NULL,
  category VARCHAR(255) NOT NULL,
  problem_no INTEGER,
  problem_prompt TEXT,
  statement_no INTEGER,
  statement_text TEXT NOT NULL,
  answer VARCHAR(2) NOT NULL CHECK (answer IN ('○', '×')),
  explanation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_questions_chapter ON questions(chapter);

-- 更新日時の自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_questions_updated_at
  BEFORE UPDATE ON questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
-- ユーザープロフィールテーブル
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ユーザー作成時に自動でプロフィールを作成するトリガー
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
-- 回答履歴テーブル
CREATE TABLE IF NOT EXISTS answer_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  is_correct BOOLEAN NOT NULL,
  answered_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_answer_history_user_date ON answer_history(user_id, answered_at DESC);
CREATE INDEX IF NOT EXISTS idx_answer_history_question ON answer_history(question_id);
CREATE INDEX IF NOT EXISTS idx_answer_history_user_question ON answer_history(user_id, question_id);
-- ブックマークテーブル
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);
-- 日別サマリービュー
CREATE OR REPLACE VIEW daily_summary AS
SELECT
  user_id,
  DATE(answered_at) as study_date,
  COUNT(*) as total_answers,
  SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct_count,
  ROUND(
    (SUM(CASE WHEN is_correct THEN 1 ELSE 0 END)::NUMERIC / COUNT(*)) * 100,
    1
  ) as accuracy
FROM answer_history
GROUP BY user_id, DATE(answered_at);

-- 分野別正答率ビュー
CREATE OR REPLACE VIEW category_accuracy AS
SELECT
  ah.user_id,
  q.chapter,
  q.chapter_title,
  COUNT(*) as total_answers,
  SUM(CASE WHEN ah.is_correct THEN 1 ELSE 0 END) as correct_count,
  ROUND(
    (SUM(CASE WHEN ah.is_correct THEN 1 ELSE 0 END)::NUMERIC / COUNT(*)) * 100,
    1
  ) as accuracy
FROM answer_history ah
JOIN questions q ON ah.question_id = q.id
GROUP BY ah.user_id, q.chapter, q.chapter_title;
-- 苦手問題を取得する関数
CREATE OR REPLACE FUNCTION get_weak_questions(p_user_id UUID, p_limit INTEGER DEFAULT 10)
RETURNS SETOF questions AS $$
BEGIN
  RETURN QUERY
  SELECT q.* FROM (
    -- 直近の回答が不正解だった問題
    SELECT DISTINCT ON (ah.question_id) ah.question_id, ah.is_correct
    FROM answer_history ah
    WHERE ah.user_id = p_user_id
    ORDER BY ah.question_id, ah.answered_at DESC
  ) AS last_answers
  JOIN questions q ON q.id = last_answers.question_id
  WHERE last_answers.is_correct = FALSE

  UNION ALL

  -- 未回答の問題
  SELECT q.* FROM questions q
  WHERE NOT EXISTS (
    SELECT 1 FROM answer_history ah
    WHERE ah.question_id = q.id AND ah.user_id = p_user_id
  )

  ORDER BY RANDOM()
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 今日の学習サマリーを取得する関数
CREATE OR REPLACE FUNCTION get_today_summary(p_user_id UUID)
RETURNS TABLE (
  total_answers BIGINT,
  correct_count BIGINT,
  accuracy NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_answers,
    SUM(CASE WHEN is_correct THEN 1 ELSE 0 END)::BIGINT as correct_count,
    CASE
      WHEN COUNT(*) = 0 THEN 0
      ELSE ROUND((SUM(CASE WHEN is_correct THEN 1 ELSE 0 END)::NUMERIC / COUNT(*)) * 100, 1)
    END as accuracy
  FROM answer_history
  WHERE user_id = p_user_id
    AND DATE(answered_at) = CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 分野一覧を取得する関数（重複なし）
CREATE OR REPLACE FUNCTION get_chapters()
RETURNS TABLE (
  chapter INTEGER,
  chapter_title VARCHAR(255),
  question_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    q.chapter,
    q.chapter_title,
    COUNT(*)::BIGINT as question_count
  FROM questions q
  GROUP BY q.chapter, q.chapter_title
  ORDER BY q.chapter;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
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
