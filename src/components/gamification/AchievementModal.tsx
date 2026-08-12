// src/components/gamification/AchievementModal.tsx
import { Sparkles, Award, ArrowRight } from 'lucide-react';
import type { Achievement } from '../../types/ecosystem';

interface AchievementModalProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export function AchievementModal({ achievement, onClose }: AchievementModalProps) {
  if (!achievement) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm rounded-3xl p-6 bg-slate-900 border border-amber-500/30 text-slate-100 shadow-2xl text-center transition-all transform scale-[0.96] animate-scale-up">
        {/* Ambient glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-4 shadow-inner">
          <Award className="w-7 h-7" />
        </div>

        <div className="flex items-center justify-center gap-1.5 text-xs text-amber-400 font-bold uppercase tracking-widest mb-1">
          <Sparkles className="w-3.5 h-3.5" /> Achievement Unlocked
        </div>

        <h3
          className="text-2xl font-normal text-foreground mb-2"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          {achievement.title}
        </h3>

        <p className="text-xs text-slate-400 leading-relaxed mb-4 max-w-xs mx-auto">
          {achievement.description}
        </p>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-xs mb-6">
          <span>+{achievement.xp_reward} XP</span>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl gradient-cta text-slate-950 font-bold text-xs flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
        >
          <span>Continue Studying</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
