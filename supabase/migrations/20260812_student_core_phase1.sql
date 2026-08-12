-- Migration: 20260812_student_core_phase1.sql
-- Description: Phase 1 Student Core tables, indexes, and RLS policies

-- 1. Table: student_profiles
create table if not exists student_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  target_exam text not null default 'GATE',
  target_exam_year text not null default '2027',
  target_goal text default 'Top Rank',
  target_rank text,
  target_score text,
  daily_study_minutes integer default 180,
  current_level text default 'Intermediate',
  exam_date date,
  onboarding_completed boolean default false,
  subject_ratings jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table student_profiles enable row level security;

drop policy if exists "Users can view their own profile" on student_profiles;
create policy "Users can view their own profile" on student_profiles
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own profile" on student_profiles;
create policy "Users can insert their own profile" on student_profiles
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own profile" on student_profiles;
create policy "Users can update their own profile" on student_profiles
  for update using (auth.uid() = user_id);

-- 2. Table: student_subject_progress
create table if not exists student_subject_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  exam text not null,
  subject text not null,
  status text default 'not_started', -- 'not_started', 'learning', 'practicing', 'revision', 'completed'
  confidence text default 'average', -- 'weak', 'average', 'strong'
  progress numeric default 0,
  accuracy numeric default 0,
  questions_attempted integer default 0,
  questions_correct integer default 0,
  last_studied_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, exam, subject)
);

create index if not exists idx_student_subject_progress_user
  on student_subject_progress(user_id, exam);

alter table student_subject_progress enable row level security;

drop policy if exists "Users can manage their subject progress" on student_subject_progress;
create policy "Users can manage their subject progress" on student_subject_progress
  for all using (auth.uid() = user_id);

-- 3. Tables: roadmaps, roadmap_sections, roadmap_topics, user_roadmap_progress
create table if not exists roadmaps (
  id text primary key,
  exam text not null,
  title text not null,
  description text,
  total_topics integer default 0,
  created_at timestamptz default now()
);

create table if not exists roadmap_sections (
  id text primary key,
  roadmap_id text references roadmaps(id) on delete cascade not null,
  title text not null,
  category text not null, -- 'FOUNDATION', 'CORE', 'ADVANCED', 'EXAM MODE'
  sort_order integer default 0
);

create table if not exists roadmap_topics (
  id text primary key,
  section_id text references roadmap_sections(id) on delete cascade not null,
  subject text not null,
  title text not null,
  description text,
  estimated_hours numeric default 5,
  subtopics jsonb default '[]'::jsonb,
  sort_order integer default 0
);

create table if not exists user_roadmap_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  topic_id text not null,
  status text default 'not_started', -- 'not_started', 'in_progress', 'completed'
  progress_pct integer default 0,
  completed_at timestamptz,
  updated_at timestamptz default now(),
  unique(user_id, topic_id)
);

alter table roadmaps enable row level security;
alter table roadmap_sections enable row level security;
alter table roadmap_topics enable row level security;
alter table user_roadmap_progress enable row level security;

drop policy if exists "Public read roadmaps" on roadmaps;
create policy "Public read roadmaps" on roadmaps for select using (true);

drop policy if exists "Public read roadmap sections" on roadmap_sections;
create policy "Public read roadmap sections" on roadmap_sections for select using (true);

drop policy if exists "Public read roadmap topics" on roadmap_topics;
create policy "Public read roadmap topics" on roadmap_topics for select using (true);

drop policy if exists "Users manage their roadmap progress" on user_roadmap_progress;
create policy "Users manage their roadmap progress" on user_roadmap_progress
  for all using (auth.uid() = user_id);

-- 4. Tables: practice_questions & user_question_attempts
create table if not exists practice_questions (
  id uuid primary key default gen_random_uuid(),
  exam text not null,
  year integer,
  subject text not null,
  topic text not null,
  difficulty text default 'Medium', -- 'Easy', 'Medium', 'Hard'
  question_type text default 'MCQ', -- 'MCQ', 'MSQ', 'Numerical', 'True/False'
  question_text text not null,
  options jsonb default '[]'::jsonb, -- ['A', 'B', 'C', 'D']
  correct_answer jsonb not null, -- 'A' or ['A', 'B'] or '42'
  explanation text,
  is_official_pyq boolean default true,
  created_at timestamptz default now()
);

