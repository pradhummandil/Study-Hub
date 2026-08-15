// src/context/StudentContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getStudentProfile, saveStudentProfile } from '../lib/studentCoreApi';
import type { StudentProfile, EducationPath, ExamCategory } from '../types/student-core';
import { EXAM_CONFIGS } from '../types/student-core';
import type { StudentContextType } from '../lib/personalization/studentContext';
import { getActiveSubjects } from '../lib/personalization/studentContext';
import { fetchNormalizedStudentState } from '../lib/intelligence/studentStateEngine';
import type { StudentLearningState } from '../lib/intelligence/studentStateEngine';

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [learningState, setLearningState] = useState<StudentLearningState | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeContextMode, setActiveContextMode] = useState<'college' | 'competitive'>('competitive');

  // Real statistics state
  const [actualQuestionsSolved, setActualQuestionsSolved] = useState(0);
  const [actualAccuracyPct, setActualAccuracyPct] = useState(0);
  const [actualStreakDays, setActualStreakDays] = useState(0);

  const loadContext = useCallback(async () => {
    setLoading(true);
    const p = await getStudentProfile();
    setProfile(p);
    
    if (p?.active_context) {
      setActiveContextMode(p.active_context);
    } else if (p?.education_path === 'college' || p?.education_stage === 'undergraduate' || p?.education_stage === 'school') {
      setActiveContextMode(p.education_path === 'both' ? 'college' : p.education_path === 'college' || p.education_path === 'school' ? 'college' : 'competitive');
    }

    const normState = await fetchNormalizedStudentState(user?.id || null, p);
    setLearningState(normState);

    setActualQuestionsSolved(normState.questionsSolved);
    setActualAccuracyPct(normState.accuracy);
    setActualStreakDays(normState.streak);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      loadContext();
    }
  }, [authLoading, loadContext]);

  const switchContext = async (mode: 'college' | 'competitive') => {
    setActiveContextMode(mode);
    if (profile) {
      const updated = { ...profile, active_context: mode };
      setProfile(updated);
      await saveStudentProfile({ active_context: mode });
      await loadContext();
    }
  };

  const switchExam = async (exam: ExamCategory, year?: string) => {
    const defaultYear = year || EXAM_CONFIGS[exam]?.currentCycle || '2027';
    if (profile) {
      const updated = { ...profile, target_exam: exam, target_exam_year: defaultYear };
      setProfile(updated);
      await saveStudentProfile({ target_exam: exam, target_exam_year: defaultYear });
      await loadContext();
    } else {
      await saveStudentProfile({ target_exam: exam, target_exam_year: defaultYear });
      await loadContext();
    }
  };

  const updateProfile = async (updates: Partial<StudentProfile>): Promise<StudentProfile | null> => {
    const saved = await saveStudentProfile(updates);
    if (saved) {
      setProfile(saved);
      if (updates.active_context) {
        setActiveContextMode(updates.active_context);
      }
      await loadContext();
    }
    return saved;
  };

  const educationPath: EducationPath = profile?.education_path || 'competitive';
  const targetExam: ExamCategory = profile?.target_exam || 'GATE';
  const targetExamYear: string = profile?.target_exam_year || '2027';
  const targetGoal: string = profile?.target_goal || 'Top Rank';
  const dailyStudyMinutes: number = profile?.daily_study_minutes || 180;
  const branch: string | undefined = profile?.branch_major;
  const classOrYear: string | undefined = profile?.college_year || profile?.school_class;

  const subjects = getActiveSubjects(profile, activeContextMode);
  const isCombinedUser = educationPath === 'both' || (profile?.competitive_exam_enabled && (profile?.education_stage === 'school' || profile?.education_stage === 'undergraduate'));

  return (
    <StudentContext.Provider
      value={{
        userId: user?.id || 'guest_user',
        profile,
        loading: authLoading || loading,
        educationPath,
        targetExam,
        targetExamYear,
        targetGoal,
        subjects,
        branch,
        classOrYear,
        dailyStudyMinutes,
        activeContext: activeContextMode,
        isCombinedUser: !!isCombinedUser,
        learningState,
        switchContext,
        switchExam,
        updateProfile,
        refetchContext: loadContext,
        hasRealAttempts: actualQuestionsSolved > 0,
        actualAccuracyPct,
        actualQuestionsSolved,
        actualStreakDays,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
};

export const useStudentContext = () => {
  const ctx = useContext(StudentContext);
  if (!ctx) {
    throw new Error('useStudentContext must be used within a StudentProvider');
  }
  return ctx;
};

export const useStudentLearningState = () => {
  const ctx = useStudentContext();
  return {
    state: ctx.learningState,
    loading: ctx.loading,
    refetch: ctx.refetchContext,
  };
};

