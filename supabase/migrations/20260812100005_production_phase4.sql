-- Migration: 20260812_production_phase4.sql
-- Description: Phase 4 Production Platform — Admin CMS, RBAC, Security, Billing, Analytics

-- ============================================================
-- 1. USER ROLES (RBAC — server-verified, never trust client)
-- ============================================================
create table if not exists user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  role text not null default 'student',
  -- Roles: 'student' | 'moderator' | 'content_editor' | 'admin' | 'super_admin'
  assigned_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint valid_role check (role in ('student', 'moderator', 'content_editor', 'admin', 'super_admin'))
);

create index if not exists idx_user_roles_user_id on user_roles(user_id);
create index if not exists idx_user_roles_role on user_roles(role);

alter table user_roles enable row level security;

-- Users can read their own role
drop policy if exists "Users read own role" on user_roles;
create policy "Users read own role"
  on user_roles for select using (auth.uid() = user_id);

-- Only service role can write (managed via Edge Functions / migrations)
-- No INSERT/UPDATE/DELETE policy for regular users intentionally

-- Helper function: get current user role
create or replace function get_user_role(uid uuid)
returns text
language sql
security definer
stable
as $$
  select coalesce(
    (select role from user_roles where user_id = uid limit 1),
    'student'
  );
$$;

-- Helper function: is_admin (admin or super_admin)
create or replace function is_admin(uid uuid)
returns boolean
language sql
security definer
stable
as $$
  select get_user_role(uid) in ('admin', 'super_admin');
$$;

-- Helper function: is_moderator_or_above
create or replace function is_moderator_or_above(uid uuid)
returns boolean
language sql
security definer
stable
as $$
  select get_user_role(uid) in ('moderator', 'content_editor', 'admin', 'super_admin');
$$;

-- Helper function: is_content_editor_or_above
create or replace function is_content_editor_or_above(uid uuid)
returns boolean
language sql
security definer
stable
as $$
  select get_user_role(uid) in ('content_editor', 'admin', 'super_admin');
$$;

-- ============================================================
-- 2. ADMIN AUDIT LOG
-- ============================================================
create table if not exists admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  actor_role text not null default 'unknown',
  action text not null, -- e.g. 'publish_resource', 'suspend_user', 'delete_question', 'change_role'
  target_type text not null, -- 'resource', 'question', 'user', 'mock_test', 'exam', 'announcement'
  target_id text not null,
  target_label text, -- Human-readable label for display
  before_state jsonb,
  after_state jsonb,
  reason text,
  ip_address text, -- Stored for security audit (no PII beyond IP)
  created_at timestamptz default now()
);

create index if not exists idx_audit_log_actor on admin_audit_log(actor_id, created_at desc);
create index if not exists idx_audit_log_target on admin_audit_log(target_type, target_id, created_at desc);
create index if not exists idx_audit_log_created on admin_audit_log(created_at desc);

alter table admin_audit_log enable row level security;

-- Admins and above can read audit logs
drop policy if exists "Admins read audit log" on admin_audit_log;
create policy "Admins read audit log"
  on admin_audit_log for select
  using (is_moderator_or_above(auth.uid()));

-- Service role handles inserts (via Edge Functions)
-- No direct client insert policy

-- ============================================================
-- 3. FEATURE FLAGS
-- ============================================================
create table if not exists feature_flags (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value boolean default true,
  description text,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz default now()
);

alter table feature_flags enable row level security;

drop policy if exists "Public read feature flags" on feature_flags;
create policy "Public read feature flags"
  on feature_flags for select using (true);

-- Seed default feature flags
insert into feature_flags (key, value, description) values
  ('study_ai', true, 'StudyMate AI chat enabled'),
  ('community', true, 'Community posts and circles enabled'),
  ('adaptive_practice', true, 'Adaptive practice sessions enabled'),
  ('mock_tests', true, 'Mock tests enabled for students'),
  ('pwa', true, 'PWA install prompt enabled'),
  ('premium_features', false, 'Premium/paid features enabled'),
  ('maintenance_mode', false, 'Global maintenance mode — blocks all student access'),
  ('leaderboards', true, 'Leaderboard visibility enabled'),
  ('resource_health_checks', true, 'Background resource health check jobs enabled'),
  ('ai_feedback', true, 'Show helpful/not-helpful on StudyMate responses')
on conflict (key) do update set
  description = excluded.description;

