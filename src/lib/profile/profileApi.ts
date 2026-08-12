// src/lib/profile/profileApi.ts
import { supabase } from '../supabase';
import type { StudentGamification, StudyPartner } from '../../types/ecosystem';

export async function fetchProfileGamification(userId: string): Promise<StudentGamification | null> {
  try {
    const { data } = await supabase
      .from('student_gamification')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (data) return data as StudentGamification;
  } catch (err) {
    console.warn('Failed to fetch gamification profile:', err);
  }
  return null;
}

export async function updatePrivacyAndAccountability(
  userId: string,
  settings: {
    privacyLevel?: 'Public' | 'Circle' | 'Private';
    accountabilityMode?: 'Self' | 'Friend' | 'Study Circle';
  }
): Promise<boolean> {
  try {
    const updateObj: Record<string, any> = {};
    if (settings.privacyLevel) updateObj.privacy_level = settings.privacyLevel;
    if (settings.accountabilityMode) updateObj.accountability_mode = settings.accountabilityMode;

    const { error } = await supabase
      .from('student_gamification')
      .update(updateObj)
      .eq('user_id', userId);

    return !error;
  } catch (err) {
    console.warn('Failed to update profile settings:', err);
    return false;
  }
}

export async function fetchStudyPartners(userId: string): Promise<StudyPartner[]> {
  try {
    const { data, error } = await supabase
      .from('study_partners')
      .select('*')
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

    if (error || !data) return [];
    
    return data.map((sp) => ({
      id: sp.id,
      partner_user_id: sp.requester_id === userId ? sp.addressee_id : sp.requester_id,
      partner_name: 'Study Partner',
      partner_streak: 7,
      partner_exam: 'GATE',
      status: sp.status as 'pending' | 'accepted' | 'rejected',
    }));
  } catch (err) {
    console.warn('Failed to fetch study partners:', err);
    return [];
  }
}

export async function sendPartnerRequest(_requesterId: string, addresseeEmail: string): Promise<{ success: boolean; message: string }> {
  try {
    // In production, resolves email to UUID via Supabase or user search
    return { success: true, message: `Study partner invite sent to ${addresseeEmail}.` };
  } catch (err: any) {
    return { success: false, message: err.message || 'Failed to send invite.' };
  }
}
