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

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

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

      {/* Top Header Banner with Mode Switcher */}
      <div className="px-6 pt-10 max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-xs uppercase tracking-wider text-cyan-400 font-semibold liquid-glass px-3 py-1 rounded-full border border-cyan-500/20">
              {activeHeaderBadge}
            </span>

            {/* Mode Switcher for Combined Users */}
            {isCombinedUser && (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="liquid-glass px-3 py-1 rounded-full text-xs text-amber-300 border border-amber-500/30 flex items-center gap-1.5 hover:bg-amber-500/10 transition-colors"
                >
                  <span>My Learning: {activeContext === 'college' ? 'College' : profile?.target_exam || 'GATE'}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-8 left-0 z-50 w-44 rounded-xl bg-slate-900 border border-slate-800 shadow-xl py-1 text-xs">
                    <button
                      onClick={() => {
                        switchContext('college');
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 hover:bg-slate-800 transition-colors ${activeContext === 'college' ? 'text-cyan-400 font-bold' : 'text-slate-300'}`}
                    >
                      🎓 College Academic
                    </button>
                    <button
                      onClick={() => {
                        switchContext('competitive');
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 hover:bg-slate-800 transition-colors ${activeContext === 'competitive' ? 'text-cyan-400 font-bold' : 'text-slate-300'}`}
                    >
                      🎯 {profile?.target_exam || 'GATE'} Preparation
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <h1
            className="text-4xl sm:text-5xl font-normal text-foreground tracking-tight"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            {greeting}, <span className="text-gradient-accent">{firstName}</span>.
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {isCollegeView
              ? `Ready for today's semester targets in ${profile?.branch_major || 'your coursework'}?`
              : `Ready for today's ${profile?.target_exam || 'GATE'} preparation session?`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!isCollegeView && daysRemaining !== null && (
            <div className="liquid-glass border border-cyan-500/30 rounded-2xl px-4 py-2 text-center shrink-0">
              <span className="text-2xl font-semibold text-cyan-300 font-sans block leading-none">{daysRemaining}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest">days until exam</span>
            </div>
          )}
          <Link
            to="/setup"
            className="liquid-glass rounded-full px-4 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Settings className="w-3.5 h-3.5" />
            Edit Setup
          </Link>
        </div>
      </div>

      {/* Main Dashboard Body */}
      <div className="px-6 mt-8 max-w-6xl mx-auto pb-24 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Metrics Bar (Real Data Only) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
              <Clock className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
              <div className="text-xl font-bold text-slate-100 font-mono">{hoursDone}h</div>
              <span className="text-[11px] text-slate-400">Study Time Today</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
              <BookOpen className="w-5 h-5 text-indigo-400 mx-auto mb-2" />
              <div className="text-xl font-bold text-slate-100 font-mono">{actualQuestionsSolved}</div>
              <span className="text-[11px] text-slate-400">Questions Solved</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
              <Award className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
              <div className="text-xl font-bold text-slate-100 font-mono">{hasRealAttempts ? `${actualAccuracyPct}%` : '—'}</div>
              <span className="text-[11px] text-slate-400">Accuracy</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
              <Flame className="w-5 h-5 text-amber-400 mx-auto mb-2" />
              <div className="text-xl font-bold text-slate-100 font-mono">{actualStreakDays}</div>
              <span className="text-[11px] text-slate-400">Streak Days</span>
            </div>
          </div>

          {/* Honest Empty State for New Users */}
          {!hasRealAttempts && (
            <div className="p-6 rounded-3xl bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-purple-500/10 border border-cyan-500/30 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-100">Your study journey starts here.</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                Complete your first 10-question practice or focus session to unlock your real performance insights, accuracy tracking, and streak progress.
              </p>
              <Link
                to="/practice"
                className="gradient-cta px-6 py-2.5 rounded-full text-xs text-slate-950 font-bold inline-flex items-center gap-1.5 shadow-md"
              >
                <span>Start First Practice</span> <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Today's Study Plan Card */}
          <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-normal text-foreground" style={{ fontFamily: "'Instrument Serif', serif" }}>
                  TODAY'S STUDY PLAN
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isCollegeView
                    ? `Tailored for ${profile?.degree || 'Academic'} Semester Goals`
                    : `Customized for your ${profile?.target_exam || 'GATE'} target`}
                </p>
              </div>
              <div className="liquid-glass px-3 py-1 rounded-full text-xs text-muted-foreground font-mono">
                {planItems.length} Tasks Scheduled
              </div>
            </div>

            <div className="space-y-3">
              {planItems.map((item) => (
                <div
                  key={item.id}
                  className="liquid-glass rounded-2xl p-4 flex items-center justify-between gap-4 border border-white/5 hover:border-white/20 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono text-cyan-400 font-semibold shrink-0 w-12">{item.time}</span>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                      <p className="text-xs text-muted-foreground">{item.subTitle} • {item.durationMinutes} min</p>
                    </div>
                  </div>

                  <Link
                    to={item.actionPath}
                    state={item.actionState}
                    className="gradient-cta rounded-full px-4 py-1.5 text-xs text-slate-950 font-bold inline-flex items-center gap-1 shrink-0 hover:scale-105 transition-transform"
                  >
                    <Play className="w-3 h-3 fill-slate-950" />
                    <span>Start</span>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* College / Competitive Specific Section */}
          {isCollegeView ? (
            <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-cyan-400" />
                Current Semester Subjects
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(profile?.college_subjects && profile.college_subjects.length > 0
                  ? profile.college_subjects
                  : ['Computer Networks', 'DBMS', 'Operating Systems', 'Software Engineering']
                ).map((subj, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-200">{subj}</h4>
                      <p className="text-[11px] text-slate-400">Semester Coursework</p>
                    </div>
                    <Link
                      to="/practice"
                      state={{ subject: subj }}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-300 font-semibold text-xs border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors"
                    >
                      Revise
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-400" />
                {profile?.target_exam || 'GATE'} Priority PYQ Practice
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recommendations.slice(0, 2).map((rec) => (
                  <div key={rec.id} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-indigo-400">{rec.priority} Priority</span>
                      <h4 className="text-sm font-bold text-slate-200 mt-1">{rec.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{rec.reason}</p>
                    </div>
                    <Link
                      to={rec.action}
                      className="mt-3 py-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 font-bold text-xs text-center border border-indigo-500/30 hover:bg-indigo-500/30 transition-colors"
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
          <div className="liquid-glass-card rounded-3xl p-6 border border-white/10 space-y-4">
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Quick Tools</h3>
            <div className="space-y-2.5">
              <Link
                to="/focus-room"
                className="liquid-glass rounded-xl p-3 text-xs text-foreground hover:bg-white/10 transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>Focus Room Session</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                to="/study-ai"
                className="liquid-glass rounded-xl p-3 text-xs text-foreground hover:bg-white/10 transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>StudyMate AI Tutor</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                to="/flashcards"
                className="liquid-glass rounded-xl p-3 text-xs text-foreground hover:bg-white/10 transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>Personalized Flashcards</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                to="/revision"
                className="liquid-glass rounded-xl p-3 text-xs text-foreground hover:bg-white/10 transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <RotateCcw className="w-4 h-4 text-emerald-400" />
                  <span>Spaced Revision</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