-- ============================================================
-- 4. AI PROMPT VERSIONS
-- ============================================================
create table if not exists ai_prompt_versions (
  id uuid primary key default gen_random_uuid(),
  name text not null, -- e.g. 'StudyMate System Prompt v2'
  version integer not null default 1,
  prompt text not null,
  is_active boolean default false,
  notes text, -- What changed in this version
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

create unique index if not exists idx_ai_prompt_one_active
  on ai_prompt_versions(is_active)
  where is_active = true;

alter table ai_prompt_versions enable row level security;

drop policy if exists "Admins read prompt versions" on ai_prompt_versions;
create policy "Admins read prompt versions"
  on ai_prompt_versions for select
  using (is_content_editor_or_above(auth.uid()));

-- ============================================================
-- 5. AI USAGE METRICS (Anonymized aggregated)
-- ============================================================
create table if not exists ai_usage_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  request_date date default current_date,
  success boolean default true,
  latency_ms integer,
  input_tokens integer,
  output_tokens integer,
  model text default 'gemini-flash-latest',
  error_type text, -- null on success, e.g. 'rate_limit', 'timeout', 'content_blocked'
  mode text, -- 'Explain', 'Practice', 'Quiz', 'Revision', 'Study Plan', 'Doubt Solving'
  created_at timestamptz default now()
);

create index if not exists idx_ai_metrics_date on ai_usage_metrics(request_date desc);
create index if not exists idx_ai_metrics_user_date on ai_usage_metrics(user_id, request_date desc);

alter table ai_usage_metrics enable row level security;

-- Users can insert their own metrics
drop policy if exists "Users insert ai metrics" on ai_usage_metrics;
create policy "Users insert ai metrics"
  on ai_usage_metrics for insert with check (auth.uid() = user_id);

-- Admins can read all metrics
drop policy if exists "Admins read ai metrics" on ai_usage_metrics;
create policy "Admins read ai metrics"
  on ai_usage_metrics for select
  using (is_admin(auth.uid()));

-- ============================================================
-- 6. AI FEEDBACK
-- ============================================================
create table if not exists ai_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  session_id text, -- StudyMate session reference (not full chat)
  rating text not null check (rating in ('helpful', 'not_helpful')),
  feedback_text text, -- Optional "what went wrong"
  message_preview text, -- First 200 chars of assistant message (anonymized)
  created_at timestamptz default now()
);

create index if not exists idx_ai_feedback_user on ai_feedback(user_id, created_at desc);
create index if not exists idx_ai_feedback_rating on ai_feedback(rating, created_at desc);

alter table ai_feedback enable row level security;

drop policy if exists "Users insert ai feedback" on ai_feedback;
create policy "Users insert ai feedback"
  on ai_feedback for insert with check (auth.uid() = user_id);

drop policy if exists "Users read own feedback" on ai_feedback;
create policy "Users read own feedback"
  on ai_feedback for select using (auth.uid() = user_id);

drop policy if exists "Admins read all ai feedback" on ai_feedback;
create policy "Admins read all ai feedback"
  on ai_feedback for select using (is_admin(auth.uid()));

