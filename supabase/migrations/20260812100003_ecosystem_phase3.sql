-- Migration: 20260812_ecosystem_phase3.sql
-- Description: Phase 3 Retention, Community & Student Ecosystem tables, indexes, RLS policies, and seed data

-- 1. Table: student_daily_activity (Canonical daily activity log)
create table if not exists student_daily_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  activity_date date default current_date not null,
  study_minutes integer default 0,
  questions_attempted integer default 0,
  questions_correct integer default 0,
  revision_completed integer default 0,
  flashcards_reviewed integer default 0,
  focus_sessions integer default 0,
  mock_tests_completed integer default 0,
  meaningful_activity boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, activity_date)
);

create index if not exists idx_student_daily_activity_user_date
  on student_daily_activity(user_id, activity_date desc);

alter table student_daily_activity enable row level security;

drop policy if exists "Users manage their daily activity" on student_daily_activity;
create policy "Users manage their daily activity"
  on student_daily_activity for all using (auth.uid() = user_id);

-- 2. Table: student_gamification (XP, Levels, Streak metadata)
create table if not exists student_gamification (
  user_id uuid primary key references auth.users(id) on delete cascade,
  xp integer default 0,
  level integer default 1,
  level_title text default 'Getting Started',
  current_streak integer default 0,
  longest_streak integer default 0,
  last_active_date date,
  streak_freezes_available integer default 1,
  last_freeze_used_date date,
  helpful_contributions integer default 0,
  accountability_mode text default 'Self', -- 'Self', 'Friend', 'Study Circle'
  privacy_level text default 'Circle', -- 'Public', 'Circle', 'Private'
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table student_gamification enable row level security;

drop policy if exists "Users view their own gamification" on student_gamification;
create policy "Users view their own gamification"
  on student_gamification for select using (true); -- Public/Circle profile views allowed

drop policy if exists "Users update their own gamification" on student_gamification;
create policy "Users update their own gamification"
  on student_gamification for all using (auth.uid() = user_id);

-- 3. Tables: achievements & user_achievements
create table if not exists achievements (
  id text primary key,
  code text unique not null,
  title text not null,
  description text not null,
  icon text default 'Award',
  xp_reward integer default 25,
  requirement_type text not null, -- 'streak', 'questions', 'mock', 'mastery', 'accuracy', 'revisions', 'focus_sessions', 'first_mock'
  requirement_value integer default 1,
  created_at timestamptz default now()
);

alter table achievements enable row level security;

drop policy if exists "Public read achievements" on achievements;
create policy "Public read achievements" on achievements for select using (true);

create table if not exists user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  achievement_id text references achievements(id) on delete cascade not null,
  unlocked_at timestamptz default now(),
  unique(user_id, achievement_id)
);

create index if not exists idx_user_achievements_user
  on user_achievements(user_id, unlocked_at desc);

alter table user_achievements enable row level security;

drop policy if exists "Public read user achievements" on user_achievements;
create policy "Public read user achievements" on user_achievements for select using (true);

drop policy if exists "Users insert user achievements" on user_achievements;
create policy "Users insert user achievements"
  on user_achievements for insert with check (auth.uid() = user_id);

