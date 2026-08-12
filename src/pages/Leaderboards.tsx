// src/pages/Leaderboards.tsx
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Award, Trophy, BookOpen, Sparkles, Lock, ShieldCheck } from 'lucide-react';
import { fetchEducationalLeaderboard } from '../lib/gamification/leaderboardApi';
import type { LeaderboardEntry } from '../types/ecosystem';
import { useAuth } from '../context/AuthContext';

export default function Leaderboards() {
  const { user } = useAuth();
  const [metric, setMetric] = useState<'questions' | 'mock_improvement' | 'helpful'>('questions');
  const [scope, setScope] = useState<'global' | 'circle'>('global');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      const data = await fetchEducationalLeaderboard({ metric, scope });
      if (isMounted) {
        setLeaderboard(data);
        setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [metric, scope]);

  return (
    <>
      <Helmet>
        <title>Educational Leaderboards — Study Hub</title>
        <meta name="description" content="Opt-in academic rankings based on questions solved, mock score improvements, and helpful community contributions." />
      </Helmet>

      {/* Header */}
      <div className="relative z-10 px-6 pt-12 pb-8 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono mb-4">
          <Award className="w-3.5 h-3.5" /> Educational Rankings
        </div>
        <h1
          className="text-4xl sm:text-5xl font-normal text-foreground tracking-tight"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Academic Growth <span className="text-gradient-accent">Leaderboard.</span>
        </h1>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto mt-2 leading-relaxed">
          We rank educational output and community helpfulness — never raw study hours. Participation is completely opt-in.
        </p>

        {/* Metric Selector Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          <button
            onClick={() => setMetric('questions')}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all ${
              metric === 'questions'
                ? 'gradient-cta text-slate-950 shadow-lg'
                : 'liquid-glass text-muted-foreground hover:text-foreground'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 inline mr-1.5" />
            Weekly Questions Solved
          </button>

          <button
            onClick={() => setMetric('mock_improvement')}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all ${
              metric === 'mock_improvement'
                ? 'gradient-cta text-slate-950 shadow-lg'
                : 'liquid-glass text-muted-foreground hover:text-foreground'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 inline mr-1.5" />
            Mock Score Improvement
          </button>

          <button
            onClick={() => setMetric('helpful')}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all ${
              metric === 'helpful'
                ? 'gradient-cta text-slate-950 shadow-lg'
                : 'liquid-glass text-muted-foreground hover:text-foreground'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 inline mr-1.5" />
            Helpful Contributions
          </button>
        </div>

        {/* Scope Selector */}
        <div className="flex justify-center gap-2 mt-4 text-xs">
          <button
            onClick={() => setScope('global')}
            className={`px-3 py-1 rounded-xl border ${
              scope === 'global' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold' : 'text-muted-foreground border-white/5'
            }`}
          >
            Global
          </button>
          <button
            onClick={() => setScope('circle')}
            className={`px-3 py-1 rounded-xl border ${
              scope === 'circle' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold' : 'text-muted-foreground border-white/5'
            }`}
          >
            GATE CS Circle
          </button>
        </div>
      </div>

      {/* Leaderboard Table Container */}
      <div className="relative z-10 px-6 max-w-4xl mx-auto pb-24">
        <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 text-xs text-muted-foreground uppercase tracking-wider font-semibold">
            <span>Rank & Student</span>
            <span>Title & Level</span>
            <span>{metric === 'questions' ? 'Questions' : metric === 'helpful' ? 'Helpful Answers' : 'Improvement'}</span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              <div className="w-3 h-3 rounded-full bg-muted-foreground skeleton-pulse mx-auto mb-2" />
              Loading rankings...
            </div>
          ) : (
            <div className="space-y-3 mt-4">
              {leaderboard.map((entry) => {
                const isCurrentUser = user?.id === entry.user_id;
                return (
                  <div
                    key={entry.user_id}
                    className={`liquid-glass rounded-2xl p-4 flex items-center justify-between text-xs transition-all ${
                      isCurrentUser
                        ? 'bg-cyan-500/10 border-cyan-500/40 font-bold'
                        : 'border-white/5 hover:border-white/20'
                    }`}
                  >
                    {/* Rank & Avatar */}
                    <div className="flex items-center gap-4">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                        entry.rank === 1
                          ? 'bg-amber-400 text-slate-950'
                          : entry.rank === 2
                          ? 'bg-slate-300 text-slate-950'
                          : entry.rank === 3
                          ? 'bg-amber-700 text-white'
                          : 'bg-white/10 text-muted-foreground'
                      }`}>
                        {entry.rank}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{entry.name}</span>
                          {isCurrentUser && (
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold">You</span>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground">{entry.exam}</span>
                      </div>
                    </div>

                    {/* Level Title */}
                    <div className="hidden sm:block text-center">
                      <span className="text-xs text-foreground font-semibold block">{entry.level_title}</span>
                      <span className="text-[10px] text-cyan-400 font-mono">Level {entry.level}</span>
                    </div>

                    {/* Metric Score */}
                    <div className="text-right">
                      <span className="text-base font-bold text-cyan-300 font-mono block">
                        {entry.metric_value}
                      </span>
                      <span className="text-[9px] text-muted-foreground uppercase tracking-wider">
                        {metric === 'questions' ? 'Questions' : metric === 'helpful' ? 'Answers' : 'Pts'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Privacy Note */}
          <div className="mt-8 pt-4 border-t border-white/10 text-[11px] text-muted-foreground flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Privacy protected. You can toggle profile privacy anytime in Settings.</span>
            </div>
            <div className="flex items-center gap-1 text-slate-500">
              <Lock className="w-3 h-3" /> No private history exposed
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
