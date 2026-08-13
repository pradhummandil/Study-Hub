// src/pages/Dashboard.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Flame, ArrowRight, Settings, Play, Sparkles,
  ChevronRight, RotateCcw, Layers, Award, BookOpen, Clock,
  ChevronDown, Target
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStudentContext } from '../context/StudentContext';
import { getFocusData } from '../lib/focusStorage';
import { generateTodayStudyPlan, type TodayPlanItem } from '../lib/studentCoreApi';
import type { Recommendation } from '../types/intelligence';
import { generateRecommendations } from '../lib/intelligence/recommendations';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const {
    profile,
    educationPath,
    activeContext,
    isCombinedUser,
    switchContext,
    hasRealAttempts,
    actualAccuracyPct,
    actualQuestionsSolved,
    actualStreakDays,
  } = useStudentContext();

  const [planItems, setPlanItems] = useState<TodayPlanItem[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Load User Data
  useEffect(() => {
    let isMounted = true;
    async function loadDashboardData() {
      if (!user || !profile) return;

      const plan = generateTodayStudyPlan(profile);
      if (isMounted) setPlanItems(plan);

      const exam = profile.target_exam || 'GATE';
      const recs = await generateRecommendations(exam);

      if (isMounted) {
        setRecommendations(recs);
      }
    }

    loadDashboardData();
    return () => { isMounted = false; };
  }, [user, profile]);

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mb-3" />
        <p className="text-xs text-muted-foreground">Loading personalized study space...</p>
      </div>
    );
  }

  const fullName = user?.user_metadata?.full_name || user?.email || 'Student';
  const firstName = fullName.split(' ')[0].split('@')[0];

  // Days remaining calculation
  let daysRemaining: number | null = null;
  if (profile?.exam_date) {
    const target = new Date(profile.exam_date).getTime();
    const now = new Date().getTime();
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    if (diff > 0) daysRemaining = diff;
  }

  const focusData = getFocusData();
  const todayMinutesDone = focusData.logs
    .filter((l) => l.date === new Date().toISOString().split('T')[0])
    .reduce((acc, curr) => acc + curr.minutes, 0);

  const hoursDone = (todayMinutesDone / 60).toFixed(1);

  // Active Context Label
  const isCollegeView = activeContext === 'college' || educationPath === 'college' || educationPath === 'school';
  const activeHeaderBadge = isCollegeView
    ? `${profile?.degree || 'B.Tech'} ${profile?.branch_major || 'IT'} • ${profile?.college_year || '3rd Year'}`
    : `${profile?.target_exam || 'GATE'} ${profile?.target_exam_year || '2027'}`;

  return (
    <>
      <Helmet>
        <title>My Study Dashboard — Study Hub</title>
        <meta name="description" content="Your personal study command center." />
      </Helmet>

      {/* Top Header Banner — Deep Navy Command Header */}
      <div className="bg-[#10233F] text-[#FCFBF8] py-10 px-6 border-b border-white/10 shadow-md">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#FCDAB7] bg-white/10 px-3 py-1 rounded-full border border-white/15">
                {activeHeaderBadge}
              </span>

              {/* Mode Switcher for Combined Users */}
              {isCombinedUser && (
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="bg-white/10 px-3 py-1 rounded-full text-xs text-[#F7E7D0] border border-white/15 flex items-center gap-1.5 hover:bg-white/20 transition-colors"
                  >
                    <span>My Learning: {activeContext === 'college' ? 'College' : profile?.target_exam || 'GATE'}</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute top-8 left-0 z-50 w-44 rounded-xl bg-[#10233F] border border-white/15 shadow-xl py-1 text-xs text-[#FCFBF8]">
                      <button
                        onClick={() => {
                          switchContext('college');
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 hover:bg-white/10 transition-colors ${activeContext === 'college' ? 'text-[#4E88B7] font-bold' : 'text-white/80'}`}
                      >
                        🎓 College Academic
                      </button>
                      <button
                        onClick={() => {
                          switchContext('competitive');
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 hover:bg-white/10 transition-colors ${activeContext === 'competitive' ? 'text-[#4E88B7] font-bold' : 'text-white/80'}`}
                      >
                        🎯 {profile?.target_exam || 'GATE'} Preparation
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <h1
              className="text-4xl sm:text-5xl font-normal text-white tracking-tight"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Know what to study next, <span className="text-[#FCDAB7]">{firstName}</span>.
            </h1>
            <p className="text-xs sm:text-sm text-white/75 mt-1">
              {isCollegeView
                ? `Your preparation, in motion for ${profile?.branch_major || 'your coursework'}.`
                : `Your preparation, in motion for ${profile?.target_exam || 'GATE'}.`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!isCollegeView && daysRemaining !== null && (
              <div className="bg-white/10 border border-white/15 rounded-2xl px-4 py-2 text-center shrink-0">
                <span className="text-2xl font-bold text-[#FCDAB7] font-sans block leading-none">{daysRemaining}</span>
                <span className="text-[10px] text-white/60 uppercase tracking-widest">days until exam</span>
              </div>
            )}
            <Link
              to="/setup"
              className="bg-white/10 rounded-full px-4 py-2 text-xs text-white/80 hover:text-white transition-colors flex items-center gap-1.5 shrink-0 border border-white/15"
            >
              <Settings className="w-3.5 h-3.5" />
              Edit Setup
            </Link>
          </div>
        </div>
      </div>

      {/* Main Dashboard Body — Paper White / Mist Command Center */}
      <div className="bg-[#EAF2F7] min-h-screen">
        <div className="px-6 pt-8 max-w-6xl mx-auto pb-24 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Columns */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-[#FCFBF8] rounded-2xl p-4 text-center border border-[#10233F]/08 shadow-sm">
                <Clock className="w-5 h-5 text-[#1F5F8B] mx-auto mb-2" />
                <div className="text-2xl font-bold text-[#172033] tracking-tight">{hoursDone}h</div>
                <span className="text-[11px] text-[#627083] uppercase tracking-wider mt-1 block">Study Time Today</span>
              </div>

              <div className="bg-[#FCFBF8] rounded-2xl p-4 text-center border border-[#10233F]/08 shadow-sm">
                <BookOpen className="w-5 h-5 text-[#4E88B7] mx-auto mb-2" />
                <div className="text-2xl font-bold text-[#172033] tracking-tight">{actualQuestionsSolved}</div>
                <span className="text-[11px] text-[#627083] uppercase tracking-wider mt-1 block">Questions Solved</span>
              </div>

              <div className="bg-[#FCFBF8] rounded-2xl p-4 text-center border border-[#10233F]/08 shadow-sm">
                <Award className="w-5 h-5 text-[#2E8B72] mx-auto mb-2" />
                <div className="text-2xl font-bold text-[#172033] tracking-tight">{hasRealAttempts ? `${actualAccuracyPct}%` : '—'}</div>
                <span className="text-[11px] text-[#627083] uppercase tracking-wider mt-1 block">Accuracy</span>
              </div>

              <div className="bg-[#FCFBF8] rounded-2xl p-4 text-center border border-[#10233F]/08 shadow-sm">
                <Flame className="w-5 h-5 text-[#D99A3D] mx-auto mb-2" />
                <div className="text-2xl font-bold text-[#172033] tracking-tight">{actualStreakDays}</div>
                <span className="text-[11px] text-[#627083] uppercase tracking-wider mt-1 block">Streak Days</span>
              </div>
            </div>

            {/* Honest Empty State for New Users */}
            {!hasRealAttempts && (
              <div className="bg-[#FCFBF8] rounded-3xl p-6 sm:p-8 text-center space-y-3 border border-[#10233F]/08 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-[#F7E7D0] text-[#10233F] flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-normal text-[#172033]" style={{ fontFamily: "'Instrument Serif', serif" }}>Your preparation, in motion.</h3>
                <p className="text-xs text-[#627083] max-w-md mx-auto leading-relaxed">
                  Complete your first 10-question practice or focus session to unlock your real performance insights, accuracy tracking, and streak progress.
                </p>
                <Link
                  to="/practice"
                  className="gradient-cta px-6 py-2.5 rounded-full text-xs text-white font-semibold inline-flex items-center gap-1.5 shadow-md"
                >
                  <span>Practice what matters</span> <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}

            {/* Today's Study Plan Card */}
            <div className="bg-[#FCFBF8] rounded-3xl p-6 sm:p-8 border border-[#10233F]/08 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[#627083] font-semibold">Today's Schedule</p>
                  <h2 className="text-2xl font-normal text-[#172033]" style={{ fontFamily: "'Instrument Serif', serif" }}>
                    Practice what matters today.
                  </h2>
                  <p className="text-xs text-[#627083] mt-0.5">
                    {isCollegeView
                      ? `Tailored for ${profile?.degree || 'Academic'} Semester Goals`
                      : `Customized for your ${profile?.target_exam || 'GATE'} target`}
                  </p>
                </div>
                <div className="bg-[#F7E7D0] px-3 py-1 rounded-full text-xs text-[#10233F] font-semibold">
                  {planItems.length} Tasks
                </div>
              </div>

              <div className="space-y-3">
                {planItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#FCFBF8] rounded-2xl p-4 flex items-center justify-between gap-4 border border-[#10233F]/08 hover:border-[#1F5F8B]/30 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-[#1F5F8B] font-semibold shrink-0 w-12">{item.time}</span>
                      <div>
                        <h3 className="text-sm font-semibold text-[#172033]">{item.title}</h3>
                        <p className="text-xs text-[#627083]">{item.subTitle} • {item.durationMinutes} min</p>
                      </div>
                    </div>

                    <Link
                      to={item.actionPath}
                      state={item.actionState}
                      className="gradient-cta rounded-full px-4 py-1.5 text-xs text-white font-semibold inline-flex items-center gap-1 shrink-0 hover:scale-105 transition-transform"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      <span>Start</span>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* College / Competitive Specific Section */}
            {isCollegeView ? (
              <div className="bg-[#FCFBF8] rounded-3xl p-6 sm:p-8 border border-[#10233F]/08 shadow-sm space-y-4">
                <h2 className="text-xl font-normal text-[#172033] flex items-center gap-2" style={{ fontFamily: "'Instrument Serif', serif" }}>
                  <BookOpen className="w-5 h-5 text-[#1F5F8B]" />
                  Current Semester Subjects
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(profile?.college_subjects && profile.college_subjects.length > 0
                    ? profile.college_subjects
                    : ['Computer Networks', 'DBMS', 'Operating Systems', 'Software Engineering']
                  ).map((subj, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-[#EAF2F7] border border-[#10233F]/06 flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-[#172033]">{subj}</h4>
                        <p className="text-[11px] text-[#627083]">Semester Coursework</p>
                      </div>
                      <Link
                        to="/practice"
                        state={{ subject: subj }}
                        className="px-3 py-1.5 rounded-full bg-[#FCFBF8] text-[#1F5F8B] font-semibold text-xs border border-[#10233F]/10 hover:bg-[#1F5F8B]/10 transition-colors"
                      >
                        Revise
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-[#FCFBF8] rounded-3xl p-6 sm:p-8 border border-[#10233F]/08 shadow-sm space-y-4">
                <h2 className="text-xl font-normal text-[#172033] flex items-center gap-2" style={{ fontFamily: "'Instrument Serif', serif" }}>
                  <Target className="w-5 h-5 text-[#1F5F8B]" />
                  {profile?.target_exam || 'GATE'} Priority PYQ Practice
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {recommendations.slice(0, 2).map((rec) => (
                    <div key={rec.id} className="p-4 rounded-2xl bg-[#EAF2F7] border border-[#10233F]/06 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#1F5F8B] tracking-wider">{rec.priority} Priority</span>
                        <h4 className="text-sm font-semibold text-[#172033] mt-1">{rec.title}</h4>
                        <p className="text-[11px] text-[#627083] mt-0.5 line-clamp-2">{rec.reason}</p>
                      </div>
                      <Link
                        to={rec.action}
                        className="mt-3 py-1.5 rounded-full bg-[#FCFBF8] text-[#1F5F8B] font-semibold text-xs text-center border border-[#10233F]/10 hover:bg-[#1F5F8B]/10 transition-colors"
                      >
                        Start Practice →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column Shortcuts & Actions */}
          <div className="space-y-6">
            <div className="bg-[#FCFBF8] rounded-3xl p-6 border border-[#10233F]/08 shadow-sm space-y-4">
              <h3 className="text-xs uppercase tracking-wider text-[#627083] font-semibold">Quick Tools</h3>
              <div className="space-y-2.5">
                <Link
                  to="/focus-room"
                  className="bg-[#EAF2F7] rounded-xl p-3 text-xs text-[#172033] hover:bg-[#1F5F8B]/10 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-[#1F5F8B]" />
                    <span className="font-semibold">Focus Room Session</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#627083] group-hover:text-[#172033] transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  to="/study-ai"
                  className="bg-[#EAF2F7] rounded-xl p-3 text-xs text-[#172033] hover:bg-[#1F5F8B]/10 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-[#4E88B7]" />
                    <span className="font-semibold">StudyMate AI Tutor</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#627083] group-hover:text-[#172033] transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  to="/flashcards"
                  className="bg-[#EAF2F7] rounded-xl p-3 text-xs text-[#172033] hover:bg-[#1F5F8B]/10 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <Layers className="w-4 h-4 text-[#4E88B7]" />
                    <span className="font-semibold">Personalized Flashcards</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#627083] group-hover:text-[#172033] transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  to="/revision"
                  className="bg-[#EAF2F7] rounded-xl p-3 text-xs text-[#172033] hover:bg-[#1F5F8B]/10 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <RotateCcw className="w-4 h-4 text-[#2E8B72]" />
                    <span className="font-semibold">Spaced Revision</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#627083] group-hover:text-[#172033] transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

