// src/lib/intelligence/mastery.ts
import { supabase } from '../supabase';
import type { StudentConceptMastery, ConceptMasteryStatus } from '../../types/intelligence';

const MASTERY_LOCAL_KEY = 'studyhub_concept_mastery';

export async function fetchConceptMastery(exam: string, subject?: string): Promise<StudentConceptMastery[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      let query = supabase
        .from('student_concept_mastery')
        .select('*')
        .eq('user_id', user.id)
        .eq('exam', exam);
      
      if (subject) {
        query = query.eq('subject', subject);
      }
      
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        saveLocalMastery(data as StudentConceptMastery[]);
        return data as StudentConceptMastery[];
      }
    }
  } catch (err) {
    console.warn('Concept mastery fetch warning:', err);
  }
  return getLocalMastery(exam, subject);
}

export async function updateMasteryForAttempt(params: {
  exam: string;
  subject: string;
  topic: string;
  isCorrect: boolean;
  timeTakenSeconds: number;
  difficulty?: string;
}): Promise<StudentConceptMastery> {
  const { exam, subject, topic, isCorrect, timeTakenSeconds } = params;
  const existingList = await fetchConceptMastery(exam, subject);
  const existing = existingList.find((m) => m.topic.toLowerCase() === topic.toLowerCase());

  const attempted = (existing?.questions_attempted || 0) + 1;
  const correct = (existing?.questions_correct || 0) + (isCorrect ? 1 : 0);
  const streakCorrect = isCorrect ? (existing?.streak_correct || 0) + 1 : 0;
  const streakWrong = !isCorrect ? (existing?.streak_wrong || 0) + 1 : 0;
  const recentAccuracy = Math.round((correct / attempted) * 100);

  // Compute speed weighting (faster correct answers boost confidence)
  const prevSpeed = existing?.recent_speed || 60;
  const newSpeed = Math.round((prevSpeed * attempted + timeTakenSeconds) / (attempted + 1));

  // Mastery score formula: accuracy (60%) + streak bonus (20%) + recency/volume (20%)
  const volumeBonus = Math.min(20, attempted * 2);
  const streakBonus = Math.min(20, streakCorrect * 4);
  const rawScore = Math.round(recentAccuracy * 0.6 + streakBonus + volumeBonus);
  const masteryScore = Math.min(100, Math.max(0, rawScore));

  let status: ConceptMasteryStatus = 'learning';
  if (masteryScore >= 85 && attempted >= 5) {
    status = 'mastered';
  } else if (masteryScore >= 70) {
    status = 'strong';
  } else if (masteryScore >= 45) {
    status = 'developing';
  } else if (attempted === 0) {
    status = 'not_started';
  }

  // Next review interval calculation based on mastery score
  const daysToAdd = status === 'mastered' ? 14 : status === 'strong' ? 7 : status === 'developing' ? 3 : 1;
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + daysToAdd);

  const updatedRecord: StudentConceptMastery = {
    id: existing?.id || `cm-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    user_id: existing?.user_id || 'local',
    exam,
    subject,
    topic,
    mastery_score: masteryScore,
    confidence_score: Math.min(100, Math.round(masteryScore * 0.9 + (isCorrect ? 10 : 0))),
    questions_attempted: attempted,
    questions_correct: correct,
    recent_accuracy: recentAccuracy,
    recent_speed: newSpeed,
    streak_correct: streakCorrect,
    streak_wrong: streakWrong,
    last_attempted_at: new Date().toISOString(),
    next_review_at: nextReviewDate.toISOString(),
    status,
    updated_at: new Date().toISOString(),
  };

  // Save to LocalStorage
  saveSingleLocalMastery(updatedRecord);

  // Sync to Supabase if authenticated
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      updatedRecord.user_id = user.id;
      await supabase.from('student_concept_mastery').upsert(updatedRecord, {
        onConflict: 'user_id,exam,subject,topic',
      });
    }
  } catch (err) {
    console.warn('Failed to upsert concept mastery to Supabase:', err);
  }

  return updatedRecord;
}

function getLocalMastery(exam: string, subject?: string): StudentConceptMastery[] {
  try {
    const raw = localStorage.getItem(MASTERY_LOCAL_KEY);
    if (!raw) return [];
    const list: StudentConceptMastery[] = JSON.parse(raw);
    return list.filter((m) => m.exam === exam && (!subject || m.subject === subject));
  } catch {
    return [];
  }
}

function saveLocalMastery(items: StudentConceptMastery[]) {
  try {
    const raw = localStorage.getItem(MASTERY_LOCAL_KEY);
    const existing: StudentConceptMastery[] = raw ? JSON.parse(raw) : [];
    const map = new Map<string, StudentConceptMastery>();
    existing.forEach((i) => map.set(`${i.exam}-${i.subject}-${i.topic}`, i));
    items.forEach((i) => map.set(`${i.exam}-${i.subject}-${i.topic}`, i));
    localStorage.setItem(MASTERY_LOCAL_KEY, JSON.stringify(Array.from(map.values())));
  } catch (err) {
    console.warn('Local mastery save failed:', err);
  }
}

function saveSingleLocalMastery(item: StudentConceptMastery) {
  saveLocalMastery([item]);
}
