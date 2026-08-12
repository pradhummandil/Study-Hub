import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Zap, ArrowRight } from 'lucide-react';
import { getLocalAttempts } from '../lib/practiceApi';
import type { UserQuestionAttempt } from '../types/student-core';

export default function PracticeHistory() {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState<UserQuestionAttempt[]>([]);

  useEffect(() => {
    const list = getLocalAttempts();
    setAttempts(list);
  }, []);

  const totalAttempted = attempts.length;
  const totalCorrect = attempts.filter((a) => a.is_correct).length;
  const overallAcc = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

  return (
    <>
      <Helmet>
        <title>Practice History — Study Hub</title>
      </Helmet>

      <div className="px-6 pt-12 max-w-4xl mx-auto pb-24 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-widest text-emerald-400 font-semibold font-mono">
              Practice Analytics
            </span>
            <h1 className="text-3xl sm:text-4xl font-normal text-foreground" style={{ fontFamily: "'Instrument Serif', serif" }}>
              Practice Question Log
            </h1>
          </div>

          <Link
            to="/practice"
            className="gradient-cta rounded-full px-6 py-2.5 text-xs text-black font-semibold hover:scale-105 transition-transform"
          >
            New Session
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="liquid-glass-card rounded-2xl p-5 border border-white/10 text-center">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Total Solved</p>
            <p className="text-3xl font-semibold text-foreground font-sans mt-1">{totalAttempted}</p>
          </div>
          <div className="liquid-glass-card rounded-2xl p-5 border border-white/10 text-center">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Accuracy</p>
            <p className="text-3xl font-semibold text-emerald-400 font-sans mt-1">{overallAcc}%</p>
          </div>
          <div className="liquid-glass-card rounded-2xl p-5 border border-white/10 text-center">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Correct</p>
            <p className="text-3xl font-semibold text-cyan-400 font-sans mt-1">{totalCorrect}</p>
          </div>
        </div>

        {/* History List */}
        {attempts.length === 0 ? (
          <div className="p-12 text-center liquid-glass-card rounded-3xl border border-white/10 space-y-4">
            <Zap className="w-12 h-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold text-foreground">No practice attempts logged yet</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Start practicing topic questions and PYQs to track accuracy, time per question, and solution reviews.
            </p>
            <Link to="/practice" className="inline-block gradient-cta rounded-full px-6 py-2.5 text-xs text-black font-semibold">
              Go to Practice Library
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {attempts.map((att, idx) => (
              <div
                key={att.id || idx}
                className="liquid-glass p-5 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-4 hover:border-white/20 transition-all"
              >
                <div>
                  <div className="flex items-center gap-2 text-xs mb-1">
                    <span className="liquid-glass px-2.5 py-0.5 rounded-full text-cyan-300 font-mono font-semibold">
                      {att.exam}
                    </span>
                    <span className="text-muted-foreground">• {att.subject} • {att.topic}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-foreground">Question {att.question_id}</h4>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <span className={att.is_correct ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {att.is_correct ? 'Correct ✓' : 'Incorrect ✕'}
                  </span>
                  <span className="text-muted-foreground">{att.time_taken_seconds || 15}s</span>
                  <button
                    onClick={() => navigate(`/question/${att.question_id}`)}
                    className="liquid-glass rounded-xl px-3 py-1.5 text-xs text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/10 flex items-center gap-1"
                  >
                    View Question <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