-- Seed Achievements Master List
insert into achievements (id, code, title, description, icon, xp_reward, requirement_type, requirement_value)
values
  ('ach_streak_7', 'STREAK_7', 'First 7-Day Streak', 'Maintained a 7-day meaningful study streak', 'Flame', 50, 'streak', 7),
  ('ach_streak_30', 'STREAK_30', 'Consistent Scholar', 'Maintained a 30-day study streak', 'Zap', 150, 'streak', 30),
  ('ach_questions_100', 'SOLVED_100', '100 Questions Solved', 'Solved 100 practice questions across any subjects', 'BookOpen', 40, 'questions', 100),
  ('ach_questions_500', 'SOLVED_500', 'Question Crusher', 'Solved 500 practice questions', 'Target', 100, 'questions', 500),
  ('ach_first_mock', 'FIRST_MOCK', 'First Mock Completed', 'Completed your first full or subject mock test', 'Award', 40, 'first_mock', 1),
  ('ach_concepts_10', 'CONCEPTS_10', '10 Concepts Mastered', 'Achieved 80%+ mastery score in 10 different topics', 'Brain', 50, 'mastery', 10),
  ('ach_accuracy_90', 'ACCURACY_90', 'Precision Solver', 'Achieved 90%+ overall quiz accuracy on at least 20 questions', 'CheckCircle2', 50, 'accuracy', 90),
  ('ach_revisions_50', 'REVISIONS_50', 'Spaced Repetition Master', 'Completed 50 spaced revision sessions', 'RotateCcw', 60, 'revisions', 50),
  ('ach_focus_10', 'FOCUS_10', 'Deep Work Practitioner', 'Completed 10 Focus Room sessions', 'Clock', 40, 'focus_sessions', 10),
  ('ach_full_mock', 'FULL_MOCK', 'Full Syllabus Warrior', 'Completed a full-syllabus exam mock test', 'Trophy', 80, 'first_mock', 1)
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  xp_reward = excluded.xp_reward;

-- 4. Table: student_daily_goals
create table if not exists student_daily_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  goal_date date default current_date not null,
  target_study_minutes integer default 150,
  target_questions integer default 20,
  target_revisions integer default 1,
  status text default 'suggested', -- 'suggested', 'accepted', 'completed'
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, goal_date)
);

alter table student_daily_goals enable row level security;

drop policy if exists "Users manage daily goals" on student_daily_goals;
create policy "Users manage daily goals"
  on student_daily_goals for all using (auth.uid() = user_id);

-- 5. Tables: weekly_challenges & user_weekly_challenges
create table if not exists weekly_challenges (
  id uuid primary key default gen_random_uuid(),
  week_code text not null, -- e.g. '2026-W33'
  title text not null,
  description text not null,
  target_type text not null, -- 'questions', 'focus_sessions', 'revisions'
  target_value integer not null,
  xp_reward integer default 100,
  created_at timestamptz default now()
);

alter table weekly_challenges enable row level security;

drop policy if exists "Public read weekly challenges" on weekly_challenges;
create policy "Public read weekly challenges" on weekly_challenges for select using (true);

create table if not exists user_weekly_challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  challenge_id uuid references weekly_challenges(id) on delete cascade not null,
  current_progress integer default 0,
  completed boolean default false,
  completed_at timestamptz,
  unique(user_id, challenge_id)
);

alter table user_weekly_challenges enable row level security;

drop policy if exists "Users manage user weekly challenges" on user_weekly_challenges;
create policy "Users manage user weekly challenges"
  on user_weekly_challenges for all using (auth.uid() = user_id);

-- Seed Default Weekly Challenges
insert into weekly_challenges (week_code, title, description, target_type, target_value, xp_reward)
values
  ('2026-W33', 'Complete 100 Practice Questions', 'Solve 100 PYQs or custom practice questions this week', 'questions', 100, 100),
  ('2026-W33', 'Complete 4 Focus Sessions', 'Log at least 4 deep focus sessions of 25+ minutes', 'focus_sessions', 4, 80),
  ('2026-W33', 'Finish 10 Revisions', 'Complete 10 scheduled spaced-repetition cards', 'revisions', 10, 80)
on conflict do nothing;

-- 6. Tables: notifications & notification_preferences
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null, -- 'study_reminder', 'revision_due', 'mock_reminder', 'achievement', 'community', 'circle', 'system'
  title text not null,
  body text not null,
  action_url text,
  read boolean default false,
  created_at timestamptz default now()
);

create index if not exists idx_notifications_user
  on notifications(user_id, read, created_at desc);

alter table notifications enable row level security;

drop policy if exists "Users manage notifications" on notifications;
create policy "Users manage notifications"
  on notifications for all using (auth.uid() = user_id);

create table if not exists notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  study_reminders boolean default true,
  revision_reminders boolean default true,
  mock_reminders boolean default true,
  community boolean default true,
  achievements boolean default true,
  updated_at timestamptz default now()
);

alter table notification_preferences enable row level security;

drop policy if exists "Users manage notification preferences" on notification_preferences;
create policy "Users manage notification preferences"
  on notification_preferences for all using (auth.uid() = user_id);

