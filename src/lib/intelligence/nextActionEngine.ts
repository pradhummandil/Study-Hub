// src/lib/intelligence/nextActionEngine.ts
// Question Engine 4.3 — Deterministic Weakness & Next Action Recommendation Engine

import { supabase } from '../supabase';
import type { StudentProfile } from '../../types/student-core';

export type SampleReliability = 'INSUFFICIENT_DATA' | 'DEVELOPING' | 'RELIABLE_SIGNAL';

export interface TopicWeaknessMetric {
  subject: string;
  topic: string;
  attemptCount: number;
  accuracyPct: number;
  recentAccuracyPct: number;
  avgTimeSeconds: number;
  expectedTimeSeconds: number;
  timeOverheadPct: number;
  reliability: SampleReliability;
  weaknessScore: number; // 0 to 100
}

export type NextActionType =
  | 'PRACTICE_TOPIC'
  | 'REVIEW_MISTAKES'
  | 'DO_REVISION'
  | 'WATCH_LESSON'
  | 'TAKE_MOCK'
  | 'NEW_USER_START'
  | 'REST_OPTIONAL';

export interface NextActionRecommendation {
  type: NextActionType;
  title: string;
  subtext: string;
  actionUrl: string;
  ctaText: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  empiricalEvidence: string;
  reliabilitySignal: SampleReliability;
  topicMetrics?: TopicWeaknessMetric;
}

/**
 * Computes deterministic weakness score for a topic with attempt data.
 * Score = (100 - accuracy) * 0.5 + (100 - recent_accuracy) * 0.3 + (time_overhead_pct) * 0.2
 */
export function computeWeaknessScore(
  accuracyPct: number,
  recentAccuracyPct: number,
  timeOverheadPct: number
): number {
  const accComponent = (100 - Math.min(100, Math.max(0, accuracyPct))) * 0.5;
  const recentComponent = (100 - Math.min(100, Math.max(0, recentAccuracyPct))) * 0.3;
  const timeComponent = Math.min(100, Math.max(0, timeOverheadPct)) * 0.2;

  return Math.round(accComponent + recentComponent + timeComponent);
}

/**
 * Classifies sample size reliability.
 */
export function classifySampleReliability(attemptCount: number): SampleReliability {
  if (attemptCount < 3) return 'INSUFFICIENT_DATA';
  if (attemptCount <= 9) return 'DEVELOPING';
  return 'RELIABLE_SIGNAL';
}

/**
 * Generates the single next best recommended action for a student based on real attempts.
 */