create index if not exists idx_practice_questions_filter
  on practice_questions(exam, subject, topic);

create table if not exists user_question_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  question_id uuid references practice_questions(id) on delete cascade not null,
  exam text not null,
  subject text not null,
  topic text not null,
  user_answer jsonb,
  is_correct boolean not null,
  time_taken_seconds integer default 0,
  marked_for_review boolean default false,
  saved_as_mistake boolean default false,
  created_at timestamptz default now()
);

create index if not exists idx_user_question_attempts_user
  on user_question_attempts(user_id, created_at desc);

alter table practice_questions enable row level security;
alter table user_question_attempts enable row level security;

drop policy if exists "Public read practice questions" on practice_questions;
create policy "Public read practice questions" on practice_questions for select using (true);

drop policy if exists "Users manage their question attempts" on user_question_attempts;
create policy "Users manage their question attempts" on user_question_attempts
  for all using (auth.uid() = user_id);

-- 5. Tables: mock_tests, mock_test_questions, mock_attempts, mock_answers
create table if not exists mock_tests (
  id uuid primary key default gen_random_uuid(),
  exam text not null,
  title text not null,
  description text,
  subject text, -- null for Full Syllabus
  total_questions integer not null default 30,
  duration_minutes integer not null default 60,
  total_marks integer not null default 100,
  difficulty text default 'Medium',
  created_at timestamptz default now()
);

create table if not exists mock_test_questions (
  id uuid primary key default gen_random_uuid(),
  mock_test_id uuid references mock_tests(id) on delete cascade not null,
  question_id uuid references practice_questions(id) on delete cascade not null,
  marks numeric default 1,
  negative_marks numeric default 0.33,
  sort_order integer default 0
);

create table if not exists mock_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  mock_test_id uuid references mock_tests(id) on delete cascade not null,
  status text default 'in_progress', -- 'in_progress', 'completed'
  score numeric default 0,
  max_score numeric default 100,
  accuracy_pct numeric default 0,
  total_questions integer default 0,
  correct_count integer default 0,
  wrong_count integer default 0,
  unanswered_count integer default 0,
  time_spent_seconds integer default 0,
  topic_scores jsonb default '{}'::jsonb,
  started_at timestamptz default now(),
  completed_at timestamptz
);

create table if not exists mock_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid references mock_attempts(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  question_id uuid references practice_questions(id) on delete cascade not null,
  selected_answer jsonb,
  is_correct boolean,
  marked_for_review boolean default false,
  updated_at timestamptz default now(),
  unique(attempt_id, question_id)
);

alter table mock_tests enable row level security;
alter table mock_test_questions enable row level security;
alter table mock_attempts enable row level security;
alter table mock_answers enable row level security;

drop policy if exists "Public read mock tests" on mock_tests;
create policy "Public read mock tests" on mock_tests for select using (true);

drop policy if exists "Public read mock test questions" on mock_test_questions;
create policy "Public read mock test questions" on mock_test_questions for select using (true);

drop policy if exists "Users manage mock attempts" on mock_attempts;
create policy "Users manage mock attempts" on mock_attempts for all using (auth.uid() = user_id);

drop policy if exists "Users manage mock answers" on mock_answers;
create policy "Users manage mock answers" on mock_answers for all using (auth.uid() = user_id);

-- 6. Table: study_sessions (tracks Focus Room sessions & study minutes for daily progress)
create table if not exists study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  subject text not null,
  minutes integer not null,
  activity_type text default 'focus_room', -- 'focus_room', 'practice', 'mock_test', 'quiz'
  session_date date default current_date,
  created_at timestamptz default now()
);

create index if not exists idx_study_sessions_user_date
  on study_sessions(user_id, session_date);

alter table study_sessions enable row level security;

drop policy if exists "Users manage study sessions" on study_sessions;
create policy "Users manage study sessions" on study_sessions for all using (auth.uid() = user_id);
