// ─── Study Hub Feature Entitlement Engine ──────────────────────────────────────
import type { FeatureEntitlementKey, SubscriptionPlanId, UserSubscription } from '../../types/phase5';

export interface PlanEntitlementConfig {
  planId: SubscriptionPlanId;
  name: string;
  aiDailyLimit: number;
  entitlements: Set<FeatureEntitlementKey>;
}

export const PLAN_CONFIGS: Record<SubscriptionPlanId, PlanEntitlementConfig> = {
  free: {
    planId: 'free',
    name: 'Free Plan',
    aiDailyLimit: 30,
    entitlements: new Set([
      'ai_daily_limit',
    ]),
  },
  plus: {
    planId: 'plus',
    name: 'Plus Plan',
    aiDailyLimit: 100,
    entitlements: new Set([
      'ai_daily_limit',
      'advanced_tutor',
      'unlimited_adaptive_practice',
      'advanced_mock_analytics',
      'ai_formula_sheets',
    ]),
  },
  pro: {
    planId: 'pro',
    name: 'Pro Plan',
    aiDailyLimit: 500,
    entitlements: new Set([
      'ai_daily_limit',
      'advanced_tutor',
      'unlimited_adaptive_practice',
      'advanced_mock_analytics',
      'deep_performance_insights',
      'ai_formula_sheets',
      'voice_study_mode',
      'exam_simulator_unlimited',
      'mentor_portal_access',
      'institution_analytics',
    ]),
  },
};

export function hasEntitlement(
  subscription: UserSubscription | null | undefined,
  entitlementKey: FeatureEntitlementKey
): boolean {
  const planId: SubscriptionPlanId = subscription?.status === 'active' ? subscription.plan_id : 'free';
  const config = PLAN_CONFIGS[planId] || PLAN_CONFIGS.free;
  return config.entitlements.has(entitlementKey);
}

export function getPlanDailyAiLimit(subscription: UserSubscription | null | undefined): number {
  const planId: SubscriptionPlanId = subscription?.status === 'active' ? subscription.plan_id : 'free';
  return PLAN_CONFIGS[planId]?.aiDailyLimit || 30;
}
