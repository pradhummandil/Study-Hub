// src/lib/intelligence/readiness.ts
import { supabase } from '../supabase';
import type { ExamReadinessSnapshot } from '../../types/intelligence';
import { fetchConceptMastery } from './mastery';
import { fetchRevisionItems, getRevisionStats } from './revision';
import { getLocalAttempts } from '../practiceApi';
import { getLocalCompletedMocks } from '../mockApi';

const READINESS_KEY = 'studyhub_exam_readiness';

export async function calculateExamReadiness(exam: string = 'GATE'): Promise<ExamReadinessSnapshot> {
  const masteryList = await fetchConceptMastery(exam);
  const revisions = await fetchRevisionItems(exam);
  const attempts = getLocalAttempts();
  const completedMocks = getLocalCompletedMocks();

  // 1. Syllabus Coverage % (proportion of topics attempted/mastered)
  const totalTopicsKnown = Math.max(1, masteryList.length);
  const coveredTopics = masteryList.filter((m) => m.questions_attempted > 0).length;
  const syllabusCoveragePct = Math.min(100, Math.round((coveredTopics / Math.max(10, totalTopicsKnown)) * 100));

  // 2. PYQ Accuracy %
  const pyqAttempts = attempts.filter((a) => a.exam === exam);
  const pyqCorrect = pyqAttempts.filter((a) => a.is_correct).length;
  const pyqAccuracyPct = pyqAttempts.length > 0 ? Math.round((pyqCorrect / pyqAttempts.length) * 100) : 60;

  // 3. Mock Performance %
  const examMocks = completedMocks.filter((m) => m.max_score > 0);
  const avgMockPct = examMocks.length > 0
    ? Math.round(examMocks.reduce((acc, m) => acc + (m.score / m.max_score) * 100, 0) / examMocks.length)
    : 55;

  // 4. Revision Health % (ratio of non-overdue items)
  const revStats = getRevisionStats(revisions);
  const totalRev = revisions.length || 1;
  const nonOverdue = Math.max(0, totalRev - revStats.overdue);
  const revisionHealthPct = Math.min(100, Math.round((nonOverdue / totalRev) * 100));

  // 5. Consistency % (activity volume & streak)
  const consistencyPct = Math.min(100, Math.max(30, Math.round((attempts.length / 50) * 100)));

  // Weighted overall readiness indicator
  const overallReadiness = Math.round(
    syllabusCoveragePct * 0.25 +
    pyqAccuracyPct * 0.25 +
    avgMockPct * 0.25 +
    revisionHealthPct * 0.15 +
    consistencyPct * 0.10
  );

  // Determine strongest area & biggest opportunity
  const dimensions = [
    { name: 'Syllabus Coverage', score: syllabusCoveragePct },
    { name: 'PYQ Accuracy', score: pyqAccuracyPct },
    { name: 'Mock Performance', score: avgMockPct },
    { name: 'Revision Health', score: revisionHealthPct },
    { name: 'Consistency', score: consistencyPct },
  ];

  dimensions.sort((a, b) => b.score - a.score);
  const strongestArea = dimensions[0].name;
  const biggestOpportunity = dimensions[dimensions.length - 1].name;

  let recommendedNextStep = 'Complete 10 PYQ practice questions to increase accuracy.';
  if (biggestOpportunity === 'Mock Performance') {
    recommendedNextStep = 'Take a 30-minute sectional mock test to build exam endurance.';
  } else if (biggestOpportunity === 'Revision Health') {
    recommendedNextStep = 'Complete your overdue spaced revision items today.';
  } else if (biggestOpportunity === 'Syllabus Coverage') {
    recommendedNextStep = 'Explore un-attempted topics in your Exam Roadmap.';
  }

  const snapshot: ExamReadinessSnapshot = {
    id: `readiness-${Date.now()}`,
    user_id: 'local',
    exam,
    overall_readiness: overallReadiness,
    syllabus_coverage_pct: syllabusCoveragePct,
    pyq_accuracy_pct: pyqAccuracyPct,
    mock_performance_pct: avgMockPct,
    revision_health_pct: revisionHealthPct,
    consistency_pct: consistencyPct,
    strongest_area: strongestArea,
    biggest_opportunity: biggestOpportunity,
    recommended_next_step: recommendedNextStep,
    created_at: new Date().toISOString(),
  };

  saveLocalReadiness(snapshot);

  // Sync to Supabase
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      snapshot.user_id = user.id;
      await supabase.from('exam_readiness_snapshots').insert(snapshot);
    }
  } catch (err) {
    console.warn('Failed to save readiness snapshot:', err);
  }

  return snapshot;
}

function saveLocalReadiness(snapshot: ExamReadinessSnapshot) {
  try {
    localStorage.setItem(READINESS_KEY, JSON.stringify(snapshot));
  } catch (err) {
    console.warn('Local readiness save warning:', err);
  }
}
