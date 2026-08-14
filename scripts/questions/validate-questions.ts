// scripts/questions/validate-questions.ts
// Question Schema & Content Quality Validation Engine

export interface QuestionValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateQuestionRecord(q: any): QuestionValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required Fields
  if (!q.id) errors.push('Missing question ID');
  if (!q.question_text || q.question_text.trim().length === 0) errors.push('Missing question_text');
  if (!q.exam_code) errors.push('Missing exam_code');
  if (!q.subject) errors.push('Missing subject');
  if (!q.chapter) errors.push('Missing chapter');
  if (!q.topic) errors.push('Missing topic');
  if (!q.difficulty) errors.push('Missing difficulty');
  if (!q.question_type) errors.push('Missing question_type');
  if (q.correct_answer === undefined || q.correct_answer === null) errors.push('Missing correct_answer');
  if (!q.source_type) errors.push('Missing source_type');

  // Question Type specific option validations
  if (['MCQ_SINGLE', 'MCQ_MULTIPLE', 'ASSERTION_REASON', 'MATCHING', 'TRUE_FALSE'].includes(q.question_type)) {
    if (!Array.isArray(q.options) || q.options.length === 0) {
      errors.push(`Question type ${q.question_type} requires options array`);
    } else {
      q.options.forEach((opt: any, idx: number) => {
        if (!opt.id) errors.push(`Option at index ${idx} missing id property`);
        if (!opt.text && !opt.image) errors.push(`Option at index ${idx} missing text or image`);
      });
    }
  }

  // Solution validations
  if (!q.solution_text && (!q.solution_steps || q.solution_steps.length === 0) && !q.explanation) {
    warnings.push('Question is missing solution text / explanation');
  }

  // Numerical / Integer format validation
  if (['NUMERICAL', 'INTEGER'].includes(q.question_type)) {
    if (typeof q.correct_answer !== 'number' && typeof q.correct_answer !== 'string' && !Array.isArray(q.correct_answer)) {
      errors.push('Numerical/Integer question correct_answer must be a number, string, or range array');
    }
  }

  // Math rendering checks (warning if unescaped LaTeX tags)
  if (q.question_text && (q.question_text.includes('\\frac') || q.question_text.includes('\\int')) && !q.question_text.includes('$')) {
    warnings.push('Question text contains LaTeX commands without KaTeX math delimiters ($...$ or $$...$$)');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
