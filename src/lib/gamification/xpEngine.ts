// src/lib/gamification/xpEngine.ts
import { supabase } from '../supabase';
import type { StudentGamification } from '../../types/ecosystem';

export const XP_REWARDS = {
  FOCUS_SESSION: 20,
  PRACTICE_10_QUESTIONS: 10,
  MOCK_COMPLETED: 40,
  REVISION_COMPLETED: 15,
  FLASHCARD_COMPLETED: 10,
  ROADMAP_TOPIC_COMPLETED: 25,
  HELPFUL_ANSWER: 15,
  DAILY_GOAL_COMPLETED: 20,
  WEEKLY_CHALLENGE_COMPLETED: 50,
} as const;

export type XPEventType = keyof typeof XP_REWARDS;

export function getLevelTitle(level: number): string {
  if (level <= 2) return 'Getting Started';
  if (level <= 5) return 'Study Explorer';
  if (level <= 9) return 'Consistent Learner';
  if (level <= 14) return 'Focused Scholar';
  if (level <= 19) return 'Deep Learner';
  if (level <= 24) return 'Exam Strategist';
  return 'Mastery Builder';
}

export function getRequiredXPForLevel(level: number): number {
  return level * 250; // Level 1 -> 250 XP, Level 2 -> 500 XP, Level 8 -> 2000 XP
}

export function calculateLevelFromXP(totalXP: number): { level: number; currentLevelXP: number; requiredXP: number; levelTitle: string } {
  let level = 1;
  let remainingXP = totalXP;
  let requiredForNext = getRequiredXPForLevel(level);

  while (remainingXP >= requiredForNext) {
    remainingXP -= requiredForNext;
    level += 1;
    requiredForNext = getRequiredXPForLevel(level);
  }

  return {
    level,
    currentLevelXP: remainingXP,
    requiredXP: requiredForNext,
    levelTitle: getLevelTitle(level),
  };
}

export async function awardXP(
  userId: string,
  eventType: XPEventType,
  amountOverride?: number
): Promise<{ addedXP: number; newTotalXP: number; levelUp: boolean; newLevel: number; newTitle: string }> {
  const xpToAdd = amountOverride ?? XP_REWARDS[eventType] ?? 10;

  let currentGamification: StudentGamification = {
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
      currentGamification = data as StudentGamification;
    }
  } catch (err) {
    console.warn('Failed to read gamification profile:', err);
  }

  const oldLevel = currentGamification.level;
  const newTotalXP = (currentGamification.xp || 0) + xpToAdd;
  const levelInfo = calculateLevelFromXP(newTotalXP);

  const levelUp = levelInfo.level > oldLevel;

  currentGamification.xp = newTotalXP;
  currentGamification.level = levelInfo.level;
  currentGamification.level_title = levelInfo.levelTitle;

  try {
    await supabase.from('student_gamification').upsert(currentGamification);
  } catch (err) {
    console.warn('Failed to upsert updated XP & level:', err);
  }

  return {
    addedXP: xpToAdd,
    newTotalXP,
    levelUp,
    newLevel: levelInfo.level,
    newTitle: levelInfo.levelTitle,
  };
}
