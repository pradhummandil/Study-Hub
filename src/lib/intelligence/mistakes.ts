// src/lib/intelligence/mistakes.ts
import { supabase } from '../supabase';
import type { MistakeRecord, MistakeType, MistakeSeverity } from '../../types/intelligence';

const MISTAKES_NOTEBOOK_KEY = 'studyhub_mistake_notebook';

export function classifyMistake(params: {
  questionType?: string;
  timeTakenSeconds: number;
  attemptCount: number;
  studentAnswer?: any;
  correctAnswer?: any;
}): MistakeType {
  const { questionType, timeTakenSeconds, attemptCount } = params;

  if (timeTakenSeconds > 0 && timeTakenSeconds < 12) {
    return 'careless_error';
  }
  if (timeTakenSeconds > 180) {
    return 'time_pressure';
  }
  if (questionType === 'Numerical') {
    return 'calculation_error';
  }
  if (attemptCount >= 2) {
    return 'concept_gap';
  }

  // When data is insufficient or ambiguous, do NOT fabricate: return unknown
  return 'unknown';
}

export async function fetchMistakeNotebook(params?: {
  exam?: string;
  subject?: string;
  topic?: string;
  mistakeType?: string;
  severity?: string;
  mastered?: boolean;
  sortBy?: 'recent' | 'repeated' | 'severity' | 'weakest' | 'due';
}): Promise<MistakeRecord[]> {
  let list: MistakeRecord[] = [];

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      let query = supabase.from('mistake_notebook').select('*').eq('user_id', user.id);
      if (params?.exam) query = query.eq('exam', params.exam);
      if (params?.subject) query = query.eq('subject', params.subject);
      if (params?.topic) query = query.eq('topic', params.topic);
      if (params?.mistakeType && params.mistakeType !== 'all') query = query.eq('mistake_type', params.mistakeType);
      if (params?.severity && params.severity !== 'all') query = query.eq('severity', params.severity);
      if (typeof params?.mastered === 'boolean') query = query.eq('mastered', params.mastered);

      const { data, error } = await query.order('created_at', { ascending: false });
      if (!error && data) {
        list = data as MistakeRecord[];
        saveLocalMistakeNotebook(list);
      } else {
        list = getLocalMistakeNotebook();
      }
    } else {
      list = getLocalMistakeNotebook();
    }
  } catch (err) {
    console.warn('Mistake notebook fetch warning:', err);
    list = getLocalMistakeNotebook();
  }

  // Filter local memory/storage if fallback
  if (params) {
    if (params.exam) list = list.filter((m) => m.exam === params.exam);
    if (params.subject) list = list.filter((m) => m.subject === params.subject);
    if (params.topic) list = list.filter((m) => m.topic.toLowerCase().includes(params.topic!.toLowerCase()));
    if (params.mistakeType && params.mistakeType !== 'all') list = list.filter((m) => m.mistake_type === params.mistakeType);
    if (params.severity && params.severity !== 'all') list = list.filter((m) => m.severity === params.severity);
    if (typeof params.mastered === 'boolean') list = list.filter((m) => m.mastered === params.mastered);
  }

  // Apply Sorting
  const sortBy = params?.sortBy || 'recent';
  return sortMistakes(list, sortBy);
}

export async function recordMistakeAutomatically(params: {
  questionId: string;
  exam: string;
  year?: number;
  subject: string;
  topic: string;
  questionText: string;
  options?: string[];
  questionType?: string;
  studentAnswer: any;
  correctAnswer: any;
  explanation?: string;
  timeTakenSeconds: number;
}): Promise<MistakeRecord> {
  const existingList = getLocalMistakeNotebook();
  const existing = existingList.find((m) => m.question_id === params.questionId);

  const attemptCount = (existing?.attempt_count || 0) + 1;
  const mistakeType = classifyMistake({
    questionType: params.questionType,
    timeTakenSeconds: params.timeTakenSeconds,
    attemptCount,
    studentAnswer: params.studentAnswer,
    correctAnswer: params.correctAnswer,
  });

  const severity: MistakeSeverity = attemptCount >= 3 ? 'high' : attemptCount === 2 ? 'medium' : 'low';

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + 1); // schedule initial 1-day spaced review

  const record: MistakeRecord = {
    id: existing?.id || `mistake-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    user_id: existing?.user_id || 'local',
    question_id: params.questionId,
    exam: params.exam,
    year: params.year,
    subject: params.subject,
    topic: params.topic,
    question_snapshot: {
      question_text: params.questionText,
      options: params.options,
      question_type: params.questionType,
    },
    student_answer: params.studentAnswer,
    correct_answer: params.correctAnswer,
    explanation: params.explanation,
    time_taken: params.timeTakenSeconds,
    attempt_count: attemptCount,
    mistake_type: mistakeType,
    severity,
    mastered: false,
    next_review_at: nextReviewDate.toISOString(),
    created_at: existing?.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  saveSingleLocalMistake(record);

  // Sync to Supabase
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      record.user_id = user.id;
      await supabase.from('mistake_notebook').upsert(record, { onConflict: 'id' });
    }
  } catch (err) {
    console.warn('Failed to upsert mistake record:', err);
  }

  return record;
}

export async function markMistakeMastered(id: string, mastered: boolean = true): Promise<boolean> {
  const list = getLocalMistakeNotebook();
  const index = list.findIndex((m) => m.id === id);
  if (index >= 0) {
    list[index].mastered = mastered;
    list[index].updated_at = new Date().toISOString();
    saveLocalMistakeNotebook(list);
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('mistake_notebook').update({ mastered, updated_at: new Date().toISOString() }).eq('id', id).eq('user_id', user.id);
    }
    return true;
  } catch (err) {
    console.warn('Failed to mark mistake as mastered:', err);
    return false;
  }
}

function sortMistakes(list: MistakeRecord[], sortBy: string): MistakeRecord[] {
  const sorted = [...list];
  if (sortBy === 'recent') {
    sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } else if (sortBy === 'repeated') {
    sorted.sort((a, b) => b.attempt_count - a.attempt_count);
  } else if (sortBy === 'severity') {
    const weights: Record<string, number> = { high: 3, medium: 2, low: 1 };
    sorted.sort((a, b) => (weights[b.severity] || 0) - (weights[a.severity] || 0));
  } else if (sortBy === 'due') {
    sorted.sort((a, b) => new Date(a.next_review_at || 0).getTime() - new Date(b.next_review_at || 0).getTime());
  }
  return sorted;
}

function getLocalMistakeNotebook(): MistakeRecord[] {
  try {
    const raw = localStorage.getItem(MISTAKES_NOTEBOOK_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalMistakeNotebook(list: MistakeRecord[]) {
  try {
    localStorage.setItem(MISTAKES_NOTEBOOK_KEY, JSON.stringify(list));
  } catch (err) {
    console.warn('Local mistake notebook save warning:', err);
  }
}

function saveSingleLocalMistake(record: MistakeRecord) {
  const list = getLocalMistakeNotebook();
  const existingIdx = list.findIndex((m) => m.id === record.id || m.question_id === record.question_id);
  if (existingIdx >= 0) {
    list[existingIdx] = record;
  } else {
    list.unshift(record);
  }
  saveLocalMistakeNotebook(list.slice(0, 300));
}
