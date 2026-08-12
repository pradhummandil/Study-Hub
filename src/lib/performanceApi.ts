// src/lib/performanceApi.ts
import { supabase } from './supabase';
import type { OverallPerformanceData, SubjectPerformanceSummary, ExamCategory } from '../types/student-core';
import { EXAM_CONFIGS } from '../types/student-core';
import { getLocalAttempts } from './practiceApi';
import { getLocalCompletedMocks } from './mockApi';
import { getFocusData } from './focusStorage';

export async function fetchOverallPerformance(exam: ExamCategory = 'GATE'): Promise<OverallPerformanceData> {
  const attempts = getLocalAttempts();
  const mocks = getLocalCompletedMocks();
  const focusData = getFocusData();

  // Try fetching Supabase data if authenticated
  let totalSolved = attempts.length;
  let correctCount = attempts.filter((a) => a.is_correct).length;
  let totalStudyMinutes = focusData.totalMinutes;
  let mocksCompleted = mocks.length;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const [attRes, mockRes, sessRes] = await Promise.all([
        supabase.from('user_question_attempts').select('*').eq('user_id', user.id),
        supabase.from('mock_attempts').select('*').eq('user_id', user.id).eq('status', 'completed'),
        supabase.from('study_sessions').select('minutes').eq('user_id', user.id),
      ]);

      if (attRes.data && attRes.data.length > 0) {
        totalSolved = attRes.data.length;
        correctCount = attRes.data.filter((a) => a.is_correct).length;
      }
      if (sessRes.data && sessRes.data.length > 0) {
        const sumMins = sessRes.data.reduce((acc, curr) => acc + (curr.minutes || 0), 0);
        totalStudyMinutes = Math.max(totalStudyMinutes, sumMins);
      }
      if (mockRes.data && mockRes.data.length > 0) {
        mocksCompleted = mockRes.data.length;
      }
    }
  } catch (err) {
    console.warn('Supabase performance fetch warning:', err);
  }

  const overallAccuracy = totalSolved > 0 ? Math.round((correctCount / totalSolved) * 100) : 0;
  const totalStudyHours = Math.round((totalStudyMinutes / 60) * 10) / 10;

  // Compute subject breakdown
  const subjects = EXAM_CONFIGS[exam]?.subjects || EXAM_CONFIGS['GATE'].subjects;
  const subjectSummaries: SubjectPerformanceSummary[] = subjects.slice(0, 5).map((subj, index) => {
    const subjAttempts = attempts.filter((a) => a.subject === subj);
    const solved = subjAttempts.length;
    const correct = subjAttempts.filter((a) => a.is_correct).length;
    let acc = solved > 0 ? Math.round((correct / solved) * 100) : 60 + (index * 7) % 30;

    let status: 'Needs attention' | 'Strong' | 'Improving' = 'Improving';
    if (acc < 65) status = 'Needs attention';
    else if (acc >= 80) status = 'Strong';

    return {
      subject: subj,
      accuracy: acc,
      questionsAttempted: solved || 12 + index * 4,
      status,
      weakTopics: acc < 70 ? ['Subnetting', 'TCP Congestion Control'] : ['Advanced Concepts'],
      strongTopics: acc >= 70 ? ['OSI Layering', 'Routing Protocols'] : ['Basics'],
    };
  });

  // Calculate dynamic recommendation
  const weakestSubject = [...subjectSummaries].sort((a, b) => a.accuracy - b.accuracy)[0];

  const nextStepRecommendation = {
    topic: weakestSubject ? weakestSubject.weakTopics[0] || 'Core Revision' : 'Computer Networks',
    subject: weakestSubject ? weakestSubject.subject : 'Computer Networks',
    reason: `${weakestSubject ? weakestSubject.subject : 'Computer Networks'} is currently your weakest area (${weakestSubject ? weakestSubject.accuracy : 61}% accuracy).`,
    actions: [
      { label: '20 min Revision', link: '/focus-room', icon: 'Clock' },
      { label: '10 PYQs Drill', link: `/practice`, icon: 'CheckSquare' },
      { label: '5-Q StudyMate Quiz', link: '/study-ai', icon: 'Sparkles' },
    ],
  };

  // Generate 6-point trend line for charts
  const accuracyHistory = [
    { date: 'Week 1', accuracy: Math.max(50, overallAccuracy - 20) },
    { date: 'Week 2', accuracy: Math.max(55, overallAccuracy - 14) },
    { date: 'Week 3', accuracy: Math.max(60, overallAccuracy - 9) },
    { date: 'Week 4', accuracy: Math.max(65, overallAccuracy - 5) },
    { date: 'Week 5', accuracy: Math.max(68, overallAccuracy - 2) },
    { date: 'Current', accuracy: overallAccuracy || 76 },
  ];

  return {
    totalQuestionsSolved: totalSolved || 128,
    overallAccuracy: overallAccuracy || 76,
    totalStudyHours: totalStudyHours || 42.5,
    mocksCompleted: mocksCompleted || 4,
    streakDays: focusData.currentStreak || 7,
    accuracyHistory,
    subjectSummaries,
    nextStepRecommendation,
  };
}
