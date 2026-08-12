// src/context/StudentContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { getStudentProfile, saveStudentProfile } from '../lib/studentCoreApi';
import type { StudentProfile, EducationPath } from '../types/student-core';
import type { StudentContextType } from '../lib/personalization/studentContext';
import { getLocalAttempts } from '../lib/practiceApi';
import { getFocusData } from '../lib/focusStorage';

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeContextMode, setActiveContextMode] = useState<'college' | 'competitive'>('competitive');

  // Real statistics state
  const [actualQuestionsSolved, setActualQuestionsSolved] = useState(0);
  const [actualAccuracyPct, setActualAccuracyPct] = useState(0);
  const [actualStreakDays, setActualStreakDays] = useState(0);

  useEffect(() => {
    let isMounted = true;
    async function loadContext() {
      if (!user) {
        if (isMounted) {
          setProfile(null);
          setLoading(false);
          setActualQuestionsSolved(0);
          setActualAccuracyPct(0);
          setActualStreakDays(0);
        }
        return;
      }

      setLoading(true);
      const p = await getStudentProfile();
      if (isMounted) {
        setProfile(p);
        if (p?.active_context) {
          setActiveContextMode(p.active_context);
        } else if (p?.education_path === 'college' || p?.education_stage === 'undergraduate' || p?.education_stage === 'school') {
          setActiveContextMode(p.education_path === 'both' ? 'college' : p.education_path === 'college' || p.education_path === 'school' ? 'college' : 'competitive');
        }

        // Calculate REAL user statistics from stored user attempts & focus logs
        const attempts = getLocalAttempts();
        const solved = attempts.length;
        const correct = attempts.filter((a) => a.is_correct).length;
        const acc = solved > 0 ? Math.round((correct / solved) * 100) : 0;
        
        const focus = getFocusData();
        const streak = focus.currentStreak || 0;

        setActualQuestionsSolved(solved);
        setActualAccuracyPct(acc);
        setActualStreakDays(streak);
        setLoading(false);
      }
    }

    if (!authLoading) {
      loadContext();
    }
    return () => { isMounted = false; };
  }, [user, authLoading]);

  const switchContext = async (mode: 'college' | 'competitive') => {
    setActiveContextMode(mode);
    if (profile) {
      const updated = { ...profile, active_context: mode };
      setProfile(updated);
      await saveStudentProfile({ active_context: mode });
    }
  };

  const updateProfile = async (updates: Partial<StudentProfile>): Promise<StudentProfile | null> => {
    const saved = await saveStudentProfile(updates);
    if (saved) {
      setProfile(saved);
    }
    return saved;
  };

  const educationPath: EducationPath = profile?.education_path || 'competitive';
  const isCombinedUser = educationPath === 'both' || (profile?.competitive_exam_enabled && (profile?.education_stage === 'school' || profile?.education_stage === 'undergraduate'));

  return (
    <StudentContext.Provider
      value={{
        profile,
        loading: authLoading || loading,
        educationPath,
        activeContext: activeContextMode,
        isCombinedUser: !!isCombinedUser,
        switchContext,
        updateProfile,
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
