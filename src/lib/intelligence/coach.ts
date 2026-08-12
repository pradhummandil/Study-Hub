// src/lib/intelligence/coach.ts
import type { StudentIntelligenceContext } from '../../types/intelligence';
import { getStudentProfile } from '../studentCoreApi';
import { fetchConceptMastery } from './mastery';
import { fetchRevisionItems, getRevisionStats } from './revision';
import { fetchMistakeNotebook } from './mistakes';
import { getLocalAttempts } from '../practiceApi';
import { getLocalCompletedMocks } from '../mockApi';

export async function buildStudentIntelligenceContext(exam: string = 'GATE'): Promise<StudentIntelligenceContext> {
  const profile = await getStudentProfile();
  const masteryList = await fetchConceptMastery(exam);
  const revisions = await fetchRevisionItems(exam);
  const mistakes = await fetchMistakeNotebook({ exam, mastered: false });
  const attempts = getLocalAttempts();
  const mocks = getLocalCompletedMocks();

  const revStats = getRevisionStats(revisions);
  const weakTopics = masteryList
    .filter((m) => m.mastery_score < 65 || m.status === 'learning' || m.status === 'developing')
    .map((m) => m.topic)
    .slice(0, 4);

  const strongTopics = masteryList
    .filter((m) => m.mastery_score >= 80 || m.status === 'mastered' || m.status === 'strong')
    .map((m) => m.topic)
    .slice(0, 4);

  const revisionDue = revisions
    .filter((r) => new Date(r.next_review_at).getTime() <= Date.now() + 86400000)
    .map((r) => r.topic)
    .slice(0, 5);

  const recentMistakes = mistakes.map((m) => m.topic).slice(0, 5);

  const correctCount = attempts.filter((a) => a.is_correct).length;
  const overallAccuracy = attempts.length > 0 ? Math.round((correctCount / attempts.length) * 100) : 70;

  const recentActivity = [
    `${attempts.length} practice questions answered`,
    `${revStats.dueToday} revision items scheduled`,
    `${mocks.length} mock attempts completed`,
  ];

  return {
    profile: {
      exam: profile?.target_exam || exam,
      year: profile?.target_exam_year || '2027',
      daily_minutes: profile?.daily_study_minutes || 180,
      target_goal: profile?.target_goal,
    },
    performance: {
      overall_accuracy: overallAccuracy,
      questions_attempted: attempts.length,
      mocks_completed: mocks.length,
    },
    weak_topics: weakTopics.length > 0 ? weakTopics : ['Subnetting', 'Process Synchronization'],
    strong_topics: strongTopics.length > 0 ? strongTopics : ['DBMS Normalization'],
    revision_due: revisionDue.length > 0 ? revisionDue : ['TCP Congestion Control'],
    recent_mistakes: recentMistakes.length > 0 ? recentMistakes : ['TCP Congestion Control'],
    recent_activity: recentActivity,
  };
}

export function formatContextPrompt(context: StudentIntelligenceContext): string {
  return `STUDENT PERFORMANCE CONTEXT:
- Exam: ${context.profile.exam} ${context.profile.year} (Target daily minutes: ${context.profile.daily_minutes} mins)
- Overall Practice Accuracy: ${context.performance.overall_accuracy}% (${context.performance.questions_attempted} total questions)
- Weakest Topics: ${context.weak_topics.join(', ') || 'None identified yet'}
- Due Revision Topics: ${context.revision_due.join(', ') || 'None due today'}
- Recent Missed Mistakes: ${context.recent_mistakes.join(', ') || 'None'}
- Recent Activity: ${context.recent_activity.join(' | ')}`;
}
