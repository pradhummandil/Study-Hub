import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey);

async function inspectPracticeQuestions() {
  const { count, error } = await supabase
    .from('practice_questions')
    .select('*', { count: 'exact', head: true });

  console.log('practice_questions count:', count, 'error:', error);

  const { data: sample } = await supabase
    .from('practice_questions')
    .select('*')
    .limit(3);

  console.log('practice_questions sample:', JSON.stringify(sample, null, 2));
}

inspectPracticeQuestions().catch(err => console.error(err));
