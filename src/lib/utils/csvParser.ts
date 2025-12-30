import { csvRowSchema } from '@/lib/validations/schemas';

export interface ParsedQuestion {
  chapter_id: string;
  chapter_name: string;
  question_text: string;
  correct_answer: boolean;
  explanation: string | null;
}

export interface ParseResult {
  success: boolean;
  questions: ParsedQuestion[];
  errors: { row: number; message: string }[];
}

/**
 * CSVテキストをパースして問題データに変換
 *
 * CSVフォーマット:
 * chapter_id,chapter_name,question_text,correct_answer,explanation
 *
 * correct_answer: 1=○, 0=×
 */
export function parseCSV(csvText: string): ParseResult {
  const lines = csvText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return {
      success: false,
      questions: [],
      errors: [{ row: 0, message: 'CSVが空です' }],
    };
  }

  // ヘッダー行をスキップ（オプション）
  const headerLine = lines[0].toLowerCase();
  const hasHeader =
    headerLine.includes('chapter_id') ||
    headerLine.includes('question_text') ||
    headerLine.includes('分野');

  const dataLines = hasHeader ? lines.slice(1) : lines;
  const questions: ParsedQuestion[] = [];
  const errors: { row: number; message: string }[] = [];

  dataLines.forEach((line, index) => {
    const rowNumber = hasHeader ? index + 2 : index + 1;

    try {
      const columns = parseCSVLine(line);

      if (columns.length < 4) {
        errors.push({
          row: rowNumber,
          message: `列数が不足しています（必要: 4以上, 実際: ${columns.length}）`,
        });
        return;
      }

      const [chapterId, chapterName, questionText, correctAnswer, explanation] = columns;

      // バリデーション
      const result = csvRowSchema.safeParse({
        chapterId,
        chapterName,
        questionText,
        correctAnswer,
        explanation: explanation || null,
      });

      if (!result.success) {
        const errorMessages = result.error.issues.map((e: { message: string }) => e.message).join(', ');
        errors.push({
          row: rowNumber,
          message: errorMessages,
        });
        return;
      }

      questions.push({
        chapter_id: chapterId.trim(),
        chapter_name: chapterName.trim(),
        question_text: questionText.trim(),
        correct_answer: correctAnswer.trim() === '1' || correctAnswer.trim().toLowerCase() === 'true',
        explanation: explanation?.trim() || null,
      });
    } catch {
      errors.push({
        row: rowNumber,
        message: 'パースに失敗しました',
      });
    }
  });

  return {
    success: errors.length === 0,
    questions,
    errors,
  };
}

/**
 * CSV行をパース（ダブルクォート対応）
 */
function parseCSVLine(line: string): string[] {
  const columns: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        // エスケープされたダブルクォート
        current += '"';
        i++;
      } else if (char === '"') {
        // クォート終了
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        // クォート開始
        inQuotes = true;
      } else if (char === ',') {
        // カラム区切り
        columns.push(current);
        current = '';
      } else {
        current += char;
      }
    }
  }

  // 最後のカラム
  columns.push(current);

  return columns;
}
