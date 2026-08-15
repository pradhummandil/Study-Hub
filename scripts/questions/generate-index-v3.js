// scripts/questions/generate-index-v3.js
// Question Engine 4.2 — Topic Gap Engine & Coverage Report v3

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

const EXAM_YEAR_RANGES = {
  'GATE_CSE': { startYear: 2012, endYear: 2026 },
  'JEE_MAIN': { startYear: 2018, endYear: 2026 },
  'JEE_ADVANCED': { startYear: 2016, endYear: 2026 },
  'NEET_UG': { startYear: 2017, endYear: 2026 },
  'GATE_DA': { startYear: 2024, endYear: 2026 }
};

export async function generateTopicGapReportV3() {
  console.log('========================================================');
  console.log('📊 RUNNING QUESTION ENGINE 4.2 TOPIC GAP ENGINE (V3)');
  console.log('========================================================\n');

  let questions = [];
  let page = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('questions')
      .select('id, exam_code, exam_family, subject, chapter, topic, subtopic, difficulty, year, source_type, verified, published, solution_text, explanation')
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

  console.log(`Fetched ${questions.length} total questions from Supabase for depth analysis.`);

  const topicMap = new Map();
  const byExam = {};
  const bySourceType = {};
  let totalVerified = 0;
  let totalWithSolutions = 0;

  questions.forEach(q => {
    const examCode = q.exam_code || 'GATE_CSE';
    const sub = q.subject || 'General';
    const chap = q.chapter || 'Core';
    const top = q.topic || 'Fundamentals';

    byExam[examCode] = (byExam[examCode] || 0) + 1;
    bySourceType[q.source_type] = (bySourceType[q.source_type] || 0) + 1;

    if (q.verified) totalVerified++;
    if ((q.solution_text && q.solution_text.trim().length > 0) || (q.explanation && q.explanation.trim().length > 0)) {
      totalWithSolutions++;
    }

    const key = `${examCode}|||${sub}|||${chap}|||${top}`;
    if (!topicMap.has(key)) {
      topicMap.set(key, {
        exam_code: examCode,
        subject: sub,
        chapter: chap,
        topic: top,
        question_count: 0,
        pyq_count: 0,
        study_hub_count: 0,
        verified_count: 0,
        solution_count: 0,
        difficulties: { Easy: 0, Medium: 0, Hard: 0 },
        years: {},
        flags: []
      });
    }

    const node = topicMap.get(key);
    node.question_count++;
    if (q.source_type === 'OFFICIAL_PYQ') node.pyq_count++;
    if (q.source_type === 'STUDY_HUB_PRACTICE') node.study_hub_count++;
    if (q.verified) node.verified_count++;
    if ((q.solution_text && q.solution_text.trim().length > 0) || (q.explanation && q.explanation.trim().length > 0)) {
      node.solution_count++;
    }

    const diff = q.difficulty || 'Medium';
    node.difficulties[diff] = (node.difficulties[diff] || 0) + 1;

    const yr = q.year || 2026;
    node.years[yr] = (node.years[yr] || 0) + 1;
  });

  const topicCoverage = [];
  const gapBuckets = {
    CRITICAL: [], // 0
    LOW: [],      // 1-4
    MEDIUM: [],   // 5-24
    GOOD: [],     // 25-99
    STRONG: []    // 100+
  };

  let difficultyImbalanceCount = 0;
  let yearImbalanceCount = 0;
  let missingYearContentCount = 0;

  for (const [key, node] of topicMap.entries()) {
    const presentYears = Object.keys(node.years).map(Number).sort((a, b) => a - b);
    const targetRange = EXAM_YEAR_RANGES[node.exam_code];
    const missingYears = [];

    if (targetRange) {
      for (let y = targetRange.startYear; y <= targetRange.endYear; y++) {
        if (!node.years[y]) {
          missingYears.push(y);
        }
      }
    }

    // Flag checks
    const activeDiffLevels = Object.values(node.difficulties).filter(c => c > 0).length;
    if (node.question_count >= 5 && activeDiffLevels <= 1) {
      node.flags.push('DIFFICULTY_IMBALANCE');
      difficultyImbalanceCount++;
    }

    if (node.question_count >= 5 && presentYears.length <= 1) {
      node.flags.push('YEAR_IMBALANCE');
      yearImbalanceCount++;
    }

    if (missingYears.length > 0) {
      node.flags.push('MISSING_YEAR_CONTENT');
      missingYearContentCount++;
    }

    node.missing_years = missingYears;
    node.present_years = presentYears;

    topicCoverage.push(node);

    // Categorize
    if (node.question_count === 0) gapBuckets.CRITICAL.push(node);
    else if (node.question_count <= 4) gapBuckets.LOW.push(node);
    else if (node.question_count <= 24) gapBuckets.MEDIUM.push(node);
    else if (node.question_count <= 99) gapBuckets.GOOD.push(node);
    else gapBuckets.STRONG.push(node);
  }

  const report = {
    generated_at: new Date().toISOString(),
    total_canonical_questions: questions.length,
    official_pyqs: bySourceType['OFFICIAL_PYQ'] || 0,
    licensed_pyqs: bySourceType['LICENSED_PYQ'] || 0,
    study_hub_original: bySourceType['STUDY_HUB_PRACTICE'] || 0,
    external_references: bySourceType['EXTERNAL_REFERENCE'] || 0,
    total_verified: totalVerified,
    total_with_solutions: totalWithSolutions,
    by_exam: byExam,
    health_summary: {
      CRITICAL_zero_coverage_topics: gapBuckets.CRITICAL.length,
      LOW_coverage_topics: gapBuckets.LOW.length,
      MEDIUM_coverage_topics: gapBuckets.MEDIUM.length,
      GOOD_coverage_topics: gapBuckets.GOOD.length,
      STRONG_coverage_topics: gapBuckets.STRONG.length,
    },
    imbalance_summary: {
      difficulty_imbalance_topics: difficultyImbalanceCount,
      year_imbalance_topics: yearImbalanceCount,
      missing_year_content_topics: missingYearContentCount
    },
    topic_coverage: topicCoverage
  };

  const outputPath = path.join(process.cwd(), 'scripts/questions/question-coverage-report-v3.json');
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));

  console.log(`✅ Topic Gap Report v3 successfully written to ${outputPath}`);
  console.log('\n--- COVERAGE & GAP SUMMARY ---');
  console.log(`Total Questions: ${report.total_canonical_questions}`);
  console.log(`Exams Represented: ${Object.keys(byExam).length}`);
  console.log(`Topics Analyzed: ${topicCoverage.length}`);
  console.log(`CRITICAL (0): ${gapBuckets.CRITICAL.length}`);
  console.log(`LOW (1-4): ${gapBuckets.LOW.length}`);
  console.log(`MEDIUM (5-24): ${gapBuckets.MEDIUM.length}`);
  console.log(`GOOD (25-99): ${gapBuckets.GOOD.length}`);
  console.log(`STRONG (100+): ${gapBuckets.STRONG.length}`);
  console.log(`Difficulty Imbalance Topics: ${difficultyImbalanceCount}`);
  console.log(`Year Imbalance Topics: ${yearImbalanceCount}`);
  console.log(`Missing Year Content Topics: ${missingYearContentCount}\n`);

  return report;
}

generateTopicGapReportV3().catch(err => console.error('Report Error:', err));
