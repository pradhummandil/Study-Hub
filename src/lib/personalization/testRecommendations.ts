// src/lib/personalization/testRecommendations.ts
import type { StudentProfile, MockTest } from '../../types/student-core';

export function getPersonalizedMockTests(profile: StudentProfile | null, activeContext: 'college' | 'competitive'): MockTest[] {
  if (!profile || activeContext === 'competitive' || profile.education_path === 'competitive') {
    const exam = profile?.target_exam || 'GATE';
    const year = profile?.target_exam_year || '2027';

    return [
      {
        id: `mock-${exam.toLowerCase()}-full-01`,
        exam,
        title: `${exam} ${year} Full Syllabus Official PYQ Simulation`,
        description: `Full length timed exam simulation for ${exam} with official scoring rules & negative marking.`,
        total_questions: 15,
        duration_minutes: 45,
        total_marks: 50,
        difficulty: 'Medium',
        test_type: 'OFFICIAL PYQ',
      },
      {
        id: `mock-${exam.toLowerCase()}-sectional-01`,
        exam,
        title: `${exam} High-Yield Sectional Drill`,
        description: 'Speed practice on core high-weightage topics.',
        subject: profile?.subject_ratings ? Object.keys(profile.subject_ratings)[0] : 'Core Subject',
        total_questions: 10,
        duration_minutes: 30,
        total_marks: 30,
        difficulty: 'Hard',
        test_type: 'AI-GENERATED',
      },
    ];
  }

  // College / School pathway test recommendations
  const degree = profile.degree || 'B.Tech';
  const branch = profile.branch_major || 'CS';

  return [
    {
      id: 'mock-college-sem-01',
      exam: 'College',
      title: `${degree} ${branch} Mid-Semester Practice Quiz`,
      description: 'Test your understanding of current semester syllabus topics before exams.',
      subject: profile.college_subjects?.[0] || 'Computer Networks',
      total_questions: 10,
      duration_minutes: 25,
      total_marks: 20,
      difficulty: 'Medium',
      test_type: 'ADMIN TEST',
    },
    {
      id: 'mock-college-unit-01',
      exam: 'College',
      title: 'Academic Unit Test & Practice Problems',
      description: 'Quick check on recent assignment concepts.',
      subject: profile.college_subjects?.[1] || 'DBMS',
      total_questions: 5,
      duration_minutes: 15,
      total_marks: 10,
      difficulty: 'Easy',
      test_type: 'AI-GENERATED',
    },
  ];
}
