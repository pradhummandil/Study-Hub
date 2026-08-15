-- Migration: 20260814100000_question_engine_v2.sql
-- Question Engine 2.0 Schema Architecture

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 1. Canonical Questions Table
CREATE TABLE IF NOT EXISTS public.questions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  exam_id TEXT NOT NULL DEFAULT 'GATE',
  exam_name TEXT NOT NULL DEFAULT 'GATE CS',
  exam_family TEXT NOT NULL DEFAULT 'GATE', -- JEE, NEET, GATE, CUET, UPSC, SSC, etc.
  exam_code TEXT NOT NULL DEFAULT 'GATE_CSE', -- JEE_MAIN, JEE_ADVANCED, NEET_UG, GATE_CSE, GATE_DA, GATE_ECE, GATE_EE, GATE_ME, GATE_CE, etc.
  year INTEGER NOT NULL DEFAULT 2026,
  session TEXT, -- 'January', 'April', 'Paper 1', 'Paper 2', 'Shift 1', etc.
  paper TEXT,
  subject TEXT NOT NULL,
  chapter TEXT NOT NULL,
  topic TEXT NOT NULL,
  subtopic TEXT,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  question_type TEXT NOT NULL CHECK (question_type IN (
    'MCQ_SINGLE', 'MCQ_MULTIPLE', 'NUMERICAL', 'ASSERTION_REASON',
    'MATCHING', 'TRUE_FALSE', 'INTEGER', 'SUBJECTIVE', 'PASSAGE',
    'COMPREHENSION', 'STATEMENT_BASED'
  )),
  language TEXT NOT NULL DEFAULT 'en',
  question_text TEXT NOT NULL,
  question_html TEXT,
  question_image TEXT,
  options JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of { id: string, text: string, image?: string }
  correct_answer JSONB NOT NULL, -- "A" or ["A", "B"] or 42.5 or range [42.0, 43.0]
  answer_format TEXT DEFAULT 'exact',
  solution_text TEXT,
  solution_steps JSONB DEFAULT '[]'::jsonb, -- Array of string steps
  explanation TEXT,
  hint TEXT,
  concept TEXT,
  formula TEXT,
  common_mistake TEXT,
  marks NUMERIC(4, 2) NOT NULL DEFAULT 1.0,
  negative_marks NUMERIC(4, 2) NOT NULL DEFAULT 0.33,
  question_number INTEGER,
  source_type TEXT NOT NULL CHECK (source_type IN ('OFFICIAL_PYQ', 'LICENSED_PYQ', 'STUDY_HUB_PRACTICE', 'EXTERNAL_REFERENCE')),
  source_url TEXT,
  source_name TEXT DEFAULT 'Official Paper',
  official_source_url TEXT,
  license_status TEXT DEFAULT 'PUBLIC_OFFICIAL',
  attribution TEXT,
  verified BOOLEAN NOT NULL DEFAULT true,
  published BOOLEAN NOT NULL DEFAULT true,
  classifier_confidence NUMERIC(3, 2) DEFAULT 1.0,
  classifier_source TEXT DEFAULT 'DETERMINISTIC',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for high performance querying
CREATE INDEX IF NOT EXISTS idx_questions_exam_code ON public.questions (exam_code);
CREATE INDEX IF NOT EXISTS idx_questions_exam_family ON public.questions (exam_family);
CREATE INDEX IF NOT EXISTS idx_questions_subject ON public.questions (subject);
CREATE INDEX IF NOT EXISTS idx_questions_chapter ON public.questions (chapter);
CREATE INDEX IF NOT EXISTS idx_questions_topic ON public.questions (topic);
CREATE INDEX IF NOT EXISTS idx_questions_year ON public.questions (year);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON public.questions (difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_type ON public.questions (question_type);
CREATE INDEX IF NOT EXISTS idx_questions_source_type ON public.questions (source_type);
CREATE INDEX IF NOT EXISTS idx_questions_published ON public.questions (published);

-- GIN trigram index for full-text question search
CREATE INDEX IF NOT EXISTS idx_questions_text_trgm ON public.questions USING gin (question_text gin_trgm_ops);

-- 2. Question Versions Table
CREATE TABLE IF NOT EXISTS public.question_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id TEXT NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  question_text TEXT NOT NULL,
  solution_text TEXT,
  source TEXT,
  verified_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Question Sources Table (Canonical & External References)
CREATE TABLE IF NOT EXISTS public.question_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id TEXT NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  source_name TEXT NOT NULL, -- 'Official GATE', 'ExamSIDE', 'MathonGo', etc.
  source_url TEXT,
  source_type TEXT NOT NULL CHECK (source_type IN ('OFFICIAL', 'LICENSED', 'REFERENCE', 'STUDY_HUB')),
  source_question_id TEXT,
  license_status TEXT DEFAULT 'REFERENCE_ONLY',
  republish_text BOOLEAN DEFAULT false,
  accessed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Taxonomy Hierarchy Tables
CREATE TABLE IF NOT EXISTS public.exams (
  id TEXT PRIMARY KEY, -- 'GATE_CSE', 'JEE_MAIN', 'NEET_UG', etc.
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  family TEXT NOT NULL, -- 'GATE', 'JEE', 'NEET', etc.
  branch TEXT,
  category TEXT NOT NULL,
  organizer TEXT,
  official_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.exam_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_code TEXT NOT NULL REFERENCES public.exams(code) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  display_order INTEGER DEFAULT 1,
  UNIQUE(exam_code, code)
);

CREATE TABLE IF NOT EXISTS public.exam_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_code TEXT NOT NULL,
  subject_name TEXT NOT NULL,
  chapter_name TEXT NOT NULL,
  topic_name TEXT NOT NULL,
  subtopic_name TEXT,
  importance TEXT DEFAULT 'Medium', -- 'High', 'Medium', 'Low'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Saved Questions Table
CREATE TABLE IF NOT EXISTS public.saved_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  question_id TEXT NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

-- 6. Question Sync Jobs Table (Admin Ingestion Auditing)
CREATE TABLE IF NOT EXISTS public.question_sync_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'RUNNING',
  records_found INTEGER DEFAULT 0,
  records_imported INTEGER DEFAULT 0,
  duplicates INTEGER DEFAULT 0,
  errors JSONB DEFAULT '[]'::jsonb
);

-- Row Level Security (RLS) Policies
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_questions ENABLE ROW LEVEL SECURITY;

-- Public read for questions & taxonomy
CREATE POLICY "Public read for published questions" ON public.questions FOR SELECT USING (published = true);
CREATE POLICY "Public read for question sources" ON public.question_sources FOR SELECT USING (true);
CREATE POLICY "Public read for exams taxonomy" ON public.exams FOR SELECT USING (true);
CREATE POLICY "Public read for exam subjects" ON public.exam_subjects FOR SELECT USING (true);
CREATE POLICY "Public read for exam topics" ON public.exam_topics FOR SELECT USING (true);

-- Saved questions policy for authenticated user
CREATE POLICY "Users read own saved questions" ON public.saved_questions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own saved questions" ON public.saved_questions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own saved questions" ON public.saved_questions FOR DELETE USING (auth.uid() = user_id);
