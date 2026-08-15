// scripts/questions/generate-expansion-queue.js
// Question Engine 4.3 — Content Expansion Queue Generator

import fs from 'fs';
import path from 'path';

const V3_REPORT_PATH = path.join(process.cwd(), 'scripts/questions/question-coverage-report-v3.json');
const QUEUE_OUTPUT_PATH = path.join(process.cwd(), 'scripts/questions/content-expansion-queue.json');

export function generateExpansionQueue() {
  console.log('========================================================');
  console.log('📋 GENERATING CONTENT EXPANSION QUEUE (ENGINE 4.3)');
  console.log('========================================================\n');

  if (!fs.existsSync(V3_REPORT_PATH)) {
    console.error('Missing report-v3 at:', V3_REPORT_PATH);
    process.exit(1);
  }

  const v3Report = JSON.parse(fs.readFileSync(V3_REPORT_PATH, 'utf-8'));
  const topics = v3Report.topic_coverage || [];

  const lowTopics = [];
  const mediumTopics = [];
  const difficultyImbalanceTopics = [];
  const missingYearTopics = [];

  topics.forEach(t => {
    if (t.question_count <= 4) {
      lowTopics.push({
        exam: t.exam_code,
        subject: t.subject,
        chapter: t.chapter,
        topic: t.topic,
        reason: 'LOW_COVERAGE (1-4 questions)',
        current_count: t.question_count,
        target_direction: 'Add 15+ verified PYQs and canonical practice items'
      });
    } else if (t.question_count <= 24) {
      mediumTopics.push({
        exam: t.exam_code,
        subject: t.subject,
        chapter: t.chapter,
        topic: t.topic,
        reason: 'MEDIUM_COVERAGE (5-24 questions)',
        current_count: t.question_count,
        target_direction: 'Expand to 25+ questions'
      });
    }

    if (t.flags.includes('DIFFICULTY_IMBALANCE')) {
      const activeLevels = Object.entries(t.difficulties).filter(([_, c]) => c > 0).map(([k, _]) => k);
      difficultyImbalanceTopics.push({
        exam: t.exam_code,
        subject: t.subject,
        chapter: t.chapter,
        topic: t.topic,
        reason: `DIFFICULTY_IMBALANCE (Active levels: ${activeLevels.join(', ') || 'None'})`,
        current_count: t.question_count,
        target_direction: 'Add missing difficulty levels (Easy/Medium/Hard balance)'
      });
    }

    if (t.flags.includes('MISSING_YEAR_CONTENT')) {
      missingYearTopics.push({
        exam: t.exam_code,
        subject: t.subject,
        chapter: t.chapter,
        topic: t.topic,
        reason: `MISSING_YEAR_CONTENT (Missing: ${t.missing_years ? t.missing_years.join(', ') : 'unknown'})`,
        current_count: t.question_count,
        target_direction: 'Ingest PYQs from missing exam years'
      });
    }
  });

  const expansionQueue = {
    generated_at: new Date().toISOString(),
    total_low_topics: lowTopics.length,
    total_medium_topics: mediumTopics.length,
    total_difficulty_imbalance_topics: difficultyImbalanceTopics.length,
    total_missing_year_topics: missingYearTopics.length,
    prioritized_queue: [
      ...lowTopics,
      ...mediumTopics,
      ...difficultyImbalanceTopics,
      ...missingYearTopics
    ]
  };

  fs.writeFileSync(QUEUE_OUTPUT_PATH, JSON.stringify(expansionQueue, null, 2));

  console.log(`✅ Content Expansion Queue written to ${QUEUE_OUTPUT_PATH}`);
  console.log(`Total LOW Topics to Expand: ${lowTopics.length}`);
  console.log(`Total MEDIUM Topics to Expand: ${mediumTopics.length}`);
  console.log(`Total Difficulty Imbalance Topics: ${difficultyImbalanceTopics.length}`);
  console.log(`Total Missing Year Topics: ${missingYearTopics.length}\n`);

  return expansionQueue;
}

generateExpansionQueue();
