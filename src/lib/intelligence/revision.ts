// src/lib/intelligence/revision.ts
import { supabase } from '../supabase';
import type { RevisionItem, SpacedRating, RevisionSourceType } from '../../types/intelligence';

const REVISION_LOCAL_KEY = 'studyhub_revision_items';

// Initial interval schedule defaults
export const REVISION_INTERVAL_SCHEDULE = [1, 3, 7, 14, 30];

export function calculateNextSpacedInterval(params: {
  rating: SpacedRating;
  intervalDays: number;
  easiness: number;
}): { nextIntervalDays: number; newEasiness: number } {
  let { rating, intervalDays, easiness } = params;

  if (rating === 'Again') {
    return { nextIntervalDays: 1, newEasiness: Math.max(1.3, easiness - 0.2) };
  } else if (rating === 'Hard') {
    return { nextIntervalDays: 2, newEasiness: Math.max(1.3, easiness - 0.15) };
  } else if (rating === 'Good') {
    const nextDays = Math.round((intervalDays || 1) * 1.7);
    return { nextIntervalDays: Math.min(30, Math.max(3, nextDays)), newEasiness: easiness };
  } else {
    // Easy
    const nextDays = Math.round((intervalDays || 1) * 2.5);
    return { nextIntervalDays: Math.min(30, Math.max(5, nextDays)), newEasiness: Math.min(2.8, easiness + 0.15) };
  }
}

export async function fetchRevisionItems(exam: string = 'GATE'): Promise<RevisionItem[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('revision_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('exam', exam)
        .order('next_review_at', { ascending: true });

      if (!error && data && data.length > 0) {
        saveLocalRevisionItems(data as RevisionItem[]);
        return data as RevisionItem[];
      }
    }
  } catch (err) {
    console.warn('Revision items fetch warning:', err);
  }
  return getLocalRevisionItems().filter((r) => r.exam === exam);
}

export async function reviewRevisionItem(id: string, rating: SpacedRating): Promise<RevisionItem | null> {
  const list = getLocalRevisionItems();
  const index = list.findIndex((r) => r.id === id);
  if (index < 0) return null;

  const item = list[index];
  const { nextIntervalDays, newEasiness } = calculateNextSpacedInterval({
    rating,
    intervalDays: item.interval_days || 1,
    easiness: item.easiness || 2.5,
  });

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + nextIntervalDays);

  const updated: RevisionItem = {
    ...item,
    review_count: item.review_count + 1,
    interval_days: nextIntervalDays,
    easiness: newEasiness,
    last_reviewed_at: new Date().toISOString(),
    next_review_at: nextDate.toISOString(),
    updated_at: new Date().toISOString(),
  };

  list[index] = updated;
  saveLocalRevisionItems(list);

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      updated.user_id = user.id;
      await supabase.from('revision_items').upsert(updated);
      await supabase.from('revision_reviews').insert([{
        user_id: user.id,
        revision_id: updated.id,
        rating,
        interval_days: nextIntervalDays,
      }]);
    }
  } catch (err) {
    console.warn('Failed to persist revision review:', err);
  }

  return updated;
}

export async function createOrUpdateRevisionItem(params: {
  exam: string;
  subject: string;
  topic: string;
  sourceType: RevisionSourceType;
  sourceId?: string;
  title: string;
  summaryNotes?: string;
}): Promise<RevisionItem> {
  const list = getLocalRevisionItems();
  const existing = list.find(
    (r) => r.exam === params.exam && r.subject === params.subject && r.topic.toLowerCase() === params.topic.toLowerCase()
  );

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + 1);

  const item: RevisionItem = {
    id: existing?.id || `rev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    user_id: existing?.user_id || 'local',
    exam: params.exam,
    subject: params.subject,
    topic: params.topic,
    source_type: params.sourceType,
    source_id: params.sourceId,
    title: params.title,
    summary_notes: params.summaryNotes || existing?.summary_notes,
    review_count: existing?.review_count || 0,
    interval_days: existing?.interval_days || 1,
    easiness: existing?.easiness || 2.5,
    next_review_at: existing?.next_review_at || nextDate.toISOString(),
    created_at: existing?.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const existingIdx = list.findIndex((r) => r.id === item.id);
  if (existingIdx >= 0) {
    list[existingIdx] = item;
  } else {
    list.unshift(item);
  }
  saveLocalRevisionItems(list);

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      item.user_id = user.id;
      await supabase.from('revision_items').upsert(item);
    }
  } catch (err) {
    console.warn('Failed to upsert revision item:', err);
  }

  return item;
}

export function getRevisionStats(items: RevisionItem[]) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const endOfDay = startOfDay + 86400000;

  let dueToday = 0;
  let overdue = 0;
  let upcoming = 0;

  items.forEach((item) => {
    const dueTime = new Date(item.next_review_at).getTime();
    if (dueTime < startOfDay) {
      overdue++;
    } else if (dueTime >= startOfDay && dueTime <= endOfDay) {
      dueToday++;
    } else {
      upcoming++;
    }
  });

  return { dueToday: dueToday + overdue, overdue, dueOnlyToday: dueToday, upcoming };
}

function getLocalRevisionItems(): RevisionItem[] {
  try {
    const raw = localStorage.getItem(REVISION_LOCAL_KEY);
    return raw ? JSON.parse(raw) : getSeedRevisionItems();
  } catch {
    return getSeedRevisionItems();
  }
}

function saveLocalRevisionItems(items: RevisionItem[]) {
  try {
    localStorage.setItem(REVISION_LOCAL_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn('Local revision items save warning:', err);
  }
}

function getSeedRevisionItems(): RevisionItem[] {
  const today = new Date().toISOString();
  return [
    {
      id: 'rev-seed-1',
      user_id: 'local',
      exam: 'GATE',
      subject: 'Computer Networks',
      topic: 'TCP Congestion Control',
      source_type: 'mistake',
      title: 'TCP Slow Start & Congestion Avoidance',
      summary_notes: 'Slow-start doubles cwnd per RTT until ssthresh; Congestion avoidance increases additively (+1 MSS per RTT).',
      review_count: 1,
      interval_days: 1,
      easiness: 2.5,
      next_review_at: today,
      created_at: today,
    },
    {
      id: 'rev-seed-2',
      user_id: 'local',
      exam: 'GATE',
      subject: 'DBMS',
      topic: 'Normalization',
      source_type: 'roadmap',
      title: 'BCNF vs 3NF Functional Dependencies',
      summary_notes: 'In 3NF, X -> Y requires X is superkey or Y is prime attribute. In BCNF, X must be a superkey for every non-trivial X -> Y.',
      review_count: 2,
      interval_days: 3,
      easiness: 2.4,
      next_review_at: today,
      created_at: today,
    },
    {
      id: 'rev-seed-3',
      user_id: 'local',
      exam: 'GATE',
      subject: 'Operating Systems',
      topic: 'Deadlocks',
      source_type: 'concept',
      title: 'Bankers Algorithm & Safe State',
      summary_notes: 'Four Coffman conditions: Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait. Banker algorithm calculates Need = Max - Allocation.',
      review_count: 0,
      interval_days: 1,
      easiness: 2.5,
      next_review_at: today,
      created_at: today,
    },
  ];
}
