// src/lib/intelligence/pipeline.ts
import { updateMasteryForAttempt } from './mastery';
import { recordMistakeAutomatically } from './mistakes';
import { createOrUpdateRevisionItem } from './revision';
import { generateRecommendations } from './recommendations';

export interface ProcessAttemptPayload {
  questionId: string;
  exam: string;
  year?: number;
  subject: string;
  topic: string;
  questionText: string;
  options?: string[];
  questionType?: string;
  studentAnswer: any;
  correctAnswer: any;
  isCorrect: boolean;
  explanation?: string;
  timeTakenSeconds: number;
  activitySource?: 'practice' | 'mock' | 'adaptive' | 'quiz';
}

const PENDING_PIPELINE_QUEUE_KEY = 'studyhub_pending_pipeline_queue';

export async function processQuestionAttemptEvent(payload: ProcessAttemptPayload): Promise<void> {
  const {
    questionId,
    exam,
    year,
    subject,
    topic,
    questionText,
    options,
    questionType,
    studentAnswer,
    correctAnswer,
    isCorrect,
    explanation,
    timeTakenSeconds,
  } = payload;

  try {
    // 1. Update Concept Mastery
    await updateMasteryForAttempt({
      exam,
      subject,
      topic,
      isCorrect,
      timeTakenSeconds,
      difficulty: 'Medium',
    });

    // 2. If incorrect, automatically create Mistake Record
    if (!isCorrect) {
      await recordMistakeAutomatically({
        questionId,
        exam,
        year,
        subject,
        topic,
        questionText,
        options,
        questionType,
        studentAnswer,
        correctAnswer,
        explanation,
        timeTakenSeconds,
      });

      // 3. Create or update Spaced Revision Item for the topic
      await createOrUpdateRevisionItem({
        exam,
        subject,
        topic,
        sourceType: 'mistake',
        sourceId: questionId,
        title: `${topic} Missed Question Review`,
        summaryNotes: explanation || `Missed question on ${topic}. Review concept and formula.`,
      });
    }

    // 4. Refresh recommendations asynchronously
    void generateRecommendations(exam);
  } catch (err) {
    console.warn('Pipeline event error, adding to offline pending queue:', err);
    addToPendingQueue(payload);
  }
}

// ── Offline Network Recovery Queue ──────────────────────────────────────
function addToPendingQueue(payload: ProcessAttemptPayload) {
  try {
    const raw = localStorage.getItem(PENDING_PIPELINE_QUEUE_KEY);
    const queue: ProcessAttemptPayload[] = raw ? JSON.parse(raw) : [];
    queue.push(payload);
    localStorage.setItem(PENDING_PIPELINE_QUEUE_KEY, JSON.stringify(queue.slice(0, 100)));
  } catch {
    // ignore
  }
}

export async function syncPendingPipelineQueue(): Promise<number> {
  try {
    const raw = localStorage.getItem(PENDING_PIPELINE_QUEUE_KEY);
    if (!raw) return 0;
    const queue: ProcessAttemptPayload[] = JSON.parse(raw);
    if (queue.length === 0) return 0;

    let processed = 0;
    for (const payload of queue) {
      await processQuestionAttemptEvent(payload);
      processed++;
    }

    localStorage.removeItem(PENDING_PIPELINE_QUEUE_KEY);
    return processed;
  } catch {
    return 0;
  }
}

// Auto-sync when online network event fires
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    void syncPendingPipelineQueue();
  });
}
