import { motion } from 'framer-motion';
import type { ExamType, StudyMode } from '../../types/study-ai';
import { StudyAIStudentIllustration } from './StudyAIStudentIllustration';
import { StudyAIQuickActions } from './StudyAIQuickActions';

interface StudyAIWelcomeProps {
  onAction: (prompt: string, exam?: ExamType, mode?: StudyMode) => void;
  selectedExam: ExamType;
}

export function StudyAIWelcome({ onAction, selectedExam }: StudyAIWelcomeProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-start overflow-y-auto no-scrollbar pb-8">
      {/* ── Hero Container ────────────────────────────────────────── */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 md:pt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">

          {/* Left Hero Text Content */}
          <div className="text-center md:text-left flex flex-col items-center md:items-start">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <div
                className="inline-flex items-center gap-2 mb-4 px-3.5 py-1.5 rounded-full"
                style={{
                  background: 'rgba(92,225,230,0.1)',
                  border: '1px solid rgba(92,225,230,0.2)',
                }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#5CE1E6] animate-pulse" />
                <span className="text-xs font-medium tracking-wide" style={{ color: '#5CE1E6' }}>
                  AI Study Coach
                </span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white mb-4 leading-[1.15]"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              What are you{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #5CE1E6 0%, #7C83FD 50%, #B49CFF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                studying today?
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-sm sm:text-base leading-relaxed max-w-md"
              style={{ color: 'rgba(159,179,200,0.9)' }}
            >
              Ask a question, test yourself, build a plan,
              or understand something you keep getting wrong.
            </motion.p>

            {selectedExam !== 'General' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full"
                style={{
                  background: 'rgba(92,225,230,0.1)',
                  border: '1px solid rgba(92,225,230,0.25)',
                }}
              >
                <span className="text-xs font-medium" style={{ color: '#5CE1E6' }}>
                  🎯 Focused on {selectedExam}
                </span>
              </motion.div>
            )}
          </div>

          {/* Right Student + AI Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="w-full flex justify-center items-center mt-4 md:mt-0"
          >
            <StudyAIStudentIllustration />
          </motion.div>
        </div>
      </main>

      {/* ── Quick Start Section ────────────────────────────────────── */}
      <section className="relative z-20 mt-8 sm:mt-10 w-full max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <p className="text-xs font-medium uppercase tracking-widest mb-3" style={{ color: 'rgba(159,179,200,0.6)' }}>
            Quick start
          </p>
          <StudyAIQuickActions onAction={onAction} />
        </motion.div>
      </section>
    </div>
  );
}
