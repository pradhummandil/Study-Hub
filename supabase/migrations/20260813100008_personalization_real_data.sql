-- Migration: 20260813100008_personalization_real_data.sql
-- Personalization, Auth-Gated Experience & Verified Exam Catalog Schema

-- 1. Extend student_profiles table with education path & personalization fields
ALTER TABLE IF EXISTS public.student_profiles
  ADD COLUMN IF NOT EXISTS education_path TEXT DEFAULT 'competitive',
  ADD COLUMN IF NOT EXISTS education_stage TEXT DEFAULT 'undergraduate',
  ADD COLUMN IF NOT EXISTS school_class TEXT,
  ADD COLUMN IF NOT EXISTS school_board TEXT,
  ADD COLUMN IF NOT EXISTS degree TEXT,
  ADD COLUMN IF NOT EXISTS college_year TEXT,
  ADD COLUMN IF NOT EXISTS branch_major TEXT,
  ADD COLUMN IF NOT EXISTS college_subjects TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS competitive_exam_enabled BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS active_context TEXT DEFAULT 'competitive';

-- 2. Create Exam Catalog table
CREATE TABLE IF NOT EXISTS public.exam_catalog (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL, -- Engineering, Medical, Management, Law, Government, Teaching, University, Defence, Design, Other
  organizer TEXT NOT NULL,
  official_url TEXT NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT TRUE,
  current_cycle TEXT NOT NULL, -- e.g. '2026' or '2027'
  subjects JSONB DEFAULT '[]'::jsonb,
  question_types TEXT[] DEFAULT '{"MCQ", "MSQ", "Numerical"}',
  duration_minutes INTEGER DEFAULT 180,
  scoring_rules JSONB DEFAULT '{"correct": 2, "wrong": -0.66}'::jsonb,
  year INTEGER DEFAULT 2026,
  availability_badge TEXT DEFAULT '✓ Official papers available',
  source_verified_at TIMESTAMPTZ DEFAULT NOW(),
  last_verified_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Exam Sources registry
CREATE TABLE IF NOT EXISTS public.exam_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id TEXT NOT NULL REFERENCES public.exam_catalog(id) ON DELETE CASCADE,
  source_url TEXT NOT NULL,
  source_type TEXT NOT NULL, -- official_archive, official_question_paper, official_answer_key, official_notice, official_syllabus, official_exam_pattern
  source_name TEXT NOT NULL,
  official BOOLEAN DEFAULT TRUE,
  verified BOOLEAN DEFAULT TRUE,
  last_checked_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Onboarding Progress tracking table
CREATE TABLE IF NOT EXISTS public.onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  current_step INTEGER DEFAULT 1,
  completed_steps TEXT[] DEFAULT '{}',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.exam_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;

-- Public read access for Exam Catalog & Sources
CREATE POLICY "Public read for exam_catalog"
  ON public.exam_catalog FOR SELECT
  USING (true);

CREATE POLICY "Public read for exam_sources"
  ON public.exam_sources FOR SELECT
  USING (true);

-- User-scoped access for Onboarding Progress
CREATE POLICY "Users can manage their onboarding progress"
  ON public.onboarding_progress FOR ALL
  USING (auth.uid() = user_id);

-- Admin permissions for Exam Catalog & Sources
CREATE POLICY "Admins can manage exam_catalog"
  ON public.exam_catalog FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can manage exam_sources"
  ON public.exam_sources FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')
    )
  );
