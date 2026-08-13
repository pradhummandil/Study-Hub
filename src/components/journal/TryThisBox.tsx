import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Target, Zap, BookOpen, BrainCircuit } from 'lucide-react';

interface TryThisBoxProps {
  cta?: {
    title: string;
    description: string;
    buttonText: string;
    link: string;
  };
  category?: string;
}

export function TryThisBox({ cta, category }: TryThisBoxProps) {
  // Dynamic fallback CTA based on category if custom CTA is not provided
  const getDefaultCta = () => {
    if (category === 'Study Notes') {
      return {
        title: 'Build Your Personal Revision Decks',
        description: 'Convert these study notes into interactive flashcards and formula summary sheets.',
        buttonText: 'Open Flashcards',
        link: '/flashcards',
      };
    }
    if (category === 'PYQ Strategy' || category === 'Exam Strategy') {
      return {
        title: 'Put Strategy into Practice',
        description: 'Test your understanding with real topic-wise past year questions on Study Hub.',
        buttonText: 'Practice PYQs',
        link: '/practice',
      };
    }
    if (category === 'Revision') {
      return {
        title: 'Master Spaced Revision',
        description: 'Queue this topic into your Study Hub spaced repetition schedule.',
        buttonText: 'Open Revision Engine',
        link: '/revision',
      };
    }
    return {
      title: 'Try This Today on Study Hub',
      description: 'Put these insights into practice using Study Hub’s adaptive learning and diagnostic tools.',
      buttonText: 'Open Study Hub Practice',
      link: '/practice',
    };
  };

  const activeCta = cta || getDefaultCta();

  const getIcon = () => {
    if (activeCta.link.includes('practice') || activeCta.link.includes('pyq')) return Target;
    if (activeCta.link.includes('flashcard')) return Zap;
    if (activeCta.link.includes('revision')) return BookOpen;
    if (activeCta.link.includes('study-mate')) return BrainCircuit;
    return Sparkles;
  };

  const IconComponent = getIcon();

  return (
    <div className="my-10 p-6 sm:p-8 rounded-3xl liquid-glass border border-cyan-500/30 relative overflow-hidden group shadow-2xl font-sans">
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass border border-cyan-400/30 text-xs font-semibold text-cyan-300 uppercase tracking-widest">
            <IconComponent className="w-3.5 h-3.5 text-cyan-400" />
            <span>Try This Today</span>
          </div>
          <h4 className="text-xl sm:text-2xl font-normal text-foreground leading-snug" style={{ fontFamily: "'Instrument Serif', serif" }}>
            {activeCta.title}
          </h4>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {activeCta.description}
          </p>
        </div>

        <Link
          to={activeCta.link}
          className="gradient-cta rounded-full px-6 py-3 text-xs sm:text-sm text-slate-950 font-semibold flex items-center gap-2 hover:scale-105 transition-all shadow-lg shrink-0 cursor-pointer"
        >
          <span>{activeCta.buttonText}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
