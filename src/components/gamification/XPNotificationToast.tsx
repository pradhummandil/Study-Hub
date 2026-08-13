// src/components/gamification/XPNotificationToast.tsx
import { Sparkles } from 'lucide-react';

interface XPNotificationToastProps {
  xp: number | null;
  message?: string;
}

export function XPNotificationToast({ xp, message }: XPNotificationToastProps) {
  if (!xp || xp <= 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
      <div className="bg-forest rounded-full px-4 py-2 text-xs font-bold text-gold border border-sage/40 shadow-card flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-gold" />
        <span>+{xp} XP</span>
        {message && <span className="text-[10px] text-sage font-normal">({message})</span>}
      </div>
    </div>
  );
}

