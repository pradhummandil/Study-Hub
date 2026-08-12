// src/lib/personalization/studentContext.ts
import type { StudentProfile, EducationPath, ExamCategory } from '../../types/student-core';

export interface StudentContextType {
  userId: string;
  profile: StudentProfile | null;
  loading: boolean;
  educationPath: EducationPath;
  targetExam: ExamCategory;
  targetExamYear: string;
  targetGoal: string;
  subjects: string[];
  branch?: string;
  classOrYear?: string;
  dailyStudyMinutes: number;
  activeContext: 'college' | 'competitive';
  isCombinedUser: boolean;
  switchContext: (mode: 'college' | 'competitive') => Promise<void>;
  switchExam: (exam: ExamCategory, year?: string) => Promise<void>;
  updateProfile: (updates: Partial<StudentProfile>) => Promise<StudentProfile | null>;
  refetchContext: () => Promise<void>;
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
  return profile.subject_ratings && Object.keys(profile.subject_ratings).length > 0
    ? Object.keys(profile.subject_ratings)
    : [
        'General Aptitude',
        'Engineering Mathematics',
        'Digital Logic',
        'Computer Organization',
        'Programming',
        'Data Structures',
        'Algorithms',
        'TOC',
        'Compiler Design',
        'Operating Systems',
        'DBMS',
        'Computer Networks',
      ];
}
