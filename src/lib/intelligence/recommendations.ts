// src/lib/intelligence/recommendations.ts
import { supabase } from '../supabase';
import type { Recommendation, RecommendationPriority } from '../../types/intelligence';
import { fetchConceptMastery } from './mastery';
import { fetchRevisionItems, getRevisionStats } from './revision';
import { fetchMistakeNotebook } from './mistakes';
import { fetchFlashcards } from './flashcards';

const RECOMMENDATIONS_KEY = 'studyhub_ai_recommendations';

export async function generateRecommendations(exam: string = 'GATE'): Promise<Recommendation[]> {
  const masteryList = await fetchConceptMastery(exam);
  const revisionList = await fetchRevisionItems(exam);
  const mistakeList = await fetchMistakeNotebook({ exam, mastered: false });
  const flashcards = await fetchFlashcards({ exam });

  const revStats = getRevisionStats(revisionList);
  const dueFlashcards = flashcards.filter((f) => new Date(f.next_review_at).getTime() <= Date.now());

  const recs: Recommendation[] = [];

  // 1. Weak concepts with unmastered mistakes -> High priority
  const weakestMastery = masteryList.sort((a, b) => a.mastery_score - b.mastery_score)[0];
  if (weakestMastery && weakestMastery.mastery_score < 65) {
    recs.push({
      id: `rec-weak-${weakestMastery.topic.replace(/\s+/g, '-').toLowerCase()}`,
      user_id: 'local',
      type: 'practice',
      title: `Practice ${weakestMastery.topic}`,
      reason: `Recommended because your recent accuracy in ${weakestMastery.topic} is ${weakestMastery.recent_accuracy || weakestMastery.mastery_score}%.`,
      priority: 'high',
      estimated_minutes: 30,
      action: `/practice?exam=${encodeURIComponent(exam)}&subject=${encodeURIComponent(weakestMastery.subject)}&topic=${encodeURIComponent(weakestMastery.topic)}`,
      source: 'performance',
    });
  }

  // 2. Overdue or due revision items -> High priority
  if (revStats.dueToday > 0) {
    const dueTopics = revisionList
      .filter((r) => new Date(r.next_review_at).getTime() <= Date.now() + 86400000)
      .map((r) => r.topic)
      .slice(0, 2);

    const priority: RecommendationPriority = revStats.overdue > 0 ? 'high' : 'medium';
    recs.push({
      id: 'rec-revision-due',
      user_id: 'local',
      type: 'revision',
      title: `Complete ${revStats.dueToday} Due Revisions`,
      reason: `Recommended because ${revStats.dueToday} concept revision items (${dueTopics.join(', ') || 'due topics'}) are ready for memory retention review.`,
      priority,
      estimated_minutes: Math.min(45, Math.max(15, revStats.dueToday * 5)),
      action: '/revision',
      source: 'spaced_revision',
    });
  }

  // 3. Unmastered Mistakes -> High/Medium priority
  if (mistakeList.length > 0) {
    const topMistake = mistakeList[0];
    recs.push({
      id: `rec-mistake-${topMistake.id}`,
      user_id: 'local',
      type: 'practice',
      title: `Review Mistake Notebook: ${topMistake.topic}`,
      reason: `Recommended because you have ${mistakeList.length} unmastered mistakes in ${topMistake.subject}.`,
      priority: topMistake.attempt_count > 1 ? 'high' : 'medium',
      estimated_minutes: 20,
      action: '/mistakes',
      source: 'mistake_notebook',
    });
  }

  // 4. Due Flashcards -> Medium priority
  if (dueFlashcards.length > 0) {
    recs.push({
      id: 'rec-flashcards-due',
      user_id: 'local',
      type: 'flashcards',
      title: `Review ${dueFlashcards.length} Flashcards`,
      reason: `Recommended because ${dueFlashcards.length} cards are due for quick active recall.`,
      priority: 'medium',
      estimated_minutes: 15,
      action: '/flashcards',
      source: 'flashcards',
    });
  }

  // 5. Adaptive Practice drill recommendation -> Medium priority
  recs.push({
    id: 'rec-adaptive-drill',
    user_id: 'local',
    type: 'practice',
    title: 'Adaptive Exam Speed Drill',
    reason: 'Recommended to balance speed, difficulty progression, and topic weak spots dynamically.',
    priority: 'medium',
    estimated_minutes: 25,
    action: `/adaptive-practice?exam=${encodeURIComponent(exam)}`,
    source: 'adaptive_engine',
  });

  // Fallback onboarding suggestion if no performance data exists
  if (recs.length === 0) {
    recs.push({
      id: 'rec-onboarding',
      user_id: 'local',
      type: 'quiz',
      title: 'Complete a 10-Question Diagnostic Practice',
      reason: "We're still learning how you study. Complete 10 practice questions to unlock your first intelligence insights.",
      priority: 'high',
      estimated_minutes: 20,
      action: '/practice',
      source: 'system',
    });
  }

  saveLocalRecommendations(recs);

  // Sync to Supabase
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const records = recs.map((r) => ({ ...r, user_id: user.id }));
      await supabase.from('ai_recommendations').upsert(records, { onConflict: 'id' });
    }
  } catch (err) {
    console.warn('Failed to upsert recommendations:', err);
  }

  return recs;
}

export function getLocalRecommendations(): Recommendation[] {
  try {
    const raw = localStorage.getItem(RECOMMENDATIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalRecommendations(items: Recommendation[]) {
  try {
    localStorage.setItem(RECOMMENDATIONS_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn('Local recommendations save warning:', err);
  }
}
