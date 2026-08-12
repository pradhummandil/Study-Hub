-- ─── STUDY HUB PHASE 5: ADVANCED AI, MONETIZATION & ECOSYSTEM MIGRATION ───────

-- Enable vector extension if available
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Knowledge Engine / RAG Tables
CREATE TABLE IF NOT EXISTS public.knowledge_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID REFERENCES public.resources(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  exam TEXT NOT NULL DEFAULT 'General',
  year INTEGER,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'official', -- 'official', 'verified', 'community', 'ai_generated', 'unverified'
  verification_status TEXT NOT NULL DEFAULT 'verified',
  language TEXT NOT NULL DEFAULT 'en',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.knowledge_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.knowledge_documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  page INTEGER,
  question_number TEXT,
  chunk_index INTEGER NOT NULL DEFAULT 0,
  keywords TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. AI Quality & Trust Center Tables
CREATE TABLE IF NOT EXISTS public.ai_response_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  message_id TEXT NOT NULL,
  prompt_text TEXT,
  response_text TEXT,
  reason TEXT NOT NULL, -- 'Incorrect', 'Not relevant', 'Missing source', 'Confusing', 'Unsafe'
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'reviewed', 'resolved'
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ai_quality_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_version TEXT NOT NULL DEFAULT 'v1.0',
  model TEXT NOT NULL DEFAULT 'gemini-flash-latest',
  retrieval_version TEXT NOT NULL DEFAULT 'v1.0',
  latency_ms INTEGER NOT NULL DEFAULT 0,
  citation_accuracy NUMERIC DEFAULT 1.0,
  feedback_score INTEGER DEFAULT 0, -- +1, -1
  is_hallucination_reported BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Subscriptions & Billing Tables
CREATE TABLE IF NOT EXISTS public.subscriptions (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL DEFAULT 'free', -- 'free', 'plus', 'pro'
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'canceled', 'past_due', 'trialing'
  provider_customer_id TEXT,
  provider_subscription_id TEXT,
  current_period_start TIMESTAMPTZ DEFAULT NOW(),
  current_period_end TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.billing_webhooks_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'processed',
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Referral System Tables
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  referral_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'signed_up', -- 'signed_up', 'activated', 'rewarded'
  reward_details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Institution & Multi-Tenant Portal Tables
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  plan TEXT NOT NULL DEFAULT 'institution_starter',
  settings JSONB DEFAULT '{"allow_student_signup": true}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'student', -- 'institution_admin', 'teacher', 'mentor', 'student'
  privacy_level TEXT NOT NULL DEFAULT 'shared_with_mentor', -- 'private', 'shared_with_mentor', 'organization_visible'
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'quiz', -- 'pyq', 'mock', 'quiz', 'flashcards', 'resource', 'topic'
  target_id TEXT,
  target_student_ids UUID[] DEFAULT '{}',
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.assignment_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'completed',
  score NUMERIC DEFAULT 0,
  details JSONB DEFAULT '{}'::jsonb,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Student Growth, Retention & Reflection Tables
CREATE TABLE IF NOT EXISTS public.session_reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id TEXT NOT NULL,
  topic_title TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  confidence_score INTEGER NOT NULL CHECK (confidence_score BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.recommendation_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recommendation_id TEXT NOT NULL,
  action_type TEXT NOT NULL,
  helpful BOOLEAN NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Feature Flags Engine
CREATE TABLE IF NOT EXISTS public.feature_flags (
  flag_key TEXT PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  target_roles TEXT[] DEFAULT '{all}',
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default feature flags
INSERT INTO public.feature_flags (flag_key, enabled, description)
VALUES
  ('advanced_tutor', true, 'Enable Socratic mode & Tutor persona controls'),
  ('rag', true, 'Enable StudyMate RAG knowledge retrieval'),
  ('voice_mode', true, 'Enable AI Voice study mode'),
  ('exam_simulator', true, 'Enable realistic exam simulator'),
  ('billing', true, 'Enable subscriptions & entitlement checks'),
  ('referrals', true, 'Enable student referral engine'),
  ('mentor_portal', true, 'Enable Mentor portal dashboard'),
  ('institution_mode', true, 'Enable Multi-tenant institution mode')
ON CONFLICT (flag_key) DO UPDATE SET enabled = EXCLUDED.enabled;

-- 8. Enable Row Level Security (RLS)
ALTER TABLE public.knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_response_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_quality_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_webhooks_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendation_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_k_chunks_doc_id ON public.knowledge_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_k_docs_exam_subj ON public.knowledge_documents(exam, subject, topic);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON public.organization_members(user_id, organization_id);
CREATE INDEX IF NOT EXISTS idx_reflections_user ON public.session_reflections(user_id, created_at);
