// src/lib/gamification/leaderboardApi.ts
import { supabase } from '../supabase';
import type { LeaderboardEntry } from '../../types/ecosystem';

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
      return [];
    }

    return data.map((g, index) => ({
      rank: index + 1,
      user_id: g.user_id,
      name: `Learner ${g.user_id.slice(0, 5)}`,
      exam: 'Academic',
      level: g.level || 1,
      level_title: g.level_title || 'Getting Started',
      metric_value: params.metric === 'helpful' ? g.helpful_contributions || 0 : Math.round((g.xp || 0) / 10),
      helpful_count: g.helpful_contributions || 0,
    }));
  } catch (err) {
    console.warn('Failed to fetch leaderboard data:', err);
    return [];
  }
}
