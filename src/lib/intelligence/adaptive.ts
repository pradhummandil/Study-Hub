// src/lib/intelligence/adaptive.ts
import type { QuestionDifficulty } from '../../types/student-core';
import type { PracticeQuestion } from '../../types/student-core';
import { fetchPracticeQuestions } from '../practiceApi';
import { fetchConceptMastery } from './mastery';
import { fetchMistakeNotebook } from './mistakes';

export interface AdaptiveConfig {
  exam: string;
  subject?: string;
  totalQuestions?: number;
}

export function determineNextDifficulty(params: {
  recentAccuracyPct: number;
  recentSpeedSeconds?: number;
  topicMasteryScore?: number;
}): QuestionDifficulty {
  const { recentAccuracyPct } = params;

  if (recentAccuracyPct < 50) {
    return 'Easy';
  } else if (recentAccuracyPct <= 70) {
    return 'Medium';
  } else if (recentAccuracyPct <= 85) {
    return 'Medium';
  } else {
    return 'Hard';
  }
}

export async function selectAdaptiveQuestions(config: AdaptiveConfig): Promise<{
  questions: PracticeQuestion[];
  targetTopics: string[];
  reason: string;
}> {
  const { exam, subject } = config;

  // 1. Inspect weak topics and recent mistakes
  const masteryList = await fetchConceptMastery(exam, subject);
  const mistakeList = await fetchMistakeNotebook({ exam, subject, mastered: false });

  const weakTopics = masteryList
    .filter((m) => m.mastery_score < 65 || m.status === 'learning' || m.status === 'developing')
    .map((m) => m.topic);

  const mistakeTopics = mistakeList.map((m) => m.topic);

  const priorityTopics = Array.from(new Set([...weakTopics, ...mistakeTopics]));

  // 2. Fetch questions pool
  const allPool = await fetchPracticeQuestions({ exam, subject, limit: 50 });

  // Prioritize questions in priority topics first, then remaining
  const prioritized = allPool.filter((q) => priorityTopics.some((t) => q.topic.toLowerCase().includes(t.toLowerCase())));

  const remainder = allPool.filter((q) => !prioritized.includes(q));

  const combined = [...prioritized, ...remainder];
  const selected = combined.slice(0, config.totalQuestions || 10);

  const reason = priorityTopics.length > 0
    ? `Targeting your weak topics & due revisions: ${priorityTopics.slice(0, 3).join(', ')}`
    : 'Balanced exam coverage based on target syllabus';

  return {
    questions: selected,
    targetTopics: priorityTopics.length > 0 ? priorityTopics : ['Core Fundamentals'],
    reason,
  };
}

export function generateSimilarQuestion(params: {
  topic: string;
  subject: string;
  exam: string;
  difficulty?: QuestionDifficulty;
}): PracticeQuestion {
  const { topic, subject, exam, difficulty = 'Medium' } = params;

  // Generator seed for AI-generated practice question
  return {
    id: `ai-sim-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    exam,
    year: undefined,
    subject,
    topic,
    difficulty,
    question_type: 'MCQ',
    question_text: `[AI-generated practice] In ${subject} (${topic}), consider a scenario with updated parameters. If the bandwidth is 10 Mbps and propagation delay is 20 ms, what is the Bandwidth-Delay Product (BDP)?`,
    options: [
      'A. 200,000 bits',
      'B. 400,000 bits',
      'C. 100,000 bits',
      'D. 500,000 bits',
    ],
    correct_answer: 'A',
    explanation: 'BDP = Bandwidth * Propagation Delay = 10 * 10^6 bps * 0.020 s = 200,000 bits. This measures the maximum number of bits in flight on the link at any given time.',
    is_official_pyq: false, // Label clearly: AI-generated practice
  };
}
