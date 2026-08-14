// src/types/student-core.ts

export type EducationPath = 'school' | 'college' | 'competitive' | 'both' | 'exploring';
export type EducationStage = 'school' | 'diploma' | 'undergraduate' | 'postgraduate' | 'other';
export type SchoolClass = 'Class 9' | 'Class 10' | 'Class 11' | 'Class 12' | 'Other';
export type SchoolBoard = 'CBSE' | 'CISCE' | 'State Board' | 'Other';
export type CollegeDegree = 'B.Tech / B.E.' | 'B.Sc' | 'B.Com' | 'BBA' | 'BA' | 'BCA' | 'MBBS' | 'Other';
export type CollegeYear = '1st Year' | '2nd Year' | '3rd Year' | '4th Year' | 'Other';
export type BranchMajor =
  | 'Computer Science'
  | 'Information Technology'
  | 'Mechanical'
  | 'Civil'
  | 'Electrical'
  | 'Electronics'
  | 'Mathematics'
  | 'Physics'
  | 'Other';

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
  | 'CAT'
  | 'SSC'
  | 'Banking'
  | 'Railway'
  | 'Defence'
  | 'State PSC'
  | 'Other';

export interface ExamInfo {
  id: ExamCategory;
  name: string;
  slug: string;
  category: string;
  shortDesc: string;
  iconName: string;
  organizer: string;
  officialUrl: string;
  currentCycle: string;
  defaultExamDate?: string; // YYYY-MM-DD
  subjects: string[];
  availabilityBadge: '✓ Official papers available' | '✓ Answer keys available' | '◐ Partial official archive' | '⚠ Candidate-login required';
  lastVerifiedAt: string;
}

