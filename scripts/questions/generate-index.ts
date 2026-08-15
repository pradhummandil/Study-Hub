// scripts/questions/generate-index.ts
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

  const { data: questions, error } = await supabase
    .from('questions')
    .select('id, exam_code, exam_family, subject, chapter, topic, source_type, verified, published, solution_text, explanation');

  if (error || !questions) {
    console.error('Failed to fetch questions for coverage report:', error?.message);
    return;
  }

  console.log(`Fetched ${questions.length} questions from Supabase for coverage analysis.`);

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
    zero_coverage: [],      // 0 questions
    very_low_coverage: [],  // 1-4 questions
    low_coverage: [],       // 5-9 questions
    moderate_coverage: [],  // 10-24 questions
    deep_coverage: []       // 25+ questions
  };

  topicCoverage.forEach(t => {
    if (t.count === 0) gapBuckets.zero_coverage.push(t);
    else if (t.count <= 4) gapBuckets.very_low_coverage.push(t);
    else if (t.count <= 9) gapBuckets.low_coverage.push(t);
    else if (t.count <= 24) gapBuckets.moderate_coverage.push(t);
    else gapBuckets.deep_coverage.push(t);
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
      zero_coverage_topics: gapBuckets.zero_coverage.length,
      very_low_coverage_topics (1-4): gapBuckets.very_low_coverage.length,
      low_coverage_topics (5-9): gapBuckets.low_coverage.length,
      moderate_coverage_topics (10-24): gapBuckets.moderate_coverage.length,
      deep_coverage_topics (25+): gapBuckets.deep_coverage.length,
    },
    topic_coverage: topicCoverage
  };

  const outputPath = path.join(process.cwd(), 'scripts/questions/question-coverage-report.json');
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));

  console.log(`✅ Coverage report successfully written to ${outputPath}`);
  console.log('\n--- COVERAGE REPORT SUMMARY ---');
  console.log(`Total Questions: ${report.total_canonical_questions}`);
  console.log(`Exams Represented: ${Object.keys(byExam).length}`);
  console.log(`Topics Covered: ${topicCoverage.length}`);
  console.log(`Very Low (1-4): ${gapBuckets.very_low_coverage.length} topics`);
  console.log(`Low (5-9): ${gapBuckets.low_coverage.length} topics`);
  console.log(`Moderate (10-24): ${gapBuckets.moderate_coverage.length} topics`);
  console.log(`Deep (25+): ${gapBuckets.deep_coverage.length} topics\n`);

  return report;
}

generateCoverageReport().catch(err => console.error('Error generating coverage report:', err));
