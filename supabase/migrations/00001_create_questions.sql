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