-- ============================================================
-- 7. SUBSCRIPTIONS & PLANS (Razorpay-ready)
-- ============================================================
create table if not exists plans (
  id text primary key, -- 'free', 'plus', 'pro', 'institution'
  name text not null,
  price_inr integer default 0, -- Monthly price in paise (0 = free)
  price_annual_inr integer default 0,
  features jsonb default '[]'::jsonb,
  ai_requests_per_day integer default 50,
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table plans enable row level security;
drop policy if exists "Public read plans" on plans;
create policy "Public read plans" on plans for select using (is_active = true);

insert into plans (id, name, price_inr, price_annual_inr, features, ai_requests_per_day) values
  ('free', 'Free', 0, 0, '["All core features", "50 AI requests/day", "Community access", "Basic analytics"]', 50),
  ('plus', 'Plus', 19900, 149900, '["Everything in Free", "200 AI requests/day", "Advanced analytics", "Priority support"]', 200),
  ('pro', 'Pro', 39900, 299900, '["Everything in Plus", "Unlimited AI requests", "Premium mock tests", "Study circle admin", "Export all data"]', 10000),
  ('institution', 'Institution', 0, 0, '["Custom pricing", "Team management", "Analytics dashboard", "Custom branding", "Dedicated support"]', 10000)
on conflict (id) do update set
  name = excluded.name,
  price_inr = excluded.price_inr;

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  plan_id text references plans(id) not null default 'free',
  status text default 'active' check (status in ('active', 'cancelled', 'expired', 'trial', 'paused')),
  razorpay_subscription_id text,
  razorpay_customer_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  trial_ends_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_subscriptions_user on subscriptions(user_id);
create index if not exists idx_subscriptions_status on subscriptions(status, current_period_end);

alter table subscriptions enable row level security;

drop policy if exists "Users read own subscription" on subscriptions;
create policy "Users read own subscription"
  on subscriptions for select using (auth.uid() = user_id);

-- Users get free plan subscription on signup (handled via Edge Function trigger)

create table if not exists payment_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  subscription_id uuid references subscriptions(id) on delete cascade,
  event_type text not null, -- 'subscription.created', 'payment.captured', 'payment.failed', 'subscription.cancelled'
  razorpay_payment_id text,
  amount_paise integer,
  currency text default 'INR',
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table payment_events enable row level security;
drop policy if exists "Users read own payment events" on payment_events;
create policy "Users read own payment events"
  on payment_events for select using (auth.uid() = user_id);

-- ============================================================
-- 8. EXTEND RESOURCES TABLE
-- ============================================================
-- Add production-ready columns to resources table
alter table resources
  add column if not exists year integer,
  add column if not exists subject text,
  add column if not exists category text,
  add column if not exists status text default 'published'
    check (status in ('draft', 'review', 'published', 'archived', 'rejected')),
  add column if not exists source_state text default 'unknown'
    check (source_state in ('official', 'verified_external', 'community', 'ai_generated', 'unknown')),
  add column if not exists published_at timestamptz,
  add column if not exists created_by uuid references auth.users(id) on delete set null,
  add column if not exists updated_by uuid references auth.users(id) on delete set null,
  add column if not exists slug text,
  add column if not exists tags text[] default '{}',
  add column if not exists official_website text,
  add column if not exists source_url text,
  add column if not exists difficulty text default 'Medium',
  add column if not exists is_official boolean default false,
  add column if not exists review_notes text;

-- Unique slug index (null-safe)
create unique index if not exists idx_resources_slug
  on resources(slug) where slug is not null;

create index if not exists idx_resources_status on resources(status, created_at desc);
create index if not exists idx_resources_exam_status on resources(exam_tag, status);

-- Update existing resources to have 'published' status if not set
update resources set status = 'published' where status is null or status = 'published';

-- ============================================================
-- 9. EXTEND PRACTICE QUESTIONS TABLE
-- ============================================================
alter table practice_questions
  add column if not exists source_type text default 'official_pyq'
    check (source_type in ('official_pyq', 'admin_created', 'ai_generated', 'community', 'imported')),
  add column if not exists source_resource_id text,
  add column if not exists source_page integer,
  add column if not exists source_question_number integer,
  add column if not exists review_status text default 'approved'
    check (review_status in ('pending_review', 'approved', 'rejected', 'needs_edit')),
  add column if not exists normalized_question_hash text,
  add column if not exists created_by uuid references auth.users(id) on delete set null,
  add column if not exists updated_by uuid references auth.users(id) on delete set null,
  add column if not exists version integer default 1,
  add column if not exists short_answer_keywords jsonb default '[]'::jsonb;

create index if not exists idx_pq_review_status on practice_questions(review_status, exam, subject);
create index if not exists idx_pq_source_type on practice_questions(source_type);
create unique index if not exists idx_pq_hash
  on practice_questions(normalized_question_hash)
  where normalized_question_hash is not null;

-- Update existing questions: all existing = official_pyq + approved
update practice_questions
  set source_type = 'official_pyq', review_status = 'approved'
  where source_type is null;

-- ============================================================
-- 10. EXTEND MOCK TESTS TABLE
-- ============================================================
alter table mock_tests
  add column if not exists status text default 'published'
    check (status in ('draft', 'published', 'archived')),
  add column if not exists created_by uuid references auth.users(id) on delete set null,
  add column if not exists scoring_rules jsonb default '{
    "mcq_correct": 1,
    "mcq_wrong": -0.33,
    "msq_correct": 2,
    "msq_partial": 0,
    "nat_correct": 1,
    "nat_wrong": 0
  }'::jsonb,
  add column if not exists question_selection text default 'fixed'
    check (question_selection in ('fixed', 'random', 'topic_balanced', 'difficulty_balanced')),
  add column if not exists scheduled_at timestamptz,
  add column if not exists is_official boolean default false;

