// src/pages/MockResult.tsx
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Trophy, Sparkles } from 'lucide-react';
import type { MockAttempt, MockTest } from '../types/student-core';

export default function MockResult() {
  const location = useLocation();
  const navigate = useNavigate();

  const stateData = location.state as { result: MockAttempt; mockTest: MockTest } | undefined;
  const result = stateData?.result;
  const mockTest = stateData?.mockTest;

  if (!result) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
        <h2 className="text-2xl font-normal text-foreground" style={{ fontFamily: "'Instrument Serif', serif" }}>
          No Mock Result Found
        </h2>
        <Link to="/mock-tests" className="gradient-cta rounded-full px-6 py-2 text-xs text-black mt-4">
          Back to Mock Tests
        </Link>
      </div>
    );
  }

  const topicScoresEntries = Object.entries(result.topic_scores || {});

  return (
    <>
      <Helmet>
        <title>{`${mockTest?.title || 'Mock Test'} Result — Study Hub`}</title>
      </Helmet>

      <div className="px-6 pt-12 max-w-4xl mx-auto pb-24 text-center space-y-8">
        <span className="text-xs uppercase tracking-widest text-indigo-400 font-semibold liquid-glass px-4 py-1.5 rounded-full inline-block mb-1 border border-indigo-500/20">
          Mock Test Result
        </span>
        <h1
          className="text-4xl sm:text-5xl font-normal text-foreground tracking-tight"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          {mockTest?.title || 'Mock Test Result'}
        </h1>

        {/* Hero Score Card */}
        <div className="liquid-glass-card rounded-3xl p-8 max-w-2xl mx-auto border border-white/10 space-y-6 shadow-2xl">
          <div className="flex items-center justify-center gap-3">
            <Trophy className="w-8 h-8 text-amber-400" />
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-widest block">Your Total Score</span>
              <span className="text-4xl font-semibold text-foreground font-sans">
                {result.score} <span className="text-lg font-normal text-muted-foreground">/ {result.max_score}</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/10">
            <div className="liquid-glass p-4 rounded-2xl text-center">
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest block">Accuracy</span>
              <span className="text-2xl font-semibold text-emerald-400 font-sans mt-0.5">{result.accuracy_pct}%</span>
            </div>
            <div className="liquid-glass p-4 rounded-2xl text-center">
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest block">Correct</span>
              <span className="text-2xl font-semibold text-foreground font-sans mt-0.5">{result.correct_count}</span>
            </div>
            <div className="liquid-glass p-4 rounded-2xl text-center">
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest block">Wrong</span>
              <span className="text-2xl font-semibold text-rose-400 font-sans mt-0.5">{result.wrong_count}</span>
            </div>
            <div className="liquid-glass p-4 rounded-2xl text-center">
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest block">Time Taken</span>
              <span className="text-2xl font-semibold text-cyan-400 font-mono mt-0.5">
                {Math.floor(result.time_spent_seconds / 60)}m
              </span>
            </div>
          </div>
        </div>

        {/* Topic Breakdown */}
        {topicScoresEntries.length > 0 && (
          <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 max-w-2xl mx-auto border border-white/10 text-left space-y-4">
            <h2 className="text-xs uppercase tracking-widest text-cyan-400 font-semibold">
              TOPIC PERFORMANCE BREAKDOWN
            </h2>
            <div className="space-y-3">
              {topicScoresEntries.map(([topic, data]) => (
                <div key={topic} className="liquid-glass p-4 rounded-2xl flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold text-foreground">{topic}</span>
                    <span className="text-[11px] text-muted-foreground block">{data.correct} of {data.total} questions correct</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-base font-semibold font-mono ${data.pct >= 75 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {data.pct}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            to="/performance"
            className="gradient-cta rounded-full px-6 py-2.5 text-xs text-black font-semibold hover:scale-105 transition-transform"
          >
            View Full Performance Analytics →
          </Link>
          <button
            onClick={() => navigate('/study-ai')}
            className="liquid-glass rounded-full px-6 py-2.5 text-xs text-violet-300 border border-violet-500/30 hover:bg-violet-500/20 transition-colors inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" /> Ask StudyMate AI
          </button>
          <Link
            to="/dashboard"
            className="liquid-glass rounded-full px-6 py-2.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </>
  );
}
