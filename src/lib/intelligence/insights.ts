// src/lib/intelligence/insights.ts
import { supabase } from '../supabase';
import type { LearningInsight } from '../../types/intelligence';
import { fetchConceptMastery } from './mastery';
import { fetchMistakeNotebook } from './mistakes';
import { fetchRevisionItems, getRevisionStats } from './revision';
import { getLocalAttempts } from '../practiceApi';

const INSIGHTS_KEY = 'studyhub_learning_insights';

export async function generateLearningInsights(exam: string = 'GATE'): Promise<LearningInsight[]> {
  const attempts = getLocalAttempts();
  const masteryList = await fetchConceptMastery(exam);
  const mistakes = await fetchMistakeNotebook({ exam });
  const revisions = await fetchRevisionItems(exam);
  const revStats = getRevisionStats(revisions);

  const insights: LearningInsight[] = [];
  const now = new Date().getTime();

  // 1. Time pressure error insight
  const timePressureMistakes = mistakes.filter((m) => m.mistake_type === 'time_pressure' || m.time_taken > 150);
  if (timePressureMistakes.length >= 2) {
    insights.push({
      id: 'ins-time-pressure',
      user_id: 'local',
      insight_type: 'time_pressure',
      title: 'Time Pressure Speed Pattern',
      description: `You frequently make errors on long questions (> 2.5 mins). Pace yourself with timed speed drills.`,
      metric_value: `${timePressureMistakes.length} time-pressured attempts`,
      is_warning: true,
      action_link: '/adaptive-practice',
      created_at: new Date().toISOString(),
    });
  }

  // 2. Repeated Mistake Early Warning
  const repeatedMistakes = mistakes.filter((m) => m.attempt_count >= 3 && !m.mastered);
  if (repeatedMistakes.length > 0) {
    const topRepeated = repeatedMistakes[0];
    insights.push({
      id: 'ins-repeated-mistake',
      user_id: 'local',
      insight_type: 'stagnant_topic',
      title: 'Stagnant Concept Alert',
      description: `${topRepeated.topic} question has been missed ${topRepeated.attempt_count} times. Review the underlying concept with StudyMate AI.`,
      metric_value: `${topRepeated.attempt_count} repeat misses`,
      is_warning: true,
      action_link: '/mistakes',
      created_at: new Date().toISOString(),
    });
  }

  // 3. Revision Backlog Warning
  if (revStats.overdue >= 3) {
    insights.push({
      id: 'ins-revision-backlog',
      user_id: 'local',
      insight_type: 'warning',
      title: 'Revision Backlog Increasing',
      description: `Your revision backlog has increased this week with ${revStats.overdue} overdue items. Consider a 20-minute revision-only session today.`,
      metric_value: `${revStats.overdue} overdue items`,
      is_warning: true,
      action_link: '/revision',
      created_at: new Date().toISOString(),
    });
  }

  // 4. Inactivity Early Warning
  if (attempts.length > 0) {
    const lastAttemptTime = new Date(attempts[0].created_at || Date.now()).getTime();
    const daysSinceLast = (now - lastAttemptTime) / (1000 * 60 * 60 * 24);

    if (daysSinceLast >= 3) {
      insights.push({
        id: 'ins-inactivity-warning',
        user_id: 'local',
        insight_type: 'warning',
        title: 'Study Momentum Check',
        description: `It's been ${Math.floor(daysSinceLast)} days since your last practice session. Re-ignite your streak with a quick 5-question review.`,
        metric_value: `${Math.floor(daysSinceLast)} days inactive`,
        is_warning: true,
        action_link: '/practice',
        created_at: new Date().toISOString(),
      });
    }
  }

  // 5. Positive Mastery Growth Insight
  const masteredTopics = masteryList.filter((m) => m.status === 'mastered');
  if (masteredTopics.length > 0) {
    insights.push({
      id: 'ins-mastery-growth',
      user_id: 'local',
      insight_type: 'mastery_growth',
      title: 'Concept Mastery Progress',
      description: `You have successfully mastered ${masteredTopics.length} topics (${masteredTopics.map((m) => m.topic).slice(0, 2).join(', ')}) with >85% accuracy.`,
      metric_value: `${masteredTopics.length} topics mastered`,
      is_warning: false,
      action_link: '/performance',
      created_at: new Date().toISOString(),
    });
  }

  // 6. Revision Impact Insight
  if (attempts.length >= 10) {
    const correctCount = attempts.filter((a) => a.is_correct).length;
    const accuracy = Math.round((correctCount / attempts.length) * 100);

    insights.push({
      id: 'ins-overall-accuracy',
      user_id: 'local',
      insight_type: 'revision_impact',
      title: 'Overall Practice Accuracy',
      description: `Your overall practice accuracy is ${accuracy}% across ${attempts.length} logged questions.`,
      metric_value: `${accuracy}% accuracy`,
      is_warning: accuracy < 60,
      action_link: '/performance',
      created_at: new Date().toISOString(),
    });
  }

  saveLocalInsights(insights);

  // Sync to Supabase
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user && insights.length > 0) {
      const records = insights.map((ins) => ({ ...ins, user_id: user.id }));
      await supabase.from('learning_insights').upsert(records, { onConflict: 'id' });
    }
  } catch (err) {
    console.warn('Failed to save learning insights:', err);
  }

  return insights;
}

function saveLocalInsights(items: LearningInsight[]) {
  try {
    localStorage.setItem(INSIGHTS_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn('Local insights save warning:', err);
  }
}
