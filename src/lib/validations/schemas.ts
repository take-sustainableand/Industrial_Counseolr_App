import { z } from 'zod';

/**
 * メールアドレスのバリデーションスキーマ
 */
export const emailSchema = z.object({
  email: z
    .string()
    .min(1, 'メールアドレスを入力してください')
    .email('有効なメールアドレスを入力してください'),
});

export type EmailInput = z.infer<typeof emailSchema>;

/**
 * 回答記録のバリデーションスキーマ
 */
export const answerSchema = z.object({
  questionId: z.number().int().positive('問題IDが不正です'),
  isCorrect: z.boolean(),
});

export type AnswerInput = z.infer<typeof answerSchema>;

/**
 * ブックマーク追加のバリデーションスキーマ
 */
export const bookmarkSchema = z.object({
  questionId: z.number().int().positive('問題IDが不正です'),
});

export type BookmarkInput = z.infer<typeof bookmarkSchema>;

/**
 * 問題取得のクエリパラメータスキーマ
 */
export const questionsQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .pipe(z.number().int().min(1).max(50)),
});

export type QuestionsQuery = z.infer<typeof questionsQuerySchema>;

/**
 * 日別統計のクエリパラメータスキーマ
 */
export const dailyStatsQuerySchema = z.object({
  days: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 7))
    .pipe(z.number().int().min(1).max(30)),
});

export type DailyStatsQuery = z.infer<typeof dailyStatsQuerySchema>;

/**
 * CSV問題データのバリデーションスキーマ
 */
export const csvQuestionSchema = z.object({
  id: z.number().int().positive(),
  chapter: z.number().int().min(1),
  chapterTitle: z.string().min(1),
  category: z.string().min(1),
  problemNo: z.number().int().nullable(),
  problemPrompt: z.string().nullable(),
  statementNo: z.number().int().nullable(),
  statementText: z.string().min(1),
  answer: z.enum(['○', '×']),
  explanation: z.string().nullable(),
});

export type CsvQuestionInput = z.infer<typeof csvQuestionSchema>;

/**
 * CSVアップロード時の行バリデーションスキーマ
 * CSVパーサーで使用（簡易版）
 */
export const csvRowSchema = z.object({
  chapterId: z.string().min(1, '分野IDは必須です'),
  chapterName: z.string().min(1, '分野名は必須です'),
  questionText: z.string().min(1, '問題文は必須です'),
  correctAnswer: z.string().refine(
    (val) => ['0', '1', 'true', 'false', '○', '×'].includes(val.toLowerCase()),
    '正解は 0/1 または ○/× で指定してください'
  ),
  explanation: z.string().nullable().optional(),
});

export type CsvRowInput = z.infer<typeof csvRowSchema>;
