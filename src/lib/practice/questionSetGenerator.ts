// src/lib/practice/questionSetGenerator.ts
// Question Engine 4.3 — Configurable Question Set Generator & Exposure Engine

import { supabase } from '../supabase';
import type { PracticeQuestion } from '../../types/student-core';

export type PracticeMode =
  | 'PYQ'
  | 'PRACTICE'
  | 'WEAK_TOPICS'
  | 'UNATTEMPTED'
  | 'INCORRECT'
  | 'MIXED'
  | 'EXAM_SIMULATION';

export interface QuestionSetRequest {
  examCode: string; // e.g. 'GATE_CSE', 'JEE_MAIN', 'NEET_UG'
  subject?: string;
  topic?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard' | 'All';
  count: number; // 10, 20, 30, 50
  mode: PracticeMode;
  userId?: string | null;
  weights?: {
    pyqPct?: number;       // default 40%
    weakPct?: number;      // default 30%
    unattemptedPct?: number; // default 20%
    revisionPct?: number;  // default 10%
  };
}

export interface GeneratedQuestionSet {
  questions: PracticeQuestion[];
  totalAvailable: number;
  mode: PracticeMode;
  yearDistribution: Record<number, number>;
  duplicateFilteredCount: number;
}

export async function generateConfiguredQuestionSet(
  req: QuestionSetRequest
): Promise<GeneratedQuestionSet> {
  const { examCode, subject, topic, difficulty, count = 10, mode = 'MIXED', userId } = req;

  // 1. Fetch recent attempts for exposure & recency filtering if userId present
  let recentAttemptedQuestionIds: string[] = [];
  if (userId) {
    const { data: recentAttempts } = await supabase
      .from('user_question_attempts')
      .select('question_id')
      .eq('user_id', userId)
      .gt('attempted_at', new Date(Date.now() - 86400000).toISOString()); // last 24h

    if (recentAttempts) {
      recentAttemptedQuestionIds = recentAttempts.map(r => r.question_id);
    }
  }

  // 2. Query canonical database questions
  let query = supabase
    .from('questions')
    .select(`
      id, exam_code, exam_family, subject, chapter, topic, subtopic, difficulty, year,
      source_type, source_name, source_url, source_year, verified, published,
      question_text, options, options_structured, correct_answer, solution_text,
      explanation, formula, concept, common_mistake, metadata
    `)
    .eq('published', true);

  if (examCode && examCode !== 'ALL') {
    query = query.eq('exam_code', examCode);
  }

  if (subject && subject !== 'All') {
    query = query.eq('subject', subject);
  }

  if (topic && topic !== 'All') {
    query = query.eq('topic', topic);
  }

  if (difficulty && difficulty !== 'All') {
    query = query.eq('difficulty', difficulty);
  }

  if (mode === 'PYQ') {
    query = query.eq('source_type', 'OFFICIAL_PYQ');
  }

  const { data: allCandidates, error } = await query.limit(500);

  if (error || !allCandidates || allCandidates.length === 0) {
    return {
      questions: [],
      totalAvailable: 0,
      mode,
      yearDistribution: {},
      duplicateFilteredCount: 0
    };
  }

  // 3. Shuffle & Filter Duplicates within session
  const seenIds = new Set<string>();
  const filteredCandidates: any[] = [];

  // Filter recency duplicates if not in INCORRECT retry mode
  allCandidates.forEach(q => {
    if (!seenIds.has(q.id)) {
      if (mode !== 'INCORRECT' && recentAttemptedQuestionIds.includes(q.id)) {
        // deprioritize recent questions
        return;
      }
      seenIds.add(q.id);
      filteredCandidates.push(q);
    }
  });

  // If filtered pool is too small, include recency items to satisfy requested count
  if (filteredCandidates.length < count) {
    allCandidates.forEach(q => {
      if (!filteredCandidates.find(x => x.id === q.id)) {
        filteredCandidates.push(q);
      }
    });
  }

  // 4. Sample evenly across available years to avoid single-year clustering
  const yearBuckets: Record<number, any[]> = {};
  filteredCandidates.forEach(q => {
    const y = q.year || 2026;
    if (!yearBuckets[y]) yearBuckets[y] = [];
    yearBuckets[y].push(q);
  });

  const availableYears = Object.keys(yearBuckets).map(Number).sort((a, b) => b - a);
  const selectedQuestions: any[] = [];
  const selectedSetIds = new Set<string>();

  let round = 0;
  while (selectedQuestions.length < count && selectedQuestions.length < filteredCandidates.length) {
    let addedInRound = false;
    for (const yr of availableYears) {
      if (selectedQuestions.length >= count) break;
      const pool = yearBuckets[yr];
      if (pool && round < pool.length) {
        const item = pool[round];
        if (!selectedSetIds.has(item.id)) {
          selectedSetIds.add(item.id);
          selectedQuestions.push(item);
          addedInRound = true;
        }
      }
    }
    round++;
    if (!addedInRound) break;
  }

  // Map to PracticeQuestion type format
  const mappedQuestions: PracticeQuestion[] = selectedQuestions.map(q => ({
    id: q.id,
    question_text: q.question_text,
    options: q.options || [],
    options_structured: q.options_structured,
    correct_answer: q.correct_answer,
    explanation: q.explanation || q.solution_text || '',
    solution_text: q.solution_text || q.explanation || '',
    exam: q.exam_family || q.exam_code,
    exam_code: q.exam_code,
    subject: q.subject,
    chapter: q.chapter,
    topic: q.topic,
    difficulty: q.difficulty || 'Medium',
    year: q.year || 2026,
    question_type: q.metadata?.question_type || 'MCQ_SINGLE',
    formula: q.formula,
    concept: q.concept,
    common_mistake: q.common_mistake,
    source_name: q.source_name,
    source_url: q.source_url
  }));

  // Calculate year distribution map for UI metrics
  const yearDistribution: Record<number, number> = {};
  mappedQuestions.forEach(q => {
    const yrNum = typeof q.year === 'number' ? q.year : 2026;
    yearDistribution[yrNum] = (yearDistribution[yrNum] || 0) + 1;
  });

  return {
    questions: mappedQuestions,
    totalAvailable: allCandidates.length,
    mode,
    yearDistribution,
    duplicateFilteredCount: allCandidates.length - filteredCandidates.length
  };
}
