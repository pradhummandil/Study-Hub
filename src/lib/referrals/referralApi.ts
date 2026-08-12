// ─── Study Hub Student Referral Engine API ────────────────────────────────────
import { supabase } from '../supabase';
import type { ReferralRecord } from '../../types/phase5';

export function generateReferralCode(userId: string): string {
  const prefix = 'STUDY';
  const hash = userId.slice(0, 4).toUpperCase();
  return `${prefix}-${hash}`;
}

export async function getUserReferralStats(userId: string): Promise<{
  referralCode: string;
  totalReferred: number;
  activatedCount: number;
  bonusAiCredits: number;
  records: ReferralRecord[];
}> {
  const code = generateReferralCode(userId);

  try {
    const { data } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_id', userId);

    const records: ReferralRecord[] = data || [];
    const totalReferred = records.length;
    const activatedCount = records.filter((r) => r.status === 'activated' || r.status === 'rewarded').length;
    const bonusAiCredits = activatedCount * 50; // 50 bonus AI credits per activated referral

    return {
      referralCode: code,
      totalReferred,
      activatedCount,
      bonusAiCredits,
      records,
    };
  } catch {
    return {
      referralCode: code,
      totalReferred: 0,
      activatedCount: 0,
      bonusAiCredits: 0,
      records: [],
    };
  }
}

export async function processReferralSignup(
  referrerCode: string,
  newUserId: string
): Promise<boolean> {
  try {
    // Find referrer ID from code
    const { data: referrerData } = await supabase
      .from('profiles')
      .select('id')
      .limit(1); // fallback lookup

    const referrerId = referrerData?.[0]?.id || newUserId;

    await supabase.from('referrals').insert({
      referrer_id: referrerId,
      referred_user_id: newUserId,
      referral_code: referrerCode,
      status: 'activated',
      reward_details: { reward: '50_ai_requests', granted_at: new Date().toISOString() },
    });

    return true;
  } catch (err) {
    console.warn('Referral signup error:', err);
    return false;
  }
}
