// ─── STUDY HUB PHASE 5 TYPE DEFINITIONS ───────────────────────────────────────

export type SourceTrustLevel = 'official' | 'verified' | 'community' | 'ai_generated' | 'unverified';

export interface KnowledgeDocument {
  id: string;
  resource_id?: string;
  title: string;
  exam: string;
  year?: number;
  subject: string;
  topic: string;
  source_type: SourceTrustLevel;
  verification_status: 'verified' | 'unverified';
  language: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface KnowledgeChunk {
  id: string;
  document_id: string;
  content: string;
  page?: number;
  question_number?: string;
  chunk_index: number;
  keywords: string[];
  metadata?: Record<string, any>;
}

export interface GroundedCitation {
  id: string;
  title: string;
  exam: string;
  year?: number;
  subject: string;
  topic: string;
  source_type: SourceTrustLevel;
  page?: number;
  question_number?: string;
  url?: string;
  snippet?: string;
}

export interface GroundedAnswerResult {
  answer: string;
  citations: GroundedCitation[];
  grounded: boolean;
  confidenceScore: number;
  noVerifiedSourceFound: boolean;
}

export type TutorPersonaMode =
  | 'Teach me'
  | 'Test me'
  | 'Explain my mistake'
  | 'Socratic mode'
  | 'Revision mode'
  | 'Exam mode';

export interface ProgressiveHint {
  level: 1 | 2 | 3;
  hintText: string;
  solutionText?: string;
}

export interface DoubtSolverResult {
  questionExtracted: string;
  conceptIdentified: string;
  stepByStepSolution: string[];
  commonMistakeTrap: string;
  similarPracticeQuestions: {
    question: string;
    options: string[];
    answer: string;
    explanation: string;
  }[];
}

export type SubscriptionPlanId = 'free' | 'plus' | 'pro';

export type FeatureEntitlementKey =
  | 'ai_daily_limit'
  | 'advanced_tutor'
  | 'unlimited_adaptive_practice'
  | 'advanced_mock_analytics'
  | 'deep_performance_insights'
  | 'ai_formula_sheets'
  | 'voice_study_mode'
  | 'exam_simulator_unlimited'
  | 'mentor_portal_access'
  | 'institution_analytics';

export interface UserSubscription {
  user_id: string;
  plan_id: SubscriptionPlanId;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  provider_customer_id?: string;
  provider_subscription_id?: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

export interface BillingPlanDetails {
  id: SubscriptionPlanId;
  name: string;
  badge?: string;
  priceMonthly: number; // 0 for free
  currency: string;
  features: string[];
  entitlements: FeatureEntitlementKey[];
  aiDailyLimit: number;
}

export interface ReferralRecord {
  id: string;
  referrer_id: string;
  referred_user_id?: string;
  referral_code: string;
  status: 'signed_up' | 'activated' | 'rewarded';
  reward_details: Record<string, any>;
  created_at: string;
}

export interface OrganizationTenant {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  plan: string;
  settings: {
    allow_student_signup: boolean;
    custom_domain?: string;
  };
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: 'institution_admin' | 'teacher' | 'mentor' | 'student';
  privacy_level: 'private' | 'shared_with_mentor' | 'organization_visible';
  joined_at: string;
}

export interface Assignment {
  id: string;
  organization_id: string;
  creator_id: string;
  title: string;
  description: string;
  type: 'pyq' | 'mock' | 'quiz' | 'flashcards' | 'resource' | 'topic';
  target_id?: string;
  target_student_ids: string[];
  due_date?: string;
  created_at: string;
}

export interface SessionReflection {
  id: string;
  user_id: string;
  topic_id: string;
  topic_title: string;
  duration_minutes: number;
  confidence_score: number; // 1 to 5
  notes?: string;
  created_at: string;
}

export interface ExamSimulationConfig {
  id: string;
  exam: string;
  title: string;
  durationMinutes: number;
  sections: {
    name: string;
    questionCount: number;
    marksPerQuestion: number;
    negativeMarkingRatio: number; // e.g. 0.33 for 1/3 negative
  }[];
  calculatorAllowed: boolean;
  instructions: string[];
}

export interface ExamSimulationResultData {
  score: number;
  totalMarks: number;
  accuracy: number;
  attemptRate: number;
  avgTimePerQuestionSec: number;
  negativeMarksLost: number;
  skippedCount: number;
  topicPerformance: { topic: string; correct: number; total: number }[];
  costMarksReasons: string[];
  timeStrategyInsight: string;
}

export interface AiReportItem {
  id: string;
  message_id: string;
  reason: 'Incorrect' | 'Not relevant' | 'Missing source' | 'Confusing' | 'Unsafe';
  details?: string;
  status: 'pending' | 'reviewed' | 'resolved';
  created_at: string;
}

export interface FeatureFlagItem {
  flag_key: string;
  enabled: boolean;
  description?: string;
}
