// src/lib/mockApi.ts
import { supabase } from './supabase';
import type { MockTest, MockAttempt, PracticeQuestion, ExamCategory } from '../types/student-core';

const MOCK_ATTEMPT_PREFIX = 'studyhub_mock_attempt_';
const COMPLETED_MOCKS_KEY = 'studyhub_completed_mock_attempts';

const SAMPLE_MOCK_TESTS: MockTest[] = [
  {
    id: 'mock-gate-full-01',
    exam: 'GATE',
    title: 'GATE CS 2027 Full Syllabus Mock #01',
    description: 'Comprehensive 65-question exam simulation covering Computer Networks, DBMS, OS, Data Structures, TOC, COA, Maths & Aptitude.',
    total_questions: 15,
    duration_minutes: 45,
    total_marks: 50,
    difficulty: 'Medium',
  },
  {
    id: 'mock-gate-cn-01',
    exam: 'GATE',
    title: 'Computer Networks Sectional Test',
    description: '30-minute speed drill on IP Addressing, Subnetting, TCP/UDP & Routing.',
    subject: 'Computer Networks',
    total_questions: 10,
    duration_minutes: 30,
    total_marks: 30,
    difficulty: 'Hard',
  },
  {
    id: 'mock-jee-phys-01',
    exam: 'JEE Main',
    title: 'JEE Main Physics Speed Mock',
    description: '15 Questions on Mechanics, Electromagnetism, and Modern Physics.',
    subject: 'Physics — Mechanics',
    total_questions: 15,
    duration_minutes: 30,
    total_marks: 60,
    difficulty: 'Medium',
  },
];

export async function fetchMockTests(exam: ExamCategory = 'GATE'): Promise<MockTest[]> {
  try {
    const { data, error } = await supabase
      .from('mock_tests')
      .select('*')
      .eq('exam', exam);

    if (!error && data && data.length > 0) {
      return data as MockTest[];
    }
  } catch {
    // fallback
  }

  return SAMPLE_MOCK_TESTS.filter((m) => m.exam === exam || exam === 'GATE');
}

export async function getMockTestById(id: string, exam: ExamCategory = 'GATE'): Promise<MockTest | null> {
  const list = await fetchMockTests(exam);
  const found = list.find((m) => m.id === id);
  if (found) return found;

  return SAMPLE_MOCK_TESTS[0];
}

export interface SaveMockStateParams {
  attemptId: string;
  mockTestId: string;
  answers: Record<string, any>;
  markedForReview: Record<string, boolean>;
  timeSpentSeconds: number;
}

export function saveMockStateLocally(params: SaveMockStateParams) {
  try {
    const key = `${MOCK_ATTEMPT_PREFIX}${params.attemptId}`;
    localStorage.setItem(key, JSON.stringify(params));
  } catch (err) {
    console.warn('Failed to save mock state locally:', err);
  }
}

export function loadMockStateLocally(attemptId: string): SaveMockStateParams | null {
  try {
    const key = `${MOCK_ATTEMPT_PREFIX}${attemptId}`;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function syncMockStateToSupabase(params: SaveMockStateParams) {
  saveMockStateLocally(params);

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Upsert attempt row
    await supabase.from('mock_attempts').upsert({
      id: params.attemptId,
      user_id: user.id,
      mock_test_id: params.mockTestId,
      status: 'in_progress',
      time_spent_seconds: params.timeSpentSeconds,
    });

    // Upsert mock answer rows
    const answerRecords = Object.keys(params.answers).map((qId) => ({
      attempt_id: params.attemptId,
      user_id: user.id,
      question_id: qId,
      selected_answer: params.answers[qId],
      marked_for_review: !!params.markedForReview[qId],
    }));

    if (answerRecords.length > 0) {
      await supabase.from('mock_answers').upsert(answerRecords);
    }
  } catch (err) {
    console.warn('Supabase sync mock state warning:', err);
  }
}

export async function submitMockAttempt(
  attemptId: string,
  mockTest: MockTest,
  questions: PracticeQuestion[],
  answers: Record<string, any>,
  _markedForReview: Record<string, boolean>,
  timeSpentSeconds: number
): Promise<MockAttempt> {
  let correctCount = 0;
  let wrongCount = 0;
  let unansweredCount = 0;
  let totalScore = 0;

  const topicScores: Record<string, { correct: number; total: number; pct: number }> = {};

  questions.forEach((q) => {
    const userAns = answers[q.id];
    if (!topicScores[q.topic]) {
      topicScores[q.topic] = { correct: 0, total: 0, pct: 0 };
    }
    topicScores[q.topic].total++;

    if (userAns === undefined || userAns === null || userAns === '') {
      unansweredCount++;
    } else {
      let isCorrect = false;
      if (Array.isArray(q.correct_answer)) {
        if (Array.isArray(userAns)) {
          isCorrect =
            q.correct_answer.length === userAns.length &&
            q.correct_answer.every((val) => userAns.includes(val));
        }
      } else {
        isCorrect = String(userAns).trim().toUpperCase() === String(q.correct_answer).trim().toUpperCase();
      }

      if (isCorrect) {
        correctCount++;
        totalScore += 2; // sample marks
        topicScores[q.topic].correct++;
      } else {
        wrongCount++;
        totalScore = Math.max(0, totalScore - 0.66); // negative marks
      }

      // Trigger Phase 2 Intelligence Pipeline processing asynchronously for mock question
      void import('./intelligence/pipeline').then(({ processQuestionAttemptEvent }) => {
        void processQuestionAttemptEvent({
          questionId: q.id,
          exam: mockTest.exam,
          subject: q.subject || mockTest.subject || 'General',
          topic: q.topic,
          questionText: q.question_text,
          options: q.options,
          questionType: q.question_type,
          studentAnswer: userAns,
          correctAnswer: q.correct_answer,
          isCorrect,
          explanation: q.explanation,
          timeTakenSeconds: Math.round(timeSpentSeconds / questions.length),
          activitySource: 'mock',
        });
      });
    }
  });

  Object.keys(topicScores).forEach((t) => {
    const item = topicScores[t];
    item.pct = item.total > 0 ? Math.round((item.correct / item.total) * 100) : 0;
  });

  const accuracyPct = questions.length > 0 ? Math.round((correctCount / (correctCount + wrongCount || 1)) * 100) : 0;

  const completedAttempt: MockAttempt = {
    id: attemptId,
    user_id: 'local',
    mock_test_id: mockTest.id,
    status: 'completed',
    score: Math.round(totalScore * 10) / 10,
    max_score: mockTest.total_marks,
    accuracy_pct: accuracyPct,
    total_questions: questions.length,
    correct_count: correctCount,
    wrong_count: wrongCount,
    unanswered_count: unansweredCount,
    time_spent_seconds: timeSpentSeconds,
    topic_scores: topicScores,
    started_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
  };

  // Save to local storage list
  try {
    const list = getLocalCompletedMocks();
    list.unshift(completedAttempt);
    localStorage.setItem(COMPLETED_MOCKS_KEY, JSON.stringify(list.slice(0, 50)));
  } catch (err) {
    console.warn('Failed to save completed mock locally:', err);
  }

  // Save to Supabase
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      completedAttempt.user_id = user.id;
      await supabase.from('mock_attempts').upsert({
        ...completedAttempt,
        user_id: user.id,
      });
    }
  } catch (err) {
    console.warn('Supabase submit mock attempt warning:', err);
  }

  return completedAttempt;
}

export function getLocalCompletedMocks(): MockAttempt[] {
  try {
    const raw = localStorage.getItem(COMPLETED_MOCKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
