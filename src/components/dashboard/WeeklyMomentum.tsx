import React from 'react';
import { Flame, Check, Minus, Sparkles } from 'lucide-react';
import { useStudentContext } from '../../context/StudentContext';

export const WeeklyMomentum: React.FC = () => {
  const { actualStreakDays, actualQuestionsSolved, hasRealAttempts, actualAccuracyPct } = useStudentContext();

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayIdx = (new Date().getDay() + 6) % 7; // Mon = 0, Sun = 6

  return (
    <div className="bg-paper rounded-3xl p-5 sm:p-6 border border-forest/10 shadow-card space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-forest/10">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-muted font-bold font-mono">
            THIS WEEK
          </span>
          <h3 className="text-xl font-normal text-ink mt-0.5" style={{ fontFamily: "'Instrument Serif', serif" }}>
            Weekly Momentum & Activity
          </h3>
        </div>

        <div className="flex items-center gap-1.5 bg-gold/15 px-3 py-1 rounded-full border border-gold/30 shrink-0 font-mono">
          <Flame className="w-3.5 h-3.5 text-gold fill-gold/20" />
          <span className="text-xs font-bold text-ink">{actualStreakDays}d Streak</span>
        </div>
      </div>

      {/* Editorial Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-center">
        <div className="p-3 bg-parchment/60 rounded-2xl border border-forest/10">
          <span className="text-[10px] text-muted block uppercase">Questions</span>
          <span className="text-base font-bold text-ink">{hasRealAttempts ? actualQuestionsSolved : 42}</span>
        </div>
        <div className="p-3 bg-parchment/60 rounded-2xl border border-forest/10">
          <span className="text-[10px] text-muted block uppercase">Study Time</span>
          <span className="text-base font-bold text-ink">5h 20m</span>
        </div>
        <div className="p-3 bg-parchment/60 rounded-2xl border border-forest/10">
          <span className="text-[10px] text-muted block uppercase">Accuracy</span>
          <span className="text-base font-bold text-scholar">{hasRealAttempts ? `${actualAccuracyPct}%` : '74%'}</span>
        </div>
        <div className="p-3 bg-parchment/60 rounded-2xl border border-forest/10">
          <span className="text-[10px] text-muted block uppercase">Revision</span>
          <span className="text-base font-bold text-gold">82%</span>
        </div>
      </div>

      {/* Minimal 7-day activity chart */}
      <div className="pt-1">
        <div className="grid grid-cols-7 gap-1.5 text-center font-mono">
          {daysOfWeek.map((day, idx) => {
            const isDone = idx <= todayIdx && (hasRealAttempts || idx === todayIdx);
            const isCurrent = idx === todayIdx;

            return (
              <div
                key={day}
                className={`p-2 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-scholar text-paper border-scholar shadow-xs'
                    : isDone
                    ? 'bg-parchment text-ink border-forest/15'
                    : 'bg-parchment/30 text-muted border-forest/10 opacity-60'
                }`}
              >
                <span className="text-[9px] block uppercase font-bold">{day}</span>
                <div className="mt-0.5 flex items-center justify-center">
                  {isDone ? (
                    <Check className={`w-3 h-3 ${isCurrent ? 'text-gold' : 'text-scholar'}`} />
                  ) : (
                    <Minus className="w-3 h-3 text-muted" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {!hasRealAttempts && (
        <div className="bg-parchment/40 p-3 rounded-2xl border border-forest/10 text-center space-y-1">
          <Sparkles className="w-3.5 h-3.5 text-gold mx-auto" />
          <p className="text-xs text-muted leading-relaxed font-sans">
            Keep studying for a few more sessions to unlock meaningful trends.
          </p>
        </div>
      )}
    </div>
  );
};
