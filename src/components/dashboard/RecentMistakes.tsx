import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { XCircle, X } from 'lucide-react';
import { getLocalAttempts } from '../../lib/practiceApi';
import type { UserQuestionAttempt } from '../../types/student-core';

export const RecentMistakes: React.FC = () => {
  const [mistakes, setMistakes] = useState<UserQuestionAttempt[]>([]);
  const [selectedMistake, setSelectedMistake] = useState<UserQuestionAttempt | null>(null);

  useEffect(() => {
    const attempts = getLocalAttempts();
    const wrong = attempts.filter((a) => !a.is_correct).slice(0, 5);
    setMistakes(wrong);
  }, []);

  if (mistakes.length === 0) {
    return (
      <div className="bg-paper rounded-3xl p-5 sm:p-6 border border-forest/10 shadow-card space-y-2">
        <div className="flex items-center justify-between pb-2 border-b border-forest/10">
          <h3 className="text-[10px] uppercase tracking-wider text-muted font-bold font-mono">
            RECENT MISTAKES
          </h3>
          <span className="text-[10px] text-scholar font-mono font-semibold">Clean Sheet</span>
        </div>
        <p className="text-xs text-muted leading-relaxed">
          No unmastered errors logged yet. Any incorrect question attempts will automatically appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-paper rounded-3xl p-5 sm:p-6 border border-forest/10 shadow-card space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-forest/10">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-muted font-bold font-mono">
            RECENT MISTAKES
          </span>
          <h3 className="text-xl font-normal text-ink" style={{ fontFamily: "'Instrument Serif', serif" }}>
            Unmastered errors to fix
          </h3>
        </div>
        <Link
          to="/mistakes"
          className="text-xs font-bold text-terracotta hover:underline font-mono"
        >
          Review all →
        </Link>
      </div>

      <div className="space-y-2">
        {mistakes.map((m, idx) => (
          <div
            key={m.id || idx}
            onClick={() => setSelectedMistake(m)}
            className="p-3.5 rounded-2xl bg-parchment/40 border border-forest/10 flex items-center justify-between gap-3 hover:border-terracotta/30 transition-all cursor-pointer group"
          >
            <div className="space-y-0.5 overflow-hidden">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-ink group-hover:text-terracotta transition-colors truncate">
                  {m.topic}
                </span>
                <span className="text-[9px] font-mono text-muted uppercase bg-parchment px-2 py-0.5 rounded border border-forest/10 shrink-0">
                  {m.subject}
                </span>
              </div>

              <div className="flex items-center gap-3 text-[11px] font-mono text-muted">
                <span className="text-terracotta flex items-center gap-1">
                  <XCircle className="w-3 h-3" /> Wrong answer
                </span>
                <span>•</span>
                <span>{new Date(m.created_at || Date.now()).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="px-3 py-1 bg-paper text-ink border border-forest/15 hover:bg-parchment font-bold text-[11px] rounded-xl shrink-0">
              <span>Inspect →</span>
            </div>
          </div>
        ))}
      </div>

      {/* Solution Review Modal */}
      {selectedMistake && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-paper border border-forest/20 rounded-3xl max-w-lg w-full p-6 shadow-deep relative space-y-4">
            <button
              onClick={() => setSelectedMistake(null)}
              className="absolute top-4 right-4 text-muted hover:text-ink p-1 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-forest/10 pb-2">
              <span className="text-[10px] font-mono uppercase font-bold text-terracotta">
                MISTAKE NOTEBOOK INSPECTION
              </span>
              <h3 className="text-lg font-bold text-ink mt-0.5">{selectedMistake.topic}</h3>
              <span className="text-xs text-muted font-mono">{selectedMistake.subject}</span>
            </div>

            <div className="space-y-3 font-sans text-xs">
              <div className="p-3 rounded-xl bg-terracotta/10 border border-terracotta/20 flex items-center justify-between text-terracotta font-mono">
                <span>Your Answer: {String(selectedMistake.user_answer || 'Skipped')}</span>
                <span className="font-bold">Incorrect</span>
              </div>

              <div className="p-3 rounded-xl bg-scholar/10 border border-scholar/20 text-scholar font-mono">
                <span className="font-bold">Recommendation:</span> Review theoretical framework & practice 5 similar PYQ drills.
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Link
                to={`/practice?subject=${encodeURIComponent(selectedMistake.subject)}&topic=${encodeURIComponent(selectedMistake.topic)}`}
                onClick={() => setSelectedMistake(null)}
                className="px-5 py-2 bg-scholar hover:bg-forest text-paper font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                <span>Practice Topic Now →</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
