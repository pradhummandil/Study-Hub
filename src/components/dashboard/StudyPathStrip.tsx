import React from 'react';
import { Link } from 'react-router-dom';
import {
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Layers,
  Video,
  FileText,
  Trophy,
  ArrowRight,
} from 'lucide-react';
import { useStudentContext } from '../../context/StudentContext';

export const StudyPathStrip: React.FC = () => {
  const { targetExam } = useStudentContext();

  const steps = [
    { label: 'QUESTION', icon: HelpCircle, path: '/practice', color: 'bg-scholar/10 text-scholar border-scholar/20' },
    { label: 'SOLUTION', icon: CheckCircle2, path: '/practice', color: 'bg-scholar/10 text-scholar border-scholar/20' },
    { label: 'MISTAKE', icon: AlertTriangle, path: '/mistakes', color: 'bg-terracotta/10 text-terracotta border-terracotta/20' },
    { label: 'REVISION', icon: RotateCcw, path: '/revision', color: 'bg-gold/15 text-gold border-gold/30' },
    { label: 'FLASHCARD', icon: Layers, path: '/flashcards', color: 'bg-scholar/10 text-scholar border-scholar/20' },
    { label: 'VIDEO', icon: Video, path: '/video-learning', color: 'bg-scholar/10 text-scholar border-scholar/20' },
    { label: 'NOTES', icon: FileText, path: '/study-materials', color: 'bg-terracotta/10 text-terracotta border-terracotta/20' },
    { label: 'MOCK', icon: Trophy, path: '/mock-tests', color: 'bg-gold/20 text-gold border-gold/40' },
  ];

  return (
    <div className="bg-paper rounded-3xl p-5 sm:p-6 border border-forest/10 shadow-card space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-forest/10">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-muted font-bold font-mono">
            SIGNATURE STUDY WORKFLOW
          </span>
          <h3 className="text-lg font-normal text-ink mt-0.5" style={{ fontFamily: "'Instrument Serif', serif" }}>
            The Study Hub Mastery Path
          </h3>
        </div>
        <span className="text-[10px] text-scholar font-mono font-semibold bg-scholar/10 px-2.5 py-1 rounded-full border border-scholar/20">
          Connected {targetExam} Engine
        </span>
      </div>

      <p className="text-xs text-muted leading-relaxed">
        Every question attempt seamlessly routes you to solution insights, mistake logging, spaced revision, video explanation, and full exam mocks.
      </p>

      {/* Horizontal Workflow Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar font-mono text-[10px]">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <React.Fragment key={step.label}>
              <Link
                to={step.path}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border font-bold shrink-0 transition-transform hover:scale-105 ${step.color}`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{step.label}</span>
              </Link>
              {idx < steps.length - 1 && (
                <ArrowRight className="w-3 h-3 text-muted shrink-0 opacity-50" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
