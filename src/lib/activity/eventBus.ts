// src/lib/activity/eventBus.ts
import { supabase } from '../supabase';
import { processStreakCalculation, getTodayDateStr } from '../gamification/streakEngine';
import { awardXP, type XPEventType } from '../gamification/xpEngine';
import { evaluateAchievements } from '../gamification/achievementEngine';
import type { StudentDailyActivity, StudentGamification, Achievement } from '../../types/ecosystem';

export interface StudyActivityEvent {
  userId: string;
  type:
    | 'focus_session_completed'
    | 'practice_questions_attempted'
    | 'mock_test_completed'
    | 'revision_completed'
    | 'flashcards_reviewed'
    | 'roadmap_topic_completed'
    | 'helpful_community_answer'
    | 'daily_goal_completed'
    | 'weekly_challenge_completed';
  metadata: {
    minutes?: number;
    questionsCount?: number;
    correctCount?: number;
    mockScore?: number;
    maxScore?: number;
    subject?: string;
    topic?: string;
  };
}

export interface ActivityResult {
  dailyActivity: StudentDailyActivity;
  gamification: StudentGamification;
  xpAwarded: number;
  newlyUnlockedAchievements: Achievement[];
}

export async function recordStudyActivity(event: StudyActivityEvent): Promise<ActivityResult> {
  const { userId, type, metadata } = event;
  const todayStr = getTodayDateStr();

  // 1. Fetch current daily activity record for today
  let currentActivity: StudentDailyActivity = {
    user_id: userId,
    activity_date: todayStr,
    study_minutes: 0,
    questions_attempted: 0,
    questions_correct: 0,
    revision_completed: 0,
    flashcards_reviewed: 0,
    focus_sessions: 0,
    mock_tests_completed: 0,
    meaningful_activity: false,
  };

  try {
    const { data } = await supabase
      .from('student_daily_activity')
      .select('*')
      .eq('user_id', userId)
      .eq('activity_date', todayStr)
      .maybeSingle();

    if (data) {
      currentActivity = data as StudentDailyActivity;
    }
  } catch (err) {
    console.warn('Failed to read today student_daily_activity:', err);
  }

  // 2. Increment activity numbers based on event type
  let xpEventType: XPEventType = 'FOCUS_SESSION';

  switch (type) {
    case 'focus_session_completed':
      currentActivity.focus_sessions += 1;
      currentActivity.study_minutes += metadata.minutes || 25;
      xpEventType = 'FOCUS_SESSION';
      break;

    case 'practice_questions_attempted':
      currentActivity.questions_attempted += metadata.questionsCount || 1;
      currentActivity.questions_correct += metadata.correctCount || 0;
      xpEventType = 'PRACTICE_10_QUESTIONS';
      break;

    case 'mock_test_completed':
      currentActivity.mock_tests_completed += 1;
      currentActivity.study_minutes += metadata.minutes || 60;
      xpEventType = 'MOCK_COMPLETED';
      break;

    case 'revision_completed':
      currentActivity.revision_completed += metadata.questionsCount || 1;
      xpEventType = 'REVISION_COMPLETED';
      break;

    case 'flashcards_reviewed':
      currentActivity.flashcards_reviewed += metadata.questionsCount || 1;
      xpEventType = 'FLASHCARD_COMPLETED';
      break;

    case 'roadmap_topic_completed':
      currentActivity.study_minutes += metadata.minutes || 30;
      xpEventType = 'ROADMAP_TOPIC_COMPLETED';
      break;

    case 'helpful_community_answer':
      xpEventType = 'HELPFUL_ANSWER';
      break;

    case 'daily_goal_completed':
      xpEventType = 'DAILY_GOAL_COMPLETED';
      break;

    case 'weekly_challenge_completed':
      xpEventType = 'WEEKLY_CHALLENGE_COMPLETED';
      break;
  }

  // 3. Upsert daily activity
  try {
    await supabase.from('student_daily_activity').upsert(currentActivity);
  } catch (err) {
    console.warn('Failed to upsert student_daily_activity:', err);
  }

  // 4. Process Streak Calculation
  const gamification = await processStreakCalculation(userId, currentActivity);

  // 5. Award XP
  const xpResult = await awardXP(userId, xpEventType);

  // 6. Evaluate Achievements
  const newlyUnlockedAchievements = await evaluateAchievements(userId, {
    streak: gamification.current_streak,
    questionsSolved: currentActivity.questions_attempted,
    mockCompletedCount: currentActivity.mock_tests_completed,
    revisionsCompleted: currentActivity.revision_completed,
    focusSessionsCompleted: currentActivity.focus_sessions,
  });

  return {
    dailyActivity: currentActivity,
    gamification,
    xpAwarded: xpResult.addedXP,
    newlyUnlockedAchievements,
  };
}
