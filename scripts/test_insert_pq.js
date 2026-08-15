import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, serviceKey);

async function testInsertPracticeQuestion() {
  const testQ = {
    id: `test-q-${Date.now()}`,
    exam: 'GATE_CSE',
    year: 2026,
    subject: 'Computer Networks',
    topic: 'Subnetting & CIDR',
    difficulty: 'Medium',
    question_type: 'MCQ_SINGLE',
    question_text: 'Test question for Supabase insertion verification.',
    options: ['A', 'B', 'C', 'D'],
    correct_answer: 'A',
    explanation: 'Test explanation.',
    is_official_pyq: true,
    source_type: 'OFFICIAL_PYQ'
  };

  const { data, error } = await supabase
    .from('practice_questions')
    .insert([testQ])
    .select();

  if (error) {
    console.error('Insert error:', error.message);
  } else {
    console.log('✅ Inserted successfully into practice_questions:', data);

    // Clean up test question
    await supabase.from('practice_questions').delete().eq('id', testQ.id);
    console.log('Cleaned up test question.');
  }
}

testInsertPracticeQuestion().catch(err => console.error(err));
