// src/pages/Performance.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  CheckSquare, Clock, FileText, TrendingUp, Sparkles, Play
} from 'lucide-react';
import { fetchOverallPerformance } from '../lib/performanceApi';
import { getStudentProfile } from '../lib/studentCoreApi';
import type { OverallPerformanceData, ExamCategory } from '../types/student-core';

export default function Performance() {
  const [data, setData] = useState<OverallPerformanceData | null>(null);
  const [exam, setExam] = useState<ExamCategory>('GATE');
  const [loading, setLoading] = useState(true);
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

  useEffect(() => {
    async function loadPerformance() {
      setLoading(true);
      const profile = await getStudentProfile();
      const currentExam = profile?.target_exam || 'GATE';
      setExam(currentExam);
      const perf = await fetchOverallPerformance(currentExam);
      setData(perf);
      setLoading(false);
    }
    loadPerformance();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-3 h-3 rounded-full bg-muted-foreground skeleton-pulse" />
      </div>
    );
  }

  // SVG Area Chart points calculation
  const chartHeight = 120;
  const chartWidth = 500;
  const maxAcc = 100;

  const points = data.accuracyHistory.map((item, idx) => {
    const x = (idx / (data.accuracyHistory.length - 1)) * chartWidth;
    const y = chartHeight - (item.accuracy / maxAcc) * chartHeight;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,${chartHeight} ${points} ${chartWidth},${chartHeight}`;

  return (
    <>
      <Helmet>
        <title>Your Performance — Study Hub</title>
        <meta name="description" content="Detailed performance analytics and topic accuracy drilldowns." />
      </Helmet>

      {/* Header */}
      <div className="px-6 pt-12 max-w-5xl mx-auto text-center">
        <span className="text-xs uppercase tracking-widest text-cyan-400 font-semibold liquid-glass px-4 py-1.5 rounded-full inline-block mb-3 border border-cyan-500/20">
          {exam} Performance Analytics
        </span>
        <h1
          className="text-4xl sm:text-5xl font-normal text-foreground tracking-tight"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Your Performance
        </h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
          Data-driven insights to eliminate weak spots and boost exam readiness.
        </p>
      </div>

      <div className="px-6 mt-10 max-w-5xl mx-auto pb-24 space-y-8">
        {/* Top 4 Stat Tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="liquid-glass-card rounded-3xl p-6 border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs uppercase tracking-widest">Questions Solved</span>
              <CheckSquare className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-3xl font-semibold text-foreground font-sans mt-3">{data.totalQuestionsSolved.toLocaleString()}</p>
          </div>

          <div className="liquid-glass-card rounded-3xl p-6 border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs uppercase tracking-widest">Accuracy</span>
              <TrendingUp className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-3xl font-semibold text-cyan-300 font-sans mt-3">{data.overallAccuracy}%</p>
          </div>

          <div className="liquid-glass-card rounded-3xl p-6 border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs uppercase tracking-widest">Study Time</span>
              <Clock className="w-4 h-4 text-violet-400" />
            </div>
            <p className="text-3xl font-semibold text-foreground font-sans mt-3">{data.totalStudyHours}h</p>
          </div>

          <div className="liquid-glass-card rounded-3xl p-6 border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs uppercase tracking-widest">Mocks Completed</span>
              <FileText className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-3xl font-semibold text-foreground font-sans mt-3">{data.mocksCompleted}</p>
          </div>
        </div>

        {/* Accuracy Trend Graph */}
        <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-2xl font-normal text-foreground" style={{ fontFamily: "'Instrument Serif', serif" }}>
                Accuracy % Trend Over Time
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">Tracking overall practice and mock test accuracy</p>
            </div>
            <span className="text-xs text-emerald-400 font-mono font-semibold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              +16% Improvement
            </span>
          </div>

          <div className="w-full overflow-hidden">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 20}`} className="w-full h-40 overflow-visible">
              <defs>
                <linearGradient id="gradientAcc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(187, 92%, 69%)" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="hsl(187, 92%, 69%)" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <polygon points={areaPoints} fill="url(#gradientAcc)" />
              <polyline fill="none" stroke="hsl(187, 92%, 69%)" strokeWidth="3" points={points} strokeLinecap="round" />
              {data.accuracyHistory.map((item, idx) => {
                const x = (idx / (data.accuracyHistory.length - 1)) * chartWidth;
                const y = chartHeight - (item.accuracy / maxAcc) * chartHeight;
                return (
                  <g key={idx}>
                    <circle cx={x} cy={y} r="4" fill="hsl(187, 92%, 69%)" stroke="#0f172a" strokeWidth="2" />
                    <text x={x} y={chartHeight + 15} textAnchor="middle" fill="currentColor" className="text-[10px] fill-muted-foreground">
                      {item.date}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Subject Performance Breakdown Cards */}
        <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
          <h2 className="text-2xl font-normal text-foreground" style={{ fontFamily: "'Instrument Serif', serif" }}>
            Subject Performance & Drilldown
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.subjectSummaries.map((s) => {
              const isExpanded = expandedSubject === s.subject;
              return (
                <div
                  key={s.subject}
                  className={`liquid-glass rounded-2xl p-5 border transition-all flex flex-col justify-between space-y-4 ${
                    s.status === 'Needs attention'
                      ? 'border-rose-500/30 bg-rose-500/5'
                      : s.status === 'Strong'
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : 'border-white/10'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-semibold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
                        s.status === 'Needs attention'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : s.status === 'Strong'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                      }`}>
                        {s.status}
                      </span>
                      <span className="text-xl font-bold font-mono text-foreground">{s.accuracy}%</span>
                    </div>

                    <h3 className="text-base font-semibold text-foreground">{s.subject}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.questionsAttempted} questions attempted</p>
                  </div>

                  <button
                    onClick={() => setExpandedSubject(isExpanded ? null : s.subject)}
                    className="text-xs text-cyan-400 font-medium hover:underline inline-flex items-center justify-between pt-2 border-t border-white/5"
                  >
                    <span>{isExpanded ? 'Hide Topic Details' : 'Drilldown Topics →'}</span>
                  </button>

                  {isExpanded && (
                    <div className="pt-3 space-y-2 border-t border-white/10 text-xs animate-fade-rise">
                      <p className="text-[10px] text-rose-400 font-semibold uppercase tracking-wider">Weak Topics:</p>
                      {s.weakTopics.map((wt) => (
                        <div key={wt} className="flex items-center justify-between text-muted-foreground">
                          <span>• {wt}</span>
                          <Link to={`/practice?subject=${encodeURIComponent(s.subject)}`} className="text-cyan-400 hover:underline text-[10px]">
                            Practice
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Personalized Next Step Recommendation */}
        <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 via-transparent to-indigo-500/10 space-y-6 shadow-2xl">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-cyan-400" />
            <div>
              <span className="text-xs uppercase tracking-widest text-cyan-300 font-semibold">PERSONALIZED NEXT STEP</span>
              <h3 className="text-xl font-semibold text-foreground mt-0.5">
                Targeted Action Plan for {data.nextStepRecommendation.subject}
              </h3>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl">
            {data.nextStepRecommendation.reason} Follow this 3-step recommendation to boost your accuracy score.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {data.nextStepRecommendation.actions.map((act, i) => (
              <Link
                key={i}
                to={act.link}
                className="liquid-glass p-4 rounded-2xl border border-white/10 hover:border-cyan-400/50 flex items-center justify-between group transition-all"
              >
                <div>
                  <span className="text-[10px] uppercase font-mono text-cyan-400 font-bold block">Step {i + 1}</span>
                  <span className="text-xs font-semibold text-foreground mt-0.5 block">{act.label}</span>
                </div>
                <Play className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform fill-cyan-400" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
