// src/lib/gamification/leaderboardApi.ts
import { supabase } from '../supabase';
import type { LeaderboardEntry } from '../../types/ecosystem';

const FALLBACK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, user_id: 'u1', name: 'Aarav Sharma', exam: 'GATE', level: 12, level_title: 'Focused Scholar', metric_value: 182, helpful_count: 27 },
  { rank: 2, user_id: 'u2', name: 'Priya Patel', exam: 'GATE', level: 10, level_title: 'Focused Scholar', metric_value: 165, helpful_count: 19 },
  { rank: 3, user_id: 'u3', name: 'Rohan Gupta', exam: 'GATE', level: 9, level_title: 'Consistent Learner', metric_value: 152, helpful_count: 14 },
  { rank: 4, user_id: 'u4', name: 'Ananya Verma', exam: 'GATE', level: 8, level_title: 'Consistent Learner', metric_value: 140, helpful_count: 11 },
  { rank: 5, user_id: 'u5', name: 'Vikram Rao', exam: 'GATE', level: 7, level_title: 'Consistent Learner', metric_value: 128, helpful_count: 8 },
];

export async function fetchEducationalLeaderboard(params: {
  metric: 'questions' | 'mock_improvement' | 'helpful';
  scope: 'global' | 'circle';
  circleId?: string;
}): Promise<LeaderboardEntry[]> {
  try {
    const { data, error } = await supabase
      .from('student_gamification')
      .select('*')
      .neq('privacy_level', 'Private')
      .order('xp', { ascending: false })
      .limit(20);

    if (error || !data || data.length === 0) {
      return FALLBACK_LEADERBOARD;
    }

    return data.map((g, index) => ({
      rank: index + 1,
      user_id: g.user_id,
      name: `Student #${g.user_id.slice(0, 4)}`,
      exam: 'GATE',
      level: g.level || 1,
      level_title: g.level_title || 'Getting Started',
      metric_value: params.metric === 'helpful' ? g.helpful_contributions || 0 : Math.round((g.xp || 0) / 10),
      helpful_count: g.helpful_contributions || 0,
    }));
  } catch (err) {
    console.warn('Failed to fetch leaderboard data:', err);
    return FALLBACK_LEADERBOARD;
  }
}
