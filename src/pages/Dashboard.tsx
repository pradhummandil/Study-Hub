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
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-paper">
        <div className="w-8 h-8 rounded-full border-2 border-scholar border-t-transparent animate-spin mb-3" />
        <p className="text-xs text-muted">Loading personalized study command center...</p>
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
    <div className="bg-paper text-ink min-h-screen selection:bg-terracotta/20 selection:text-ink">
      <Helmet>
        <title>Daily Command Center — Study Hub</title>
        <meta name="description" content="Your personal daily study command center." />
      </Helmet>

      {/* Top Header Banner — Deep Forest Command Header */}
      <div className="bg-forest text-paper py-10 px-6 border-b border-forest/20 shadow-deep">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gold bg-gold/20 px-3 py-1 rounded-full border border-gold/30">
                {activeHeaderBadge}
              </span>

              {/* Mode Switcher for Combined Users */}
              {isCombinedUser && (
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="bg-scholar/40 px-3 py-1 rounded-full text-xs text-paper border border-sage/30 flex items-center gap-1.5 hover:bg-scholar transition-colors"
                  >
                    <span>My Learning: {activeContext === 'college' ? 'College' : profile?.target_exam || 'GATE'}</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute top-8 left-0 z-50 w-44 rounded-xl bg-forest border border-sage/30 shadow-deep py-1 text-xs text-paper">
                      <button
                        onClick={() => {
                          switchContext('college');
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 hover:bg-scholar/40 transition-colors ${activeContext === 'college' ? 'text-gold font-bold' : 'text-sage'}`}
                      >
                        🎓 College Academic
                      </button>
                      <button
                        onClick={() => {
                          switchContext('competitive');
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 hover:bg-scholar/40 transition-colors ${activeContext === 'competitive' ? 'text-gold font-bold' : 'text-sage'}`}
                      >
                        🎯 {profile?.target_exam || 'GATE'} Preparation
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <h1
              className="text-4xl sm:text-5xl font-normal text-paper tracking-tight"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Know what to study next, <span className="text-gold italic">{firstName}</span>.
            </h1>
            <p className="text-xs sm:text-sm text-sage mt-1">
              {isCollegeView
                ? `Your preparation, in motion for ${profile?.branch_major || 'your coursework'}.`
                : `Your preparation, in motion for ${profile?.target_exam || 'GATE'}.`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!isCollegeView && daysRemaining !== null && (
              <div className="bg-scholar/40 border border-sage/30 rounded-2xl px-4 py-2 text-center shrink-0">
                <span className="text-2xl font-bold text-gold font-sans block leading-none">{daysRemaining}</span>
                <span className="text-[10px] text-sage uppercase tracking-widest">days until exam</span>
              </div>
            )}
            <Link
              to="/setup"
              className="bg-scholar/40 rounded-xl px-4 py-2 text-xs text-paper hover:bg-scholar transition-colors flex items-center gap-1.5 shrink-0 border border-sage/30"
            >
              <Settings className="w-3.5 h-3.5 text-gold" />
              Edit Setup
            </Link>
          </div>
        </div>
      </div>

      {/* Main Dashboard Body — Paper White / Parchment Command Center */}
      <div className="bg-paper min-h-screen">
        <div className="px-6 pt-8 max-w-6xl mx-auto pb-24 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Columns */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-parchment/60 rounded-2xl p-4 text-center border border-forest/10 shadow-card">
                <Clock className="w-5 h-5 text-scholar mx-auto mb-2" />
                <div className="text-2xl font-bold text-ink tracking-tight">{hoursDone}h</div>
                <span className="text-[11px] text-muted uppercase tracking-wider mt-1 block">Study Time Today</span>
              </div>

              <div className="bg-parchment/60 rounded-2xl p-4 text-center border border-forest/10 shadow-card">
                <BookOpen className="w-5 h-5 text-terracotta mx-auto mb-2" />
                <div className="text-2xl font-bold text-ink tracking-tight">{actualQuestionsSolved}</div>
                <span className="text-[11px] text-muted uppercase tracking-wider mt-1 block">Questions Solved</span>
              </div>

              <div className="bg-parchment/60 rounded-2xl p-4 text-center border border-forest/10 shadow-card">
                <Award className="w-5 h-5 text-success mx-auto mb-2" />
                <div className="text-2xl font-bold text-ink tracking-tight">{hasRealAttempts ? `${actualAccuracyPct}%` : '—'}</div>
                <span className="text-[11px] text-muted uppercase tracking-wider mt-1 block">Accuracy</span>
              </div>

              <div className="bg-parchment/60 rounded-2xl p-4 text-center border border-forest/10 shadow-card">
                <Flame className="w-5 h-5 text-gold mx-auto mb-2" />
                <div className="text-2xl font-bold text-ink tracking-tight">{actualStreakDays}</div>
                <span className="text-[11px] text-muted uppercase tracking-wider mt-1 block">Streak Days</span>
              </div>
            </div>

            {/* Honest Empty State for New Users */}
            {!hasRealAttempts && (
              <div className="bg-parchment/60 rounded-3xl p-6 sm:p-8 text-center space-y-3 border border-forest/10 shadow-card">
                <div className="w-12 h-12 rounded-2xl bg-terracotta/10 text-terracotta flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-normal text-ink" style={{ fontFamily: "'Instrument Serif', serif" }}>Your preparation, in motion.</h3>
                <p className="text-xs text-muted max-w-md mx-auto leading-relaxed">
                  Complete your first 10-question practice or focus session to unlock your real performance insights, accuracy tracking, and streak progress.
                </p>
                <Link
                  to="/practice"
                  className="px-6 py-2.5 rounded-xl text-xs text-paper bg-terracotta font-bold inline-flex items-center gap-1.5 shadow-card hover:bg-terracotta/90 transition-colors"
                >
                  <span>Practice what matters</span> <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}

            {/* Today's Study Plan Card */}
            <div className="bg-paper rounded-3xl p-6 sm:p-8 border border-forest/10 shadow-card space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted font-bold">Today's Schedule</p>
                  <h2 className="text-2xl font-normal text-ink" style={{ fontFamily: "'Instrument Serif', serif" }}>
                    Practice what matters today.
                  </h2>
                  <p className="text-xs text-muted mt-0.5">
                    {isCollegeView
                      ? `Tailored for ${profile?.degree || 'Academic'} Semester Goals`
                      : `Customized for your ${profile?.target_exam || 'GATE'} target`}
                  </p>
                </div>
                <div className="bg-parchment px-3 py-1 rounded-full text-xs text-ink font-semibold border border-forest/10">
                  {planItems.length} Tasks
                </div>
              </div>

              <div className="space-y-3">
                {planItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-parchment/40 rounded-2xl p-4 flex items-center justify-between gap-4 border border-forest/10 hover:border-scholar/40 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-scholar font-bold shrink-0 w-12">{item.time}</span>
                      <div>
                        <h3 className="text-sm font-bold text-ink">{item.title}</h3>
                        <p className="text-xs text-muted">{item.subTitle} • {item.durationMinutes} min</p>
                      </div>
                    </div>

                    <Link
                      to={item.actionPath}
                      state={item.actionState}
                      className="rounded-xl px-4 py-1.5 text-xs text-paper bg-scholar font-bold inline-flex items-center gap-1 shrink-0 hover:bg-forest transition-colors shadow-sm"
                    >
                      <Play className="w-3 h-3 fill-paper" />
                      <span>Start</span>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Exam Priority Section */}
            <div className="bg-paper rounded-3xl p-6 sm:p-8 border border-forest/10 shadow-card space-y-4">
              <h2 className="text-xl font-normal text-ink flex items-center gap-2" style={{ fontFamily: "'Instrument Serif', serif" }}>
                <Target className="w-5 h-5 text-terracotta" />
                {profile?.target_exam || 'GATE'} Priority PYQ Practice
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recommendations.slice(0, 2).map((rec) => (
                  <div key={rec.id} className="p-4 rounded-2xl bg-parchment/40 border border-forest/10 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-terracotta tracking-wider">{rec.priority} Priority</span>
                      <h4 className="text-sm font-bold text-ink mt-1">{rec.title}</h4>
                      <p className="text-[11px] text-muted mt-0.5 line-clamp-2">{rec.reason}</p>
                    </div>
                    <Link
                      to={rec.action}
                      className="mt-3 py-1.5 rounded-xl bg-paper text-scholar font-bold text-xs text-center border border-forest/10 hover:bg-parchment transition-colors"
                    >
                      Start Practice →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column Shortcuts & Actions */}
          <div className="space-y-6">
            <div className="bg-paper rounded-3xl p-6 border border-forest/10 shadow-card space-y-4">
              <h3 className="text-xs uppercase tracking-wider text-muted font-bold">Quick Tools</h3>
              <div className="space-y-2.5">
                <Link
                  to="/focus-room"
                  className="bg-parchment/50 rounded-xl p-3 text-xs text-ink hover:bg-scholar/10 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-scholar" />
                    <span className="font-semibold">Focus Room Session</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted group-hover:text-ink transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  to="/study-ai"
                  className="bg-parchment/50 rounded-xl p-3 text-xs text-ink hover:bg-scholar/10 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-terracotta" />
                    <span className="font-semibold">StudyMate AI Tutor</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted group-hover:text-ink transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  to="/flashcards"
                  className="bg-parchment/50 rounded-xl p-3 text-xs text-ink hover:bg-scholar/10 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <Layers className="w-4 h-4 text-gold" />
                    <span className="font-semibold">Personalized Flashcards</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted group-hover:text-ink transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  to="/revision"
                  className="bg-parchment/50 rounded-xl p-3 text-xs text-ink hover:bg-scholar/10 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <RotateCcw className="w-4 h-4 text-success" />
                    <span className="font-semibold">Spaced Revision</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted group-hover:text-ink transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
