// src/lib/exam/examSimulatorApi.ts
import { supabase } from '../supabase';
import type { ExamCategory, QuestionDifficulty, PracticeQuestion } from '../../types/student-core';
import { fetchPracticeQuestions } from '../practiceApi';

export interface ExamTestSummary {
  id: string;
  exam: ExamCategory;
  examYear: number;
  title: string;
  description: string;
  subject?: string;
  topic?: string;
  mode: 'full' | 'section' | 'subject' | 'topic' | 'weak_area' | 'pyq' | 'custom';
  durationMinutes: number;
  questionCount: number;
  difficulty: QuestionDifficulty;
  sourceType: 'official_pyq' | 'ai_generated' | 'admin_test' | 'institution_test';
  calculatorAllowed: boolean;
  published: boolean;
  sections: Array<{ name: string; questionCount: number; marksPerQuestion: number; negativeMarkingRatio: number }>;
  instructions: string[];
}

export interface ExamAttemptRecord {
  id: string;
  user_id: string;
  test_id: string;
  exam: string;
  test_title: string;
  status: 'in_progress' | 'completed';
  score: number;
  max_score: number;
  accuracy_pct: number;
  total_questions: number;
  correct_count: number;
  wrong_count: number;
  skipped_count: number;
  negative_marks_lost: number;
  time_spent_seconds: number;
  started_at: string;
  completed_at?: string | null;
  answers: Record<number, string>;
  marked_for_review: Record<number, boolean>;
  time_per_question: Record<number, number>;
  questions: PracticeQuestion[];
  topic_performance: Array<{ topic: string; correct: number; total: number }>;
  cost_marks_reasons: string[];
  time_strategy_insight: string;
}

const ATTEMPTS_STORAGE_KEY = 'studyhub_exam_attempts';
const PENDING_ANSWERS_KEY = 'studyhub_pending_answers_';

// Real Exam Catalog
export const CATALOG_EXAM_TESTS: ExamTestSummary[] = [
  {
    id: 'gate-cs-2026-sim',
    exam: 'GATE',
    examYear: 2026,
    title: 'GATE 2026 Computer Science Full Simulation',
    description: 'Official IIT Madras structure with General Aptitude & Core CS sections, scientific calculator & negative marking.',
    mode: 'full',
    durationMinutes: 180,
    questionCount: 15,
    difficulty: 'Hard',
    sourceType: 'official_pyq',
    calculatorAllowed: true,
    published: true,
    sections: [
      { name: 'General Aptitude', questionCount: 3, marksPerQuestion: 1.5, negativeMarkingRatio: 0.33 },
      { name: 'Computer Science & IT', questionCount: 12, marksPerQuestion: 2, negativeMarkingRatio: 0.33 },
    ],
    instructions: [
      'Total duration is 180 minutes.',
      'On-screen GATE Scientific Calculator is available.',
      'Negative marking: 1/3 mark deducted for incorrect MCQs.',
      'Questions can be marked for review and navigated using the Question Palette.',
    ],
  },
  {
    id: 'gate-cn-topic-sim',
    exam: 'GATE',
    examYear: 2025,
    title: 'GATE Computer Networks — Topic Mastery Test',
    description: 'Focused test on Subnetting, TCP/IP, Sliding Window Protocols & CIDR routing.',
    subject: 'Computer Networks',
    topic: 'Subnetting & Routing',
    mode: 'topic',
    durationMinutes: 45,
    questionCount: 10,
    difficulty: 'Medium',
    sourceType: 'official_pyq',
    calculatorAllowed: true,
    published: true,
    sections: [
      { name: 'Computer Networks', questionCount: 10, marksPerQuestion: 2, negativeMarkingRatio: 0.33 },
    ],
    instructions: [
      'Duration: 45 minutes.',
      'GATE Scientific Calculator is allowed.',
      'Step-by-step verified explanations available post-test.',
    ],
  },
  {
    id: 'gate-dbms-os-sim',
    exam: 'GATE',
    examYear: 2025,
    title: 'DBMS & Operating Systems Subject Test',
    description: 'Subject evaluation covering Process Synchronization, Deadlocks, BCNF Normalization & SQL transactions.',
    subject: 'Operating Systems',
    mode: 'subject',
    durationMinutes: 60,
    questionCount: 10,
    difficulty: 'Medium',
    sourceType: 'official_pyq',
    calculatorAllowed: true,
    published: true,
    sections: [
      { name: 'Operating Systems', questionCount: 5, marksPerQuestion: 2, negativeMarkingRatio: 0.33 },
      { name: 'DBMS', questionCount: 5, marksPerQuestion: 2, negativeMarkingRatio: 0.33 },
    ],
    instructions: [
      'Duration: 60 minutes.',
      'Calculators permitted.',
    ],
  },
  {
    id: 'jee-adv-2025-sim',
    exam: 'JEE Advanced',
    examYear: 2025,
    title: 'JEE Advanced Paper 1 Simulation',
    description: 'Advanced Physics, Physical Chemistry & Calculus with single/multi-correct and integer question types.',
    mode: 'full',
    durationMinutes: 180,
    questionCount: 15,
    difficulty: 'Hard',
    sourceType: 'official_pyq',
    calculatorAllowed: false,
    published: true,
    sections: [
      { name: 'Physics', questionCount: 5, marksPerQuestion: 4, negativeMarkingRatio: 0.25 },
      { name: 'Chemistry', questionCount: 5, marksPerQuestion: 4, negativeMarkingRatio: 0.25 },
      { name: 'Mathematics', questionCount: 5, marksPerQuestion: 4, negativeMarkingRatio: 0.25 },
    ],
    instructions: [
      'Total duration: 180 minutes.',
      'NO calculator permitted.',
      'Partial marking available for MSQ multi-select questions.',
    ],
  },
  {
    id: 'neet-bio-full-sim',
    exam: 'NEET',
    examYear: 2025,
    title: 'NEET Full Length Mock Simulation',
    description: 'NCERT Botany, Zoology, Physics & Chemistry test formatted to official NEET standards.',
    mode: 'full',
    durationMinutes: 200,
    questionCount: 20,
    difficulty: 'Medium',
    sourceType: 'official_pyq',
    calculatorAllowed: false,
    published: true,
    sections: [
      { name: 'Biology (Botany & Zoology)', questionCount: 10, marksPerQuestion: 4, negativeMarkingRatio: 0.25 },
      { name: 'Physics & Chemistry', questionCount: 10, marksPerQuestion: 4, negativeMarkingRatio: 0.25 },
    ],
    instructions: [
      'Total duration: 200 minutes.',
      '4 marks for correct answer, -1 for incorrect.',
    ],
  },
];

