// src/lib/personalization/communityRecommendations.ts
import type { StudentProfile } from '../../types/student-core';

export interface CommunityCircle {
  id: string;
  name: string;
  category: string;
  description: string;
  memberCount: number;
  postCount: number;
}

export function getPersonalizedCircles(profile: StudentProfile | null, activeContext: 'college' | 'competitive'): CommunityCircle[] {
  if (!profile) {
    return [
      {
        id: 'circle-gate-cs',
        name: 'GATE CS 2027 Aspirants',
        category: 'Competitive Exam',
        description: 'Peer discussion circle for GATE Computer Science aspirants.',
        memberCount: 0,
        postCount: 0,
      },
    ];
  }

  if (activeContext === 'college' || profile.education_path === 'college' || profile.education_path === 'school') {
    const branch = profile.branch_major || 'CS / IT';
    const degree = profile.degree || 'B.Tech';
    return [
      {
        id: 'circle-college-dept',
        name: `${degree} ${branch} Semester Peer Circle`,
        category: 'College Academic',
        description: `Discussions, notes, and lab assignments for ${degree} ${branch} students.`,
        memberCount: 0,
        postCount: 0,
      },
      {
        id: 'circle-college-subjects',
        name: 'Semester Revision & Doubts',
        category: 'Academic Subjects',
        description: 'Ask and answer doubts regarding mid-sem and end-sem exams.',
        memberCount: 0,
        postCount: 0,
      },
    ];
  }

  const exam = profile.target_exam || 'GATE';
  const year = profile.target_exam_year || '2027';

  return [
    {
      id: `circle-${exam.toLowerCase()}`,
      name: `${exam} ${year} Strategy & PYQ Discussions`,
      category: 'Competitive Exam',
      description: `Official study circle for ${exam} ${year} candidates.`,
      memberCount: 0,
      postCount: 0,
    },
    {
      id: `circle-mock-${exam.toLowerCase()}`,
      name: `${exam} Mock Test Analysis & Doubts`,
      category: 'Mock Analysis',
      description: 'Discuss mock test solutions, trick questions, and scoring strategies.',
      memberCount: 0,
      postCount: 0,
    },
  ];
}