-- 7. Tables: study_circles & study_circle_members
create table if not exists study_circles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  exam text not null,
  subject text,
  cover_image text,
  member_count integer default 1,
  created_by uuid references auth.users(id) on delete set null,
  is_public boolean default true,
  created_at timestamptz default now()
);

alter table study_circles enable row level security;

drop policy if exists "Public read study circles" on study_circles;
create policy "Public read study circles" on study_circles for select using (true);

drop policy if exists "Authenticated insert study circles" on study_circles;
create policy "Authenticated insert study circles" on study_circles for insert with check (auth.role() = 'authenticated');

create table if not exists study_circle_members (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid references study_circles(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text default 'member', -- 'admin', 'moderator', 'member'
  joined_at timestamptz default now(),
  unique(circle_id, user_id)
);

alter table study_circle_members enable row level security;

drop policy if exists "Public read circle members" on study_circle_members;
create policy "Public read circle members" on study_circle_members for select using (true);

drop policy if exists "Users manage circle memberships" on study_circle_members;
create policy "Users manage circle memberships" on study_circle_members for all using (auth.uid() = user_id);

-- Seed Core Study Circles
insert into study_circles (name, slug, description, exam, member_count)
values
  ('GATE CS 2027', 'gate-cs-2027', 'Dedicated group for GATE Computer Science 2027 aspirants. PYQs, doubt solving, and revision strategies.', 'GATE', 1284),
  ('JEE Advanced 2027', 'jee-advanced-2027', 'High-level problem solving, physics drills, and mock strategies for IIT aspirants.', 'JEE Advanced', 950),
  ('NEET 2027 Biology & NCERT', 'neet-2027-biology', 'NCERT line-by-line breakdown, diagram revision, and biology speed drills.', 'NEET', 1420),
  ('DSA & Problem Solving', 'dsa-problem-solving', 'Data structures, algorithms, time complexity, and competitive coding practice.', 'GATE', 840),
  ('Computer Networks Hub', 'computer-networks', 'Deep dive into TCP/IP, subnetting, sliding window protocols, and GATE PYQs.', 'GATE', 630),
  ('Competitive Programming', 'competitive-programming', 'Codeforces, LeetCode, and algorithmic problem-solving study room.', 'Other', 510)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description;

-- 8. Tables: community_posts, community_comments, community_reactions
create table if not exists community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  circle_id uuid references study_circles(id) on delete cascade,
  type text not null default 'discussion', -- 'question', 'discussion', 'tip', 'resource', 'achievement'
  title text not null,
  content text not null,
  exam text,
  is_answered boolean default false,
  resource_id text,
  helpful_count integer default 0,
  like_count integer default 0,
  comment_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_community_posts_circle
  on community_posts(circle_id, created_at desc);

create index if not exists idx_community_posts_type
  on community_posts(type, is_answered);

alter table community_posts enable row level security;

drop policy if exists "Public read community posts" on community_posts;
create policy "Public read community posts" on community_posts for select using (true);

drop policy if exists "Users manage their own community posts" on community_posts;
create policy "Users manage their own community posts" on community_posts for all using (auth.uid() = user_id);

create table if not exists community_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references community_posts(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  parent_comment_id uuid references community_comments(id) on delete cascade,
  content text not null,
  is_helpful boolean default false,
  is_ai_response boolean default false,
  created_at timestamptz default now()
);

create index if not exists idx_community_comments_post
  on community_comments(post_id, created_at asc);

alter table community_comments enable row level security;

drop policy if exists "Public read community comments" on community_comments;
create policy "Public read community comments" on community_comments for select using (true);

drop policy if exists "Users manage their own comments" on community_comments;
create policy "Users manage their own comments" on community_comments for all using (auth.uid() = user_id);

create table if not exists community_reactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  post_id uuid references community_posts(id) on delete cascade,
  comment_id uuid references community_comments(id) on delete cascade,
  reaction_type text not null, -- 'helpful', 'like'
  created_at timestamptz default now()
);

alter table community_reactions enable row level security;

drop policy if exists "Public read reactions" on community_reactions;
create policy "Public read reactions" on community_reactions for select using (true);

