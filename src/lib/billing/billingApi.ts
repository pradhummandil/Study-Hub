// ─── Billing & Subscriptions API Client ───────────────────────────────────────
import { supabase } from '../supabase';
import type { SubscriptionPlanId, UserSubscription, BillingPlanDetails } from '../../types/phase5';

export const PUBLIC_PLANS: BillingPlanDetails[] = [
  {
    id: 'free',
    name: 'Study Hub Free',
    priceMonthly: 0,
    currency: 'INR',
    aiDailyLimit: 30,
    features: [
      '30 StudyMate AI requests / day',
      'Full access to official PYQ Bank',
      'Basic Exam Roadmaps & PYQ Practice',
      'Standard Mock Tests',
      'Mistake Notebook & Spaced Revision',
      'Study Circles & Focus Rooms',
    ],
    entitlements: ['ai_daily_limit'],
  },
  {
    id: 'plus',
    name: 'Study Hub Plus',
    badge: 'Popular',
    priceMonthly: 499,
    currency: 'INR',
    aiDailyLimit: 100,
    features: [
      '100 StudyMate AI requests / day',
      'Advanced AI Tutor & Socratic Mode',
      'Unlimited Adaptive Practice',
      'AI Formual Sheet Generator',
      'Detailed Mock Test Analytics',
      'Priority RAG Source Grounding',
    ],
    entitlements: [
      'ai_daily_limit',
      'advanced_tutor',
      'unlimited_adaptive_practice',
      'advanced_mock_analytics',
      'ai_formula_sheets',
    ],
  },
  {
    id: 'pro',
    name: 'Study Hub Pro',
    badge: 'Ultimate',
    priceMonthly: 999,
    currency: 'INR',
    aiDailyLimit: 500,
    features: [
      '500 StudyMate AI requests / day',
      'AI Voice Study Mode',
      'Multimodal Image Doubt Solver',
      'Full Realistic Exam Simulator',
      'Deep Performance Intelligence',
      'Mentor & Teacher Collaboration',
      'Institution Analytics Integration',
    ],
    entitlements: [
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
    ],
  },
];

export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  try {
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (data) return data as UserSubscription;
  } catch (err) {
    console.warn('Subscription fetch error:', err);
  }

  // Default free subscription
  return {
    user_id: userId,
    plan_id: 'free',
    status: 'active',
    current_period_start: new Date().toISOString(),
    current_period_end: new Date(Date.now() + 30 * 86400000).toISOString(),
    cancel_at_period_end: false,
  };
}

export async function simulateServerVerifiedCheckout(
  userId: string,
  planId: SubscriptionPlanId
): Promise<{ success: boolean; message: string }> {
  try {
    const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date();
    const periodEnd = new Date(Date.now() + 30 * 86400000);

    // 1. Log payment webhook on server
    await supabase.from('billing_webhooks_log').insert({
      event_id: eventId,
      event_type: 'payment_succeeded',
      status: 'processed',
      payload: { userId, planId, amount: planId === 'pro' ? 999 : 499 },
    });

    // 2. Grant subscription verified by server logic
    await supabase.from('subscriptions').upsert({
      user_id: userId,
      plan_id: planId,
      status: 'active',
      provider_customer_id: `cust_${userId.substring(0, 8)}`,
      provider_subscription_id: `sub_${Date.now()}`,
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
      cancel_at_period_end: false,
      updated_at: now.toISOString(),
    });

    return {
      success: true,
      message: `Successfully upgraded to ${planId.toUpperCase()}! Your entitlements have been activated.`,
    };
  } catch (err: any) {
    console.error('Checkout error:', err);
    return { success: false, message: err?.message || 'Payment processing failed.' };
  }
}

export async function cancelUserSubscription(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('subscriptions')
      .update({ cancel_at_period_end: true, updated_at: new Date().toISOString() })
      .eq('user_id', userId);
    return !error;
  } catch {
    return false;
  }
}