update mock_tests set status = 'published' where status is null;

-- ============================================================
-- 11. EXTEND ANNOUNCEMENTS TABLE
-- ============================================================
alter table announcements
  add column if not exists priority text default 'normal'
    check (priority in ('low', 'normal', 'high', 'critical')),
  add column if not exists audience text default 'all'
    check (audience in ('all', 'gate', 'jee', 'neet', 'cuet', 'circle')),
  add column if not exists start_time timestamptz,
  add column if not exists end_time timestamptz,
  add column if not exists cta_text text,
  add column if not exists cta_url text,
  add column if not exists created_by uuid references auth.users(id) on delete set null,
  add column if not exists updated_by uuid references auth.users(id) on delete set null;

-- Admins can now write to announcements
drop policy if exists "Admins manage announcements" on announcements;
create policy "Admins manage announcements"
  on announcements for all
  using (is_content_editor_or_above(auth.uid()));

-- ============================================================
-- 12. RESOURCE HEALTH CHECKS
-- ============================================================
create table if not exists resource_health_checks (
  id uuid primary key default gen_random_uuid(),
  resource_id text not null, -- references resources(id) but kept as text for flexibility
  url text not null,
  status text default 'unknown' check (status in ('ok', 'redirect', 'broken', 'unknown', 'checking')),
  http_status integer,
  content_type text,
  redirect_url text,
  error_message text,
  checked_at timestamptz default now(),
  unique(resource_id)
);

create index if not exists idx_health_checks_status on resource_health_checks(status, checked_at desc);

alter table resource_health_checks enable row level security;
drop policy if exists "Admins read health checks" on resource_health_checks;
create policy "Admins read health checks"
  on resource_health_checks for select using (is_admin(auth.uid()));

-- ============================================================
-- 13. DOWNLOADS TRACKER
-- ============================================================
create table if not exists resource_downloads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  resource_id text not null,
  resource_title text,
  downloaded_at timestamptz default now(),
  unique(user_id, resource_id)
);

create index if not exists idx_downloads_user on resource_downloads(user_id, downloaded_at desc);

alter table resource_downloads enable row level security;

drop policy if exists "Users manage their downloads" on resource_downloads;
create policy "Users manage their downloads"
  on resource_downloads for all using (auth.uid() = user_id);

-- ============================================================
-- 14. USER PRIVACY SETTINGS
-- ============================================================
create table if not exists user_privacy_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  public_profile boolean default true,
  community_visibility boolean default true,
  leaderboard_participation boolean default true,
  study_room_visibility boolean default true,
  ai_chat_history_saved boolean default true,
  data_analytics_opt_in boolean default true,
  updated_at timestamptz default now()
);

alter table user_privacy_settings enable row level security;

drop policy if exists "Users manage privacy settings" on user_privacy_settings;
create policy "Users manage privacy settings"
  on user_privacy_settings for all using (auth.uid() = user_id);

-- ============================================================
-- 15. AI PREFERENCES
-- ============================================================
create table if not exists user_ai_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  response_style text default 'balanced' check (response_style in ('concise', 'balanced', 'detailed')),
  study_difficulty text default 'mixed' check (study_difficulty in ('beginner', 'mixed', 'advanced')),
  preferred_mode text default 'Explain',
  updated_at timestamptz default now()
);

alter table user_ai_preferences enable row level security;

drop policy if exists "Users manage ai preferences" on user_ai_preferences;
create policy "Users manage ai preferences"
  on user_ai_preferences for all using (auth.uid() = user_id);

-- ============================================================
-- 16. UPDATE COMMUNITY REPORTS — Add admin read access & more fields
-- ============================================================
alter table community_reports
  add column if not exists assigned_to uuid references auth.users(id) on delete set null,
  add column if not exists moderator_notes text,
  add column if not exists resolved_at timestamptz,
  add column if not exists action_taken text; -- 'dismissed', 'content_removed', 'user_warned', 'user_suspended', 'content_blocked', 'escalated'

-- Drop old policy and recreate with moderator access
drop policy if exists "Moderators read all reports" on community_reports;
create policy "Moderators read all reports"
  on community_reports for select using (is_moderator_or_above(auth.uid()));

