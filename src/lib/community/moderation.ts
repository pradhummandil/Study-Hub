// src/lib/community/moderation.ts
import { supabase } from '../supabase';
import type { CommunityReport } from '../../types/ecosystem';

const MAX_POST_LENGTH = 5000;
const MIN_POST_LENGTH = 10;
const MAX_URLS_PER_POST = 3;

// In-memory rate limiting map: userId -> timestamps array
const userPostTimestamps = new Map<string, number[]>();

export function validatePostContent(title: string, content: string): { valid: boolean; error?: string } {
  if (!title.trim() || title.trim().length < 5) {
    return { valid: false, error: 'Title must be at least 5 characters long.' };
  }
  if (content.trim().length < MIN_POST_LENGTH) {
    return { valid: false, error: `Content must be at least ${MIN_POST_LENGTH} characters long.` };
  }
  if (content.length > MAX_POST_LENGTH) {
    return { valid: false, error: `Content exceeds maximum length of ${MAX_POST_LENGTH} characters.` };
  }

  // URL count check
  const urlMatches = content.match(/https?:\/\/[^\s]+/g);
  if (urlMatches && urlMatches.length > MAX_URLS_PER_POST) {
    return { valid: false, error: `Posts are limited to a maximum of ${MAX_URLS_PER_POST} links to prevent spam.` };
  }

  return { valid: true };
}

export function checkRateLimit(userId: string): { allowed: boolean; waitSeconds?: number } {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxPostsPerWindow = 5;

  const timestamps = userPostTimestamps.get(userId) || [];
  const recentTimestamps = timestamps.filter((t) => now - t < windowMs);

  if (recentTimestamps.length >= maxPostsPerWindow) {
    const oldestInWindow = recentTimestamps[0];
    const waitSeconds = Math.ceil((windowMs - (now - oldestInWindow)) / 1000);
    return { allowed: false, waitSeconds };
  }

  recentTimestamps.push(now);
  userPostTimestamps.set(userId, recentTimestamps);
  return { allowed: true };
}

export async function submitReport(report: CommunityReport): Promise<boolean> {
  try {
    const { error } = await supabase.from('community_reports').insert({
      reporter_id: report.reporter_id,
      target_type: report.target_type,
      target_id: report.target_id,
      reason: report.reason,
      details: report.details,
      status: 'pending',
    });

    return !error;
  } catch (err) {
    console.warn('Failed to submit community report:', err);
    return false;
  }
}

export async function blockUser(blockerId: string, blockedId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('user_blocks').insert({
      blocker_id: blockerId,
      blocked_id: blockedId,
    });

    return !error;
  } catch (err) {
    console.warn('Failed to block user:', err);
    return false;
  }
}

export async function getBlockedUserIds(userId: string): Promise<string[]> {
  try {
    const { data } = await supabase
      .from('user_blocks')
      .select('blocked_id')
      .eq('blocker_id', userId);

    if (!data) return [];
    return data.map((b) => b.blocked_id);
  } catch (err) {
    console.warn('Failed to fetch blocked user IDs:', err);
    return [];
  }
}
