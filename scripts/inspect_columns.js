import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceKey);

async function inspectTableColumns() {
  const tables = [
    'practice_questions',
    'exam_catalog',
    'exam_configurations',
    'exam_sources',
    'flashcards',
    'mistake_notebook',
    'mock_tests',
    'mock_test_questions',
    'mock_answers',
    'mock_attempts',
    'user_question_attempts',
    'revision_items'
  ];

  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.log(`Table ${table}: error -> ${error.message}`);
      } else {
        const cols = data && data.length > 0 ? Object.keys(data[0]) : 'empty table';
        console.log(`Table ${table}: columns =`, cols);
      }
    } catch (e) {
      console.log(`Table ${table}: catch ->`, e.message);
    }
  }
}

inspectTableColumns().catch(err => console.error(err));
