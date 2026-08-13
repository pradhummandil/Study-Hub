// src/components/gamification/AchievementModal.tsx
import { Sparkles, Award, ArrowRight } from 'lucide-react';
import type { Achievement } from '../../types/ecosystem';
import { ModalShell } from '../modals/ModalShell';

interface AchievementModalProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export function AchievementModal({ achievement, onClose }: AchievementModalProps) {
  if (!achievement) return null;

  return (
    <ModalShell isOpen={Boolean(achievement)} onClose={onClose} maxWidthClassName="max-w-sm">
      <div className="p-6 sm:p-8 text-center space-y-4 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner">
          <Award className="w-8 h-8" />
        </div>

        <div className="flex items-center justify-center gap-1.5 text-xs text-amber-500 dark:text-amber-400 font-bold uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" /> Achievement Unlocked
        </div>

        <h3
          className="text-2xl sm:text-3xl font-normal text-slate-900 dark:text-white"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          {achievement.title}
        </h3>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-xs mx-auto">
          {achievement.description}
        </p>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300 font-bold text-xs">
          <span>+{achievement.xp_reward} XP</span>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#287BFF] to-[#6366F1] hover:brightness-110 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
        >
          <span>Continue Studying</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </ModalShell>
  );
}
