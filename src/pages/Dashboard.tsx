import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import { useStudentContext } from '../context/StudentContext';
import { getFocusData } from '../lib/focusStorage';
import { getExamTaxonomyHierarchy, type ExamTaxonomyNode } from '../lib/questionEngineApi';
import { computeStudentNextAction, type NextActionRecommendation } from '../lib/intelligence/nextActionEngine';
import { fetchRevisionItems, getRevisionStats } from '../lib/intelligence/revision';

// Dashboard Command Center Modular Components
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { TodayPlan } from '../components/dashboard/TodayPlan';
import { NextActionCard } from '../components/dashboard/NextActionCard';
import { MetricStrip } from '../components/dashboard/MetricStrip';
import { CurriculumExplorer } from '../components/dashboard/CurriculumExplorer';
import { QuickTools } from '../components/dashboard/QuickTools';
import { RecommendedNotes } from '../components/dashboard/RecommendedNotes';
import { ContinueLearning } from '../components/dashboard/ContinueLearning';
import { RecentMistakes } from '../components/dashboard/RecentMistakes';
import { RevisionQueue } from '../components/dashboard/RevisionQueue';
import { RoadmapSnapshot } from '../components/dashboard/RoadmapSnapshot';
import { ExamCountdown } from '../components/dashboard/ExamCountdown';
import { WeeklyMomentum } from '../components/dashboard/WeeklyMomentum';
import { NewUserOnboarding } from '../components/dashboard/NewUserOnboarding';
import { DiagnosticModal } from '../components/dashboard/DiagnosticModal';
import { StudyPathStrip } from '../components/dashboard/StudyPathStrip';
import { BottomNav } from '../components/layout/BottomNav';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const {
    profile,
    targetExam,
    hasRealAttempts,
    actualAccuracyPct,
    actualQuestionsSolved,
    actualStreakDays,
  } = useStudentContext();

  const [taxonomyNodes, setTaxonomyNodes] = useState<ExamTaxonomyNode[]>([]);
  const [nextAction, setNextAction] = useState<NextActionRecommendation | null>(null);
  const [revisionDueCount, setRevisionDueCount] = useState(0);
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);

  const activeExamCode =
    targetExam === 'JEE Main'
      ? 'JEE_MAIN'
      : targetExam === 'NEET'
      ? 'NEET_UG'
      : targetExam === 'JEE Advanced'
      ? 'JEE_ADVANCED'
      : 'GATE_CSE';

  // Load Dashboard Data dynamically on targetExam / user changes
  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      // Fetch Real Taxonomy Hierarchy for Active Exam
      const taxonomy = await getExamTaxonomyHierarchy(activeExamCode);
      const action = await computeStudentNextAction(user?.id || null, profile);
      const revItems = await fetchRevisionItems(targetExam);
      const revStats = getRevisionStats(revItems);

      if (isMounted) {
        setTaxonomyNodes(taxonomy);
        setNextAction(action);
        setRevisionDueCount(revStats.dueToday);
      }
    }

    loadDashboardData();
    return () => {
      isMounted = false;
    };
  }, [user, profile, targetExam, activeExamCode]);

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-paper">
        <div className="w-8 h-8 rounded-full border-2 border-scholar border-t-transparent animate-spin mb-3" />
        <p className="text-xs text-muted font-mono">Loading personalized student command center...</p>
      </div>
    );
  }

  // Calculate focus room study time today
  const focusData = getFocusData();
  const todayStr = new Date().toISOString().split('T')[0];
  const todayMinutesDone = focusData.logs
    .filter((l) => l.date === todayStr)
    .reduce((acc, curr) => acc + curr.minutes, 0);
  const hoursDoneStr = (todayMinutesDone / 60).toFixed(1);

  const showOnboardingWizard = profile && !profile.onboarding_completed;

  return (
    <div className="bg-paper text-ink min-h-screen selection:bg-terracotta/20 selection:text-ink pb-24 md:pb-12">
      <Helmet>
        <title>Student Command Center — Study Hub</title>
        <meta
          name="description"
          content="Your personalized daily study operating system for exam preparation."
        />
      </Helmet>

      {/* Main Container — 1440px Max Width */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 pt-5 space-y-6">
        {/* VIEWPORT 1: Greeting + Countdown Header Banner */}
        <DashboardHeader />

        {/* New User Onboarding Wizard (if first time login) */}
        {showOnboardingWizard && (
          <NewUserOnboarding
            onComplete={() => {}}
            onStartDiagnostic={() => setIsDiagnosticOpen(true)}
          />
        )}

        {/* VIEWPORT 1: Today's Study Plan (Next 4 Moves) */}
        <TodayPlan onOpenDiagnostic={() => setIsDiagnosticOpen(true)} />

        {/* VIEWPORT 1: Hero Next Action Recommendation Card */}
        <NextActionCard
          nextAction={nextAction}
          onOpenDiagnostic={() => setIsDiagnosticOpen(true)}
        />

        {/* VIEWPORT 1: Metric Strip */}
        <MetricStrip
          studyHoursToday={hoursDoneStr}
          questionsSolved={actualQuestionsSolved}
          accuracyPct={actualAccuracyPct}
          hasRealAttempts={hasRealAttempts}
          streakDays={actualStreakDays}
          revisionDueCount={revisionDueCount}
        />

        {/* LOWER SECTION: 12-Column Grid Command Center Architecture */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
          {/* LEFT 8 COLUMNS: Curriculum & Primary Study Modules */}
          <div className="lg:col-span-8 space-y-6">
            {/* 1. Curriculum Command Center */}
            <CurriculumExplorer taxonomyNodes={taxonomyNodes} />

            {/* 2. Signature Study Path Strip */}
            <StudyPathStrip />

            {/* 3. Recent Mistakes Notebook */}
            <RecentMistakes />

            {/* 4. Weekly Performance Momentum */}
            <WeeklyMomentum />

            {/* 5. Recommended Notes */}
            <RecommendedNotes />
          </div>

          {/* RIGHT 4 COLUMNS: Tools, Queues & Snapshot */}
          <div className="lg:col-span-4 space-y-6">
            {/* 1. Revision Queue */}
            <RevisionQueue />

            {/* 2. Continue Learning */}
            <ContinueLearning />

            {/* 3. Roadmap Snapshot */}
            <RoadmapSnapshot />

            {/* 4. Quick Tools */}
            <QuickTools />

            {/* 5. Exam Countdown Widget */}
            <ExamCountdown />
          </div>
        </div>
      </div>

      {/* Interactive 10-Question Diagnostic Modal */}
      <DiagnosticModal
        isOpen={isDiagnosticOpen}
        onClose={() => setIsDiagnosticOpen(false)}
      />

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav />
    </div>
  );
}
