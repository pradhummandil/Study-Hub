import React from 'react';
import { Clock, BookOpen, Award, Flame, RotateCcw } from 'lucide-react';

interface MetricStripProps {
  studyHoursToday: string;
  questionsSolved: number;
  accuracyPct: number;
  hasRealAttempts: boolean;
  streakDays: number;
  revisionDueCount: number;
}

export const MetricStrip: React.FC<MetricStripProps> = ({
  studyHoursToday,
  questionsSolved,
  accuracyPct,
  hasRealAttempts,
  streakDays,
  revisionDueCount,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
      {/* 1. TODAY */}
      <div className="bg-parchment/60 rounded-2xl p-4 text-center border border-forest/10 shadow-card flex flex-col items-center justify-center">
        <Clock className="w-4 h-4 text-scholar mb-1.5" />
        <div className="text-xl sm:text-2xl font-bold text-ink tracking-tight font-mono">
          {studyHoursToday}h
        </div>
        <span className="text-[10px] sm:text-[11px] text-muted uppercase tracking-wider mt-0.5 block font-semibold font-mono">
          TODAY
        </span>
        <span className="text-[10px] text-muted block">Study time</span>
      </div>

      {/* 2. QUESTIONS */}
      <div className="bg-parchment/60 rounded-2xl p-4 text-center border border-forest/10 shadow-card flex flex-col items-center justify-center">
        <BookOpen className="w-4 h-4 text-terracotta mb-1.5" />
        <div className="text-xl sm:text-2xl font-bold text-ink tracking-tight font-mono">
          {questionsSolved}
        </div>
        <span className="text-[10px] sm:text-[11px] text-muted uppercase tracking-wider mt-0.5 block font-semibold font-mono">
          QUESTIONS
        </span>
        <span className="text-[10px] text-muted block">Solved</span>
      </div>

      {/* 3. ACCURACY */}
      <div className="bg-parchment/60 rounded-2xl p-4 text-center border border-forest/10 shadow-card flex flex-col items-center justify-center">
        <Award className="w-4 h-4 text-scholar mb-1.5" />
        <div className="text-xl sm:text-2xl font-bold text-ink tracking-tight font-mono">
          {hasRealAttempts ? `${accuracyPct}%` : 'No signal'}
        </div>
        <span className="text-[10px] sm:text-[11px] text-muted uppercase tracking-wider mt-0.5 block font-semibold font-mono">
          ACCURACY
        </span>
        <span className="text-[10px] text-muted block">Overall</span>
      </div>

      {/* 4. STREAK */}
      <div className="bg-parchment/60 rounded-2xl p-4 text-center border border-forest/10 shadow-card flex flex-col items-center justify-center">
        <Flame className="w-4 h-4 text-gold mb-1.5" />
        <div className="text-xl sm:text-2xl font-bold text-ink tracking-tight font-mono">
          {streakDays}
        </div>
        <span className="text-[10px] sm:text-[11px] text-muted uppercase tracking-wider mt-0.5 block font-semibold font-mono">
          STREAK
        </span>
        <span className="text-[10px] text-muted block">Days</span>
      </div>

      {/* 5. REVISION */}
      <div className="col-span-2 sm:col-span-1 bg-parchment/60 rounded-2xl p-4 text-center border border-forest/10 shadow-card flex flex-col items-center justify-center">
        <RotateCcw className="w-4 h-4 text-scholar mb-1.5" />
        <div className="text-xl sm:text-2xl font-bold text-ink tracking-tight font-mono">
          {revisionDueCount}
        </div>
        <span className="text-[10px] sm:text-[11px] text-muted uppercase tracking-wider mt-0.5 block font-semibold font-mono">
          REVISION
        </span>
        <span className="text-[10px] text-muted block">Due today</span>
      </div>
    </div>
  );
};
