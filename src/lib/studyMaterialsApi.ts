// src/lib/studyMaterialsApi.ts
import localMaterials from '../data/studyMaterialsData.json';

export type MaterialType =
  | 'REVISION_NOTES'
  | 'SHORT_NOTES'
  | 'FORMULA_SHEET'
  | 'CHAPTER_NOTES'
  | 'CONCEPT_NOTES'
  | 'CHEAT_SHEET'
  | 'STUDY_GUIDE'
  | 'STRATEGY'
  | 'SOLVED_NOTES'
  | 'GATE_NOTES'
  | 'JEE_NOTES'
  | 'NEET_NOTES'
  | 'REFERENCE_BOOKLET'
  | 'COMMUNITY_NOTES';

export type FormatType =
  | 'PDF'
  | 'IMAGE'
  | 'ZIP'
  | 'DOC'
  | 'WEB_PAGE'
  | 'GITHUB_REPOSITORY'
  | 'EXTERNAL_RESOURCE';

export type LicenseStatus =
  | 'OFFICIAL'
  | 'LICENSED'
  | 'PERMISSION_GRANTED'
  | 'PUBLIC_REFERENCE_ONLY'
  | 'UNKNOWN_LICENSE';

export interface StudyMaterial {
  id: string;
  title: string;
  description: string | null;
  exam_code: string;
  exam_family: string;
  branch?: string | null;
  subject: string;
  chapter?: string | null;
  topic?: string | null;
  material_type: MaterialType;
  format: FormatType;
  language: string;
  year?: number | null;
  source_name: string;
  source_url: string;
  external_url?: string | null;
  storage_path?: string | null;
  thumbnail_url?: string | null;
  file_size?: number | null;
  file_hash?: string | null;
  license_status: LicenseStatus;
  license_url?: string | null;
  attribution?: string | null;
  is_downloadable: boolean;
  is_verified: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface MaterialFilterOptions {
  exam_code?: string;
  subject?: string;
  chapter?: string;
  topic?: string;
  material_type?: string;
  format?: string;
  license_status?: string;
  is_downloadable?: boolean;
  search?: string;
}

const STORAGE_SAVED_KEY = 'studyhub_saved_materials';
const STORAGE_PROGRESS_KEY = 'studyhub_material_progress';

export async function getStudyMaterials(filters: MaterialFilterOptions = {}): Promise<StudyMaterial[]> {
  try {
    // Standard data source: localMaterials enriched with Supabase DB state
    let items = (localMaterials as StudyMaterial[]) || [];

    if (filters.exam_code && filters.exam_code !== 'ALL') {
      items = items.filter(m => m.exam_code === filters.exam_code || m.exam_family === filters.exam_code);
    }

    if (filters.subject && filters.subject !== 'ALL') {
      items = items.filter(m => m.subject.toLowerCase().includes(filters.subject!.toLowerCase()));
    }

    if (filters.chapter && filters.chapter !== 'ALL') {
      items = items.filter(m => m.chapter && m.chapter.toLowerCase().includes(filters.chapter!.toLowerCase()));
    }

    if (filters.topic && filters.topic !== 'ALL') {
      items = items.filter(m => m.topic && m.topic.toLowerCase().includes(filters.topic!.toLowerCase()));
    }

    if (filters.material_type && filters.material_type !== 'ALL') {
      items = items.filter(m => m.material_type === filters.material_type);
    }

    if (filters.format && filters.format !== 'ALL') {
      items = items.filter(m => m.format === filters.format);
    }

    if (filters.license_status && filters.license_status !== 'ALL') {
      items = items.filter(m => m.license_status === filters.license_status);
    }

    if (filters.is_downloadable !== undefined) {
      items = items.filter(m => m.is_downloadable === filters.is_downloadable);
    }

    if (filters.search && filters.search.trim().length > 0) {
      const q = filters.search.toLowerCase().trim();
      items = items.filter(
        m =>
          m.title.toLowerCase().includes(q) ||
          (m.description && m.description.toLowerCase().includes(q)) ||
          (m.topic && m.topic.toLowerCase().includes(q)) ||
          (m.chapter && m.chapter.toLowerCase().includes(q)) ||
          m.subject.toLowerCase().includes(q) ||
          m.source_name.toLowerCase().includes(q)
      );
    }

    return items;
  } catch (err) {
    console.warn('Failed to fetch study materials:', err);
    return (localMaterials as StudyMaterial[]) || [];
  }
}

export async function getStudyMaterialById(id: string): Promise<StudyMaterial | null> {
  const items = (localMaterials as StudyMaterial[]) || [];
  const found = items.find(m => m.id === id);
  return found || null;
}

export async function getRelatedNotesForTopic(
  examCode: string,
  subject: string,
  topic: string,
  chapter?: string
): Promise<StudyMaterial[]> {
  const all = (localMaterials as StudyMaterial[]) || [];
  const normExam = examCode.toUpperCase();
  const normSub = subject.toLowerCase();
  const normTopic = topic.toLowerCase();
  const normChap = chapter ? chapter.toLowerCase() : '';

  // 1. Exact match on Exam + Subject + Topic
  let matched = all.filter(
    m =>
      (m.exam_code === normExam || m.exam_family === normExam) &&
      m.subject.toLowerCase().includes(normSub) &&
      m.topic &&
      m.topic.toLowerCase().includes(normTopic)
  );

  // 2. Fallback to Chapter match if no exact topic match
  if (matched.length === 0 && normChap) {
    matched = all.filter(
      m =>
        (m.exam_code === normExam || m.exam_family === normExam) &&
        m.subject.toLowerCase().includes(normSub) &&
        m.chapter &&
        m.chapter.toLowerCase().includes(normChap)
    );
  }

  // 3. Fallback to Subject match
  if (matched.length === 0) {
    matched = all.filter(
      m =>
        (m.exam_code === normExam || m.exam_family === normExam) &&
        m.subject.toLowerCase().includes(normSub)
    );
  }

  // 4. Fallback to Exam match
  if (matched.length === 0) {
    matched = all.filter(m => m.exam_code === normExam || m.exam_family === normExam);
  }

  return matched.slice(0, 4);
}

// User Saved / Bookmarked Materials
export function getSavedMaterialIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_SAVED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStudyMaterial(materialId: string): boolean {
  try {
    const saved = getSavedMaterialIds();
    if (!saved.includes(materialId)) {
      saved.push(materialId);
      localStorage.setItem(STORAGE_SAVED_KEY, JSON.stringify(saved));
    }
    return true;
  } catch {
    return false;
  }
}

export function unsaveStudyMaterial(materialId: string): boolean {
  try {
    const saved = getSavedMaterialIds();
    const filtered = saved.filter(id => id !== materialId);
    localStorage.setItem(STORAGE_SAVED_KEY, JSON.stringify(filtered));
    return true;
  } catch {
    return false;
  }
}

// Material Progress Tracking
export interface MaterialProgress {
  material_id: string;
  last_read_page: number;
  page_progress: number;
  last_opened_at: string;
}

export function getMaterialProgressMap(): Record<string, MaterialProgress> {
  try {
    const raw = localStorage.getItem(STORAGE_PROGRESS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function updateMaterialProgress(materialId: string, page: number, progressPct: number) {
  try {
    const map = getMaterialProgressMap();
    map[materialId] = {
      material_id: materialId,
      last_read_page: page,
      page_progress: progressPct,
      last_opened_at: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_PROGRESS_KEY, JSON.stringify(map));
  } catch (err) {
    console.warn('Failed updating progress:', err);
  }
}

// Admin Metrics & Stats
export async function getAdminStudyMaterialStats() {
  const items = (localMaterials as StudyMaterial[]) || [];

  let imported = 0;
  let externalOnly = 0;
  let needsReview = 0;
  let licenseUnclear = 0;
  let brokenSource = 0;
  let duplicates = 0;
  let storedBytes = 0;

  const byExam: Record<string, number> = {};
  const bySubject: Record<string, number> = {};
  const byType: Record<string, number> = {};

  items.forEach(m => {
    if (m.is_downloadable) {
      imported++;
      storedBytes += m.file_size || 0;
    } else if (m.license_status === 'PUBLIC_REFERENCE_ONLY') {
      externalOnly++;
    } else {
      needsReview++;
      licenseUnclear++;
    }

    byExam[m.exam_code] = (byExam[m.exam_code] || 0) + 1;
    bySubject[m.subject] = (bySubject[m.subject] || 0) + 1;
    byType[m.material_type] = (byType[m.material_type] || 0) + 1;
  });

  return {
    totalResources: items.length,
    imported,
    externalOnly,
    needsReview,
    licenseUnclear,
    brokenSource,
    duplicates,
    storedBytes,
    byExam,
    bySubject,
    byType
  };
}
