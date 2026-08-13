export interface JournalCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  badgeColor: string;
  iconName: string;
}

export const JOURNAL_CATEGORIES: JournalCategory[] = [
  {
    id: 'topper-stories',
    name: 'Topper Stories',
    slug: 'topper-stories',
    description: 'Deconstructed preparation strategies and routines from verified rankers.',
    badgeColor: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    iconName: 'Trophy',
  },
  {
    id: 'study-notes',
    name: 'Study Notes',
    slug: 'study-notes',
    description: 'Revision maps, formula sheets, and cheat sheets built for long-term retention.',
    badgeColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    iconName: 'FileText',
  },
  {
    id: 'exam-strategy',
    name: 'Exam Strategy',
    slug: 'exam-strategy',
    description: 'Systematic frameworks for syllabus distribution, mock test analysis, and speed.',
    badgeColor: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    iconName: 'Target',
  },
  {
    id: 'study-science',
    name: 'Study Science',
    slug: 'study-science',
    description: 'Evidence-based cognitive science on active recall, memory decay, and focus.',
    badgeColor: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    iconName: 'Brain',
  },
  {
    id: 'student-stories',
    name: 'Student Stories',
    slug: 'student-stories',
    description: 'Honest accounts of overcoming burnout, balancing college, and rebuilding routines.',
    badgeColor: 'text-sky-400 border-sky-500/30 bg-sky-500/10',
    iconName: 'Users',
  },
  {
    id: 'educator-stories',
    name: 'Educator Stories',
    slug: 'educator-stories',
    description: 'Pedagogical insights and journeys of teachers who transformed how students learn.',
    badgeColor: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
    iconName: 'GraduationCap',
  },
  {
    id: 'inspiration',
    name: 'Inspiration',
    slug: 'inspiration',
    description: 'Real student resilience, comeback accounts, and stories before the rank.',
    badgeColor: 'text-amber-300 border-amber-400/30 bg-amber-400/10',
    iconName: 'Sparkles',
  },
  {
    id: 'college-life',
    name: 'College Life',
    slug: 'college-life',
    description: 'Navigating academics, semester exams, campus balance, and projects.',
    badgeColor: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
    iconName: 'Building',
  },
  {
    id: 'career-research',
    name: 'Career & Research',
    slug: 'career-research',
    description: 'Life beyond exams: M.Tech, research fellowships, AI engineering, and industry roles.',
    badgeColor: 'text-teal-400 border-teal-500/30 bg-teal-500/10',
    iconName: 'Compass',
  },
  {
    id: 'productivity',
    name: 'Productivity',
    slug: 'productivity',
    description: 'Time audit systems, distraction blocking, and deep work routines.',
    badgeColor: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    iconName: 'Zap',
  },
  {
    id: 'pyq-strategy',
    name: 'PYQ Strategy',
    slug: 'pyq-strategy',
    description: 'How to convert previous year questions into diagnostic problem-solving engines.',
    badgeColor: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
    iconName: 'HelpCircle',
  },
  {
    id: 'revision',
    name: 'Revision',
    slug: 'revision',
    description: 'Spaced repetition, mistake notebooks, and last-mile retention systems.',
    badgeColor: 'text-pink-400 border-pink-500/30 bg-pink-500/10',
    iconName: 'Repeat',
  },
  {
    id: 'ai-learning',
    name: 'AI & Learning',
    slug: 'ai-learning',
    description: 'Leveraging AI tools ethically for concept clarification and smart practice.',
    badgeColor: 'text-cyan-300 border-cyan-400/30 bg-cyan-400/10',
    iconName: 'Cpu',
  },
  {
    id: 'exam-updates',
    name: 'Exam Updates',
    slug: 'exam-updates',
    description: 'Official notifications, syllabus modifications, and pattern analysis.',
    badgeColor: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
    iconName: 'Bell',
  },
  {
    id: 'book-resource-reviews',
    name: 'Book / Resource Reviews',
    slug: 'book-resource-reviews',
    description: 'Objective evaluations of standard textbooks, question banks, and reference materials.',
    badgeColor: 'text-violet-400 border-violet-500/30 bg-violet-500/10',
    iconName: 'BookOpen',
  },
];