export async function fetchExamTests(params?: {
  exam?: string;
  mode?: string;
  subject?: string;
}): Promise<ExamTestSummary[]> {
  try {
    let query = supabase.from('exam_tests').select('*').eq('published', true);
    if (params?.exam) query = query.eq('exam', params.exam);
    if (params?.mode && params.mode !== 'all') query = query.eq('mode', params.mode);

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return data as ExamTestSummary[];
    }
  } catch {
    // fallback
  }

  let filtered = [...CATALOG_EXAM_TESTS];
  if (params?.exam) {
    filtered = filtered.filter((t) => t.exam === params.exam);
  }
  if (params?.mode && params.mode !== 'all') {
    filtered = filtered.filter((t) => t.mode === params.mode);
  }

  if (filtered.length === 0) {
    return CATALOG_EXAM_TESTS;
  }
  return filtered;
}

export async function getExamTestById(testId: string): Promise<ExamTestSummary> {
  const all = await fetchExamTests();
  const found = all.find((t) => t.id === testId || t.id.toLowerCase().includes(testId.toLowerCase()));
  if (found) return found;

  // Fallback default test summary
  return {
    id: testId,
    exam: 'GATE',
    examYear: 2027,
    title: `${testId.toUpperCase()} Exam Test`,
    description: 'Adaptive simulation test configured for active student preparation.',
    mode: 'full',
    durationMinutes: 180,
    questionCount: 10,
    difficulty: 'Medium',
    sourceType: 'official_pyq',
    calculatorAllowed: true,
    published: true,
    sections: [{ name: 'Core Exam Section', questionCount: 10, marksPerQuestion: 2, negativeMarkingRatio: 0.33 }],
    instructions: [
      'On-screen calculator enabled for GATE.',
      'Answers are autosaved. Refreshing will resume your progress.',
    ],
  };
}

