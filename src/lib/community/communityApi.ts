// src/lib/community/communityApi.ts
import { supabase } from '../supabase';
import type { StudyCircle, CommunityPost, CommunityComment, PostType } from '../../types/ecosystem';
import { validatePostContent, checkRateLimit, getBlockedUserIds } from './moderation';
import { awardXP } from '../gamification/xpEngine';

// Seed mock data for fallback offline/initial display
const FALLBACK_CIRCLES: StudyCircle[] = [
  { id: 'c1', name: 'GATE CS 2027', slug: 'gate-cs-2027', description: 'Dedicated group for GATE Computer Science 2027 aspirants. PYQs, doubt solving, and revision strategies.', exam: 'GATE', member_count: 1284, is_member: true },
  { id: 'c2', name: 'JEE Advanced 2027', slug: 'jee-advanced-2027', description: 'High-level problem solving, physics drills, and mock strategies for IIT aspirants.', exam: 'JEE Advanced', member_count: 950, is_member: false },
  { id: 'c3', name: 'NEET 2027 Biology & NCERT', slug: 'neet-2027-biology', description: 'NCERT line-by-line breakdown, diagram revision, and biology speed drills.', exam: 'NEET', member_count: 1420, is_member: false },
  { id: 'c4', name: 'DSA & Problem Solving', slug: 'dsa-problem-solving', description: 'Data structures, algorithms, time complexity, and competitive coding practice.', exam: 'GATE', member_count: 840, is_member: true },
  { id: 'c5', name: 'Computer Networks Hub', slug: 'computer-networks', description: 'Deep dive into TCP/IP, subnetting, sliding window protocols, and GATE PYQs.', exam: 'GATE', member_count: 630, is_member: false },
  { id: 'c6', name: 'Competitive Programming', slug: 'competitive-programming', description: 'Codeforces, LeetCode, and algorithmic problem-solving study room.', exam: 'Other', member_count: 510, is_member: false },
];

const FALLBACK_POSTS: CommunityPost[] = [
  {
    id: 'p1',
    user_id: 'u101',
    circle_id: 'c1',
    type: 'question',
    title: 'How to efficiently solve Subnetting CIDR Masking questions in GATE?',
    content: 'I frequently get confused when calculating the range of usable host IP addresses for non-standard subnet masks like /27 or /29. Is there a shortcut trick?',
    exam: 'GATE',
    is_answered: true,
    helpful_count: 18,
    like_count: 24,
    comment_count: 3,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    author_name: 'Aarav Sharma',
    circle_name: 'GATE CS 2027',
  },
  {
    id: 'p2',
    user_id: 'u102',
    circle_id: 'c1',
    type: 'tip',
    title: '3-Step Strategy for Mastering Operating System Process Scheduling',
    content: '1. Draw Gantt charts immediately.\n2. Note arrival times vs CPU burst times clearly.\n3. Always double check preemptive vs non-preemptive rules before calculating average waiting time.',
    exam: 'GATE',
    is_answered: false,
    helpful_count: 32,
    like_count: 45,
    comment_count: 5,
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    author_name: 'Priya Patel',
    circle_name: 'GATE CS 2027',
  },
  {
    id: 'p3',
    user_id: 'u103',
    circle_id: 'c4',
    type: 'question',
    title: 'Dynamic Programming vs Greedy for Coin Change Problem — Clear explanation needed',
    content: 'When does the greedy approach fail for the coin change problem? Can someone provide a counter-example set of coin denominations?',
    exam: 'GATE',
    is_answered: false,
    helpful_count: 9,
    like_count: 14,
    comment_count: 2,
    created_at: new Date(Date.now() - 3600000 * 14).toISOString(),
    author_name: 'Rohan Gupta',
    circle_name: 'DSA & Problem Solving',
  },
];

export async function fetchStudyCircles(userId?: string): Promise<StudyCircle[]> {
  try {
    const { data, error } = await supabase.from('study_circles').select('*').order('member_count', { ascending: false });

    if (error || !data || data.length === 0) {
      return FALLBACK_CIRCLES;
    }

    let joinedCircleIds = new Set<string>();
    if (userId) {
      const { data: userMemberships } = await supabase
        .from('study_circle_members')
        .select('circle_id')
        .eq('user_id', userId);

      if (userMemberships) {
        userMemberships.forEach((m) => joinedCircleIds.add(m.circle_id));
      }
    }

    return data.map((c) => ({
      ...c,
      is_member: joinedCircleIds.has(c.id),
    }));
  } catch (err) {
    console.warn('Failed to fetch study circles from Supabase:', err);
    return FALLBACK_CIRCLES;
  }
}

export async function toggleCircleMembership(userId: string, circleId: string, join: boolean): Promise<boolean> {
  try {
    if (join) {
      const { error } = await supabase.from('study_circle_members').insert({
        circle_id: circleId,
        user_id: userId,
        role: 'member',
      });
      return !error;
    } else {
      const { error } = await supabase
        .from('study_circle_members')
        .delete()
        .eq('circle_id', circleId)
        .eq('user_id', userId);
      return !error;
    }
  } catch (err) {
    console.warn('Failed to toggle circle membership:', err);
    return false;
  }
}

