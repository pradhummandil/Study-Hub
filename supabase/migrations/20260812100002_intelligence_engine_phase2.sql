-- Migration: 20260812_intelligence_engine_phase2.sql
-- Description: Phase 2 Intelligence Engine tables, indexes, and RLS policies

-- 1. Table: student_concept_mastery
create table if not exists student_concept_mastery (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exam text not null,
  subject text not null,
  topic text not null,
  mastery_score numeric default 0,
  confidence_score numeric default 0,
  questions_attempted integer default 0,
  questions_correct integer default 0,
  recent_accuracy numeric default 0,
  recent_speed numeric default 0,
  streak_correct integer default 0,
  streak_wrong integer default 0,
  last_attempted_at timestamptz,
  last_reviewed_at timestamptz,
  next_review_at timestamptz,
  status text default 'learning', -- 'not_started', 'learning', 'developing', 'strong', 'mastered'
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, exam, subject, topic)
);

create index if not exists idx_concept_mastery_user
  on student_concept_mastery(user_id, exam, subject);

create index if not exists idx_concept_mastery_next_review
  on student_concept_mastery(user_id, next_review_at);

alter table student_concept_mastery enable row level security;

drop policy if exists "Users manage their concept mastery" on student_concept_mastery;
create policy "Users manage their concept mastery"
  on student_concept_mastery for all using (auth.uid() = user_id);

-- 2. Table: mistake_notebook
create table if not exists mistake_notebook (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id text not null,
  exam text not null,
  year integer,
  subject text not null,
  topic text not null,
  question_snapshot jsonb not null,
  student_answer jsonb,
  correct_answer jsonb not null,
  explanation text,
  time_taken integer default 0,
  attempt_count integer default 1,
  mistake_type text default 'unknown', -- 'concept_gap', 'careless_error', 'calculation_error', 'memory_error', 'misread_question', 'time_pressure', 'guessing', 'unknown'
  severity text default 'medium', -- 'low', 'medium', 'high'
  mastered boolean default false,
  last_reviewed_at timestamptz,
  next_review_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_mistake_notebook_user
  on mistake_notebook(user_id, exam, subject);

create index if not exists idx_mistake_notebook_mastered
  on mistake_notebook(user_id, mastered);

alter table mistake_notebook enable row level security;

drop policy if exists "Users manage their mistake notebook" on mistake_notebook;
create policy "Users manage their mistake notebook"
  on mistake_notebook for all using (auth.uid() = user_id);

-- 3. Tables: revision_items & revision_reviews
create table if not exists revision_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exam text not null,
  subject text not null,
  topic text not null,
  source_type text default 'concept', -- 'roadmap', 'mistake', 'flashcard', 'concept', 'recommendation'
  source_id text,
  title text not null,
  summary_notes text,
  review_count integer default 0,
  interval_days numeric default 1,
  easiness numeric default 2.5,
  last_reviewed_at timestamptz,
  next_review_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_revision_items_user_due
  on revision_items(user_id, next_review_at);

alter table revision_items enable row level security;

drop policy if exists "Users manage their revision items" on revision_items;
create policy "Users manage their revision items"
  on revision_items for all using (auth.uid() = user_id);

create table if not exists revision_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  revision_id uuid references revision_items(id) on delete cascade not null,
  rating text not null, -- 'Again', 'Hard', 'Good', 'Easy'
  interval_days numeric default 1,
  reviewed_at timestamptz default now()
);

alter table revision_reviews enable row level security;

drop policy if exists "Users manage their revision reviews" on revision_reviews;
create policy "Users manage their revision reviews"
  on revision_reviews for all using (auth.uid() = user_id);

-- 4. Tables: flashcard_decks, flashcards, flashcard_reviews
create table if not exists flashcard_decks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exam text not null default 'GATE',
  subject text not null,
  title text not null,
  description text,
  card_count integer default 0,
  is_public boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table flashcard_decks enable row level security;

drop policy if exists "Users manage their flashcard decks" on flashcard_decks;
create policy "Users manage their flashcard decks"
  on flashcard_decks for all using (auth.uid() = user_id);

