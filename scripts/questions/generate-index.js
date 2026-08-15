// scripts/questions/generate-index.js
// Question Index & Content Gap Reporter for Question Engine 3.0

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function generateCoverageReport() {
  console.log('\n========================================================');
  console.log('📊 GENERATING QUESTION COVERAGE & CONTENT GAP REPORT...');
  console.log('========================================================\n');

  if (!supabaseUrl || !serviceKey) {
    console.error('Missing Supabase environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  let questions = [];
  let fromIndex = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('questions')
      .select('id, exam_code, exam_family, subject, chapter, topic, source_type, verified, published, solution_text, explanation')
      .range(fromIndex, fromIndex + pageSize - 1);

    if (error) {
      console.error('Failed to fetch questions for coverage report:', error.message);
      break;
    }
    if (data && data.length > 0) {
      questions = questions.concat(data);
      fromIndex += pageSize;
      if (data.length < pageSize) hasMore = false;
    } else {
      hasMore = false;
    }
  }

  console.log(`Fetched ${questions.length} total questions from Supabase for coverage analysis.`);

  const topicMap = new Map();
  const byExam = {};
  const bySourceType = {};
  let withSolution = 0;
  let verifiedCount = 0;

  questions.forEach((q) => {
    const examCode = q.exam_code || 'GATE_CSE';
    byExam[examCode] = (byExam[examCode] || 0) + 1;
    bySourceType[q.source_type] = (bySourceType[q.source_type] || 0) + 1;

    if (q.verified) verifiedCount++;
    if ((q.solution_text && q.solution_text.trim().length > 0) || (q.explanation && q.explanation.trim().length > 0)) {
      withSolution++;
    }

    const key = `${examCode}|||${q.subject}|||${q.chapter}|||${q.topic}`;
    if (!topicMap.has(key)) {
      topicMap.set(key, {
        exam_code: examCode,
        subject: q.subject,
        chapter: q.chapter,
        topic: q.topic,
        count: 0
      });
    }
    topicMap.get(key).count++;
  });

  const topicCoverage = Array.from(topicMap.values());

  const gapBuckets = {
    CRITICAL: [], // 0 questions
    LOW: [],      // 1-4 questions
    MEDIUM: [],   // 5-24 questions
    GOOD: [],     // 25-99 questions
    STRONG: []    // 100+ questions
  };

  topicCoverage.forEach(t => {
    if (t.count === 0) gapBuckets.CRITICAL.push(t);
    else if (t.count <= 4) gapBuckets.LOW.push(t);
    else if (t.count <= 24) gapBuckets.MEDIUM.push(t);
    else if (t.count <= 99) gapBuckets.GOOD.push(t);
    else gapBuckets.STRONG.push(t);
  });

  const report = {
    generated_at: new Date().toISOString(),
    total_canonical_questions: questions.length,
    official_pyqs: bySourceType['OFFICIAL_PYQ'] || 0,
    licensed_pyqs: bySourceType['LICENSED_PYQ'] || 0,
    study_hub_original: bySourceType['STUDY_HUB_PRACTICE'] || 0,
    external_references: bySourceType['EXTERNAL_REFERENCE'] || 0,
    questions_with_solutions: withSolution,
    questions_verified: verifiedCount,
    by_exam: byExam,
    gap_summary: {
      CRITICAL_zero_coverage_topics: gapBuckets.CRITICAL.length,
      LOW_coverage_topics: gapBuckets.LOW.length,
      MEDIUM_coverage_topics: gapBuckets.MEDIUM.length,
      GOOD_coverage_topics: gapBuckets.GOOD.length,
      STRONG_coverage_topics: gapBuckets.STRONG.length,
    },
    topic_coverage: topicCoverage
  };

  const outputPath = path.join(process.cwd(), 'scripts/questions/question-coverage-report-v2.json');
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));

  console.log(`✅ Coverage report successfully written to ${outputPath}`);
  console.log('\n--- COVERAGE REPORT SUMMARY ---');
  console.log(`Total Questions: ${report.total_canonical_questions}`);
  console.log(`Exams Represented: ${Object.keys(byExam).length}`);
  console.log(`Topics Covered: ${topicCoverage.length}`);
  console.log(`CRITICAL (0): ${gapBuckets.CRITICAL.length} topics`);
  console.log(`LOW (1-4): ${gapBuckets.LOW.length} topics`);
  console.log(`MEDIUM (5-24): ${gapBuckets.MEDIUM.length} topics`);
  console.log(`GOOD (25-99): ${gapBuckets.GOOD.length} topics`);
  console.log(`STRONG (100+): ${gapBuckets.STRONG.length} topics\n`);

  return report;
}

generateCoverageReport().catch(err => console.error('Error generating coverage report:', err));
