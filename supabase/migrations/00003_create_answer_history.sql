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
