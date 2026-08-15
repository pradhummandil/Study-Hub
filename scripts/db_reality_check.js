import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Service Key present:', !!serviceKey);

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false }
});

async function runRealityCheck() {
  console.log('--- DATABASE REALITY CHECK ---');

  const tables = [
    'questions',
    'question_sources',
    'question_versions',
    'exams',
    'exam_subjects',
    'exam_topics',
    'saved_questions',
    'question_sync_jobs'
  ];

  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    if (error) {
      console.log(`Table ${table}: ERROR ->`, error);
    } else {
      console.log(`Table ${table}: COUNT = ${count}`);
    }
  }

  // Detailed breakdowns of questions table
  const { data: questions, error: qErr } = await supabase
    .from('questions')
    .select('*');

  if (qErr) {
    console.error('Error fetching questions:', qErr);
    return;
  }

  console.log(`Retrieved ${questions.length} question rows.`);

  let official = 0, licensed = 0, original = 0, external = 0;
  let verifiedCount = 0, unverifiedCount = 0;
  let withSolution = 0, withoutSolution = 0;
  let withTaxonomy = 0, withoutTaxonomy = 0;

  const examCounts = {};
  const examYears = {};

  questions.forEach(q => {
    if (q.source_type === 'OFFICIAL_PYQ') official++;
    else if (q.source_type === 'LICENSED_PYQ') licensed++;
    else if (q.source_type === 'STUDY_HUB_PRACTICE') original++;
    else if (q.source_type === 'EXTERNAL_REFERENCE') external++;

    if (q.verified) verifiedCount++;
    else unverifiedCount++;

    if ((q.solution_text && q.solution_text.trim().length > 0) || (q.explanation && q.explanation.trim().length > 0)) {
      withSolution++;
    } else {
      withoutSolution++;
    }

    if (q.subject && q.chapter && q.topic && q.topic !== 'Unknown') {
      withTaxonomy++;
    } else {
      withoutTaxonomy++;
    }

    const code = q.exam_code || q.exam_family || 'UNKNOWN';
    examCounts[code] = (examCounts[code] || 0) + 1;
    if (!examYears[code]) examYears[code] = [];
    if (q.year) examYears[code].push(q.year);
  });

  console.log('\n============================================================');
  console.log('1. DATABASE REALITY CHECK RESULTS');
  console.log('============================================================');
  console.log('TOTAL QUESTIONS:', questions.length);
  console.log('OFFICIAL PYQ:', official);
  console.log('LICENSED PYQ:', licensed);
  console.log('STUDY HUB ORIGINAL:', original);
  console.log('EXTERNAL REFERENCES:', external);
  console.log('VERIFIED:', verifiedCount);
  console.log('UNVERIFIED:', unverifiedCount);
  console.log('WITH SOLUTION:', withSolution);
  console.log('WITHOUT SOLUTION:', withoutSolution);
  console.log('WITH TAXONOMY:', withTaxonomy);
  console.log('WITHOUT TAXONOMY:', withoutTaxonomy);
  console.log('\n--- BY EXAM CODE ---');
  console.log(JSON.stringify(examCounts, null, 2));
  console.log('\n--- YEAR RANGES PER EXAM ---');
  for (const [code, years] of Object.entries(examYears)) {
    const min = Math.min(...years);
    const max = Math.max(...years);
    console.log(`${code}: ${min} - ${max} (Total years: ${new Set(years).size})`);
  }
}

runRealityCheck().catch(err => console.error(err));
