// src/types/student-core.ts

export type ExamCategory =
  | 'GATE'
  | 'JEE Main'
  | 'JEE Advanced'
  | 'NEET'
  | 'CUET'
  | 'UPSC'
  | 'UGC NET'
  | 'CLAT'
  | 'NIFT'
  | 'Other';

export interface ExamInfo {
  id: ExamCategory;
  name: string;
  shortDesc: string;
  iconName: string;
  defaultExamDate?: string; // YYYY-MM-DD
  subjects: string[];
}

export const EXAM_CONFIGS: Record<ExamCategory, ExamInfo> = {
  GATE: {
    id: 'GATE',
    name: 'GATE',
    shortDesc: 'Graduate Aptitude Test in Engineering for M.Tech & PSUs',
    iconName: 'Cpu',
    defaultExamDate: '2027-02-06',
    subjects: [
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
      'Software Engineering',
    ],
  },
  'JEE Main': {
    id: 'JEE Main',
    name: 'JEE Main',
    shortDesc: 'Joint Entrance Examination for NITs, IIITs & CFTIs',
    iconName: 'Atom',
    defaultExamDate: '2027-01-22',
    subjects: [
      'Physics — Mechanics',
      'Physics — Electromagnetism',
      'Physics — Optics & Modern',
      'Chemistry — Physical',
      'Chemistry — Inorganic',
      'Chemistry — Organic',
      'Mathematics — Algebra',
      'Mathematics — Calculus',
      'Mathematics — Coordinate Geometry',
    ],
  },
  'JEE Advanced': {
    id: 'JEE Advanced',
    name: 'JEE Advanced',
    shortDesc: 'Premier Entrance Exam for Indian Institutes of Technology (IITs)',
    iconName: 'Zap',
    defaultExamDate: '2027-05-23',
    subjects: [
      'Advanced Physics',
      'Advanced Organic Chemistry',
      'Advanced Physical Chemistry',
      'Advanced Inorganic Chemistry',
      'Advanced Calculus & Algebra',
      'Geometry & Vectors',
    ],
  },
  NEET: {
    id: 'NEET',
    name: 'NEET UG',
    shortDesc: 'National Eligibility cum Entrance Test for MBBS / BDS',
    iconName: 'HeartPulse',
    defaultExamDate: '2027-05-02',
    subjects: [
      'Botany — Cell & Genetics',
      'Botany — Plant Physiology',
      'Zoology — Human Physiology',
      'Zoology — Diversity & Biomolecules',
      'Physics — Mechanics & Thermodynamics',
      'Physics — Electricity & Waves',
      'Chemistry — Organic & Inorganic',
    ],
  },
  CUET: {
    id: 'CUET',
    name: 'CUET UG',
    shortDesc: 'Common University Entrance Test for Central Universities',
    iconName: 'GraduationCap',
    defaultExamDate: '2027-05-15',
    subjects: [
      'General Test & Reasoning',
      'English Language',
      'Domain — Computer Science',
      'Domain — Mathematics',
      'Domain — Physics',
      'Domain — Economics',
    ],
  },
  UPSC: {
    id: 'UPSC',
    name: 'UPSC CSE',
    shortDesc: 'Civil Services Examination for IAS, IPS & IFS',
    iconName: 'Landmark',
    defaultExamDate: '2027-05-30',
    subjects: [
      'Polity & Governance',
      'Indian History & Culture',
      'Geography & Environment',
      'Indian Economy',
      'Science & Technology',
      'CSAT Aptitude',
      'Current Affairs',
    ],
  },
  'UGC NET': {
    id: 'UGC NET',
    name: 'UGC NET',
    shortDesc: 'National Eligibility Test for Assistant Professor & JRF',
    iconName: 'BookOpen',
    defaultExamDate: '2027-06-18',
    subjects: [
      'Paper 1 — General Teaching & Research',
      'Computer Science & Applications',
      'Data Structures & Algorithms',
      'System Software & OS',
      'Database Systems & Web Tech',
    ],
  },
  CLAT: {
    id: 'CLAT',
    name: 'CLAT',
    shortDesc: 'Common Law Admission Test for National Law Universities',
    iconName: 'Scale',
    defaultExamDate: '2027-12-05',
    subjects: [
      'Legal Reasoning',
      'Logical Reasoning',
      'English Language',
      'Current Affairs & GK',
      'Quantitative Techniques',
    ],
  },
  NIFT: {
    id: 'NIFT',
    name: 'NIFT Entrance',
    shortDesc: 'National Institute of Fashion Technology Entrance',
    iconName: 'Palette',
    defaultExamDate: '2027-02-14',
    subjects: [
      'General Ability Test (GAT)',
      'Creative Ability Test (CAT)',
      'Analytical & Logical Ability',
      'Communication & English',
    ],
  },
  Other: {
    id: 'Other',
    name: 'Custom Exam',
    shortDesc: 'Personalized study schedule for university or professional exams',
    iconName: 'Sparkles',
    subjects: [
      'Core Subject 1',
      'Core Subject 2',
      'Core Subject 3',
      'Aptitude & Practice',
    ],
  },
};

