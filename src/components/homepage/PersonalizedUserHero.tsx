import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useStudentContext } from '../../context/StudentContext';
import { ArrowRight, Clock, Target, Sparkles, LayoutDashboard, Compass } from 'lucide-react';

export const PersonalizedUserHero: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const studentContext = useStudentContext();

  const fullName = user?.user_metadata?.full_name || user?.email || 'Student';
  const firstName = fullName.split(' ')[0].split('@')[0];

  const targetExam = studentContext.targetExam || 'GATE';
  const targetYear = studentContext.targetExamYear || '2027';
  const branch = studentContext.branch || 'Computer Science';
  const hasProfile = studentContext.profile?.onboarding_completed;

  return (
    <section className="relative z-10 py-12 md:py-16 bg-gradient-to-b from-[#F8FCFF] via-[#EDF6FF] to-[#FFFFFF] border-b border-slate-200/60">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[#062B3D] text-white rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden border border-white/10"
        >
          {/* Subtle Glow & Background Graphics */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-radial from-[#287BFF]/25 via-[#5CE1E6]/10 to-transparent blur-3xl pointer-events-none" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Greeting & Next Best Step */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#5CE1E6] text-xs font-semibold mb-4 border border-[#5CE1E6]/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Personalized Study Hub</span>
              </div>

              <h1
                className="text-4xl sm:text-5xl font-normal text-white mb-2 leading-tight"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                Welcome back, {firstName}.
              </h1>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 mb-6">
                <span className="bg-[#287BFF]/20 text-[#5CE1E6] font-bold px-2.5 py-1 rounded-md border border-[#287BFF]/30 flex items-center gap-1">
                  <Target className="w-3.5 h-3.5" />
                  {targetExam} {targetYear}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-300">{branch}</span>
              </div>

              {hasProfile ? (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 w-full max-w-lg mb-8">
                  <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
                    <span className="flex items-center gap-1.5 font-semibold text-[#5CE1E6]">
                      <Clock className="w-3.5 h-3.5" /> Recommended Next Step
                    </span>
                    <span>30 min session</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">
                    Computer Networks — TCP Congestion Control
                  </h3>
                  <p className="text-xs text-slate-300">
                    High-yield topic for {targetExam}. Practice 10 previous year questions.
                  </p>
                </div>
              ) : (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 w-full max-w-lg mb-8">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#5CE1E6] mb-1">
                    <Compass className="w-4 h-4" /> Ready to personalize?
                  </div>
                  <p className="text-sm text-slate-200">
                    Set up your target exam, daily study goals, and subjects to unlock your custom roadmap.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => navigate(hasProfile ? '/dashboard' : '/setup')}
                  className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#287BFF] to-[#6F7CFF] text-white font-semibold text-sm shadow-lg shadow-[#287BFF]/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{hasProfile ? 'Continue studying →' : 'Set up my study path'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/study-ai')}
                  className="px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium text-sm transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/20"
                >
                  <Sparkles className="w-4 h-4 text-[#5CE1E6]" />
                  <span>Ask StudyMate</span>
                </button>
              </div>
            </div>

            {/* Right Mini Status Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 w-full max-w-sm space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Personalized Workspace
                  </span>
                  <LayoutDashboard className="w-4 h-4 text-[#5CE1E6]" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">Target Exam</span>
                    <span className="font-bold text-white">{targetExam}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">Daily Goal</span>
                    <span className="font-bold text-[#5CE1E6]">
                      {Math.round(studentContext.dailyStudyMinutes / 60)} Hours / Day
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">Questions Solved</span>
                    <span className="font-bold text-white">{studentContext.actualQuestionsSolved}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">Streak</span>
                    <span className="font-bold text-amber-400">{studentContext.actualStreakDays} Days</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="w-full mt-2 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-slate-200 transition-colors text-center block"
                >
                  Open Full Dashboard
                </button>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
};
