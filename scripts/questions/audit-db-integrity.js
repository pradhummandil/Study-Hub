// scripts/questions/audit-db-integrity.js
// Question Engine 4.1 — Production Data Integrity & Corpus Verification Audit

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false }
});

async function runComprehensiveAudit() {
  console.log('========================================================');
  console.log('🔍 RUNNING QUESTION ENGINE 4.1 DATA INTEGRITY AUDIT');
  console.log('========================================================\n');

  // 1. Fetch exact database total count directly from Supabase
  const { count: exactDbCount, error: countErr } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true });

  if (countErr) {
    console.error('Failed to query total questions count:', countErr.message);
    return;
  }

  console.log(`LIVE DATABASE EXACT QUESTION COUNT (SELECT COUNT(*)): ${exactDbCount}\n`);

  // 2. Fetch ALL rows in pages of 1,000 to ensure zero truncation
  let allQuestions = [];
  let page = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error(`Page ${page} fetch error:`, error.message);
      break;
    }

    if (data && data.length > 0) {
      allQuestions = allQuestions.concat(data);
      page++;
      if (data.length < pageSize) hasMore = false;
    } else {
      hasMore = false;
    }
  }

  console.log(`Retrieved ${allQuestions.length} complete rows from Supabase (Matched count check: ${allQuestions.length === exactDbCount ? 'MATCH' : 'MISMATCH'}).\n`);

  // 3. Source Type Breakdown & Reconciliation
  const sourceTypeCounts = {};
  const examCodeCounts = {};
  const yearCounts = {};
  const subjectCounts = {};
  const questionTypeCounts = {};
  const verifiedCounts = { verified: 0, unverified: 0 };
  const solutionCounts = { VERIFIED: 0, AI_DRAFT: 0, MISSING: 0, EXTERNAL_REFERENCE_ONLY: 0 };

  // Quality checks
  let missingText = 0;
  let missingAnswer = 0;
  let missingOptions = 0;
  let missingSubject = 0;
  let missingChapter = 0;
  let missingTopic = 0;
  let missingExam = 0;
  let missingYear = 0;
  let missingSource = 0;
  let officialMissingUrl = 0;

  // Duplicates audit
  const hashMap = new Map();
  const duplicateCandidates = [];

  // Deep Exam Breakdowns
  const gateCseByYearSubject = {};
  const jeeMainByYearSessionSubject = {};
  const jeeAdvByYearPaperSubject = {};
  const neetByYearSubject = {};
  const gateBranchCounts = {};

  allQuestions.forEach((q, idx) => {
    // Source Type
    const st = q.source_type || 'UNKNOWN';
    sourceTypeCounts[st] = (sourceTypeCounts[st] || 0) + 1;

    // Exam Code
    const ec = q.exam_code || 'UNCLASSIFIED';
    examCodeCounts[ec] = (examCodeCounts[ec] || 0) + 1;

    // Years
    const yr = q.year || 'UNKNOWN';
    yearCounts[yr] = (yearCounts[yr] || 0) + 1;

    // Subject
    const sub = q.subject || 'UNCLASSIFIED';
    subjectCounts[sub] = (subjectCounts[sub] || 0) + 1;

    // Question Type
    const qt = q.question_type || 'UNKNOWN';
    questionTypeCounts[qt] = (questionTypeCounts[qt] || 0) + 1;

    // Verified
    if (q.verified) verifiedCounts.verified++;
    else verifiedCounts.unverified++;

    // Solution classification
    const sol = q.solution_text || q.explanation || '';
    if (q.source_type === 'EXTERNAL_REFERENCE' && !sol) {
      solutionCounts.EXTERNAL_REFERENCE_ONLY++;
    } else if (!sol || sol.trim().length === 0) {
      solutionCounts.MISSING++;
    } else if (q.classifier_source === 'AI' || q.verified === false) {
      solutionCounts.AI_DRAFT++;
    } else {
      solutionCounts.VERIFIED++;
    }

    // Quality Audit
    if (!q.question_text || q.question_text.trim().length === 0) missingText++;
    if (q.correct_answer === undefined || q.correct_answer === null || q.correct_answer === '') missingAnswer++;
    if ((q.question_type === 'MCQ_SINGLE' || q.question_type === 'MCQ_MULTIPLE') && (!q.options || !Array.isArray(q.options) || q.options.length === 0)) missingOptions++;
    if (!q.subject) missingSubject++;
    if (!q.chapter) missingChapter++;
    if (!q.topic) missingTopic++;
    if (!q.exam_code) missingExam++;
    if (!q.year) missingYear++;
    if (!q.source_name) missingSource++;

    if (q.source_type === 'OFFICIAL_PYQ' && !q.official_source_url && !q.source_url) {
      officialMissingUrl++;
    }

    // Hash calculation for duplicate detection
    const norm = (q.question_text || '').toLowerCase().replace(/[^a-z0-9]/g, '').trim();
    const hash = crypto.createHash('sha256').update(`${ec}:${yr}:${q.question_number || ''}:${norm.slice(0, 120)}`).digest('hex');

    if (hashMap.has(hash)) {
      duplicateCandidates.push({
        id1: hashMap.get(hash).id,
        id2: q.id,
        exam: ec,
        year: yr,
        question_number: q.question_number,
        text_snippet: norm.slice(0, 60)
      });
    } else {
      hashMap.set(hash, q);
    }

    // Exam-specific breakdowns
    if (ec === 'GATE_CSE') {
      const key = `${yr}|||${sub}`;
      gateCseByYearSubject[key] = (gateCseByYearSubject[key] || 0) + 1;
    } else if (ec === 'JEE_MAIN') {
      const key = `${yr}|||${q.session || 'Session 1'}|||${sub}`;
      jeeMainByYearSessionSubject[key] = (jeeMainByYearSessionSubject[key] || 0) + 1;
    } else if (ec === 'JEE_ADVANCED') {
      const key = `${yr}|||${q.paper || 'Paper 1'}|||${sub}`;
      jeeAdvByYearPaperSubject[key] = (jeeAdvByYearPaperSubject[key] || 0) + 1;
    } else if (ec === 'NEET_UG' || ec === 'NEET') {
      const key = `${yr}|||${sub}`;
      neetByYearSubject[key] = (neetByYearSubject[key] || 0) + 1;
    }

    if (ec.startsWith('GATE_')) {
      gateBranchCounts[ec] = (gateBranchCounts[ec] || 0) + 1;
    }
  });

  // Calculate Sums
  const sourceTypeSum = Object.values(sourceTypeCounts).reduce((a, b) => a + b, 0);
  const examCodeSum = Object.values(examCodeCounts).reduce((a, b) => a + b, 0);

  // Fetch Sync Jobs
  const { data: syncJobs } = await supabase.from('question_sync_jobs').select('*');

  // Fetch Sources Table
  const { count: sourcesTableCount } = await supabase.from('question_sources').select('*', { count: 'exact', head: true });

  const auditReport = {
    audited_at: new Date().toISOString(),
    exact_db_count: exactDbCount,
    retrieved_row_count: allQuestions.length,

    reconciliation: {
      total_questions: exactDbCount,
      source_type_sum: sourceTypeSum,
      source_type_pass: sourceTypeSum === exactDbCount,
      exam_code_sum: examCodeSum,
      exam_code_pass: examCodeSum === exactDbCount
    },

    source_type_breakdown: sourceTypeCounts,
    exam_code_breakdown: examCodeCounts,
    gate_branches_breakdown: gateBranchCounts,
    year_breakdown: yearCounts,
    question_type_breakdown: questionTypeCounts,
    verified_breakdown: verifiedCounts,
    solution_breakdown: solutionCounts,

    quality_audit: {
      missing_question_text: missingText,
      missing_correct_answer: missingAnswer,
      missing_options: missingOptions,
      missing_subject: missingSubject,
      missing_chapter: missingChapter,
      missing_topic: missingTopic,
      missing_exam: missingExam,
      missing_year: missingYear,
      missing_source: missingSource,
      official_missing_url: officialMissingUrl
    },

    duplicate_audit: {
      duplicate_candidate_count: duplicateCandidates.length,
      candidates: duplicateCandidates.slice(0, 10)
    },

    tables_integrity: {
      question_sources_row_count: sourcesTableCount || 0,
      sync_jobs_count: (syncJobs || []).length,
      sync_jobs: syncJobs
    },

    exam_deep_breakdowns: {
      gate_cse: gateCseByYearSubject,
      jee_main: jeeMainByYearSessionSubject,
      jee_advanced: jeeAdvByYearPaperSubject,
      neet: neetByYearSubject
    }
  };

  const auditPath = path.join(process.cwd(), 'scripts/questions/db-integrity-audit-report.json');
  fs.writeFileSync(auditPath, JSON.stringify(auditReport, null, 2));

  console.log('========================================================');
  console.log('📊 AUDIT SUMMARY & RECONCILIATION RESULT');
  console.log('========================================================');
  console.log(`LIVE DB COUNT: ${exactDbCount}`);
  console.log(`Source Type Sum: ${sourceTypeSum} [${sourceTypeSum === exactDbCount ? 'PASS ✅' : 'FAIL ❌'}]`);
  console.log(`Exam Code Sum: ${examCodeSum} [${examCodeSum === exactDbCount ? 'PASS ✅' : 'FAIL ❌'}]`);
  console.log(`Duplicate Candidates Detected: ${duplicateCandidates.length}`);
  console.log(`Missing Question Text: ${missingText}`);
  console.log(`Missing Correct Answer: ${missingAnswer}`);
  console.log(`Official PYQs Missing Source URL: ${officialMissingUrl}`);
  console.log(`Report written to: ${auditPath}\n`);

  return auditReport;
}

runComprehensiveAudit().catch(err => console.error('Audit Script Error:', err));
