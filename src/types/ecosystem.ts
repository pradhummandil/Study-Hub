// src/types/ecosystem.ts

export type RequirementType =
  | 'streak'
  | 'questions'
  | 'mock'
  | 'mastery'
  | 'accuracy'
  | 'revisions'
  | 'focus_sessions'
  | 'first_mock';

export interface Achievement {
  id: string;
  code: string;
  title: string;
  description: string;
  icon: string;
  xp_reward: number;
  requirement_type: RequirementType;
  requirement_value: number;
  unlocked_at?: string | null;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  achievement?: Achievement;
}

export interface StudentGamification {
  user_id: string;
  xp: number;
  level: number;
  level_title: string;
  current_streak: number;
  longest_streak: number;
  last_active_date?: string | null;
  streak_freezes_available: number;
  last_freeze_used_date?: string | null;
  helpful_contributions: number;
  accountability_mode: 'Self' | 'Friend' | 'Study Circle';
  privacy_level: 'Public' | 'Circle' | 'Private';
}

export interface StudentDailyActivity {
  id?: string;
  user_id: string;
  activity_date: string; // YYYY-MM-DD
  study_minutes: number;
  questions_attempted: number;
  questions_correct: number;
  revision_completed: number;
  flashcards_reviewed: number;
  focus_sessions: number;
  mock_tests_completed: number;
  meaningful_activity: boolean;
}

export interface DailyGoal {
  id?: string;
  user_id: string;
  goal_date: string;
  target_study_minutes: number;
  target_questions: number;
  target_revisions: number;
  status: 'suggested' | 'accepted' | 'completed';
}

export interface WeeklyChallenge {
  id: string;
  week_code: string;
  title: string;
  description: string;
  target_type: 'questions' | 'focus_sessions' | 'revisions';
  target_value: number;
  xp_reward: number;
  current_progress?: number;
  completed?: boolean;
}

export type NotificationType =
  | 'study_reminder'
  | 'revision_due'
  | 'mock_reminder'
  | 'achievement'
  | 'community'
  | 'circle'
  | 'system';

export interface AppNotification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  action_url?: string;
  read: boolean;
  created_at: string;
}

export interface NotificationPreferences {
  user_id: string;
  study_reminders: boolean;
  revision_reminders: boolean;
  mock_reminders: boolean;
  community: boolean;
  achievements: boolean;
}

export interface StudyCircle {
  id: string;
  name: string;
  slug: string;
  description: string;
  exam: string;
  subject?: string | null;
  cover_image?: string | null;
  member_count: number;
  is_member?: boolean;
  created_at?: string;
}

export type PostType = 'question' | 'discussion' | 'tip' | 'resource' | 'achievement';

export interface CommunityPost {
  id: string;
  user_id: string;
  circle_id?: string | null;
  type: PostType;
  title: string;
  content: string;
  exam?: string | null;
  is_answered: boolean;
  resource_id?: string | null;
  helpful_count: number;
  like_count: number;
  comment_count: number;
  created_at: string;
  author_name?: string;
  author_avatar?: string;
  circle_name?: string;
  user_has_liked?: boolean;
  user_has_helped?: boolean;
}

export interface CommunityComment {
  id: string;
  post_id: string;
  user_id: string;
  parent_comment_id?: string | null;
  content: string;
  is_helpful: boolean;
  is_ai_response: boolean;
  created_at: string;
  author_name?: string;
  author_avatar?: string;
}

export interface CommunityReport {
  id?: string;
  reporter_id: string;
  target_type: 'post' | 'comment' | 'user' | 'room';
  target_id: string;
  reason: 'Spam' | 'Harassment' | 'Inappropriate' | 'Misleading academic information' | 'Copyright concern' | 'Other';
  details?: string;
  status?: 'pending' | 'reviewed' | 'dismissed' | 'actioned';
}

export interface StudyRoom {
  id: string;
  host_id: string;
  title: string;
  goal: string;
  exam: string;
  subject?: string | null;
  duration_minutes: number;
  privacy: 'public' | 'circle' | 'private';
  max_participants: number;
  status: 'active' | 'ended';
  started_at: string;
  ends_at: string;
  participant_count?: number;
  host_name?: string;
  host_avatar?: string;
}

export interface StudyPartner {
  id: string;
  partner_user_id: string;
  partner_name: string;
  partner_avatar?: string;
  partner_streak: number;
  partner_exam: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'system' | 'exam' | 'resource' | 'maintenance';
  created_at: string;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  name: string;
  avatar_url?: string;
  exam: string;
  level: number;
  level_title: string;
  metric_value: number; // e.g. Questions Solved or Score Improvement
  helpful_count: number;
}
