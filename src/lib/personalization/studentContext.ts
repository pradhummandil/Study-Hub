// src/lib/personalization/studentContext.ts
import type { StudentProfile, EducationPath } from '../../types/student-core';

export interface StudentContextType {
  profile: StudentProfile | null;
  loading: boolean;
  educationPath: EducationPath;
  activeContext: 'college' | 'competitive';
  isCombinedUser: boolean;
  switchContext: (mode: 'college' | 'competitive') => Promise<void>;
  updateProfile: (updates: Partial<StudentProfile>) => Promise<StudentProfile | null>;
  hasRealAttempts: boolean;
  actualAccuracyPct: number;
  actualQuestionsSolved: number;
  actualStreakDays: number;
}

export function getActiveSubjects(profile: StudentProfile | null, mode: 'college' | 'competitive'): string[] {
  if (!profile) return ['General Learning'];
  if (mode === 'college') {
    return profile.college_subjects && profile.college_subjects.length > 0
      ? profile.college_subjects
      : ['Computer Networks', 'DBMS', 'Operating Systems', 'Software Engineering'];
  }
  return profile.subject_ratings ? Object.keys(profile.subject_ratings) : ['General Aptitude', 'Core Engineering'];
}
