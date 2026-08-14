// src/lib/practiceApi.ts
import { supabase } from './supabase';
import type { PracticeQuestion, UserQuestionAttempt, PracticeSessionResult, QuestionDifficulty, QuestionType } from '../types/student-core';

const MISTAKES_LOCAL_KEY = 'studyhub_saved_mistakes';
const ATTEMPTS_LOCAL_KEY = 'studyhub_question_attempts';

const SAMPLE_QUESTION_BANK: PracticeQuestion[] = [
  {
    id: 'q-cn-1',
    exam: 'GATE',
    year: 2025,
    subject: 'Computer Networks',
    topic: 'Subnetting',
    difficulty: 'Medium',
    question_type: 'MCQ',
    question_text: 'An organization is granted the block 130.56.0.0/16. The administrator wants to create 1024 subnets. What is the subnet mask and how many addresses are available per subnet for hosts?',
    options: [
      'A. 255.255.255.192 and 62 host addresses',
      'B. 255.255.255.128 and 126 host addresses',
      'C. 255.255.252.0 and 1022 host addresses',
      'D. 255.255.255.0 and 254 host addresses',
    ],
    correct_answer: 'A',
    explanation: 'To create 1024 (2^10) subnets from /16, we borrow 10 bits for subnetting, making the new prefix length /26 (16 + 10). A /26 mask is 255.255.255.192. Each subnet has 32 - 26 = 6 host bits, giving 2^6 - 2 = 62 usable host addresses per subnet.',
    is_official_pyq: true,
  },
  {
    id: 'q-cn-2',
    exam: 'GATE',
    year: 2024,
    subject: 'Computer Networks',
    topic: 'TCP/UDP',
    difficulty: 'Hard',
    question_type: 'MSQ',
    question_text: 'Which of the following statements is/are TRUE regarding TCP Congestion Control and Flow Control?',
    options: [
      'A. Flow control prevents the sender from overwhelming the receiver.',
      'B. Congestion control prevents the sender from overwhelming the network infrastructure.',
      'C. TCP AIMD increases congestion window additively on receiving ACKs and decreases multiplicatively on loss.',
      'D. UDP provides flow control but does not provide congestion control.',
    ],
    correct_answer: ['A', 'B', 'C'],
    explanation: 'A, B, and C are correct. Statement D is false because UDP provides neither flow control nor congestion control.',
    is_official_pyq: true,
  },
  {
    id: 'q-cn-3',
    exam: 'GATE',
    year: 2023,
    subject: 'Computer Networks',
    topic: 'IP Addressing',
    difficulty: 'Medium',
    question_type: 'Numerical',
    question_text: 'Consider an IP packet of total length 4500 bytes (including a 20-byte IP header) sent over a link with Maximum Transmission Unit (MTU) of 1000 bytes. How many total fragments are generated at the IP layer?',
    options: [],
    correct_answer: '5',
    explanation: 'Each fragment can carry at most 1000 - 20 = 980 payload bytes. Since fragment offset must be a multiple of 8, max payload per fragment is floor(980/8)*8 = 976 bytes. Total payload = 4480 bytes. Number of fragments = ceil(4480 / 976) = 5 fragments.',
    is_official_pyq: true,
  },
  {
    id: 'q-os-1',
    exam: 'GATE',
    year: 2024,
    subject: 'Operating Systems',
    topic: 'Process Synchronization',
    difficulty: 'Medium',
    question_type: 'MCQ',
    question_text: 'Three processes P1, P2, and P3 share a counting semaphore S initialized to 2. If P1 executes wait(S), P2 executes wait(S), and P3 executes wait(S), what is the final value of S?',
    options: [
      'A. 0',
      'B. -1',
      'C. 1',
      'D. -2',
    ],
    correct_answer: 'B',
    explanation: 'Initial S = 2. After P1 wait(S): S = 1. After P2 wait(S): S = 0. After P3 wait(S): S = -1. P3 is blocked.',
    is_official_pyq: true,
  },
  {
    id: 'q-dbms-1',
    exam: 'GATE',
    year: 2024,
    subject: 'DBMS',
    topic: 'Normalization',
    difficulty: 'Easy',
    question_type: 'True/False',
    question_text: 'True or False: Every relation in BCNF is also in 3NF.',
    options: ['A. True', 'B. False'],
    correct_answer: 'A',
    explanation: 'BCNF is a stricter form of 3NF. If a relation is in BCNF, it satisfies all 3NF conditions.',
    is_official_pyq: true,
  },
  {
    id: 'q-jee-1',
    exam: 'JEE Main',
    year: 2025,
    subject: 'Physics — Mechanics',
    topic: 'Kinematics',
    difficulty: 'Medium',
    question_type: 'MCQ',
    question_text: 'A projectile is thrown from horizontal ground with speed 20 m/s at an angle of 30° to the horizontal. Taking g = 10 m/s^2, the maximum height reached by the projectile is:',
    options: ['A. 5 m', 'B. 10 m', 'C. 15 m', 'D. 20 m'],
    correct_answer: 'A',
    explanation: 'H_max = (u^2 * sin^2(theta)) / (2g) = (400 * (1/4)) / 20 = 100 / 20 = 5 meters.',
    is_official_pyq: true,
  },
];

