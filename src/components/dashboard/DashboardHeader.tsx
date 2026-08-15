import React from 'react';
import { Link } from 'react-router-dom';
import { Settings, Shield, Calendar, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStudentContext } from '../../context/StudentContext';
import { EXAM_CONFIGS } from '../../types/student-core';

export const DashboardHeader: React.FC = () => {
  const { user } = useAuth();
  const { profile, targetExam, targetExamYear } = useStudentContext();

  const fullName = user?.user_metadata?.full_name || user?.email || 'Student';
  const firstName = fullName.split(' ')[0].split('@')[0];

  // Dynamic days remaining calculation
  let daysRemaining: number | null = null;
  const examConfig = EXAM_CONFIGS[targetExam];
  const targetDateStr = profile?.exam_date || examConfig?.defaultExamDate;

  if (targetDateStr) {
    const target = new Date(targetDateStr).getTime();
    const now = new Date().getTime();
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    if (diff > 0) daysRemaining = diff;
  }

  return (
    <div className="bg-forest text-paper py-6 sm:py-7 px-6 rounded-3xl border border-forest/20 shadow-deep relative overflow-hidden">
      {/* Subtle ambient glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-scholar/20 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gold bg-gold/15 px-3 py-0.5 rounded-full border border-gold/30 font-mono inline-flex items-center gap-1.5">
              <Shield className="w-3 h-3" />
              {targetExam} {targetExamYear}
            </span>
            {profile?.target_goal && (
              <span className="text-[10px] font-semibold text-sage bg-scholar/40 px-2.5 py-0.5 rounded-full border border-sage/20 font-mono">
                Target: {profile.target_goal}
              </span>
            )}
          </div>

          <h1
            className="text-2xl sm:text-3xl md:text-4xl font-normal text-paper tracking-tight leading-snug"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Know what to study next, <span className="text-gold italic">{firstName}</span>.
          </h1>

          <p className="text-xs sm:text-sm text-sage font-sans flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-gold shrink-0" />
            <span>Your preparation is moving forward.</span>
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
          {daysRemaining !== null ? (
            <div className="bg-scholar/50 border border-sage/30 rounded-2xl px-4 py-2 text-center font-mono shadow-inner min-w-[120px]">
              <span className="text-2xl font-bold text-gold block leading-none tracking-tight">
                {daysRemaining} DAYS LEFT
              </span>
              <span className="text-[9px] text-sage uppercase tracking-widest block mt-0.5">
                Target: {targetExam} {targetExamYear}
              </span>
            </div>
          ) : (
            <div className="bg-scholar/30 border border-sage/20 rounded-2xl px-4 py-2 text-center font-mono">
              <Calendar className="w-3.5 h-3.5 text-gold mx-auto mb-0.5" />
              <span className="text-[11px] text-sage block font-sans">Date upcoming</span>
            </div>
          )}

          <Link
            to="/setup"
            className="bg-scholar/40 hover:bg-scholar rounded-2xl px-4 py-2.5 text-xs text-paper font-semibold transition-all flex items-center gap-1.5 border border-sage/30 shadow-sm"
          >
            <Settings className="w-3.5 h-3.5 text-gold" />
            <span>Edit setup</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
