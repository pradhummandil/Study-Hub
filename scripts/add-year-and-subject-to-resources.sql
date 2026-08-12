-- Migration: Add year and subject columns and performance indexes to resources table
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS year INTEGER;
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS subject TEXT;

CREATE INDEX IF NOT EXISTS idx_resources_exam_tag ON public.resources(exam_tag);
CREATE INDEX IF NOT EXISTS idx_resources_category ON public.resources(category);
CREATE INDEX IF NOT EXISTS idx_resources_year ON public.resources(year);
CREATE INDEX IF NOT EXISTS idx_resources_subject ON public.resources(subject);
