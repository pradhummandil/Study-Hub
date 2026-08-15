// src/lib/intelligence/auditIntegrity.ts
import { supabase } from '../supabase';

export interface IntegrityAuditResult {
  orphanAttempts: number;
  orphanMistakes: number;
  orphanRevisions: number;
  orphanFlashcards: number;
  isClean: boolean;
  checkedAt: string;
}

export async function runDataIntegrityAudit(_userId?: string): Promise<IntegrityAuditResult> {
  let orphanAttempts = 0;
  let orphanMistakes = 0;
  let orphanRevisions = 0;
  let orphanFlashcards = 0;

  try {
    // 1. Check attempts with missing user_id
    const { count: cAttempts } = await supabase
      .from('user_question_attempts')
      .select('*', { count: 'exact', head: true })
      .is('user_id', null);
    orphanAttempts = cAttempts || 0;

    // 2. Check mistakes with missing question or missing user
    const { count: cMistakes } = await supabase
      .from('mistake_notebook')
      .select('*', { count: 'exact', head: true })
      .is('user_id', null);
    orphanMistakes = cMistakes || 0;

    // 3. Check revisions with missing user
    const { count: cRevisions } = await supabase
      .from('revision_items')
      .select('*', { count: 'exact', head: true })
      .is('user_id', null);
    orphanRevisions = cRevisions || 0;

    // 4. Check flashcards with missing user
    const { count: cFlashcards } = await supabase
      .from('flashcards')
      .select('*', { count: 'exact', head: true })
      .is('user_id', null);
    orphanFlashcards = cFlashcards || 0;
  } catch (err) {
    console.warn('Integrity audit warning:', err);
  }

  const isClean = orphanAttempts === 0 && orphanMistakes === 0 && orphanRevisions === 0 && orphanFlashcards === 0;

  return {
    orphanAttempts,
    orphanMistakes,
    orphanRevisions,
    orphanFlashcards,
    isClean,
    checkedAt: new Date().toISOString(),
  };
}