export const EXAM_CONFIGS: Record<ExamCategory, ExamInfo> = {
  GATE: {
    id: 'GATE',
    name: 'GATE CS / IT',
    slug: 'gate',
    category: 'Engineering',
    shortDesc: 'Graduate Aptitude Test in Engineering for M.Tech & PSUs',
    iconName: 'Cpu',
    organizer: 'IIT Madras / GATE Committee',
    officialUrl: 'https://gate2026.iitm.ac.in',
    currentCycle: '2027',
    defaultExamDate: '2027-02-06',
    availabilityBadge: '✓ Official papers available',
    lastVerifiedAt: '13 Aug 2026',
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
    ],
  },
  'JEE Main': {
    id: 'JEE Main',
    name: 'JEE Main',
    slug: 'jee-main',
    category: 'Engineering',
    shortDesc: 'Joint Entrance Examination for NITs, IIITs & CFTIs',
    iconName: 'Atom',
    organizer: 'National Testing Agency (NTA)',
    officialUrl: 'https://jeemain.nta.nic.in',
    currentCycle: '2027',
    defaultExamDate: '2027-01-22',
    availabilityBadge: '✓ Official papers available',
    lastVerifiedAt: '13 Aug 2026',
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
    slug: 'jee-advanced',
    category: 'Engineering',
    shortDesc: 'Premier Entrance Exam for Indian Institutes of Technology (IITs)',
    iconName: 'Zap',
    organizer: 'IIT Joint Admission Board',
    officialUrl: 'https://jeeadv.ac.in',
    currentCycle: '2026',
    defaultExamDate: '2027-05-23',
    availabilityBadge: '✓ Official papers available',
    lastVerifiedAt: '13 Aug 2026',
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
    slug: 'neet',
    category: 'Medical',
    shortDesc: 'National Eligibility cum Entrance Test for MBBS / BDS',
    iconName: 'HeartPulse',
    organizer: 'National Testing Agency (NTA)',
    officialUrl: 'https://neet.nta.nic.in',
    currentCycle: '2026',
    defaultExamDate: '2027-05-02',
    availabilityBadge: '✓ Answer keys available',
    lastVerifiedAt: '13 Aug 2026',
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
    slug: 'cuet-ug',
    category: 'University',
    shortDesc: 'Common University Entrance Test for Central Universities',
    iconName: 'GraduationCap',
    organizer: 'National Testing Agency (NTA)',
    officialUrl: 'https://cuetug.nta.online',
    currentCycle: '2026',
    defaultExamDate: '2027-05-15',
    availabilityBadge: '✓ Official papers available',
    lastVerifiedAt: '13 Aug 2026',
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
    slug: 'upsc',
    category: 'Government',
    shortDesc: 'Civil Services Examination for IAS, IPS & IFS',
    iconName: 'Landmark',
    organizer: 'Union Public Service Commission',
    officialUrl: 'https://upsc.gov.in',
    currentCycle: '2026',
    defaultExamDate: '2027-05-30',
    availabilityBadge: '✓ Official papers available',
    lastVerifiedAt: '13 Aug 2026',
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
    slug: 'ugc-net',
    category: 'Teaching',
    shortDesc: 'National Eligibility Test for Assistant Professor & JRF',
    iconName: 'BookOpen',
    organizer: 'National Testing Agency (NTA)',
    officialUrl: 'https://ugcnet.nta.ac.in',
    currentCycle: '2026',
    defaultExamDate: '2027-06-18',
    availabilityBadge: '✓ Official papers available',
    lastVerifiedAt: '13 Aug 2026',
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
    slug: 'clat',
    category: 'Law',
    shortDesc: 'Common Law Admission Test for National Law Universities',
    iconName: 'Scale',
    organizer: 'Consortium of NLUs',
    officialUrl: 'https://consortiumofnlus.ac.in',
    currentCycle: '2027',
    defaultExamDate: '2027-12-05',
    availabilityBadge: '✓ Official papers available',
    lastVerifiedAt: '13 Aug 2026',
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
    slug: 'nift',
    category: 'Design',
    shortDesc: 'National Institute of Fashion Technology Entrance',
    iconName: 'Palette',
    organizer: 'NTA / NIFT Admission Cell',
    officialUrl: 'https://nift.nta.online',
    currentCycle: '2026',
    defaultExamDate: '2027-02-14',
    availabilityBadge: '✓ Answer keys available',
    lastVerifiedAt: '13 Aug 2026',
    subjects: [
      'General Ability Test (GAT)',
      'Creative Ability Test (CAT)',
      'Analytical & Logical Ability',
      'Communication & English',
    ],
  },
  CAT: {
    id: 'CAT',
    name: 'CAT (Common Admission Test)',
    slug: 'cat',
    category: 'Management',
    shortDesc: 'Premier Entrance Exam for IIMs & Top Business Schools',
    iconName: 'Sparkles',
    organizer: 'Indian Institutes of Management (IIMs)',
    officialUrl: 'https://iimcat.ac.in',
    currentCycle: '2026',
    defaultExamDate: '2026-11-29',
    availabilityBadge: '✓ Official papers available',
    lastVerifiedAt: '13 Aug 2026',
    subjects: [
      'Verbal Ability & Reading Comprehension (VARC)',
      'Data Interpretation & Logical Reasoning (DILR)',
      'Quantitative Aptitude (QA)',
    ],
  },
  SSC: {
    id: 'SSC',
    name: 'SSC CGL / CHSL',
    slug: 'ssc',
    category: 'Government',
    shortDesc: 'Staff Selection Commission Combined Graduate Level Exam',
    iconName: 'Landmark',
    organizer: 'Staff Selection Commission',
    officialUrl: 'https://ssc.gov.in',
    currentCycle: '2026',
    defaultExamDate: '2026-09-15',
    availabilityBadge: '✓ Official papers available',
    lastVerifiedAt: '13 Aug 2026',
    subjects: [
      'General Intelligence & Reasoning',
      'General Awareness',
      'Quantitative Aptitude',
      'English Comprehension',
    ],
  },
  Banking: {
    id: 'Banking',
    name: 'IBPS / SBI PO',
    slug: 'banking',
    category: 'Government',
    shortDesc: 'Bank Probationary Officer & Clerk Recruitment Exams',
    iconName: 'Landmark',
    organizer: 'Institute of Banking Personnel Selection',
    officialUrl: 'https://ibps.in',
    currentCycle: '2026',
    defaultExamDate: '2026-10-10',
    availabilityBadge: '✓ Answer keys available',
    lastVerifiedAt: '13 Aug 2026',
    subjects: [
      'Reasoning Ability',
      'Quantitative Aptitude',
      'English Language',
      'General & Banking Awareness',
      'Computer Aptitude',
    ],
  },
  Railway: {
    id: 'Railway',
    name: 'RRB NTPC / JE',
    slug: 'railway',
    category: 'Government',
    shortDesc: 'Railway Recruitment Board Non-Technical & Technical Exams',
    iconName: 'Landmark',
    organizer: 'Railway Recruitment Control Board',
    officialUrl: 'https://indianrailways.gov.in',
    currentCycle: '2026',
    defaultExamDate: '2026-11-15',
    availabilityBadge: '✓ Official papers available',
    lastVerifiedAt: '13 Aug 2026',
    subjects: [
      'General Awareness',
      'Mathematics',
      'General Intelligence & Reasoning',
      'General Science',
    ],
  },
  Defence: {
    id: 'Defence',
    name: 'NDA / CDS / AFCAT',
    slug: 'defence',
    category: 'Defence',
    shortDesc: 'National Defence Academy & Combined Defence Services Exam',
    iconName: 'Zap',
    organizer: 'UPSC & IAF',
    officialUrl: 'https://upsc.gov.in',
    currentCycle: '2026',
    defaultExamDate: '2026-09-01',
    availabilityBadge: '✓ Official papers available',
    lastVerifiedAt: '13 Aug 2026',
    subjects: [
      'Mathematics',
      'General Ability Test (GAT)',
      'English',
      'General Knowledge & Current Affairs',
    ],
  },
  'State PSC': {
    id: 'State PSC',
    name: 'State PSC Examinations',
    slug: 'state-psc',
    category: 'Government',
    shortDesc: 'State Public Service Commission Examinations (UPPSC, MPSC, BPSC, etc.)',
    iconName: 'Landmark',
    organizer: 'Respective State Public Service Commissions',
    officialUrl: 'https://upsc.gov.in',
    currentCycle: '2026',
    defaultExamDate: '2026-10-25',
    availabilityBadge: '◐ Partial official archive',
    lastVerifiedAt: '13 Aug 2026',
    subjects: [
      'General Studies Paper 1',
      'General Studies Paper 2 (CSAT)',
      'State History & Geography',
      'Current Events',
    ],
  },
  Other: {
    id: 'Other',
    name: 'Custom Exam',
    slug: 'other',
    category: 'Other',
    shortDesc: 'Personalized study schedule for university or professional exams',
    iconName: 'Sparkles',
    organizer: 'Custom Institution',
    officialUrl: 'https://studyhub.ai',
    currentCycle: '2026',
    availabilityBadge: '✓ Official papers available',
    lastVerifiedAt: '13 Aug 2026',
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
  | 'High Score'
  | 'Strong Score'
  | 'Qualify / Clear'
  | "I'm exploring";

export type CurrentLevel =
  | 'Not started'
  | 'Just started'
  | 'Some preparation done'
  | 'Well prepared'
  | 'Revision phase';

export type SelfRating = 'Weak' | 'Average' | 'Strong';

export interface StudentProfile {
  user_id: string;
  education_path?: EducationPath;
  education_stage?: EducationStage;
  school_class?: SchoolClass;
  school_board?: SchoolBoard;
  degree?: CollegeDegree;
  college_year?: CollegeYear;
  branch_major?: BranchMajor;
  college_subjects?: string[];
  competitive_exam_enabled?: boolean;
  active_context?: 'college' | 'competitive';
  target_exam: ExamCategory;
  target_exam_year: string;
  target_goal: TargetGoal;
  target_rank?: string;
  target_score?: string;
  daily_study_minutes: number;
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
  progress: number;
  accuracy: number;
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
export type QuestionType =
  | 'MCQ_SINGLE'
  | 'MCQ_MULTIPLE'
  | 'NUMERICAL'
  | 'ASSERTION_REASON'
  | 'MATCHING'
  | 'TRUE_FALSE'
  | 'INTEGER'
  | 'SUBJECTIVE'
  | 'PASSAGE'
  | 'COMPREHENSION'
  | 'STATEMENT_BASED'
  | 'MCQ'
  | 'MSQ'
  | 'Numerical'
  | 'True/False';

export type QuestionDifficulty = 'Easy' | 'Medium' | 'Hard';

export type ContentSourceClass =
  | 'OFFICIAL_PYQ'
  | 'LICENSED_PYQ'
  | 'STUDY_HUB_PRACTICE'
  | 'EXTERNAL_REFERENCE'
  | 'official'
  | 'ai_generated'
  | 'community';

export interface StructuredOption {
  id: string;
  text: string;
  image?: string;
}

export interface PracticeQuestion {
  id: string;
  exam_id?: string;
  exam_name?: string;
  exam_family?: string;
  exam_code?: string;
  exam: string;
  year?: number | null;
  session?: string | null;
  paper?: string | null;
  subject: string;
  chapter?: string;
  topic: string;
  subtopic?: string;
  difficulty: QuestionDifficulty;
  question_type: QuestionType;
  language?: string;
  question_text: string;
  options?: string[];
  options_structured?: StructuredOption[];
  correct_answer: any;
  solution_text?: string;
  solution_steps?: string[];
  explanation?: string;
  hint?: string;
  concept?: string;
  formula?: string;
  common_mistake?: string;
  marks?: number;
  negative_marks?: number;
  question_number?: number;
  is_official_pyq?: boolean;
  source_type?: ContentSourceClass;
  source_url?: string;
  source_name?: string;
  official_source_url?: string;
  license_status?: string;
  attribution?: string;
  verified?: boolean;
  published?: boolean;
  classifier_confidence?: number;
  classifier_source?: string;
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
  subject?: string | null;
  total_questions: number;
  duration_minutes: number;
  total_marks: number;
  difficulty: QuestionDifficulty;
  test_type?: 'OFFICIAL PYQ' | 'AI-GENERATED' | 'ADMIN TEST' | 'INSTITUTION TEST';
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
