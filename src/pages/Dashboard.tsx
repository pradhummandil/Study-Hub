// src/pages/Dashboard.tsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Flame, ArrowRight, Settings, Play, Sparkles,
  ChevronRight, RotateCcw, Layers, Award, X, Check, Trophy, Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getFocusData, type FocusData } from '../lib/focusStorage';
import { getStudentProfile, generateTodayStudyPlan, type TodayPlanItem } from '../lib/studentCoreApi';
import type { StudentProfile } from '../types/student-core';
import type { Recommendation, ExamReadinessSnapshot } from '../types/intelligence';
import { generateRecommendations } from '../lib/intelligence/recommendations';
import { calculateExamReadiness } from '../lib/intelligence/readiness';
import { fetchRevisionItems, getRevisionStats } from '../lib/intelligence/revision';
import { fetchMistakeNotebook } from '../lib/intelligence/mistakes';
import { getLocalAttempts } from '../lib/practiceApi';
import { fetchProfileGamification } from '../lib/profile/profileApi';
import type { StudentGamification } from '../types/ecosystem';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [focusData, setFocusData] = useState<FocusData>(() => getFocusData());
  const [planItems, setPlanItems] = useState<TodayPlanItem[]>([]);
  const [gamification, setGamification] = useState<StudentGamification | null>(null);

  // Phase 2 Intelligence State
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [readiness, setReadiness] = useState<ExamReadinessSnapshot | null>(null);
  const [dueRevisionCount, setDueRevisionCount] = useState(0);
  const [unmasteredMistakesCount, setUnmasteredMistakesCount] = useState(0);
  
  // Phase 3 AI Daily Goal State
  const [goalTargetHours, setGoalTargetHours] = useState('2.5');
  const [goalTargetQuestions, setGoalTargetQuestions] = useState(20);
  const [isAdjustingGoal, setIsAdjustingGoal] = useState(false);

  // Daily Check-in & End of Day state
  const [dailyFocusSelected, setDailyFocusSelected] = useState<string | null>(null);
  const [showEndOfDayReview, setShowEndOfDayReview] = useState(false);

  // Auth Guard
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true });
    }
  }, [user, loading, navigate]);

  // Load user core, intelligence, & gamification data
  useEffect(() => {
    let isMounted = true;
    async function loadCoreData() {
      if (!user) return;

      const p = await getStudentProfile();
      if (isMounted) {
        setProfile(p);
        const plan = generateTodayStudyPlan(p);
        setPlanItems(plan);
      }

      const exam = p?.target_exam || 'GATE';
      if (isMounted) {
        setFocusData(getFocusData());
      }

      // Phase 2 Intelligence Loaders
      const recs = await generateRecommendations(exam);
      const read = await calculateExamReadiness(exam);
      const revs = await fetchRevisionItems(exam);
      const revStats = getRevisionStats(revs);
      const mistakes = await fetchMistakeNotebook({ exam, mastered: false });
      const g = await fetchProfileGamification(user.id);

      if (isMounted) {
        setRecommendations(recs);
        setReadiness(read);
        setDueRevisionCount(revStats.dueToday);
        setUnmasteredMistakesCount(mistakes.length);
        if (g) setGamification(g);
      }
    }

    loadCoreData();
    return () => { isMounted = false; };
  }, [user]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-3 h-3 rounded-full bg-muted-foreground skeleton-pulse" />
      </div>
    );
  }

  const fullName = user.user_metadata?.full_name || user.email || 'Student';
  const firstName = fullName.split(' ')[0].split('@')[0];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  let daysRemaining: number | null = null;
  if (profile?.exam_date) {
    const target = new Date(profile.exam_date).getTime();
    const now = new Date().getTime();
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
    if (diff > 0) daysRemaining = diff;
  }

  const dailyTargetMinutes = profile?.daily_study_minutes || 180;
  const todayMinutesDone = focusData.logs
    .filter((l) => l.date === new Date().toISOString().split('T')[0])
    .reduce((acc, curr) => acc + curr.minutes, 0);

  const todayProgressPct = Math.min(100, Math.round((todayMinutesDone / dailyTargetMinutes) * 100));
  const hoursDone = (todayMinutesDone / 60).toFixed(1);
  const targetHours = (dailyTargetMinutes / 60).toFixed(1);

  const attemptsToday = getLocalAttempts();
  const currentStreak = gamification?.current_streak || focusData.currentStreak || 12;
  const level = gamification?.level || 8;
  const levelTitle = gamification?.level_title || 'Consistent Learner';
  const xp = gamification?.xp || 1840;
  const nextLevelXP = level * 250;

  return (
    <>
      <Helmet>
        <title>My Study Dashboard — Study Hub</title>
        <meta name="description" content="Your personal study command center with Intelligence AI Coach, Streaks & Daily Goals." />
      </Helmet>

      {/* Header Banner */}
      <div className="px-6 pt-10 max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-xs uppercase tracking-wider text-cyan-400 font-semibold liquid-glass px-3 py-1 rounded-full border border-cyan-500/20">
              {profile?.target_exam || 'GATE'} {profile?.target_exam_year || '2027'}
            </span>
            <span className="text-xs text-muted-foreground">• {profile?.target_goal || 'Top Rank'}</span>
          </div>
          <h1
            className="text-4xl sm:text-5xl font-normal text-foreground tracking-tight"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            {greeting}, <span className="text-gradient-accent">{firstName}</span>.
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Study Hub has analyzed your recent attempts and scheduled your next best actions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowEndOfDayReview(true)}
            className="liquid-glass rounded-full px-4 py-2 text-xs text-purple-300 border border-purple-500/30 hover:bg-purple-500/10 transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            End-of-Day Review
          </button>
          {daysRemaining !== null && (
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

      {/* PHASE 3 ACADEMIC LEVEL & XP PROGRESS BAR */}
      <div className="px-6 mt-6 max-w-6xl mx-auto">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-300 font-bold text-sm shrink-0 font-mono">
              L{level}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-100">{levelTitle}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-semibold">
                  Level {level}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                {xp.toLocaleString()} / {nextLevelXP.toLocaleString()} XP
              </p>
            </div>
          </div>

          <div className="w-full sm:w-64">
            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((xp / nextLevelXP) * 100))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Daily Check-In Banner */}
      <div className="px-6 mt-4 max-w-6xl mx-auto">
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-indigo-500/30 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-100">Daily Check-In: What are you focusing on today?</p>
              <p className="text-[11px] text-slate-400">Select an focus area to tailor today's suggestions.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            {['Follow my plan', 'Focus on weak topics', 'Revise', 'Practice', 'Mock test'].map((opt) => (
              <button
                key={opt}
                onClick={() => setDailyFocusSelected(opt)}
                className={`px-3 py-1.5 rounded-xl border transition-all ${
                  dailyFocusSelected === opt
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                    : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:border-slate-500'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TODAY'S INTELLIGENCE AI COACH BANNER */}
      <div className="px-6 mt-6 max-w-6xl mx-auto">
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-cyan-500/30 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-100">Today's Intelligence & AI Coach</h2>
                <p className="text-xs text-slate-400">Next best actions automatically computed for you</p>
              </div>
            </div>
            {readiness && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <Award className="w-4 h-4 text-cyan-400" />
                <span className="text-slate-400">Readiness Estimate:</span>
                <span className="font-bold text-cyan-300">{readiness.overall_readiness}%</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {recommendations.slice(0, 4).map((rec, i) => (
              <div
                key={rec.id || i}
                className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] mb-2">
                    <span className={`px-2 py-0.5 rounded font-bold uppercase ${
                      rec.priority === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {rec.priority} Priority
                    </span>
                    <span className="text-slate-500">{rec.estimated_minutes} min</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-200 mb-1">{rec.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-3">{rec.reason}</p>
                </div>

                <button
                  onClick={() => navigate(rec.action)}
                  className="w-full py-2 rounded-xl bg-slate-900 hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 font-bold text-xs flex items-center justify-center gap-1 transition-all"
                >
                  Start Action <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Dashboard Layout */}
      <div className="px-6 mt-8 max-w-6xl mx-auto pb-24 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Intelligence Tools Hub, Study Plan, Progress */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Quick Intelligence Status Hub Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link
              to="/revision"
              className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all text-center group"
            >
              <RotateCcw className="w-5 h-5 text-cyan-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-xl font-bold text-slate-100">{dueRevisionCount}</div>
              <span className="text-[11px] text-slate-400">Revisions Due</span>
            </Link>

            <Link
              to="/mistakes"
              className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-red-500/40 transition-all text-center group"
            >
              <Flame className="w-5 h-5 text-red-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-xl font-bold text-slate-100">{unmasteredMistakesCount}</div>
              <span className="text-[11px] text-slate-400">Unmastered Mistakes</span>
            </Link>

            <Link
              to="/flashcards"
              className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 transition-all text-center group"
            >
              <Layers className="w-5 h-5 text-purple-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-xl font-bold text-slate-100">3</div>
              <span className="text-[11px] text-slate-400">Flashcards Due</span>
            </Link>

            <Link
              to="/exam-readiness"
              className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all text-center group"
            >
              <Award className="w-5 h-5 text-emerald-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-xl font-bold text-slate-100">{readiness?.overall_readiness || 72}%</div>
              <span className="text-[11px] text-slate-400">Exam Readiness</span>
            </Link>
          </div>

          {/* PHASE 3 TODAY'S DAILY GOAL CARD */}
          <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-normal text-foreground" style={{ fontFamily: "'Instrument Serif', serif" }}>
                  TODAY'S DAILY GOAL
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">Recommended by AI Coach based on your setup</p>
              </div>

              {!isAdjustingGoal ? (
                <button
                  onClick={() => setIsAdjustingGoal(true)}
                  className="liquid-glass rounded-full px-3 py-1.5 text-xs text-slate-300 border border-white/10 hover:bg-white/10"
                >
                  Adjust Goal
                </button>
              ) : (
                <button
                  onClick={() => setIsAdjustingGoal(false)}
                  className="gradient-cta rounded-full px-3 py-1.5 text-xs text-slate-950 font-bold"
                >
                  Save Target
                </button>
              )}
            </div>

            {!isAdjustingGoal ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Study Time Target</span>
                  <div className="text-lg font-bold text-cyan-300 font-mono mt-1">{hoursDone}h / {goalTargetHours}h</div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${Math.min(100, Math.round((parseFloat(hoursDone) / parseFloat(goalTargetHours)) * 100))}%` }} />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Questions Target</span>
                  <div className="text-lg font-bold text-indigo-300 font-mono mt-1">{attemptsToday.length} / {goalTargetQuestions} PYQs</div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div className="bg-indigo-400 h-full rounded-full" style={{ width: `${Math.min(100, Math.round((attemptsToday.length / goalTargetQuestions) * 100))}%` }} />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Revision Status</span>
                  <div className="text-lg font-bold text-emerald-300 mt-1 flex items-center gap-1">
                    <Check className="w-4 h-4 text-emerald-400" /> Completed
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-2">1 revision session logged</span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Target Study Hours</label>
                    <input
                      type="text"
                      value={goalTargetHours}
                      onChange={(e) => setGoalTargetHours(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Target Questions</label>
                    <input
                      type="number"
                      value={goalTargetQuestions}
                      onChange={(e) => setGoalTargetQuestions(parseInt(e.target.value) || 20)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Today's Study Plan Card */}
          <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-normal text-foreground" style={{ fontFamily: "'Instrument Serif', serif" }}>
                  TODAY'S STUDY PLAN
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">Customized for your {profile?.target_exam || 'GATE'} target</p>
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

            {/* Today's Progress Bar */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-muted-foreground font-medium">Today's Progress</span>
                <span className="text-foreground font-semibold font-mono">{hoursDone}h / {targetHours}h ({todayProgressPct}%)</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden p-0.5 border border-white/10">
                <div
                  className="bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${todayProgressPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Phase 3 Streak Card, Weekly Challenges, Quick Tools */}
        <div className="space-y-8">
          
          {/* PHASE 3 STREAK CARD */}
          <div className="liquid-glass-card rounded-3xl p-6 border border-white/10 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Habit Tracker</span>
              <Flame className="w-5 h-5 text-amber-400 fill-amber-400/20" />
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-normal text-foreground" style={{ fontFamily: "'Instrument Serif', serif" }}>
                🔥 {currentStreak}
              </span>
              <span className="text-xs text-muted-foreground">day study streak</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              You're building a strong habit. Show up again today!
            </p>

            <div className="pt-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span>Today's Habit Goal</span>
                <span className="font-mono font-bold text-cyan-300">80%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <div className="bg-amber-400 h-full rounded-full" style={{ width: '80%' }} />
              </div>
            </div>

            <Link
              to="/practice"
              className="w-full py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1 transition-all mt-2"
            >
              Complete a session to protect streak <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* PHASE 3 WEEKLY CHALLENGES CARD */}
          <div className="liquid-glass-card rounded-3xl p-6 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">This Week's Challenge</span>
              <Trophy className="w-4 h-4 text-purple-400" />
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-200 font-semibold">Complete 100 questions</span>
                  <span className="text-cyan-300 font-mono">76%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-1.5">
                  <div className="bg-purple-400 h-full rounded-full" style={{ width: '76%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-200 font-semibold">Complete 4 Focus Sessions</span>
                  <span className="text-cyan-300 font-mono">60%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-1.5">
                  <div className="bg-indigo-400 h-full rounded-full" style={{ width: '60%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-200 font-semibold">Finish 10 revisions</span>
                  <span className="text-emerald-400 font-mono font-bold">100% ✓</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-1.5">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: '100%' }} />
                </div>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-purple-300 font-bold text-center">
              Reward: +100 XP upon completion
            </div>
          </div>

          {/* Quick Intelligence Shortcuts */}
          <div className="liquid-glass-card rounded-3xl p-6 border border-white/10">
            <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-4">Intelligence & Ecosystem</h3>
            <div className="space-y-2.5">
              <Link
                to="/community"
                className="liquid-glass rounded-xl p-3 text-xs text-foreground hover:bg-white/10 transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span>Study Circles & Doubts</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                to="/leaderboards"
                className="liquid-glass rounded-xl p-3 text-xs text-foreground hover:bg-white/10 transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Educational Leaderboards</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                to="/mistakes"
                className="liquid-glass rounded-xl p-3 text-xs text-foreground hover:bg-white/10 transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <Flame className="w-4 h-4 text-red-400" />
                  <span>My Mistakes Notebook</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                to="/revision"
                className="liquid-glass rounded-xl p-3 text-xs text-foreground hover:bg-white/10 transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <RotateCcw className="w-4 h-4 text-cyan-400" />
                  <span>Spaced Revision Center</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>

      </div>

      {/* End-of-Day Study Review Modal */}
      {showEndOfDayReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-3xl p-6 bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl">
            <button
              onClick={() => setShowEndOfDayReview(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" /> Today's Study Review
            </h3>

            <div className="grid grid-cols-2 gap-3 mb-6 text-center">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Study Time</span>
                <div className="text-xl font-bold text-cyan-400">{hoursDone}h</div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Questions Solved</span>
                <div className="text-xl font-bold text-indigo-400">{attemptsToday.length}</div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Accuracy</span>
                <div className="text-xl font-bold text-emerald-400">
                  {attemptsToday.length > 0
                    ? `${Math.round((attemptsToday.filter((a) => a.is_correct).length / attemptsToday.length) * 100)}%`
                    : '76%'}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Revisions</span>
                <div className="text-xl font-bold text-amber-400">8 / 10</div>
              </div>
            </div>

            <button
              onClick={() => setShowEndOfDayReview(false)}
              className="w-full py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm"
            >
              Complete Review
            </button>
          </div>
        </div>
      )}
    </>
  );
}
