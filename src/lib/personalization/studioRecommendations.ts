// src/lib/personalization/studioRecommendations.ts
import type { StudentProfile } from '../../types/student-core';

export interface StudioResourceItem {
  id: string;
  title: string;
  category: 'Competitive' | 'School' | 'College' | 'Subjects' | 'Skills';
  examOrBranch?: string;
  fileType: 'PDF' | 'Interactive' | 'PYQ Set' | 'Formula Sheet' | 'Lab Manual';
  downloadUrl?: string;
  officialSource?: string;
  isVerified: boolean;
}

export function getPersonalizedStudioResources(profile: StudentProfile | null, activeContext: 'college' | 'competitive'): StudioResourceItem[] {
  if (!profile) {
    return [
      {
        id: 'res-gen-01',
        title: 'Computer Networks Fundamental Architecture Notes',
        category: 'Subjects',
        fileType: 'PDF',
        isVerified: true,
        officialSource: 'IIT Kharagpur Courseware',
      },
      {
        id: 'res-gen-02',
        title: 'GATE Computer Science 10-Year Master Formula Book',
        category: 'Competitive',
        examOrBranch: 'GATE',
        fileType: 'Formula Sheet',
        isVerified: true,
        officialSource: 'IIT Madras Master Archive',
      },
    ];
  }

  if (activeContext === 'college' || profile.education_path === 'college' || profile.education_path === 'school') {
    const branch = profile.branch_major || 'Engineering';
    const degree = profile.degree || 'B.Tech';
    const year = profile.college_year || '3rd Year';

    return [
      {
        id: 'res-col-01',
        title: `${degree} ${branch} (${year}) Semester Exam Question Bank`,
        category: 'College',
        examOrBranch: `${degree} ${branch}`,
        fileType: 'PYQ Set',
        isVerified: true,
        officialSource: 'University Academic Portal',
      },
      {
        id: 'res-col-02',
        title: 'Computer Networks & Distributed Systems Lab Guide',
        category: 'College',
        examOrBranch: branch,
        fileType: 'Lab Manual',
        isVerified: true,
      },
      {
        id: 'res-col-03',
        title: 'Database Management Systems Semester Revision Summary',
        category: 'College',
        fileType: 'PDF',
        isVerified: true,
      },
    ];
  }

  const exam = profile.target_exam || 'GATE';
  return [
    {
      id: `res-comp-01`,
      title: `${exam} ${profile.target_exam_year || '2027'} Official Syllabus & Weightage Map`,
      category: 'Competitive',
      examOrBranch: exam,
      fileType: 'PDF',
      isVerified: true,
      officialSource: 'Official Exam Authority',
    },
    {
      id: `res-comp-02`,
      title: `${exam} High-Yield Previous Year Paper Collection (2015–2025)`,
      category: 'Competitive',
      examOrBranch: exam,
      fileType: 'PYQ Set',
      isVerified: true,
      officialSource: 'Official Master Archive',
    },
    {
      id: `res-comp-03`,
      title: `${exam} Core Topic Cheat Sheet & Rapid Revision Notes`,
      category: 'Competitive',
      examOrBranch: exam,
      fileType: 'Formula Sheet',
      isVerified: true,
    },
  ];
}