export async function computeStudentNextAction(
  userId: string | null,
  profile: StudentProfile | null
): Promise<NextActionRecommendation> {
  const targetExam = profile?.target_exam || 'GATE';

  // PRIORITY 7 (Default / Guest): DIAGNOSTIC
  if (!userId || userId === 'guest_user') {
    return {
      type: 'NEW_USER_START',
      title: `Take ${targetExam} Baseline Diagnostic`,
      subtext: `Start your first 10-question practice set to build your strength profile.`,
      actionUrl: '/practice',
      ctaText: 'Start now →',
      priority: 'HIGH',
      empiricalEvidence: 'No attempts registered yet for this account.',
      reliabilitySignal: 'INSUFFICIENT_DATA',
    };
  }

  // PRIORITY 1: REVISION DUE
  try {
    const { data: revisionItems } = await supabase
      .from('revision_items')
      .select('id, topic, subject')
      .eq('user_id', userId)
      .lte('next_review_date', new Date().toISOString());

    if (revisionItems && revisionItems.length > 0) {
      const topTopic = revisionItems[0]?.topic || 'Core Concepts';
      const topSubject = revisionItems[0]?.subject || 'General';
      return {
        type: 'DO_REVISION',
        title: `Spaced Revision Due: ${topTopic}`,
        subtext: `${revisionItems.length} revision cards are due today to lock in memory retention.`,
        actionUrl: '/revision',
        ctaText: 'Start revision →',
        priority: 'HIGH',
        empiricalEvidence: `${revisionItems.length} items due today based on SuperMemo algorithm.`,
        reliabilitySignal: 'RELIABLE_SIGNAL',
        topicMetrics: {
          subject: topSubject,
          topic: topTopic,
          attemptCount: revisionItems.length,
          accuracyPct: 70,
          recentAccuracyPct: 70,
          avgTimeSeconds: 60,
          expectedTimeSeconds: 90,
          timeOverheadPct: 0,
          reliability: 'RELIABLE_SIGNAL',
          weaknessScore: 65,
        },
      };
    }
  } catch (e) {
    console.warn('Error checking revision due:', e);
  }

  // Fetch attempt history for priorities 2, 3, 4, 5
  const { data: attempts } = await supabase
    .from('user_question_attempts')
    .select('question_id, is_correct, time_taken_seconds, attempted_at, questions(subject, topic)')
    .eq('user_id', userId)
    .order('attempted_at', { ascending: false });

  // PRIORITY 2: RELIABLE WEAKNESS
  if (attempts && attempts.length >= 3) {
    const topicMap = new Map<string, {
      subject: string;
      topic: string;
      attempts: any[];
      correctCount: number;
      totalTime: number;
    }>();

    attempts.forEach(a => {
      const qData = Array.isArray(a.questions) ? a.questions[0] : a.questions;
      const sub = qData?.subject || 'General';
      const top = qData?.topic || 'Fundamentals';
      const key = `${sub}|||${top}`;

      if (!topicMap.has(key)) {
        topicMap.set(key, {
          subject: sub,
          topic: top,
          attempts: [],
          correctCount: 0,
          totalTime: 0
        });
      }

      const entry = topicMap.get(key)!;
      entry.attempts.push(a);
      if (a.is_correct) entry.correctCount++;
      entry.totalTime += a.time_taken_seconds || 30;
    });

    const topicMetricsList: TopicWeaknessMetric[] = [];
    for (const [_, entry] of topicMap.entries()) {
      const total = entry.attempts.length;
      const reliability = classifySampleReliability(total);
      if (reliability === 'INSUFFICIENT_DATA') continue;

      const acc = Math.round((entry.correctCount / total) * 100);
      const recent5 = entry.attempts.slice(0, 5);
      const recentCorrect = recent5.filter(x => x.is_correct).length;
      const recentAcc = Math.round((recentCorrect / recent5.length) * 100);
      const avgTime = Math.round(entry.totalTime / total);
      const expectedTime = 90;
      const timeOverheadPct = Math.max(0, Math.round(((avgTime - expectedTime) / expectedTime) * 100));

      const weaknessScore = computeWeaknessScore(acc, recentAcc, timeOverheadPct);
      topicMetricsList.push({
        subject: entry.subject,
        topic: entry.topic,
        attemptCount: total,
        accuracyPct: acc,
        recentAccuracyPct: recentAcc,
        avgTimeSeconds: avgTime,
        expectedTimeSeconds: expectedTime,
        timeOverheadPct,
        reliability,
        weaknessScore
      });
    }

    topicMetricsList.sort((a, b) => b.weaknessScore - a.weaknessScore);
    const weakest = topicMetricsList[0];

    if (weakest && weakest.weaknessScore >= 40) {
      return {
        type: 'PRACTICE_TOPIC',
        title: `${weakest.subject} — ${weakest.topic}`,
        subtext: `Selected based on high weakness score (${weakest.weaknessScore}/100) and low recent accuracy (${weakest.recentAccuracyPct}%).`,
        actionUrl: `/practice?subject=${encodeURIComponent(weakest.subject)}&topic=${encodeURIComponent(weakest.topic)}`,
        ctaText: 'Start now →',
        priority: 'HIGH',
        empiricalEvidence: `${weakest.attemptCount} attempts registered • ${weakest.accuracyPct}% overall accuracy`,
        reliabilitySignal: weakest.reliability,
        topicMetrics: weakest
      };
    }
  }

  // PRIORITY 3: RECENT MISTAKES
  try {
    const { data: mistakes } = await supabase
      .from('mistake_notebook')
      .select('id, topic, subject')
      .eq('user_id', userId)
      .eq('mastered', false);

    if (mistakes && mistakes.length > 0) {
      const firstMistake = mistakes[0];
      return {
        type: 'REVIEW_MISTAKES',
        title: `Clear Unmastered Mistakes: ${firstMistake.topic || 'Saved Errors'}`,
        subtext: `You have ${mistakes.length} saved mistakes waiting to be converted into long-term mastery.`,
        actionUrl: '/mistakes',
        ctaText: 'Review mistakes →',
        priority: 'HIGH',
        empiricalEvidence: `${mistakes.length} unmastered mistakes present in notebook.`,
        reliabilitySignal: 'RELIABLE_SIGNAL',
      };
    }
  } catch (e) {
    console.warn('Error checking mistakes:', e);
  }

  // PRIORITY 4: UNATTEMPTED HIGH-VALUE PYQ
  return {
    type: 'PRACTICE_TOPIC',
    title: `${targetExam} High-Value PYQs`,
    subtext: `Solve unattempted official PYQs with solutions and concept notes.`,
    actionUrl: '/practice',
    ctaText: 'Start now →',
    priority: 'MEDIUM',
    empiricalEvidence: 'Core official PYQs available for targeted practice.',
    reliabilitySignal: 'RELIABLE_SIGNAL',
  };
}
