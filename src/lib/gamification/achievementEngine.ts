// src/lib/gamification/achievementEngine.ts
import { supabase } from '../supabase';
import type { Achievement, UserAchievement } from '../../types/ecosystem';
import { awardXP } from './xpEngine';

export async function fetchAllAchievements(): Promise<Achievement[]> {
  try {
    const { data, error } = await supabase.from('achievements').select('*');
    if (error || !data) return [];
    return data as Achievement[];
  } catch (err) {
    console.warn('Failed to fetch master achievements:', err);
    return [];
  }
}

export async function fetchUserAchievements(userId: string): Promise<UserAchievement[]> {
  try {
    const { data, error } = await supabase
      .from('user_achievements')
      .select('*, achievement:achievements(*)')
      .eq('user_id', userId);

    if (error || !data) return [];
    return data as UserAchievement[];
  } catch (err) {
    console.warn('Failed to fetch user achievements:', err);
    return [];
  }
}

export async function evaluateAchievements(
  userId: string,
  metrics: {
    streak?: number;
    questionsSolved?: number;
    mockCompletedCount?: number;
    masteredConceptsCount?: number;
    overallAccuracy?: number;
    revisionsCompleted?: number;
    focusSessionsCompleted?: number;
  }
): Promise<Achievement[]> {
  const masterAchievements = await fetchAllAchievements();
  const existingUserAchievements = await fetchUserAchievements(userId);
  const unlockedIds = new Set(existingUserAchievements.map((ua) => ua.achievement_id));

  const newlyUnlocked: Achievement[] = [];

  for (const ach of masterAchievements) {
    if (unlockedIds.has(ach.id)) continue;

    let isEligible = false;

    switch (ach.requirement_type) {
      case 'streak':
        if ((metrics.streak || 0) >= ach.requirement_value) isEligible = true;
        break;
      case 'questions':
        if ((metrics.questionsSolved || 0) >= ach.requirement_value) isEligible = true;
        break;
      case 'first_mock':
      case 'mock':
        if ((metrics.mockCompletedCount || 0) >= ach.requirement_value) isEligible = true;
        break;
      case 'mastery':
        if ((metrics.masteredConceptsCount || 0) >= ach.requirement_value) isEligible = true;
        break;
      case 'accuracy':
        if ((metrics.overallAccuracy || 0) >= ach.requirement_value) isEligible = true;
        break;
      case 'revisions':
        if ((metrics.revisionsCompleted || 0) >= ach.requirement_value) isEligible = true;
        break;
      case 'focus_sessions':
        if ((metrics.focusSessionsCompleted || 0) >= ach.requirement_value) isEligible = true;
        break;
    }

    if (isEligible) {
      // Idempotent unlock insert
      try {
        const { error } = await supabase.from('user_achievements').insert({
          user_id: userId,
          achievement_id: ach.id,
        });

        if (!error) {
          newlyUnlocked.push(ach);
          // Award achievement XP
          await awardXP(userId, 'DAILY_GOAL_COMPLETED', ach.xp_reward);
          // Trigger in-app notification
          await supabase.from('notifications').insert({
            user_id: userId,
            type: 'achievement',
            title: `✨ Achievement Unlocked: ${ach.title}`,
            body: `${ach.description} (+${ach.xp_reward} XP)`,
            action_url: '/profile',
          });
        }
      } catch (err) {
        console.warn('Failed to insert user achievement:', err);
      }
    }
  }

  return newlyUnlocked;
}
