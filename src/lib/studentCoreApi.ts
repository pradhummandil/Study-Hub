// src/lib/studentCoreApi.ts
import { supabase } from './supabase';
import type { StudentProfile, StudentSubjectProgress, ExamCategory } from '../types/student-core';
import { EXAM_CONFIGS } from '../types/student-core';

const PROFILE_LOCAL_KEY = 'studyhub_student_profile';
const SUBJECT_PROGRESS_KEY = 'studyhub_subject_progress';

export async function getStudentProfile(): Promise<StudentProfile | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // Fallback local storage check
      const raw = localStorage.getItem(PROFILE_LOCAL_KEY);
      return raw ? JSON.parse(raw) : null;
    }

    const { data, error } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.warn('Supabase fetch profile warning:', error.message);
    }

    if (data) {
      localStorage.setItem(PROFILE_LOCAL_KEY, JSON.stringify(data));
      return data as StudentProfile;
    }

    // Try local storage if Supabase table is not populated yet
    const raw = localStorage.getItem(PROFILE_LOCAL_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn('Failed to get student profile:', err);
    const raw = localStorage.getItem(PROFILE_LOCAL_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}

export async function saveStudentProfile(profile: Partial<StudentProfile>): Promise<StudentProfile | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const existing = await getStudentProfile();

    const merged: StudentProfile = {
      user_id: user?.id || existing?.user_id || 'guest_user',
      target_exam: profile.target_exam || existing?.target_exam || 'GATE',
      target_exam_year: profile.target_exam_year || existing?.target_exam_year || '2027',
      target_goal: profile.target_goal || existing?.target_goal || 'Top Rank',
      target_rank: profile.target_rank ?? existing?.target_rank,
      target_score: profile.target_score ?? existing?.target_score,
      daily_study_minutes: profile.daily_study_minutes || existing?.daily_study_minutes || 180,
      current_level: profile.current_level || existing?.current_level || 'Some preparation done',
      exam_date: profile.exam_date ?? existing?.exam_date,
      onboarding_completed: profile.onboarding_completed ?? true,
      subject_ratings: profile.subject_ratings || existing?.subject_ratings || {},
      updated_at: new Date().toISOString(),
    };

    // Save to LocalStorage immediately
    localStorage.setItem(PROFILE_LOCAL_KEY, JSON.stringify(merged));

    if (user) {
      const { data, error } = await supabase
        .from('student_profiles')
        .upsert(merged)
        .select()
        .single();

      if (error) {
        console.warn('Supabase upsert profile warning:', error.message);
        return merged;
      }
      return data as StudentProfile;
    }

    return merged;
  } catch (err) {
    console.warn('Failed to save profile:', err);
    return null;
  }
}

export async function getStudentSubjectProgress(exam: ExamCategory): Promise<StudentSubjectProgress[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return getLocalSubjectProgress(exam);

    const { data, error } = await supabase
      .from('student_subject_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('exam', exam);

    if (error) {
      console.warn('Supabase subject progress warning:', error.message);
      return getLocalSubjectProgress(exam);
    }

    if (data && data.length > 0) {
      return data as StudentSubjectProgress[];
    }

    return getLocalSubjectProgress(exam);
  } catch {
    return getLocalSubjectProgress(exam);
  }
}

function getLocalSubjectProgress(exam: ExamCategory): StudentSubjectProgress[] {
  const subjects = EXAM_CONFIGS[exam]?.subjects || EXAM_CONFIGS['GATE'].subjects;
  try {
    const raw = localStorage.getItem(`${SUBJECT_PROGRESS_KEY}_${exam}`);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }

  // Generate initial state for subjects
  return subjects.map((subj) => ({
    user_id: 'local',
    exam,
    subject: subj,
    status: 'not_started',
    confidence: 'average',
    progress: 0,
    accuracy: 0,
    questions_attempted: 0,
    questions_correct: 0,
  }));
}

