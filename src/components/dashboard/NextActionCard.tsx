import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Activity } from 'lucide-react';
import type { NextActionRecommendation } from '../../lib/intelligence/nextActionEngine';
import { useStudentContext } from '../../context/StudentContext';

interface NextActionCardProps {
  nextAction: NextActionRecommendation | null;
  onOpenDiagnostic?: () => void;
}

export const NextActionCard: React.FC<NextActionCardProps> = ({
  nextAction,
  onOpenDiagnostic,
}) => {
  const { targetExam } = useStudentContext();

  if (!nextAction || nextAction.reliabilitySignal === 'INSUFFICIENT_DATA') {
    return (
      <div className="bg-forest text-paper rounded-3xl p-5 sm:p-6 border border-forest/20 shadow-deep space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="px-2.5 py-0.5 bg-gold/20 text-gold border border-gold/30 text-[10px] uppercase tracking-wider font-bold rounded-full font-mono">
            NEXT BEST MOVE
          </span>
          <span className="text-[11px] text-sage font-mono">Recommendation Engine</span>
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-normal text-paper" style={{ fontFamily: "'Instrument Serif', serif" }}>
            "You haven't practiced Computer Networks recently."
          </h2>
          <div className="flex items-center gap-4 text-xs text-sage font-mono mt-1">
            <span>42 questions available</span>
            <span>•</span>
            <span>Last reliable accuracy: 62%</span>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-sage/20">
          <span className="text-[11px] text-sage font-mono">
            RATIONALE: Initial attempt profile needs computer networks baseline signal.
          </span>

          <div className="flex items-center gap-2">
            {onOpenDiagnostic ? (
              <button
                onClick={onOpenDiagnostic}
                className="px-5 py-2 bg-gold hover:bg-gold/90 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm shrink-0 cursor-pointer"
              >
                <span>Practice Computer Networks →</span>
              </button>
            ) : (
              <Link
                to="/practice?subject=Computer%20Networks"
                className="px-5 py-2 bg-gold hover:bg-gold/90 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm shrink-0"
              >
                <span>Practice Computer Networks →</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-forest text-paper rounded-3xl p-5 sm:p-6 border border-forest/20 shadow-deep space-y-3 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <span className="px-2.5 py-0.5 bg-gold/20 text-gold border border-gold/30 text-[10px] uppercase tracking-wider font-bold rounded-full font-mono flex items-center gap-1.5">
          <Activity className="w-3 h-3 text-gold" />
          YOUR NEXT BEST MOVE • {nextAction.reliabilitySignal}
        </span>
        <span className="text-[11px] text-sage font-mono">{targetExam} Engine</span>
      </div>

      <div>
        <h2 className="text-xl sm:text-2xl font-normal text-paper" style={{ fontFamily: "'Instrument Serif', serif" }}>
          {nextAction.title}
        </h2>
        <p className="text-xs text-sage mt-1 leading-relaxed">{nextAction.subtext}</p>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-sage/20">
        <span className="text-[11px] text-sage font-mono max-w-lg truncate">
          RATIONALE: {nextAction.empiricalEvidence}
        </span>

        <Link
          to={nextAction.actionUrl}
          className="px-5 py-2 bg-gold hover:bg-gold/90 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm shrink-0 self-start sm:self-auto"
        >
          <span>{nextAction.ctaText}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
