// scripts/questions/generate-index.ts
// Question Index & Content Gap Reporter

import { INITIAL_CANONICAL_PYQS } from './import-official-pyqs';

export function generateContentReport() {
  const byExam: Record<string, number> = {};
  const bySourceType: Record<string, number> = {};
  let withSolution = 0;
  let verified = 0;

  INITIAL_CANONICAL_PYQS.forEach((q) => {
    byExam[q.exam_code] = (byExam[q.exam_code] || 0) + 1;
    bySourceType[q.source_type] = (bySourceType[q.source_type] || 0) + 1;
    if (q.solution_text || q.explanation) withSolution++;
    if (q.verified) verified++;
  });

  return {
    total_canonical_questions: INITIAL_CANONICAL_PYQS.length,
    official_pyqs: bySourceType['OFFICIAL_PYQ'] || 0,
    licensed_pyqs: bySourceType['LICENSED_PYQ'] || 0,
    study_hub_original: bySourceType['STUDY_HUB_PRACTICE'] || 0,
    external_references: bySourceType['EXTERNAL_REFERENCE'] || 0,
    questions_with_solutions: withSolution,
    questions_verified: verified,
    by_exam: byExam,
  };
}

if (require.main === module) {
  console.log('--- STUDY HUB QUESTION ENGINE 2.0 INDEX REPORT ---');
  console.log(JSON.stringify(generateContentReport(), null, 2));
}
