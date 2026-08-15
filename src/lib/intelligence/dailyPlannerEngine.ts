// src/lib/intelligence/dailyPlannerEngine.ts
import { supabase } from '../supabase';
import type { StudentLearningState } from './studentStateEngine';
import type { StudentProfile } from '../../types/student-core';
import { EXAM_CONFIGS } from '../../types/student-core';

export type PlannerTaskType = 'PYQ_PRACTICE' | 'REVISION' | 'VIDEO_LESSON' | 'DAILY_MOCK' | 'NOTES_READ' | 'FLASHCARDS';
export type PlannerTaskStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';

export interface PlannedTask {
  id: string;
  timeSlot: string; // e.g. "09:00"
  subject: string;
  topic: string;
  type: PlannerTaskType;
  title: string;
  description: string;
  durationMinutes: number;
  questionCount?: number;
  status: PlannerTaskStatus;
  actionUrl: string;
  completedAt?: string;
}

export interface TodayPlan {
  date: string;
  exam: string;
  totalTasks: number;
  completedCount: number;
  tasks: PlannedTask[];
}

const STORAGE_KEY_PLAN = 'studyhub_daily_plan_v2';

export async function fetchOrCreateTodayPlan(
  userId: string | null,
  profile: StudentProfile | null,
  learningState: StudentLearningState | null
): Promise<TodayPlan> {
  const todayStr = new Date().toISOString().split('T')[0];

  // Try reading cached local plan for today
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PLAN);
    if (raw) {
      const parsed: TodayPlan = JSON.parse(raw);
      if (parsed.date === todayStr && parsed.exam === (profile?.target_exam || 'GATE')) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to parse cached plan:', err);
  }

  // Generate a fresh plan for today
  const freshPlan = generateDailyPlan(todayStr, profile, learningState);
  saveLocalPlan(freshPlan);

  // Sync to Supabase if authenticated
  if (userId && userId !== 'guest_user') {
    try {
      await supabase.from('daily_study_plans').upsert({
        user_id: userId,
        plan_date: todayStr,
        exam: freshPlan.exam,
        plan_data: freshPlan,
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Failed to sync plan to Supabase:', e);
    }
  }

  return freshPlan;
}

export function generateDailyPlan(
  date: string,
  profile: StudentProfile | null,
  state: StudentLearningState | null
): TodayPlan {
  const exam = profile?.target_exam || 'GATE';
  const availableMinutes = profile?.daily_study_minutes || 180;
  const subjects = state?.subjects || EXAM_CONFIGS[exam]?.subjects || ['General Aptitude'];
  const s1 = subjects[0] || 'Computer Networks';
  const s2 = subjects[1] || 'Operating Systems';
  const s3 = subjects[2] || 'Engineering Mathematics';

  const revisionDue = state?.revisionDueCount || 0;
  const mistakesCount = state?.recentMistakesCount || 0;

  // Calculate proportional durations respecting availableMinutes budget
  // Budget breakdown: 35% practice, 25% revision/flashcards, 25% video lesson, 15% daily mock
  const d1 = Math.max(15, Math.round(availableMinutes * 0.35));
  const d2 = Math.max(15, Math.round(availableMinutes * 0.25));
  const d3 = Math.max(15, Math.round(availableMinutes * 0.25));
  const d4 = Math.max(15, availableMinutes - (d1 + d2 + d3));

  const tasks: PlannedTask[] = [
    {
      id: `task-${date}-1`,
      timeSlot: '09:00',
      subject: s1,
      topic: mistakesCount > 0 ? 'Recent Mistakes Drill' : 'Core Concept Drill',
      type: 'PYQ_PRACTICE',
      title: `${s1} PYQ Practice`,
      description: mistakesCount > 0 ? `Targeted practice on ${mistakesCount} unmastered mistakes.` : `Solve high-value questions for ${s1}.`,
      durationMinutes: d1,
      questionCount: Math.max(5, Math.round(d1 * 0.4)),
      status: 'pending',
      actionUrl: `/practice?subject=${encodeURIComponent(s1)}`,
    },
    {
      id: `task-${date}-2`,
      timeSlot: '11:30',
      subject: s2,
      topic: 'Spaced Memory Review',
      type: revisionDue > 0 ? 'REVISION' : 'FLASHCARDS',
      title: revisionDue > 0 ? `${s2} Spaced Revision` : `${s2} Flashcards Review`,
      description: revisionDue > 0 ? `${revisionDue} revision items due today.` : `Review formula cards and key definitions.`,
      durationMinutes: d2,
      questionCount: revisionDue > 0 ? revisionDue : 15,
      status: 'pending',
      actionUrl: revisionDue > 0 ? '/revision' : '/flashcards',
    },
    {
      id: `task-${date}-3`,
      timeSlot: '17:00',
      subject: s3,
      topic: 'Key Concept Lecture',
      type: 'VIDEO_LESSON',
      title: `${s3} Video Lesson`,
      description: `Watch high-yield problem solving strategy for ${s3}.`,
      durationMinutes: d3,
      status: 'pending',
      actionUrl: `/video-learning?exam=${encodeURIComponent(exam)}&subject=${encodeURIComponent(s3)}`,
    },
    {
      id: `task-${date}-4`,
      timeSlot: '20:30',
      subject: exam,
      topic: 'Daily Mixed Assessment',
      type: 'DAILY_MOCK',
      title: `Daily Mini Mock Test`,
      description: `Timed evaluation across ${s1} & ${s2}.`,
      durationMinutes: d4,
      questionCount: Math.max(5, Math.round(d4 * 0.5)),
      status: 'pending',
      actionUrl: '/exam-simulator',
    },
  ];

  return {
    date,
    exam,
    totalTasks: tasks.length,
    completedCount: 0,
    tasks,
  };
}

export async function updateTaskStatus(
  plan: TodayPlan,
  taskId: string,
  newStatus: PlannerTaskStatus,
  userId?: string | null
): Promise<TodayPlan> {
  const updatedTasks = plan.tasks.map((t) => {
    if (t.id === taskId) {
      return {
        ...t,
        status: newStatus,
        completedAt: newStatus === 'completed' ? new Date().toISOString() : t.completedAt,
      };
    }
    return t;
  });

  const completedCount = updatedTasks.filter((t) => t.status === 'completed').length;
  const updatedPlan: TodayPlan = {
    ...plan,
    completedCount,
    tasks: updatedTasks,
  };

  saveLocalPlan(updatedPlan);

  if (userId && userId !== 'guest_user') {
    try {
      await supabase.from('daily_study_plans').upsert({
        user_id: userId,
        plan_date: plan.date,
        exam: plan.exam,
        plan_data: updatedPlan,
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Failed to save task update to Supabase:', e);
    }
  }

  return updatedPlan;
}

export function regeneratePlanOnEvent(
  plan: TodayPlan,
  event: 'missed_task' | 'poor_performance' | 'high_performance' | 'hours_changed' | 'exam_changed',
  eventData?: { subject?: string; accuracy?: number }
): TodayPlan {
  const newTasks = [...plan.tasks];

  if (event === 'poor_performance' && eventData?.subject) {
    // Add reinforcement task for poor performance (<40%) without removing finished tasks
    const reinforcementTask: PlannedTask = {
      id: `task-reinforce-${Date.now()}`,
      timeSlot: '21:30',
      subject: eventData.subject,
      topic: `${eventData.subject} Targeted Recovery`,
      type: 'PYQ_PRACTICE',
      title: `Reinforce ${eventData.subject}`,
      description: `You scored ${eventData.accuracy || 35}% in last session. Practice 10 targeted questions to lock concepts.`,
      durationMinutes: 20,
      questionCount: 10,
      status: 'pending',
      actionUrl: `/practice?subject=${encodeURIComponent(eventData.subject)}`,
    };

    // Avoid duplicate reinforcement tasks
    if (!newTasks.some((t) => t.title.includes(`Reinforce ${eventData.subject}`))) {
      newTasks.push(reinforcementTask);
    }
  } else if (event === 'missed_task') {
    // Mark overdue pending task as rescheduled or skipped
    const pendingIdx = newTasks.findIndex((t) => t.status === 'pending');
    if (pendingIdx !== -1) {
      newTasks[pendingIdx] = { ...newTasks[pendingIdx], timeSlot: 'Next Slot' };
    }
  }

  const updatedPlan: TodayPlan = {
    ...plan,
    totalTasks: newTasks.length,
    tasks: newTasks,
  };

  saveLocalPlan(updatedPlan);
  return updatedPlan;
}

function saveLocalPlan(plan: TodayPlan) {
  try {
    localStorage.setItem(STORAGE_KEY_PLAN, JSON.stringify(plan));
  } catch (e) {
    console.warn('Local plan save failed:', e);
  }
}