drop policy if exists "Users manage reactions" on community_reactions;
create policy "Users manage reactions" on community_reactions for all using (auth.uid() = user_id);

-- 9. Tables: community_reports & user_blocks
create table if not exists community_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references auth.users(id) on delete cascade not null,
  target_type text not null, -- 'post', 'comment', 'user', 'room'
  target_id text not null,
  reason text not null, -- 'Spam', 'Harassment', 'Inappropriate', 'Misleading academic information', 'Copyright concern', 'Other'
  details text,
  status text default 'pending', -- 'pending', 'reviewed', 'dismissed', 'actioned'
  created_at timestamptz default now()
);

alter table community_reports enable row level security;

drop policy if exists "Users insert reports" on community_reports;
create policy "Users insert reports" on community_reports for insert with check (auth.uid() = reporter_id);

drop policy if exists "Reporters view own reports" on community_reports;
create policy "Reporters view own reports" on community_reports for select using (auth.uid() = reporter_id);

create table if not exists user_blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid references auth.users(id) on delete cascade not null,
  blocked_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(blocker_id, blocked_id)
);

alter table user_blocks enable row level security;

drop policy if exists "Users manage user blocks" on user_blocks;
create policy "Users manage user blocks" on user_blocks for all using (auth.uid() = blocker_id);

-- 10. Tables: study_rooms & study_room_participants
create table if not exists study_rooms (
  id uuid primary key default gen_random_uuid(),
  host_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  goal text not null,
  exam text not null,
  subject text,
  duration_minutes integer default 25, -- 25, 50, 90
  privacy text default 'public', -- 'public', 'circle', 'private'
  max_participants integer default 10,
  status text default 'active', -- 'active', 'ended'
  started_at timestamptz default now(),
  ends_at timestamptz not null
);

alter table study_rooms enable row level security;

drop policy if exists "Public read active study rooms" on study_rooms;
create policy "Public read active study rooms" on study_rooms for select using (true);

drop policy if exists "Users manage study rooms" on study_rooms;
create policy "Users manage study rooms" on study_rooms for all using (auth.uid() = host_id);

create table if not exists study_room_participants (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references study_rooms(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  joined_at timestamptz default now(),
  unique(room_id, user_id)
);

alter table study_room_participants enable row level security;

drop policy if exists "Public read room participants" on study_room_participants;
create policy "Public read room participants" on study_room_participants for select using (true);

drop policy if exists "Users manage room participants" on study_room_participants;
create policy "Users manage room participants" on study_room_participants for all using (auth.uid() = user_id);

-- 11. Table: study_partners (Friends & Accountability)
create table if not exists study_partners (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid references auth.users(id) on delete cascade not null,
  addressee_id uuid references auth.users(id) on delete cascade not null,
  status text default 'pending', -- 'pending', 'accepted', 'rejected'
  created_at timestamptz default now(),
  unique(requester_id, addressee_id)
);

alter table study_partners enable row level security;

drop policy if exists "Users manage study partners" on study_partners;
create policy "Users manage study partners" on study_partners
  for all using (auth.uid() = requester_id or auth.uid() = addressee_id);

-- 12. Table: announcements
create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  type text default 'system', -- 'system', 'exam', 'resource', 'maintenance'
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table announcements enable row level security;

drop policy if exists "Public read active announcements" on announcements;
create policy "Public read active announcements" on announcements for select using (is_active = true);

-- Seed initial announcements
insert into announcements (title, content, type)
values
  ('GATE 2027 PYQ Bank Updated', 'Over 1,200 verified Previous Year Questions with detailed explanations are now live across all 13 subjects.', 'exam'),
  ('Study Rooms & Ecosystem Live', 'You can now join live timed Study Rooms with fellow aspirants, track daily streaks, and join subject circles.', 'system')
on conflict do nothing;

-- 13. Table: retention_analytics
create table if not exists retention_analytics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  event_name text not null,
  event_data jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table retention_analytics enable row level security;

drop policy if exists "Users insert retention analytics" on retention_analytics;
create policy "Users insert retention analytics" on retention_analytics for insert with check (auth.uid() = user_id);