import { fetchCanonicalQuestions } from './questionEngineApi';

export async function fetchPracticeQuestions(params: {
  exam?: string;
  year?: number | null;
  subject?: string;
  topic?: string;
  difficulty?: QuestionDifficulty;
  questionType?: QuestionType;
  limit?: number;
}): Promise<PracticeQuestion[]> {
  try {
    const res = await fetchCanonicalQuestions({
      examCode: params.exam,
      year: params.year,
      subject: params.subject,
      topic: params.topic,
      difficulty: params.difficulty,
      questionType: params.questionType,
      limit: params.limit || 20,
    });
    if (res.questions.length > 0) {
      return res.questions;
    }
  } catch {
    // fallback
  }

  // Filter local sample question bank
  let filtered = [...SAMPLE_QUESTION_BANK];
  if (params.exam) filtered = filtered.filter((q) => q.exam === params.exam);
  if (params.subject) filtered = filtered.filter((q) => q.subject === params.subject);
  if (params.topic) filtered = filtered.filter((q) => q.topic.toLowerCase().includes(params.topic!.toLowerCase()));
  if (params.difficulty) filtered = filtered.filter((q) => q.difficulty === params.difficulty);
  if (params.questionType) filtered = filtered.filter((q) => q.question_type === params.questionType);

  if (filtered.length === 0) {
    return SAMPLE_QUESTION_BANK;
  }

  return filtered;
}

export async function recordQuestionAttempt(attempt: Omit<UserQuestionAttempt, 'id' | 'user_id' | 'created_at'>): Promise<boolean> {
  try {
    const localAttempts = getLocalAttempts();
    const newAttempt: UserQuestionAttempt = {
      ...attempt,
      id: String(Date.now()),
      user_id: 'local',
      created_at: new Date().toISOString(),
    };
    localAttempts.unshift(newAttempt);
    localStorage.setItem(ATTEMPTS_LOCAL_KEY, JSON.stringify(localAttempts.slice(0, 200)));

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('user_question_attempts').insert([
        {
          ...attempt,
          user_id: user.id,
        },
      ]);
    }

    // Trigger Phase 2 Intelligence Pipeline processing asynchronously
    void import('./intelligence/pipeline').then(({ processQuestionAttemptEvent }) => {
      void processQuestionAttemptEvent({
        questionId: attempt.question_id,
        exam: attempt.exam,
        subject: attempt.subject,
        topic: attempt.topic,
        questionText: `Question on ${attempt.topic}`,
        studentAnswer: attempt.user_answer,
        correctAnswer: 'Refer to explanation',
        isCorrect: attempt.is_correct,
        timeTakenSeconds: attempt.time_taken_seconds || 30,
        activitySource: 'practice',
      });
    });

    return true;
  } catch (err) {
    console.warn('Failed to record question attempt:', err);
    return false;
  }
}

export async function toggleSaveMistake(questionId: string, saved: boolean): Promise<boolean> {
  try {
    const list = getLocalSavedMistakes();
    let updated: string[];
    if (saved) {
      updated = Array.from(new Set([...list, questionId]));
    } else {
      updated = list.filter((id) => id !== questionId);
    }
    localStorage.setItem(MISTAKES_LOCAL_KEY, JSON.stringify(updated));

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('user_question_attempts')
        .update({ saved_as_mistake: saved })
        .eq('user_id', user.id)
        .eq('question_id', questionId);
    }
    return true;
  } catch (err) {
    console.warn('Failed to toggle mistake:', err);
    return false;
  }
}

export function getLocalSavedMistakes(): string[] {
  try {
    const raw = localStorage.getItem(MISTAKES_LOCAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getLocalAttempts(): UserQuestionAttempt[] {
  try {
    const raw = localStorage.getItem(ATTEMPTS_LOCAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function calculateSessionSummary(
  questions: PracticeQuestion[],
  answers: Record<string, any>,
  timeTakenMap: Record<string, number>
): PracticeSessionResult {
  let correctCount = 0;
  let wrongCount = 0;
  let totalTime = 0;
  const strongTopicsSet = new Set<string>();
  const weakTopicsSet = new Set<string>();

  questions.forEach((q) => {
    const userAns = answers[q.id];
    const time = timeTakenMap[q.id] || 0;
    totalTime += time;

    let isCorrect = false;
    if (Array.isArray(q.correct_answer)) {
      if (Array.isArray(userAns)) {
        isCorrect =
          q.correct_answer.length === userAns.length &&
          q.correct_answer.every((val) => userAns.includes(val));
      }
    } else {
      isCorrect = String(userAns || '').trim().toUpperCase() === String(q.correct_answer).trim().toUpperCase();
    }

    if (isCorrect) {
      correctCount++;
      strongTopicsSet.add(q.topic);
    } else if (userAns !== undefined) {
      wrongCount++;
      weakTopicsSet.add(q.topic);
    }
  });

  const total = questions.length;
  const accuracyPct = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  return {
    totalQuestions: total,
    correctCount,
    wrongCount,
    accuracyPct,
    totalTimeSeconds: totalTime,
    strongTopics: Array.from(strongTopicsSet),
    weakTopics: Array.from(weakTopicsSet),
  };
}
