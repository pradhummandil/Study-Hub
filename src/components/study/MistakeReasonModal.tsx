import React from 'react';
import { HelpCircle } from 'lucide-react';
import type { MistakeType } from '../../types/intelligence';

interface MistakeReasonModalProps {
  isOpen: boolean;
  questionText?: string;
  onSelectReason: (reason: MistakeType) => void;
  onClose: () => void;
}

const MISTAKE_REASONS: Array<{ type: MistakeType; label: string; description: string; icon: string }> = [
  {
    type: 'concept_gap',
    label: 'Concept gap',
    description: "Didn't fully understand the underlying theory or formula.",
    icon: '💡',
  },
  {
    type: 'calculation_error',
    label: 'Calculation error',
    description: 'Understood the steps but made an arithmetic/algebra error.',
    icon: '🧮',
  },
  {
    type: 'careless_error',
    label: 'Careless mistake',
    description: 'Misread the question or selected wrong option by accident.',
    icon: '🤦‍♂️',
  },
  {
    type: 'memory_error',
    label: "Didn't remember",
    description: 'Forgot the specific formula, rule, or syntax needed.',
    icon: '🧠',
  },
  {
    type: 'time_pressure',
    label: 'Time pressure',
    description: 'Rushed through the question due to running out of time.',
    icon: '⏱️',
  },
];

export const MistakeReasonModal: React.FC<MistakeReasonModalProps> = ({
  isOpen,
  questionText,
  onSelectReason,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-paper border border-forest/15 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-scale-up">
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-forest/10">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-terracotta">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Mistake Categorization</span>
            </div>
            <h2 className="text-xl font-normal text-ink mt-0.5" style={{ fontFamily: "'Instrument Serif', serif" }}>
              Why did you miss this?
            </h2>
          </div>
        </div>

        {questionText && (
          <p className="text-xs text-muted italic line-clamp-2 bg-parchment/60 p-2.5 rounded-xl border border-forest/10">
            "{questionText}"
          </p>
        )}

        <div className="space-y-2">
          {MISTAKE_REASONS.map((r) => (
            <button
              key={r.type}
              onClick={() => {
                onSelectReason(r.type);
                onClose();
              }}
              className="w-full text-left bg-parchment/50 hover:bg-parchment p-3 rounded-2xl border border-forest/10 hover:border-scholar transition-all flex items-start gap-3 group"
            >
              <span className="text-xl">{r.icon}</span>
              <div>
                <h3 className="text-xs font-bold text-ink group-hover:text-scholar transition-colors">
                  {r.label}
                </h3>
                <p className="text-[11px] text-muted leading-tight mt-0.5">
                  {r.description}
                </p>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 text-center text-xs font-mono text-muted hover:text-ink transition-colors"
        >
          Skip reason for now
        </button>
      </div>
    </div>
  );
};
