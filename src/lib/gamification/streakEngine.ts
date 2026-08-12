// src/lib/gamification/streakEngine.ts
import { supabase } from '../supabase';
import type { StudentDailyActivity, StudentGamification } from '../../types/ecosystem';

export const QUALIFYING_THRESHOLDS = {
  MIN_STUDY_MINUTES: 20,
  MIN_PRACTICE_QUESTIONS: 10,
  MIN_MOCK_TESTS: 1,
  MIN_REVISIONS: 1,
};

export function isMeaningfulActivity(act: Partial<StudentDailyActivity>): boolean {
  if (!act) return false;
  return (
    (act.study_minutes || 0) >= QUALIFYING_THRESHOLDS.MIN_STUDY_MINUTES ||
    (act.questions_attempted || 0) >= QUALIFYING_THRESHOLDS.MIN_PRACTICE_QUESTIONS ||
    (act.mock_tests_completed || 0) >= QUALIFYING_THRESHOLDS.MIN_MOCK_TESTS ||
    (act.revision_completed || 0) >= QUALIFYING_THRESHOLDS.MIN_REVISIONS
  );
}

export function getTodayDateStr(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

export function getYesterdayDateStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

export async function processStreakCalculation(
  userId: string,
  todayActivity: Partial<StudentDailyActivity>
): Promise<StudentGamification> {
  const todayStr = getTodayDateStr();
  const yesterdayStr = getYesterdayDateStr();

  // 1. Fetch current gamification profile
  let gamification: StudentGamification = {
    user_id: userId,
    xp: 0,
    level: 1,
    level_title: 'Getting Started',
    current_streak: 0,
    longest_streak: 0,
    streak_freezes_available: 1,
    helpful_contributions: 0,
    accountability_mode: 'Self',
    privacy_level: 'Circle',
  };

  try {
    const { data } = await supabase
      .from('student_gamification')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (data) {
      gamification = data as StudentGamification;
    }
  } catch (err) {
    console.warn('Failed to fetch student_gamification profile:', err);
  }

  // 2. Process today's qualifying state

  const isTodayQualifying = isMeaningfulActivity(todayActivity);
  const lastActiveDate = gamification.last_active_date;

  let newCurrentStreak = gamification.current_streak;

  if (isTodayQualifying) {
    if (lastActiveDate === todayStr) {
      // Already logged qualifying activity today
      newCurrentStreak = Math.max(1, gamification.current_streak);
    } else if (lastActiveDate === yesterdayStr) {
      // Continued streak from yesterday
      newCurrentStreak = gamification.current_streak + 1;
    } else {
      // Check if user has streak freeze available for yesterday's miss
      const d = new Date();
      d.setDate(d.getDate() - 2);
      const dayBeforeYesterday = d.toISOString().split('T')[0];

      if (
        lastActiveDate === dayBeforeYesterday &&
        gamification.streak_freezes_available > 0 &&
        gamification.last_freeze_used_date !== yesterdayStr
      ) {
        // Freeze protected yesterday!
        newCurrentStreak = gamification.current_streak + 1;
        gamification.streak_freezes_available -= 1;
        gamification.last_freeze_used_date = yesterdayStr;
      } else {
        // Streak reset
        newCurrentStreak = 1;
      }
    }
    gamification.last_active_date = todayStr;
  } else {
    // Today not yet qualifying
    if (lastActiveDate && lastActiveDate !== todayStr && lastActiveDate !== yesterdayStr) {
      // Missed at least one day
      newCurrentStreak = 0;
    }
  }

  gamification.current_streak = newCurrentStreak;
  gamification.longest_streak = Math.max(gamification.longest_streak, newCurrentStreak);

  // Update Supabase
  try {
    await supabase.from('student_gamification').upsert(gamification);
  } catch (err) {
    console.warn('Failed to upsert gamification streak update:', err);
  }

  return gamification;
}
