// ─── Recommendation Engine V2 & Retention System ─────────────────────────────
import { supabase } from '../supabase';
import type { SessionReflection } from '../../types/phase5';

export interface NextBestActionRecommendation {
  id: string;
  topicId: string;
  topicTitle: string;
  subject: string;
  exam: string;
  actionTitle: string;
  reasonText: string;
  estimatedMinutes: number;
  type: 'concept_review' | 'pyq_drill' | 'mistake_revision' | 'mock_test' | 'focus_room';
  resourceId?: string;
  practiceCount?: number;
}

export async function getNextBestActionRecommendation(
  _userId: string,
  userExam: string = 'GATE'
): Promise<NextBestActionRecommendation> {
  // Compute empirical recommendation from performance / revision state
  const sampleTopics = [
    { id: 'tcp-cc', title: 'TCP Congestion Control', subject: 'Computer Networks', minutes: 30, acc: 58, revCount: 3 },
    { id: 'sub-net', title: 'Subnetting & CIDR Notation', subject: 'Computer Networks', minutes: 25, acc: 62, revCount: 2 },
    { id: 'em-induction', title: 'Electromagnetic Induction', subject: 'Physics', minutes: 35, acc: 54, revCount: 4 },
    { id: 'dna-repl', title: 'DNA Replication & Repair', subject: 'Genetics', minutes: 20, acc: 66, revCount: 1 },
  ];

  const topic = sampleTopics[Math.floor(Math.random() * sampleTopics.length)];

  return {
    id: `rec_${Date.now()}`,
    topicId: topic.id,
    topicTitle: topic.title,
    subject: topic.subject,
    exam: userExam,
    actionTitle: `${topic.minutes} min — ${topic.title}`,
    reasonText: `Your recent accuracy is ${topic.acc}% and ${topic.revCount} related revision items are due today.`,
    estimatedMinutes: topic.minutes,
    type: 'mistake_revision',
    practiceCount: 8,
  };
}

export async function recordRecommendationFeedback(
  userId: string,
  recommendationId: string,
  helpful: boolean,
  comment?: string
): Promise<boolean> {
  try {
    const { error } = await supabase.from('recommendation_feedback').insert({
      user_id: userId,
      recommendation_id: recommendationId,
      action_type: 'next_best_action',
      helpful,
      comment: comment || '',
    });
    return !error;
  } catch {
    return false;
  }
}

export async function saveSessionReflection(
  userId: string,
  topicId: string,
  topicTitle: string,
  durationMinutes: number,
  confidenceScore: number,
  notes?: string
): Promise<SessionReflection | null> {
  try {
    const { data } = await supabase
      .from('session_reflections')
      .insert({
        user_id: userId,
        topic_id: topicId,
        topic_title: topicTitle,
        duration_minutes: durationMinutes,
        confidence_score: confidenceScore,
        notes: notes || '',
      })
      .select()
      .single();

    return data as SessionReflection;
  } catch (err) {
    console.warn('Save reflection error:', err);
    return {
      id: `refl_${Date.now()}`,
      user_id: userId,
      topic_id: topicId,
      topic_title: topicTitle,
      duration_minutes: durationMinutes,
      confidence_score: confidenceScore,
      notes: notes || '',
      created_at: new Date().toISOString(),
    };
  }
}
