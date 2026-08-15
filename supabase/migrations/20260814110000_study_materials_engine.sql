-- Migration: 20260814110000_study_materials_engine.sql
-- Study Materials & Revision Notes Engine 1.0 Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 1. Study Material Sources Catalog
CREATE TABLE IF NOT EXISTS public.study_material_sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  base_url TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('OFFICIAL', 'LICENSED', 'COMMUNITY', 'AGGREGATOR', 'INSTITUTION', 'GITHUB')),
  license_status TEXT NOT NULL CHECK (license_status IN ('OFFICIAL', 'LICENSED', 'PERMISSION_GRANTED', 'PUBLIC_REFERENCE_ONLY', 'UNKNOWN_LICENSE')),
  license_url TEXT,
  terms_checked_at TIMESTAMPTZ DEFAULT NOW(),
  redistribution_allowed BOOLEAN DEFAULT false,
  external_link_allowed BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Default Sources
INSERT INTO public.study_material_sources (id, name, base_url, source_type, license_status, redistribution_allowed, external_link_allowed, notes)
VALUES 
  ('mathongo', 'MathonGo', 'https://www.mathongo.com', 'AGGREGATOR', 'PUBLIC_REFERENCE_ONLY', false, true, 'Free web revision notes & formula sheets for JEE Main.'),
  ('iitian_academy', 'IITian Academy', 'https://www.iitianacademy.com', 'AGGREGATOR', 'PUBLIC_REFERENCE_ONLY', false, true, 'Chapter-wise JEE Advanced Physics study materials.'),
  ('practice_paper', 'PracticePaper', 'https://practicepaper.in', 'AGGREGATOR', 'PUBLIC_REFERENCE_ONLY', false, true, 'GATE CSE notes catalog.'),
  ('iitians_gate', 'IITians GATE Classes', 'https://iitiansgateclasses.com', 'INSTITUTION', 'PUBLIC_REFERENCE_ONLY', false, true, 'Computer Science GATE study materials.'),
  ('github_gate2027', 'Aparnaraha/Gate2027 GitHub', 'https://github.com/Aparnaraha/Gate2027', 'GITHUB', 'COMMUNITY_NOTES', false, true, 'GATE 2027 Community Notes repository.')
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, base_url = EXCLUDED.base_url, notes = EXCLUDED.notes;

-- 2. Study Materials Main Table
CREATE TABLE IF NOT EXISTS public.study_materials (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  description TEXT,
  exam_code TEXT NOT NULL, -- JEE_MAIN, JEE_ADVANCED, GATE_CSE, NEET_UG, etc.
  exam_family TEXT NOT NULL, -- JEE, GATE, NEET, etc.
  branch TEXT, -- CSE, ECE, EE, ME, CE, etc.
  subject TEXT NOT NULL,
  chapter TEXT,
  topic TEXT,
  material_type TEXT NOT NULL CHECK (material_type IN (
    'REVISION_NOTES', 'SHORT_NOTES', 'FORMULA_SHEET', 'CHAPTER_NOTES',
    'CONCEPT_NOTES', 'CHEAT_SHEET', 'STUDY_GUIDE', 'STRATEGY',
    'SOLVED_NOTES', 'GATE_NOTES', 'JEE_NOTES', 'NEET_NOTES',
    'REFERENCE_BOOKLET', 'COMMUNITY_NOTES'
  )),
  format TEXT NOT NULL CHECK (format IN (
    'PDF', 'IMAGE', 'ZIP', 'DOC', 'WEB_PAGE', 'GITHUB_REPOSITORY', 'EXTERNAL_RESOURCE'
  )),
  language TEXT NOT NULL DEFAULT 'English',
  year INTEGER,
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  external_url TEXT,
  storage_path TEXT,
  thumbnail_url TEXT,
  file_size BIGINT,
  file_hash TEXT, -- SHA256 hash for deduplication
  license_status TEXT NOT NULL CHECK (license_status IN (
    'OFFICIAL', 'LICENSED', 'PERMISSION_GRANTED', 'PUBLIC_REFERENCE_ONLY', 'UNKNOWN_LICENSE'
  )),
  license_url TEXT,
  attribution TEXT,
  is_downloadable BOOLEAN NOT NULL DEFAULT false,
  is_verified BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast filtering & text search
CREATE INDEX IF NOT EXISTS idx_study_materials_exam_code ON public.study_materials (exam_code);
CREATE INDEX IF NOT EXISTS idx_study_materials_exam_family ON public.study_materials (exam_family);
CREATE INDEX IF NOT EXISTS idx_study_materials_subject ON public.study_materials (subject);
CREATE INDEX IF NOT EXISTS idx_study_materials_chapter ON public.study_materials (chapter);
CREATE INDEX IF NOT EXISTS idx_study_materials_topic ON public.study_materials (topic);
CREATE INDEX IF NOT EXISTS idx_study_materials_type ON public.study_materials (material_type);
CREATE INDEX IF NOT EXISTS idx_study_materials_format ON public.study_materials (format);
CREATE INDEX IF NOT EXISTS idx_study_materials_license ON public.study_materials (license_status);
CREATE INDEX IF NOT EXISTS idx_study_materials_file_hash ON public.study_materials (file_hash);

-- GIN trigram index for full text title & topic searching
CREATE INDEX IF NOT EXISTS idx_study_materials_title_trgm ON public.study_materials USING gin (title gin_trgm_ops);

-- 3. Study Material Versions Table
CREATE TABLE IF NOT EXISTS public.study_material_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id TEXT NOT NULL REFERENCES public.study_materials(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  file_hash TEXT,
  source_url TEXT,
  published_at TIMESTAMPTZ,
  retrieved_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active'
);

-- 4. User Saved Materials Table
CREATE TABLE IF NOT EXISTS public.user_saved_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  material_id TEXT NOT NULL REFERENCES public.study_materials(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, material_id)
);

-- 5. Study Material Progress Table
CREATE TABLE IF NOT EXISTS public.study_material_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  material_id TEXT NOT NULL REFERENCES public.study_materials(id) ON DELETE CASCADE,
  last_read_page INTEGER DEFAULT 1,
  page_progress DOUBLE PRECISION DEFAULT 0.0,
  last_opened_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, material_id)
);

-- Row Level Security (RLS) Policies
ALTER TABLE public.study_material_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_material_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_saved_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_material_progress ENABLE ROW LEVEL SECURITY;

-- Public Read Policies
CREATE POLICY "Public read for material sources" ON public.study_material_sources FOR SELECT USING (true);
CREATE POLICY "Public read for study materials" ON public.study_materials FOR SELECT USING (is_verified = true);
CREATE POLICY "Public read for material versions" ON public.study_material_versions FOR SELECT USING (true);

-- User Policies for Saved Materials & Progress
CREATE POLICY "Users read own saved materials" ON public.user_saved_materials FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own saved materials" ON public.user_saved_materials FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own saved materials" ON public.user_saved_materials FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users read own progress" ON public.study_material_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users upsert own progress" ON public.study_material_progress FOR ALL USING (auth.uid() = user_id);