export async function saveSubjectRatings(exam: ExamCategory, ratings: Record<string, 'Weak' | 'Average' | 'Strong'>) {
  const list = Object.entries(ratings).map(([subject, confidence]) => ({
    exam,
    subject,
    confidence: confidence.toLowerCase() as 'weak' | 'average' | 'strong',
    status: 'learning' as const,
    progress: confidence === 'Strong' ? 40 : confidence === 'Average' ? 20 : 10,
    accuracy: confidence === 'Strong' ? 80 : confidence === 'Average' ? 65 : 45,
    questions_attempted: 0,
    questions_correct: 0,
  }));

  try {
    localStorage.setItem(`${SUBJECT_PROGRESS_KEY}_${exam}`, JSON.stringify(list));
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const records = list.map((item) => ({ ...item, user_id: user.id }));
      await supabase.from('student_subject_progress').upsert(records);
    }
  } catch (err) {
    console.warn('Failed to save subject ratings:', err);
  }
}

// ── Daily Study Plan Generator ─────────────────────────────────────────────
export interface TodayPlanItem {
  id: string;
  time: string;
  title: string;
  subTitle: string;
  durationMinutes: number;
  activityType: 'focus' | 'practice' | 'quiz' | 'revision';
  actionPath: string;
  actionState?: Record<string, any>;
  completed: boolean;
}

export function generateTodayStudyPlan(profile: StudentProfile | null): TodayPlanItem[] {
  const exam = profile?.target_exam || 'GATE';
  const subjects = EXAM_CONFIGS[exam]?.subjects || EXAM_CONFIGS['GATE'].subjects;
  const minutes = profile?.daily_study_minutes || 180;

  const subj1 = subjects[0] || 'Core Subject 1';
  const subj2 = subjects[1] || 'Core Subject 2';
  const subj3 = subjects[2] || 'Core Subject 3';

  if (minutes <= 120) {
    return [
      {
        id: '1',
        time: '08:00',
        title: `${subj1} Concept Focus`,
        subTitle: 'Key Theory & Notes',
        durationMinutes: 45,
        activityType: 'focus',
        actionPath: '/focus-room',
        completed: false,
      },
      {
        id: '2',
        time: '18:00',
        title: `${subj1} PYQs`,
        subTitle: '10 Selected PYQs',
        durationMinutes: 45,
        activityType: 'practice',
        actionPath: '/practice',
        actionState: { exam, subject: subj1 },
        completed: false,
      },
      {
        id: '3',
        time: '20:00',
        title: 'StudyMate Quick Quiz',
        subTitle: '15 Min Revision',
        durationMinutes: 15,
        activityType: 'quiz',
        actionPath: '/study-ai',
        actionState: { mode: 'Quiz', prompt: `Generate a 5-question quiz on ${subj1}` },
        completed: false,
      },
    ];
  }

  return [
    {
      id: '1',
      time: '08:00',
      title: `${subj1} Deep Work`,
      subTitle: 'Core Concepts & Architecture',
      durationMinutes: 60,
      activityType: 'focus',
      actionPath: '/focus-room',
      completed: false,
    },
    {
      id: '2',
      time: '10:00',
      title: `${subj1} PYQ Practice`,
      subTitle: '15 High-Yield Questions',
      durationMinutes: 45,
      activityType: 'practice',
      actionPath: '/practice',
      actionState: { exam, subject: subj1 },
      completed: false,
    },
    {
      id: '3',
      time: '17:00',
      title: `${subj2} Revision`,
      subTitle: 'Formulae & Quick Review',
      durationMinutes: 45,
      activityType: 'focus',
      actionPath: '/focus-room',
      completed: false,
    },
    {
      id: '4',
      time: '20:00',
      title: `${subj3} StudyMate AI Check`,
      subTitle: 'Adaptive Topic Quiz',
      durationMinutes: 30,
      activityType: 'quiz',
      actionPath: '/study-ai',
      actionState: { mode: 'Quiz', prompt: `Create a 5 question test on ${subj3}` },
      completed: false,
    },
  ];
}
