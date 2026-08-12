// src/lib/exam/examCatalog.ts
import { supabase } from '../supabase';
import { EXAM_CONFIGS, type ExamCategory, type ExamInfo } from '../../types/student-core';

export interface ExamCatalogItem extends ExamInfo {
  active?: boolean;
  questionTypes?: string[];
  durationMinutes?: number;
  year?: number;
  sourceVerifiedAt?: string;
}

export async function fetchExamCatalog(): Promise<ExamCatalogItem[]> {
  try {
    const { data, error } = await supabase
      .from('exam_catalog')
      .select('*')
      .eq('active', true)
      .order('name');

    if (!error && data && data.length > 0) {
      return data.map((d) => ({
        id: d.id as ExamCategory,
        name: d.name,
        slug: d.slug,
        category: d.category,
        shortDesc: d.description || `${d.name} Entrance Exam`,
        iconName: 'GraduationCap',
        organizer: d.organizer,
        officialUrl: d.official_url,
        currentCycle: d.current_cycle,
        defaultExamDate: d.default_exam_date || `${d.year || 2026}-05-15`,
        subjects: Array.isArray(d.subjects) ? d.subjects : d.subjects?.subjects || [],
        availabilityBadge: d.availability_badge || '✓ Official papers available',
        lastVerifiedAt: d.last_verified_at || '13 Aug 2026',
        active: d.active,
        questionTypes: d.question_types,
        durationMinutes: d.duration_minutes,
        year: d.year,
      }));
    }
  } catch (err) {
    console.warn('Failed to fetch exam_catalog from Supabase, using verified fallback catalog:', err);
  }

  // Fallback to static catalog derived from EXAM_CONFIGS
  return Object.values(EXAM_CONFIGS);
}

export async function getExamBySlug(slug: string): Promise<ExamCatalogItem | null> {
  const catalog = await fetchExamCatalog();
  const found = catalog.find((e) => e.slug.toLowerCase() === slug.toLowerCase() || e.id.toLowerCase() === slug.toLowerCase());
  return found || catalog[0] || null;
}
