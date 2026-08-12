// src/types/intelligence.ts

export type ConceptMasteryStatus = 'not_started' | 'learning' | 'developing' | 'strong' | 'mastered';

export interface StudentConceptMastery {
  id: string;
  user_id: string;
  exam: string;
  subject: string;
  topic: string;
  mastery_score: number; // 0 - 100
  confidence_score: number; // 0 - 100
  questions_attempted: number;
  questions_correct: number;
  recent_accuracy: number;
  recent_speed: number; // avg seconds per question
  streak_correct: number;
  streak_wrong: number;
  last_attempted_at?: string;
  last_reviewed_at?: string;
  next_review_at?: string;
  status: ConceptMasteryStatus;
  created_at?: string;
  updated_at?: string;
}

export type MistakeType =
  | 'concept_gap'
  | 'careless_error'
  | 'calculation_error'
  | 'memory_error'
  | 'misread_question'
  | 'time_pressure'
  | 'guessing'
  | 'unknown';

export type MistakeSeverity = 'low' | 'medium' | 'high';

export interface MistakeRecord {
  id: string;
  user_id: string;
  question_id: string;
  exam: string;
  year?: number;
  subject: string;
  topic: string;
  question_snapshot: {
    question_text: string;
    options?: string[];
    question_type?: string;
    difficulty?: string;
  };
  student_answer: any;
  correct_answer: any;
  explanation?: string;
  time_taken: number;
  attempt_count: number;
  mistake_type: MistakeType;
  severity: MistakeSeverity;
  mastered: boolean;
  last_reviewed_at?: string;
  next_review_at?: string;
  created_at: string;
  updated_at?: string;
}

export type RevisionSourceType = 'roadmap' | 'mistake' | 'flashcard' | 'concept' | 'recommendation';
export type SpacedRating = 'Again' | 'Hard' | 'Good' | 'Easy';

export interface RevisionItem {
  id: string;
  user_id: string;
  exam: string;
  subject: string;
  topic: string;
  source_type: RevisionSourceType;
  source_id?: string;
  title: string;
  summary_notes?: string;
  review_count: number;
  interval_days: number;
  easiness: number;
  last_reviewed_at?: string;
  next_review_at: string;
  created_at: string;
  updated_at?: string;
}

export interface FlashcardDeck {
  id: string;
  user_id: string;
  exam: string;
  subject: string;
  title: string;
  description?: string;
  card_count: number;
  is_public: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Flashcard {
  id: string;
  user_id: string;
  deck_id?: string;
  exam: string;
  subject: string;
  topic: string;
  front: string;
  back: string;
  source_type: 'custom' | 'ai_generated' | 'mistake' | 'roadmap';
  source_id?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  review_count: number;
  interval_days: number;
  easiness: number;
  next_review_at: string;
  last_reviewed_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface AdaptiveSession {
  id: string;
  user_id: string;
  exam: string;
  subject: string;
  total_questions: number;
  current_question_index: number;
  performance_pct: number;
  current_difficulty: 'Easy' | 'Medium' | 'Hard';
  status: 'in_progress' | 'completed';
  target_topics: string[];
  questions_data: any[];
  created_at: string;
  updated_at?: string;
}

export type RecommendationPriority = 'high' | 'medium' | 'low';
export type RecommendationType = 'revision' | 'practice' | 'flashcards' | 'quiz' | 'mock';

export interface Recommendation {
  id: string;
  user_id: string;
  type: RecommendationType;
  title: string;
  reason: string;
  priority: RecommendationPriority;
  estimated_minutes: number;
  action: string;
  action_state?: Record<string, any>;
  source: string;
  dismissed?: boolean;
  created_at?: string;
}

export interface LearningInsight {
  id: string;
  user_id: string;
  insight_type: 'time_of_day' | 'revision_impact' | 'time_pressure' | 'stagnant_topic' | 'mastery_growth' | 'warning';
  title: string;
  description: string;
  metric_value?: string;
  is_warning: boolean;
  action_link?: string;
  created_at: string;
}

export interface ExamReadinessSnapshot {
  id: string;
  user_id: string;
  exam: string;
  overall_readiness: number; // 0-100
  syllabus_coverage_pct: number;
  pyq_accuracy_pct: number;
  mock_performance_pct: number;
  revision_health_pct: number;
  consistency_pct: number;
  strongest_area: string;
  biggest_opportunity: string;
  recommended_next_step: string;
  created_at: string;
}

export interface StudentIntelligenceContext {
  profile: {
    exam: string;
    year: number | string;
    daily_minutes: number;
    target_goal?: string;
  };
  performance: {
    overall_accuracy: number;
    questions_attempted: number;
    mocks_completed: number;
  };
  weak_topics: string[];
  strong_topics: string[];
  revision_due: string[];
  recent_mistakes: string[];
  recent_activity: string[];
}
