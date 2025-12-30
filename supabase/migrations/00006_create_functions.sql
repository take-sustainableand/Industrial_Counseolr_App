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
