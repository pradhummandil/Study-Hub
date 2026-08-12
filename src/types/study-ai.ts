// ─── StudyMate AI Type Definitions ───────────────────────────────────────────

export type ExamType =
  | 'GATE'
  | 'JEE Main'
  | 'JEE Advanced'
  | 'NEET'
  | 'CUET'
  | 'UPSC'
  | 'UGC NET'
  | 'CLAT'
  | 'NIFT'
  | 'General'
  | 'Other';

export type StudyMode =
  | 'Explain'
  | 'Practice'
  | 'Quiz'
  | 'Revision'
  | 'Study Plan'
  | 'Doubt Solving';

export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard' | 'Mixed';

export type MessageRole = 'user' | 'assistant' | 'system';

export type MessageStatus = 'complete' | 'streaming' | 'error';

export interface MessageMetadata {
  exam?: ExamType;
  subject?: string;
  topic?: string;
  mode?: StudyMode;
  difficulty?: DifficultyLevel;
  model?: string;
  generationTimeMs?: number;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  status?: MessageStatus;
  metadata?: MessageMetadata;
  isError?: boolean;
  isTyping?: boolean;
}

export interface ChatSession {
  id: string;
  userId?: string;
  title: string;
  exam?: ExamType;
  subject?: string;
  mode?: StudyMode;
  createdAt: string;
  updatedAt: string;
}

export interface StudyContext {
  exam?: ExamType;
  subject?: string;
  topic?: string;
  mode?: StudyMode;
  difficulty?: DifficultyLevel;
  userLevel?: 'Beginner' | 'Intermediate' | 'Strong';
  resourceTitle?: string;
  resourceDescription?: string;
}

export interface QuizOption {
  label: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  difficulty: DifficultyLevel;
  topic: string;
}

export interface QuizConfig {
  count: 5 | 10 | 15;
  difficulty: DifficultyLevel;
  exam: ExamType;
  subject?: string;
}

export interface QuizState {
  active: boolean;
  questions: QuizQuestion[];
  currentIndex: number;
  answers: Record<number, 'A' | 'B' | 'C' | 'D' | null>;
  revealed: Record<number, boolean>;
  completed: boolean;
  config: QuizConfig | null;
}

export interface QuizResult {
  score: number;
  total: number;
  accuracy: number;
  strongTopics: string[];
  weakTopics: string[];
  recommendation: string;
}

export interface StudyPlanDay {
  day: string;
  sessions: {
    time: string;
    subject: string;
    topic: string;
    type: 'Study' | 'Practice' | 'Revision' | 'Mock Test';
    duration: string;
  }[];
}

export interface StudyPlanData {
  exam: ExamType;
  examDate?: string;
  dailyHours: number;
  weeklyPlan: StudyPlanDay[];
  revisionCycle: string;
  mockTestSchedule: string;
  tips: string[];
}

export interface SendMessageRequest {
  messages: { role: MessageRole; content: string }[];
  context: StudyContext;
  mode: 'chat' | 'quiz' | 'plan';
}

export interface SendMessageResponse {
  response: string;
  error?: string;
  rateLimited?: boolean;
}

export interface QuickAction {
  id: string;
  label: string;
  emoji: string;
  prompt: string;
  exam?: ExamType;
  mode?: StudyMode;
}
