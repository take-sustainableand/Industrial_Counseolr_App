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