export type TargetGoal =
  | 'Top Rank'
  | 'Excellent Score'
  | 'Strong Score'
  | "Just Clear the Exam"
  | "I'm Exploring";

export type CurrentLevel =
  | 'Beginner'
  | 'Intermediate'
  | 'Advanced'
  | "I've already started seriously";

export type SelfRating = 'Weak' | 'Average' | 'Strong';

export interface StudentProfile {
  user_id: string;
  target_exam: ExamCategory;
  target_exam_year: string;
  target_goal: TargetGoal;
  target_rank?: string;
  target_score?: string;
  daily_study_minutes: number; // e.g. 60, 120, 180, 240, 300
  current_level: CurrentLevel;
  exam_date?: string | null;
  onboarding_completed: boolean;
  subject_ratings?: Record<string, SelfRating>;
  created_at?: string;
  updated_at?: string;
}

export interface StudentSubjectProgress {
  id?: string;
  user_id: string;
  exam: string;
  subject: string;
  status: 'not_started' | 'learning' | 'practicing' | 'revision' | 'completed';
  confidence: 'weak' | 'average' | 'strong';
  progress: number; // 0 to 100
  accuracy: number; // 0 to 100
  questions_attempted: number;
  questions_correct: number;
  last_studied_at?: string | null;
}

// ── Roadmap ────────────────────────────────────────────────────────────────
export interface RoadmapTopic {
  id: string;
  section_id: string;
  subject: string;
  title: string;
  description: string;
  estimated_hours: number;
  subtopics: string[];
  status?: 'not_started' | 'in_progress' | 'completed';
  progress_pct?: number;
}

export interface RoadmapSection {
  id: string;
  roadmap_id: string;
  title: string;
  category: 'FOUNDATION' | 'CORE' | 'ADVANCED' | 'EXAM MODE';
  topics: RoadmapTopic[];
}

export interface RoadmapData {
  id: string;
  exam: string;
  title: string;
  description: string;
  total_topics: number;
  completed_topics: number;
  overall_progress: number;
  sections: RoadmapSection[];
}

// ── Practice & PYQs ────────────────────────────────────────────────────────
export type QuestionType = 'MCQ' | 'MSQ' | 'Numerical' | 'True/False';
export type QuestionDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface PracticeQuestion {
  id: string;
  exam: string;
  year?: number | null;
  subject: string;
  topic: string;
  difficulty: QuestionDifficulty;
  question_type: QuestionType;
  question_text: string;
  options?: string[]; // e.g. ["A. Option 1", "B. Option 2", ...]
  correct_answer: any; // "A" or ["A", "B"] or 42
  explanation?: string;
  is_official_pyq: boolean;
}

export interface UserQuestionAttempt {
  id?: string;
  user_id: string;
  question_id: string;
  exam: string;
  subject: string;
  topic: string;
  user_answer: any;
  is_correct: boolean;
  time_taken_seconds: number;
  marked_for_review?: boolean;
  saved_as_mistake?: boolean;
  created_at?: string;
}

export interface PracticeSessionResult {
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  accuracyPct: number;
  totalTimeSeconds: number;
  strongTopics: string[];
  weakTopics: string[];
}

// ── Mock Tests ─────────────────────────────────────────────────────────────
export interface MockTest {
  id: string;
  exam: string;
  title: string;
  description?: string;
  subject?: string | null; // null for full syllabus
  total_questions: number;
  duration_minutes: number;
  total_marks: number;
  difficulty: QuestionDifficulty;
  questions?: PracticeQuestion[];
}

export interface MockAttempt {
  id: string;
  user_id: string;
  mock_test_id: string;
  status: 'in_progress' | 'completed';
  score: number;
  max_score: number;
  accuracy_pct: number;
  total_questions: number;
  correct_count: number;
  wrong_count: number;
  unanswered_count: number;
  time_spent_seconds: number;
  topic_scores: Record<string, { correct: number; total: number; pct: number }>;
  started_at: string;
  completed_at?: string | null;
}

export interface MockAnswer {
  attempt_id: string;
  question_id: string;
  selected_answer: any;
  is_correct?: boolean;
  marked_for_review: boolean;
}

// ── Performance ────────────────────────────────────────────────────────────
export interface SubjectPerformanceSummary {
  subject: string;
  accuracy: number;
  questionsAttempted: number;
  status: 'Needs attention' | 'Strong' | 'Improving';
  weakTopics: string[];
  strongTopics: string[];
}

export interface OverallPerformanceData {
  totalQuestionsSolved: number;
  overallAccuracy: number;
  totalStudyHours: number;
  mocksCompleted: number;
  streakDays: number;
  accuracyHistory: Array<{ date: string; accuracy: number }>;
  subjectSummaries: SubjectPerformanceSummary[];
  nextStepRecommendation: {
    topic: string;
    subject: string;
    reason: string;
    actions: Array<{ label: string; link: string; icon: string }>;
  };
}
