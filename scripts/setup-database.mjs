/**
 * Supabaseデータベースセットアップスクリプト
 *
 * マイグレーションの実行とCSVデータのインポートを行います。
 *
 * 使用方法:
 * node scripts/setup-database.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));

// .env.localを読み込み
config({ path: join(__dirname, '..', '.env.local') });

// 環境変数から接続情報を取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) must be set');
  console.error('Please check your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * マイグレーションファイルを実行
 */
async function runMigrations() {
  console.log('📦 Running migrations...\n');

  const migrationsDir = join(__dirname, '..', 'supabase', 'migrations');

  try {
    const files = readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      console.log(`  Executing: ${file}`);
      const sql = readFileSync(join(migrationsDir, file), 'utf-8');

      // SQLを実行（Supabase REST APIではraw SQLは直接実行できないため、
      // SQL Editorで手動実行が必要な場合があります）
      const { error } = await supabase.rpc('exec_sql', { sql_query: sql }).single();

      if (error) {
        // exec_sql関数がない場合は手動実行を案内
        if (error.code === 'PGRST202') {
          console.log(`    ⚠️  Cannot execute SQL via API. Please run manually in Supabase SQL Editor.`);
        } else {
          console.log(`    ⚠️  Warning: ${error.message}`);
        }
      } else {
        console.log(`    ✅ Done`);
      }
    }

    console.log('\n✅ Migrations completed (or need manual execution)\n');
  } catch (err) {
    console.error('Migration error:', err.message);
    console.log('\n⚠️  Please run migrations manually in Supabase SQL Editor\n');
  }
}

/**
 * CSVファイルをパースしてデータをインポート
 */
async function importCsvData(csvPath) {
  console.log('📥 Importing CSV data...\n');

  const csvContent = readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n').filter(line => line.trim());

  // ヘッダー行を解析
  const header = lines[0].replace(/^\uFEFF/, ''); // BOMを除去
  const columns = parseCSVLine(header);
  console.log(`  Columns: ${columns.join(', ')}`);

  const dataLines = lines.slice(1);
  console.log(`  Total rows: ${dataLines.length}\n`);

  // バッチでインサート（100件ずつ）
  const batchSize = 100;
  let insertedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < dataLines.length; i += batchSize) {
    const batch = dataLines.slice(i, i + batchSize);
    const rows = batch.map(line => {
      const values = parseCSVLine(line);
      return {
        id: parseInt(values[0]) || null,
        chapter: parseInt(values[2]) || 1,
        chapter_title: values[3] || '',
        problem_no: parseInt(values[4]) || null,
        problem_prompt: values[5] || null,
        category: values[6] || '',
        statement_no: parseInt(values[7]) || null,
        statement_text: values[8] || '',
        answer: values[9] || '○',
        explanation: values[10] || null,
      };
    }).filter(row => row.id && row.statement_text); // 空行とID欠損をスキップ

    if (rows.length === 0) continue;

    const { error } = await supabase
      .from('questions')
      .insert(rows);

    if (error) {
      console.log(`  ⚠️  Batch ${Math.floor(i / batchSize) + 1} error: ${error.message}`);
      errorCount += rows.length;
    } else {
      insertedCount += rows.length;
      process.stdout.write(`\r  Progress: ${insertedCount} / ${dataLines.length} rows inserted`);
    }
  }

  console.log(`\n\n✅ Import completed: ${insertedCount} rows inserted, ${errorCount} errors\n`);
}

/**
 * CSV行をパース（ダブルクォート対応）
 */
function parseCSVLine(line) {
  const columns = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        columns.push(current);
        current = '';
      } else {
        current += char;
      }
    }
  }

  columns.push(current);
  return columns;
}

/**
 * テーブルの存在確認
 */
async function checkTables() {
  console.log('🔍 Checking database tables...\n');

  const { data, error } = await supabase
    .from('questions')
    .select('id')
    .limit(1);

  if (error) {
    if (error.code === '42P01') {
      console.log('  ❌ Table "questions" does not exist\n');
      console.log('  Please run migrations first in Supabase SQL Editor:\n');
      console.log('  1. Go to Supabase Dashboard > SQL Editor');
      console.log('  2. Execute each file in supabase/migrations/ folder in order\n');
      return false;
    }
    console.log(`  ⚠️  Error: ${error.message}\n`);
    return false;
  }

  console.log('  ✅ Table "questions" exists\n');
  return true;
}

/**
 * 既存データの確認
 */
async function checkExistingData() {
  const { count, error } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.log(`  ⚠️  Cannot check existing data: ${error.message}`);
    return 0;
  }

  return count || 0;
}

/**
 * メイン処理
 */
async function main() {
  console.log('\n🚀 Supabase Database Setup\n');
  console.log('='.repeat(50));
  console.log(`URL: ${supabaseUrl}`);
  console.log('='.repeat(50) + '\n');

  // テーブル確認
  const tablesExist = await checkTables();

  if (!tablesExist) {
    console.log('⚠️  Please create tables first, then run this script again.\n');
    process.exit(1);
  }

  // 既存データ確認
  const existingCount = await checkExistingData();
  console.log(`  Existing rows in questions table: ${existingCount}\n`);

  if (existingCount > 0) {
    console.log('  ⚠️  Table already has data. Skipping import to avoid duplicates.\n');
    console.log('  If you want to reimport, delete existing data first:\n');
    console.log('    DELETE FROM questions;\n');
  } else {
    // CSVデータをインポート
    const csvPath = join(__dirname, '..', '..', 'all_questions.csv');
    await importCsvData(csvPath);
  }

  // 最終確認
  const finalCount = await checkExistingData();
  console.log(`📊 Final count: ${finalCount} questions in database\n`);

  console.log('✅ Setup completed!\n');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
