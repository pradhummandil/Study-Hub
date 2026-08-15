// scripts/questions/audit-solution-quality.js
// Question Engine 4.4 — Solution Quality & Veracity Auditor

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

const PLACEHOLDER_KEYWORDS = ['lorem', 'todo', 'placeholder', 'dummy', 'test solution', 'tbd'];

export async function auditSolutionQuality() {
  console.log('========================================================');
  console.log('🔍 RUNNING SOLUTION QUALITY & VERACITY AUDIT (QE 4.4)');
  console.log('========================================================\n');

  let questions = [];
  let page = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('questions')
      .select('id, exam_code, subject, topic, solution_text, explanation, verified')
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error('Failed to fetch questions:', error.message);
      break;
    }
    if (data && data.length > 0) {
      questions = questions.concat(data);
      page++;
      if (data.length < pageSize) hasMore = false;
    } else {
      hasMore = false;
    }
  }

  console.log(`Fetched ${questions.length} total questions from Supabase for solution quality audit.`);

  let totalVerified = 0;
  let missingSolutions = 0;
  let shortSolutions = 0;
  let placeholderSolutions = 0;
  let lowQualityCount = 0;
  const lowQualityDetails = [];

  questions.forEach(q => {
    if (q.verified) totalVerified++;

    const text = (q.solution_text || q.explanation || '').trim();
    if (!text) {
      missingSolutions++;
      lowQualityCount++;
      lowQualityDetails.push({ id: q.id, issue: 'MISSING_SOLUTION' });
      return;
    }

    if (text.length < 20) {
      shortSolutions++;
      lowQualityCount++;
      lowQualityDetails.push({ id: q.id, issue: 'TOO_SHORT (<20 chars)' });
    }

    const lower = text.toLowerCase();
    const hasPlaceholder = PLACEHOLDER_KEYWORDS.some(kw => lower.includes(kw));
    if (hasPlaceholder) {
      placeholderSolutions++;
      lowQualityCount++;
      lowQualityDetails.push({ id: q.id, issue: 'PLACEHOLDER_TEXT_DETECTED' });
    }
  });

  const report = {
    generated_at: new Date().toISOString(),
    total_canonical_questions: questions.length,
    total_verified: totalVerified,
    quality_summary: {
      missing_solutions: missingSolutions,
      too_short_solutions: shortSolutions,
      placeholder_solutions: placeholderSolutions,
      total_low_quality_flagged: lowQualityCount,
      quality_pass_pct: Math.round(((questions.length - lowQualityCount) / questions.length) * 100)
    },
    flagged_details: lowQualityDetails.slice(0, 50)
  };

  const reportPath = path.join(process.cwd(), 'scripts/questions/solution-quality-audit-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(`✅ Solution Quality Report written to ${reportPath}`);
  console.log('--- SOLUTION QUALITY SUMMARY ---');
  console.log(`Total Questions: ${questions.length}`);
  console.log(`Verified Solutions: ${totalVerified}`);
  console.log(`Missing Solutions: ${missingSolutions}`);
  console.log(`Short Solutions (<20 chars): ${shortSolutions}`);
  console.log(`Placeholder Text Detected: ${placeholderSolutions}`);
  console.log(`Quality Pass Percentage: ${report.quality_summary.quality_pass_pct}%\n`);

  return report;
}

auditSolutionQuality().catch(err => console.error('Audit Error:', err));