drop policy if exists "Moderators update reports" on community_reports;
create policy "Moderators update reports"
  on community_reports for update using (is_moderator_or_above(auth.uid()));

-- ============================================================
-- 17. EXAM CONFIGURATIONS (JSON-driven, not hardcoded in React)
-- ============================================================
create table if not exists exam_configurations (
  id uuid primary key default gen_random_uuid(),
  exam text unique not null,
  exam_code text,
  display_name text not null,
  official_website text,
  subjects jsonb default '[]'::jsonb,
  sections jsonb default '[]'::jsonb,
  question_types jsonb default '["MCQ"]'::jsonb,
  duration_minutes integer default 180,
  total_questions integer default 65,
  total_marks integer default 100,
  negative_marking boolean default false,
  negative_marking_rules jsonb default '{}'::jsonb,
  scoring_rules jsonb default '{}'::jsonb,
  exam_month text, -- 'February', 'April' etc.
  status text default 'active' check (status in ('active', 'inactive', 'upcoming')),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table exam_configurations enable row level security;

drop policy if exists "Public read exam configurations" on exam_configurations;
create policy "Public read exam configurations"
  on exam_configurations for select using (true);

drop policy if exists "Admins manage exam configurations" on exam_configurations;
create policy "Admins manage exam configurations"
  on exam_configurations for all
  using (is_content_editor_or_above(auth.uid()));

-- Seed core exam configurations
insert into exam_configurations (exam, exam_code, display_name, official_website, question_types, duration_minutes, total_questions, total_marks, negative_marking, negative_marking_rules, scoring_rules, exam_month)
values
  ('GATE', 'GATE', 'Graduate Aptitude Test in Engineering', 'https://gate2027.iitm.ac.in',
   '["MCQ", "MSQ", "NAT"]', 180, 65, 100, true,
   '{"MCQ_wrong": -0.33, "MCQ_2mark_wrong": -0.67, "MSQ_wrong": 0, "NAT_wrong": 0}',
   '{"MCQ_1mark": 1, "MCQ_2mark": 2, "MSQ_2mark": 2, "NAT_1mark": 1, "NAT_2mark": 2}',
   'February'),
  ('JEE Advanced', 'JEEADV', 'Joint Entrance Examination Advanced', 'https://jeeadv.ac.in',
   '["MCQ", "MSQ", "Numerical"]', 180, 54, 180, true,
   '{"MCQ_wrong": -1, "MSQ_partial": 0}',
   '{"MCQ_correct": 3, "MSQ_full": 4, "Numerical": 3}',
   'May'),
  ('JEE Main', 'JEEMAIN', 'Joint Entrance Examination Main', 'https://jeemain.nta.ac.in',
   '["MCQ", "Numerical"]', 180, 90, 300, true,
   '{"MCQ_wrong": -1}',
   '{"MCQ_correct": 4, "Numerical_correct": 4}',
   'January'),
  ('NEET', 'NEET', 'National Eligibility cum Entrance Test', 'https://neet.nta.nic.in',
   '["MCQ"]', 200, 200, 720, true,
   '{"MCQ_wrong": -1}',
   '{"MCQ_correct": 4}',
   'May'),
  ('CUET', 'CUET', 'Common University Entrance Test', 'https://cuet.nta.nic.in',
   '["MCQ"]', 45, 50, 200, true,
   '{"MCQ_wrong": -1}',
   '{"MCQ_correct": 5}',
   'May'),
  ('UGC NET', 'UGCNET', 'UGC National Eligibility Test', 'https://ugcnet.nta.nic.in',
   '["MCQ"]', 180, 150, 300, false,
   '{}',
   '{"MCQ_correct": 2}',
   'June')
on conflict (exam) do update set
  display_name = excluded.display_name,
  question_types = excluded.question_types,
  scoring_rules = excluded.scoring_rules;

-- ============================================================
-- 18. PERFORMANCE INDEXES (identified from query patterns)
-- ============================================================
-- Resources — most common query patterns
create index if not exists idx_resources_published on resources(status, exam_tag, created_at desc)
  where status = 'published';
create index if not exists idx_resources_category on resources(category, status);
create index if not exists idx_resources_year on resources(year, status) where year is not null;
create index if not exists idx_resources_subject on resources(subject, status) where subject is not null;

-- Practice questions — performance-critical
create index if not exists idx_pq_approved on practice_questions(exam, subject, topic, difficulty)
  where review_status = 'approved';
create index if not exists idx_pq_year on practice_questions(exam, year)
  where year is not null;

-- Mock tests — student-facing queries
create index if not exists idx_mock_tests_published on mock_tests(exam, status)
  where status = 'published';

-- User question attempts — performance analytics
create index if not exists idx_uqa_subject on user_question_attempts(user_id, exam, subject);
create index if not exists idx_uqa_correct on user_question_attempts(user_id, is_correct, created_at desc);

-- Notifications — already indexed but add compound
create index if not exists idx_notifications_unread on notifications(user_id, created_at desc)
  where read = false;

-- Concept mastery — revision engine
create index if not exists idx_mastery_review_due on student_concept_mastery(user_id, next_review_at)
  where status != 'mastered';

-- Revision items — due for review
create index if not exists idx_revision_due on revision_items(user_id, next_review_at)
  where next_review_at is not null;

-- ============================================================
-- 19. FULL-TEXT SEARCH FOR RESOURCES
-- ============================================================
-- Add tsvector column for full-text search
alter table resources add column if not exists search_vector tsvector;

-- Create index
create index if not exists idx_resources_search on resources using gin(search_vector);

-- Function to update search vector
create or replace function update_resource_search_vector()
returns trigger
language plpgsql
as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.exam_tag, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(new.subject, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(new.category, '')), 'D');
  return new;