export async function fetchCommunityPosts(params: {
  circleId?: string;
  type?: PostType | 'all';
  unansweredOnly?: boolean;
  searchQuery?: string;
  userId?: string;
}): Promise<CommunityPost[]> {
  const { circleId, type, unansweredOnly, searchQuery, userId } = params;

  try {
    const blockedIds = userId ? await getBlockedUserIds(userId) : [];

    let query = supabase.from('community_posts').select('*').order('created_at', { ascending: false });

    if (circleId) {
      query = query.eq('circle_id', circleId);
    }
    if (type && type !== 'all') {
      query = query.eq('type', type);
    }
    if (unansweredOnly) {
      query = query.eq('is_answered', false).eq('type', 'question');
    }
    if (searchQuery && searchQuery.trim()) {
      query = query.ilike('title', `%${searchQuery.trim()}%`);
    }

    const { data, error } = await query.limit(50);

    if (error || !data) {
      let filtered = [...FALLBACK_POSTS];
      if (circleId) filtered = filtered.filter((p) => p.circle_id === circleId);
      if (type && type !== 'all') filtered = filtered.filter((p) => p.type === type);
      if (unansweredOnly) filtered = filtered.filter((p) => !p.is_answered && p.type === 'question');
      if (searchQuery) filtered = filtered.filter((p) => p.title.toLowerCase().includes(searchQuery.toLowerCase()));
      return filtered;
    }

    // Filter out blocked users
    const validPosts = data.filter((p) => !blockedIds.includes(p.user_id));
    return validPosts as CommunityPost[];
  } catch (err) {
    console.warn('Failed to fetch community posts:', err);
    return FALLBACK_POSTS;
  }
}

export async function createCommunityPost(post: {
  userId: string;
  circleId?: string;
  type: PostType;
  title: string;
  content: string;
  exam?: string;
  resourceId?: string;
}): Promise<{ success: boolean; post?: CommunityPost; error?: string }> {
  // 1. Rate Limit Check
  const rateCheck = checkRateLimit(post.userId);
  if (!rateCheck.allowed) {
    return { success: false, error: `Rate limit reached. Please wait ${rateCheck.waitSeconds}s before posting again.` };
  }

  // 2. Content Validation
  const val = validatePostContent(post.title, post.content);
  if (!val.valid) {
    return { success: false, error: val.error };
  }

  try {
    const { data, error } = await supabase
      .from('community_posts')
      .insert({
        user_id: post.userId,
        circle_id: post.circleId || null,
        type: post.type,
        title: post.title.trim(),
        content: post.content.trim(),
        exam: post.exam || 'GATE',
        resource_id: post.resourceId || null,
      })
      .select()
      .single();

    if (error || !data) {
      return { success: false, error: error?.message || 'Failed to publish post.' };
    }

    // Award XP for useful community contribution
    await awardXP(post.userId, 'HELPFUL_ANSWER', 15);

    return { success: true, post: data as CommunityPost };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error creating post.' };
  }
}

export async function deleteCommunityPost(postId: string, userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('community_posts')
      .delete()
      .eq('id', postId)
      .eq('user_id', userId);

    return !error;
  } catch (err) {
    console.warn('Failed to delete post:', err);
    return false;
  }
}

export async function fetchPostComments(postId: string): Promise<CommunityComment[]> {
  try {
    const { data, error } = await supabase
      .from('community_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error || !data) return [];
    return data as CommunityComment[];
  } catch (err) {
    console.warn('Failed to fetch post comments:', err);
    return [];
  }
}

export async function addPostComment(
  postId: string,
  userId: string,
  content: string,
  parentCommentId?: string
): Promise<{ success: boolean; comment?: CommunityComment; error?: string }> {
  if (!content.trim()) {
    return { success: false, error: 'Comment cannot be empty.' };
  }

  try {
    const { data, error } = await supabase
      .from('community_comments')
      .insert({
        post_id: postId,
        user_id: userId,
        parent_comment_id: parentCommentId || null,
        content: content.trim(),
      })
      .select()
      .single();

    if (error || !data) {
      return { success: false, error: error?.message || 'Failed to post comment.' };
    }

    // Increment post comment count
    try {
      await supabase.rpc('increment_comment_count', { p_post_id: postId });
    } catch {
      const { data: p } = await supabase.from('community_posts').select('comment_count').eq('id', postId).single();
      if (p) {
        await supabase.from('community_posts').update({ comment_count: (p.comment_count || 0) + 1 }).eq('id', postId);
      }
    }

    return { success: true, comment: data as CommunityComment };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error adding comment.' };
  }
}

export async function markHelpfulAnswer(commentId: string, postId: string, commentAuthorId: string): Promise<boolean> {
  try {
    // Mark comment helpful
    await supabase.from('community_comments').update({ is_helpful: true }).eq('id', commentId);
    // Mark post answered
    await supabase.from('community_posts').update({ is_answered: true }).eq('id', postId);
    // Increment author helpful count & award XP
    await awardXP(commentAuthorId, 'HELPFUL_ANSWER', 25);

    return true;
  } catch (err) {
    console.warn('Failed to mark helpful answer:', err);
    return false;
  }
}

export async function togglePostReaction(userId: string, postId: string, reactionType: 'helpful' | 'like'): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('community_reactions')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .eq('reaction_type', reactionType)
      .maybeSingle();

    if (data) {
      // Remove reaction
      await supabase.from('community_reactions').delete().eq('id', data.id);
    } else {
      // Add reaction
      await supabase.from('community_reactions').insert({
        user_id: userId,
        post_id: postId,
        reaction_type: reactionType,
      });
    }
    return true;
  } catch (err) {
    console.warn('Failed to toggle reaction:', err);
    return false;
  }
}