export async function startOrCreateExamAttempt(testId: string, userId: string): Promise<{ attempt: ExamAttemptRecord; test: ExamTestSummary; questions: PracticeQuestion[] }> {
  const test = await getExamTestById(testId);
  const questions = await fetchPracticeQuestions({ exam: test.exam, limit: test.questionCount });

  const attemptId = `attempt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const attempt: ExamAttemptRecord = {
    id: attemptId,
    user_id: userId,
    test_id: test.id,
    exam: test.exam,
    test_title: test.title,
    status: 'in_progress',
    score: 0,
    max_score: test.sections.reduce((acc, s) => acc + s.questionCount * s.marksPerQuestion, 0),
    accuracy_pct: 0,
    total_questions: questions.length,
    correct_count: 0,
    wrong_count: 0,
    skipped_count: questions.length,
    negative_marks_lost: 0,
    time_spent_seconds: 0,
    started_at: new Date().toISOString(),
    answers: {},
    marked_for_review: {},
    time_per_question: {},
    questions,
    topic_performance: [],
    cost_marks_reasons: [],
    time_strategy_insight: '',
  };

  // Persist locally
  const attempts = getStoredAttempts();
  attempts.unshift(attempt);
  localStorage.setItem(ATTEMPTS_STORAGE_KEY, JSON.stringify(attempts.slice(0, 50)));

  // Try Supabase insert
  try {
    await supabase.from('exam_attempts').insert({
      id: attemptId,
      user_id: userId === 'guest_user' ? null : userId,
      test_id: test.id,
      exam: test.exam,
      test_title: test.title,
      status: 'in_progress',
      started_at: attempt.started_at,
    });
  } catch {
    // Graceful fallback to local
  }

  return { attempt, test, questions };
}

export async function saveExamAnswersProgress(
  attemptId: string,
  answers: Record<number, string>,
  markedForReview: Record<number, boolean>,
  timeSpentSec: number
): Promise<void> {
  const attempts = getStoredAttempts();
  const idx = attempts.findIndex((a) => a.id === attemptId);
  if (idx !== -1) {
    attempts[idx].answers = answers;
    attempts[idx].marked_for_review = markedForReview;
    attempts[idx].time_spent_seconds = timeSpentSec;
    localStorage.setItem(ATTEMPTS_STORAGE_KEY, JSON.stringify(attempts));
  }

  // Backup to pending answers storage for network recovery sync
  localStorage.setItem(`${PENDING_ANSWERS_KEY}${attemptId}`, JSON.stringify({ answers, markedForReview, timeSpentSec, updatedAt: Date.now() }));
}

export async function completeAndGradeExamAttempt(
  attemptId: string,
  answers: Record<number, string>,
  markedForReview: Record<number, boolean>,
  timeSpentSec: number,
  test: ExamTestSummary,
  questions: PracticeQuestion[]
): Promise<ExamAttemptRecord> {
  let score = 0;
  let correctCount = 0;
  let wrongCount = 0;
  let skippedCount = 0;
  let negativeMarksLost = 0;
  let maxScore = 0;

  const topicMap: Record<string, { correct: number; total: number }> = {};

  questions.forEach((q, qIdx) => {
    const sec = test.sections[0] || { marksPerQuestion: 2, negativeMarkingRatio: 0.33 };
    const marks = sec.marksPerQuestion;
    const penalty = marks * sec.negativeMarkingRatio;
    maxScore += marks;

    if (!topicMap[q.topic]) {
      topicMap[q.topic] = { correct: 0, total: 0 };
    }
    topicMap[q.topic].total += 1;

    const userAns = answers[qIdx];
    if (!userAns) {
      skippedCount += 1;
    } else if (String(userAns).trim().toUpperCase() === String(q.correct_answer).trim().toUpperCase()) {
      correctCount += 1;
      score += marks;
      topicMap[q.topic].correct += 1;
    } else {
      wrongCount += 1;
      negativeMarksLost += penalty;
      score -= penalty;
    }
  });

  const attemptedCount = correctCount + wrongCount;
  const accuracyPct = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;

  const costReasons: string[] = [];
  if (negativeMarksLost > 0) {
    costReasons.push(`${Math.round(negativeMarksLost * 10) / 10} marks lost due to negative marking on incorrect options.`);
  }
  if (skippedCount > 0) {
    costReasons.push(`${skippedCount} questions left unattempted.`);
  }

  const topicPerformance = Object.entries(topicMap).map(([t, s]) => ({
    topic: t,
    correct: s.correct,
    total: s.total,
  }));

  const completedRecord: ExamAttemptRecord = {
    id: attemptId,
    user_id: 'user',
    test_id: test.id,
    exam: test.exam,
    test_title: test.title,
    status: 'completed',
    score: Math.max(0, Math.round(score * 10) / 10),
    max_score: Math.round(maxScore),
    accuracy_pct: accuracyPct,
    total_questions: questions.length,
    correct_count: correctCount,
    wrong_count: wrongCount,
    skipped_count: skippedCount,
    negative_marks_lost: Math.round(negativeMarksLost * 10) / 10,
    time_spent_seconds: timeSpentSec,
    started_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
    answers,
    marked_for_review: markedForReview,
    time_per_question: {},
    questions,
    topic_performance: topicPerformance,
    cost_marks_reasons: costReasons,
    time_strategy_insight: timeSpentSec / Math.max(1, attemptedCount) > 180 ? 'Pacing was slow on complex questions. Work on speed drills.' : 'Pacing was well balanced across all test sections.',
  };

  // Save completed attempt
  const attempts = getStoredAttempts();
  const existingIdx = attempts.findIndex((a) => a.id === attemptId);
  if (existingIdx !== -1) {
    attempts[existingIdx] = completedRecord;
  } else {
    attempts.unshift(completedRecord);
  }
  localStorage.setItem(ATTEMPTS_STORAGE_KEY, JSON.stringify(attempts));

  // Remove pending temp backup
  localStorage.removeItem(`${PENDING_ANSWERS_KEY}${attemptId}`);

  return completedRecord;
}

export function getStoredAttempts(): ExamAttemptRecord[] {
  try {
    const raw = localStorage.getItem(ATTEMPTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getExamAttemptById(attemptId: string): ExamAttemptRecord | null {
  const list = getStoredAttempts();
  return list.find((a) => a.id === attemptId) || null;
}
