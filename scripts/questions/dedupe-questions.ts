// scripts/questions/dedupe-questions.ts
// Question Deduplication & Canonical Source Mapping Engine

import crypto from 'crypto';

export interface DedupeResult {
  isDuplicate: boolean;
  canonicalId?: string;
  hash: string;
}

export function generateQuestionHash(questionText: string, examCode: string, year?: number, questionNumber?: number): string {
  const normalizedText = questionText
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
  
  const rawKey = `${examCode}:${year || ''}:${questionNumber || ''}:${normalizedText.slice(0, 120)}`;
  return crypto.createHash('sha256').update(rawKey).digest('hex');
}

export function checkForDuplicates(
  newQuestion: { question_text: string; exam_code: string; year?: number; question_number?: number },
  existingQuestions: Array<{ id: string; question_text: string; exam_code: string; year?: number; question_number?: number }>
): DedupeResult {
  const newHash = generateQuestionHash(newQuestion.question_text, newQuestion.exam_code, newQuestion.year, newQuestion.question_number);

  for (const existing of existingQuestions) {
    const existingHash = generateQuestionHash(existing.question_text, existing.exam_code, existing.year, existing.question_number);
    if (newHash === existingHash) {
      return {
        isDuplicate: true,
        canonicalId: existing.id,
        hash: newHash,
      };
    }
  }

  return {
    isDuplicate: false,
    hash: newHash,
  };
}
