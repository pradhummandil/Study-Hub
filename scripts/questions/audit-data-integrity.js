// scripts/questions/audit-data-integrity.js
// Question Engine 4.4 — Database Integrity & Orphan Records Auditor

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false }
});

export async function auditDataIntegrity() {
  console.log('========================================================');
  console.log('🔍 RUNNING DATA INTEGRITY & ORPHAN RECORDS AUDIT (QE 4.4)');
  console.log('========================================================\n');

  // 1. Fetch set of valid question IDs using pagination
  let questionsData = [];
  let page = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('questions')
      .select('id')
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error('Failed to fetch valid question IDs:', error.message);
      break;
    }
    if (data && data.length > 0) {
      questionsData = questionsData.concat(data);
      page++;
      if (data.length < pageSize) hasMore = false;
    } else {
      hasMore = false;
    }
  }

  const validQuestionIds = new Set(questionsData.map(q => q.id));
  console.log(`Loaded ${validQuestionIds.size} valid canonical question IDs from production database.`);

  // 2. Audit user_question_attempts
  const { data: attempts, error: attErr } = await supabase
    .from('user_question_attempts')
    .select('id, question_id, user_id, time_taken_seconds');

  let orphanAttempts = 0;
  let invalidTimes = 0;
  let missingUserAttempts = 0;

  if (attempts) {
    attempts.forEach(a => {
      if (!validQuestionIds.has(a.question_id)) orphanAttempts++;
      if (!a.user_id) missingUserAttempts++;
      if (typeof a.time_taken_seconds === 'number' && a.time_taken_seconds < 0) invalidTimes++;
    });
  }

  // 3. Audit mistake_notebook
  const { data: mistakes, error: misErr } = await supabase
    .from('mistake_notebook')
    .select('id, question_id');

  let orphanMistakes = 0;
  if (mistakes) {
    mistakes.forEach(m => {
      if (!validQuestionIds.has(m.question_id)) orphanMistakes++;
    });
  }

  // 4. Audit revision_items
  const { data: revisions, error: revErr } = await supabase
    .from('revision_items')
    .select('id, question_id, next_review_date');

  let orphanRevisions = 0;
  let invalidReviewDates = 0;
  if (revisions) {
    revisions.forEach(r => {
      if (!validQuestionIds.has(r.question_id)) orphanRevisions++;
      if (!r.next_review_date || isNaN(Date.parse(r.next_review_date))) invalidReviewDates++;
    });
  }

  // 5. Audit flashcards
  const { data: flashcards, error: fcErr } = await supabase
    .from('flashcards')
    .select('id, question_id');

  let orphanFlashcards = 0;
  if (flashcards) {
    flashcards.forEach(f => {
      if (f.question_id && !validQuestionIds.has(f.question_id)) orphanFlashcards++;
    });
  }

  const report = {
    generated_at: new Date().toISOString(),
    total_canonical_questions: validQuestionIds.size,
    attempts_audit: {
      total_records: attempts ? attempts.length : 0,
      orphan_attempts: orphanAttempts,
      missing_user_id: missingUserAttempts,
      invalid_time_spent: invalidTimes,
      status: orphanAttempts === 0 && missingUserAttempts === 0 ? 'PASS' : 'WARNING'
    },
    mistakes_audit: {
      total_records: mistakes ? mistakes.length : 0,
      orphan_mistakes: orphanMistakes,
      status: orphanMistakes === 0 ? 'PASS' : 'WARNING'
    },
    revisions_audit: {
      total_records: revisions ? revisions.length : 0,
      orphan_revisions: orphanRevisions,
      invalid_dates: invalidReviewDates,
      status: orphanRevisions === 0 && invalidReviewDates === 0 ? 'PASS' : 'WARNING'
    },
    flashcards_audit: {
      total_records: flashcards ? flashcards.length : 0,
      orphan_flashcards: orphanFlashcards,
      status: orphanFlashcards === 0 ? 'PASS' : 'WARNING'
    }
  };

  const reportPath = path.join(process.cwd(), 'scripts/questions/data-integrity-audit-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(`✅ Data Integrity Audit Report written to ${reportPath}`);
  console.log('--- DATA INTEGRITY SUMMARY ---');
  console.log(`Orphan Attempts: ${orphanAttempts}`);
  console.log(`Orphan Mistakes: ${orphanMistakes}`);
  console.log(`Orphan Revisions: ${orphanRevisions}`);
  console.log(`Orphan Flashcards: ${orphanFlashcards}\n`);

  return report;
}

auditDataIntegrity().catch(err => console.error('Audit Error:', err));
