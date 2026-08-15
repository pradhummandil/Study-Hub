import React from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  Sparkles,
  BookOpen,
  Trophy,
  RotateCcw,
  Layers,
  ChevronRight,
} from 'lucide-react';

export const QuickTools: React.FC = () => {
  const tools = [
    {
      title: 'Focus Room Session',
      desc: 'Pomodoro timer & deep work study lounge',
      path: '/focus-room',
      icon: Clock,
      color: 'text-scholar',
    },
    {
      title: 'StudyMate AI Tutor',
      desc: 'Instant doubt solver & concept explainer',
      path: '/study-ai',
      icon: Sparkles,
      color: 'text-terracotta',
    },
    {
      title: 'Practice & Canonical PYQs',
      desc: 'Topic drills with step-by-step solutions',
      path: '/practice',
      icon: BookOpen,
      color: 'text-scholar',
    },
    {
      title: 'Mock Tests & Simulator',
      desc: 'Full-length timed exam simulations',
      path: '/mock-tests',
      icon: Trophy,
      color: 'text-gold',
    },
    {
      title: 'Spaced Revision Queue',
      desc: 'SuperMemo 2 memory retention reviews',
      path: '/revision',
      icon: RotateCcw,
      color: 'text-scholar',
    },
    {
      title: 'Flashcards Decks',
      desc: 'Active recall formula & definition cards',
      path: '/flashcards',
      icon: Layers,
      color: 'text-terracotta',
    },
  ];

  return (
    <div className="bg-paper rounded-3xl p-6 border border-forest/10 shadow-card space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-forest/10">
        <h3 className="text-xs uppercase tracking-wider text-muted font-bold font-mono">
          QUICK TOOLS
        </h3>
        <span className="text-[10px] text-muted font-mono font-semibold">6 Tools Available</span>
      </div>

      <div className="space-y-2">
        {tools.map(({ title, desc, path, icon: Icon, color }) => (
          <Link
            key={title}
            to={path}
            className="bg-parchment/40 rounded-xl p-3 text-xs text-ink hover:bg-parchment/90 transition-all flex items-center justify-between group border border-forest/5 hover:border-forest/15"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-paper border border-forest/10 group-hover:scale-105 transition-transform">
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div>
                <span className="font-bold text-ink group-hover:text-scholar transition-colors block">
                  {title}
                </span>
                <span className="text-[10px] text-muted block leading-tight">{desc}</span>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-muted group-hover:text-ink transition-transform group-hover:translate-x-1 shrink-0 ml-2" />
          </Link>
        ))}
      </div>
    </div>
  );
};