create table if not exists flashcards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  deck_id uuid references flashcard_decks(id) on delete cascade,
  exam text not null default 'GATE',
  subject text not null,
  topic text not null,
  front text not null,
  back text not null,
  source_type text default 'custom', -- 'custom', 'ai_generated', 'mistake', 'roadmap'
  source_id text,
  difficulty text default 'Medium',
  review_count integer default 0,
  interval_days numeric default 1,
  easiness numeric default 2.5,
  next_review_at timestamptz default now(),
  last_reviewed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_flashcards_user_deck
  on flashcards(user_id, deck_id);

create index if not exists idx_flashcards_due
  on flashcards(user_id, next_review_at);

alter table flashcards enable row level security;

drop policy if exists "Users manage their flashcards" on flashcards;
create policy "Users manage their flashcards"
  on flashcards for all using (auth.uid() = user_id);

create table if not exists flashcard_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  flashcard_id uuid references flashcards(id) on delete cascade not null,
  rating text not null, -- 'Again', 'Hard', 'Good', 'Easy'
  interval_days numeric default 1,
  reviewed_at timestamptz default now()
);

alter table flashcard_reviews enable row level security;

drop policy if exists "Users manage their flashcard reviews" on flashcard_reviews;
create policy "Users manage their flashcard reviews"
  on flashcard_reviews for all using (auth.uid() = user_id);

-- 5. Table: adaptive_sessions
create table if not exists adaptive_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exam text not null,
  subject text not null,
  total_questions integer default 10,
  current_question_index integer default 0,
  performance_pct numeric default 0,
  current_difficulty text default 'Medium',
  status text default 'in_progress', -- 'in_progress', 'completed'
  target_topics jsonb default '[]'::jsonb,
  questions_data jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table adaptive_sessions enable row level security;

drop policy if exists "Users manage adaptive sessions" on adaptive_sessions;
create policy "Users manage adaptive sessions"
  on adaptive_sessions for all using (auth.uid() = user_id);

-- 6. Table: ai_recommendations
create table if not exists ai_recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null, -- 'revision', 'practice', 'flashcards', 'quiz', 'mock'
  title text not null,
  reason text not null,
  priority text default 'medium', -- 'high', 'medium', 'low'
  estimated_minutes integer default 20,
  action text not null,
  source text default 'performance',
  dismissed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_ai_recommendations_user
  on ai_recommendations(user_id, priority, created_at desc);

alter table ai_recommendations enable row level security;

drop policy if exists "Users manage AI recommendations" on ai_recommendations;
create policy "Users manage AI recommendations"
  on ai_recommendations for all using (auth.uid() = user_id);

-- 7. Table: learning_insights
create table if not exists learning_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  insight_type text not null, -- 'time_of_day', 'revision_impact', 'time_pressure', 'stagnant_topic', 'mastery_growth', 'warning'
  title text not null,
  description text not null,
  metric_value text,
  is_warning boolean default false,
  action_link text,
  created_at timestamptz default now()
);

alter table learning_insights enable row level security;

drop policy if exists "Users manage learning insights" on learning_insights;
create policy "Users manage learning insights"
  on learning_insights for all using (auth.uid() = user_id);

-- 8. Table: exam_readiness_snapshots
create table if not exists exam_readiness_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exam text not null,
  overall_readiness numeric default 0,
  syllabus_coverage_pct numeric default 0,
  pyq_accuracy_pct numeric default 0,
  mock_performance_pct numeric default 0,
  revision_health_pct numeric default 0,
  consistency_pct numeric default 0,
  strongest_area text,
  biggest_opportunity text,
  recommended_next_step text,
  created_at timestamptz default now()
);

alter table exam_readiness_snapshots enable row level security;

drop policy if exists "Users manage exam readiness snapshots" on exam_readiness_snapshots;
create policy "Users manage exam readiness snapshots"
  on exam_readiness_snapshots for all using (auth.uid() = user_id);
