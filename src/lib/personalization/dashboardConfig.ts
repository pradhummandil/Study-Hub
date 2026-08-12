// src/lib/personalization/dashboardConfig.ts
import type { EducationPath } from '../../types/student-core';

export type DashboardModuleId =
  | 'exam_countdown'
  | 'roadmap'
  | 'pyq'
  | 'mock_tests'
  | 'revision'
  | 'performance'
  | 'study_ai'
  | 'focus_room'
  | 'subjects'
  | 'assignments'
  | 'semester_tests'
  | 'notes'
  | 'college_today'
  | 'competitive_priority'
  | 'recommended_focus'
  | 'combined_progress';

export interface DashboardConfig {
  title: string;
  subTitle: string;
  modules: DashboardModuleId[];
}

export function getDashboardConfig(path: EducationPath, activeContext: 'college' | 'competitive'): DashboardConfig {
  if (path === 'both') {
    return {
      title: 'My Study Operating System',
      subTitle: 'Combined view of your Academic Semester & Competitive Exam goals.',
      modules: [
        'college_today',
        'competitive_priority',
        'recommended_focus',
        'combined_progress',
        'study_ai',
        'focus_room',
      ],
    };
  }

  if (path === 'school' || path === 'college' || activeContext === 'college') {
    return {
      title: 'My Semester Dashboard',
      subTitle: 'Focus on coursework, semester assignments, notes, and academic revision.',
      modules: [
        'subjects',
        'assignments',
        'semester_tests',
        'notes',
        'revision',
        'study_ai',
        'focus_room',
      ],
    };
  }

  return {
    title: 'My Exam Dashboard',
    subTitle: 'Targeted preparation system with PYQs, roadmaps, mock tests, and revision.',
    modules: [
      'exam_countdown',
      'roadmap',
      'pyq',
      'mock_tests',
      'revision',
      'performance',
      'study_ai',
    ],
  };
}