end;
$$;

drop trigger if exists resources_search_vector_update on resources;
create trigger resources_search_vector_update
  before insert or update of title, description, exam_tag, subject, category
  on resources
  for each row execute function update_resource_search_vector();

-- Backfill existing resources
update resources set search_vector =
  setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(exam_tag, '')), 'C') ||
  setweight(to_tsvector('english', coalesce(subject, '')), 'C') ||
  setweight(to_tsvector('english', coalesce(category, '')), 'D');

-- ============================================================
-- 20. ADMIN STATS AGGREGATE FUNCTION
-- ============================================================
create or replace function get_admin_dashboard_stats()
returns jsonb
language plpgsql
security definer
as $$
declare
  result jsonb;
  total_users bigint;
  active_today bigint;
  total_resources bigint;
  total_questions bigint;
  total_mocks bigint;
  ai_requests_today bigint;
  ai_failures_today bigint;
  pending_reports bigint;
begin
  -- Total users (approximation from student_profiles)
  select count(*) into total_users from student_profiles;

  -- Active today
  select count(*) into active_today
  from student_daily_activity
  where activity_date = current_date and meaningful_activity = true;

  -- Published resources
  select count(*) into total_resources
  from resources where status = 'published';

  -- Approved questions
  select count(*) into total_questions
  from practice_questions where review_status = 'approved';

  -- Published mock tests
  select count(*) into total_mocks
  from mock_tests where status = 'published';

  -- AI requests today
  select count(*) into ai_requests_today
  from ai_usage_metrics where request_date = current_date;

  -- AI failures today
  select count(*) into ai_failures_today
  from ai_usage_metrics
  where request_date = current_date and success = false;

  -- Pending reports
  select count(*) into pending_reports
  from community_reports where status = 'pending';

  result := jsonb_build_object(
    'total_users', total_users,
    'active_today', active_today,
    'total_resources', total_resources,
    'total_questions', total_questions,
    'total_mock_tests', total_mocks,
    'ai_requests_today', ai_requests_today,
    'ai_failures_today', ai_failures_today,
    'pending_reports', pending_reports
  );

  return result;
end;
$$;

-- ============================================================
-- 21. QUESTION DUPLICATE DETECTION FUNCTION
-- ============================================================
create or replace function normalize_question_text(q text)
returns text
language plpgsql
immutable
as $$
begin
  -- Lowercase, remove extra whitespace, remove punctuation for hash comparison
  return lower(
    regexp_replace(
      regexp_replace(trim(q), '\s+', ' ', 'g'),
      '[^a-z0-9 ]', '', 'g'
    )
  );
end;
$$;

-- ============================================================
-- 22. MAINTENANCE MODE CHECK FUNCTION
-- ============================================================
create or replace function is_maintenance_mode()
returns boolean
language sql
security definer
stable
as $$
  select coalesce(
    (select value from feature_flags where key = 'maintenance_mode' limit 1),
    false
  );
$$;
