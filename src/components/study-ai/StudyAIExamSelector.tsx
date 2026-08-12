import { motion, AnimatePresence } from 'framer-motion';
import type { ExamType, StudyMode } from '../../types/study-ai';
import { BookOpen, Brain, ChevronDown, Check } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const EXAMS: ExamType[] = [
  'General', 'GATE', 'JEE Main', 'JEE Advanced', 'NEET',
  'CUET', 'UPSC', 'UGC NET', 'CLAT', 'NIFT', 'Other',
];

const MODES: StudyMode[] = [
  'Explain', 'Practice', 'Quiz', 'Revision', 'Study Plan', 'Doubt Solving',
];

const MODE_ICONS: Record<StudyMode, string> = {
  'Explain': '📖',
  'Practice': '✏️',
  'Quiz': '🧠',
  'Revision': '📝',
  'Study Plan': '🗓️',
  'Doubt Solving': '🔍',
};

interface StudyAIExamSelectorProps {
  selectedExam: ExamType;
  selectedMode: StudyMode;
  onExamChange: (exam: ExamType) => void;
  onModeChange: (mode: StudyMode) => void;
}

export function StudyAIExamSelector({
  selectedExam,
  selectedMode,
  onExamChange,
  onModeChange,
}: StudyAIExamSelectorProps) {
  const [examOpen, setExamOpen] = useState(false);
  const [modeOpen, setModeOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click or Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setExamOpen(false);
        setModeOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setExamOpen(false);
        setModeOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleExam = () => {
    setExamOpen((prev) => !prev);
    setModeOpen(false);
  };

  const toggleMode = () => {
    setModeOpen((prev) => !prev);
    setExamOpen(false);
  };

  return (
    <div ref={containerRef} className="flex flex-wrap items-center gap-2 sm:gap-3 relative z-[100]">
      {/* ── Exam Selector ────────────────────────────────────────── */}
      <div className="relative">
        <button
          onClick={toggleExam}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5CE1E6]/50"
          style={{
            background: selectedExam !== 'General'
              ? 'linear-gradient(135deg, rgba(92,225,230,0.2), rgba(124,131,253,0.2))'
              : 'rgba(255,255,255,0.06)',
            border: selectedExam !== 'General'
              ? '1px solid rgba(92,225,230,0.4)'
              : '1px solid rgba(255,255,255,0.12)',
            color: selectedExam !== 'General' ? '#5CE1E6' : 'rgba(255,255,255,0.85)',
          }}
          aria-label="Select exam target"
          aria-expanded={examOpen}
          aria-haspopup="menu"
        >
          <Brain className="w-3.5 h-3.5" style={{ color: selectedExam !== 'General' ? '#5CE1E6' : 'rgba(255,255,255,0.6)' }} />
          <span>{selectedExam}</span>
          <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${examOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {examOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.96 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="absolute left-0 top-[calc(100%+8px)] z-[200] rounded-[18px] overflow-hidden min-w-[170px] max-w-[calc(100vw-24px)] max-h-[360px] overflow-y-auto no-scrollbar shadow-2xl"
              style={{
                background: 'rgba(7, 38, 53, 0.96)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(92,225,230,0.18)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.45), 0 0 20px rgba(92,225,230,0.08)',
              }}
              role="menu"
              aria-orientation="vertical"
            >
              <div className="py-1.5">
                <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/40 border-b border-white/5 mb-1">
                  Target Exam
                </div>
                {EXAMS.map((exam) => {
                  const isSelected = selectedExam === exam;
                  return (
                    <button
                      key={exam}
                      onClick={() => {
                        onExamChange(exam);
                        setExamOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors hover:bg-white/10"
                      style={{
                        color: isSelected ? '#5CE1E6' : 'rgba(255,255,255,0.8)',
                        fontWeight: isSelected ? 600 : 400,
                        background: isSelected ? 'rgba(92,225,230,0.08)' : 'transparent',
                      }}
                      role="menuitem"
                    >
                      <span>{exam}</span>
                      {isSelected && <Check className="w-3.5 h-3.5" style={{ color: '#5CE1E6' }} />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Mode Selector ────────────────────────────────────────── */}
      <div className="relative">
        <button
          onClick={toggleMode}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B49CFF]/50"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.85)',
          }}
          aria-label="Select study mode"
          aria-expanded={modeOpen}
          aria-haspopup="menu"
        >
          <BookOpen className="w-3.5 h-3.5" style={{ color: '#B49CFF' }} />
          <span>{MODE_ICONS[selectedMode]} {selectedMode}</span>
          <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${modeOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {modeOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.96 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="absolute left-0 top-[calc(100%+8px)] z-[200] rounded-[18px] overflow-hidden w-[180px] max-w-[calc(100vw-24px)] max-h-[360px] overflow-y-auto no-scrollbar shadow-2xl"
              style={{
                background: 'rgba(7, 38, 53, 0.96)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(180,156,255,0.18)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.45), 0 0 20px rgba(180,156,255,0.08)',
              }}
              role="menu"
              aria-orientation="vertical"
            >
              <div className="py-1.5">
                <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/40 border-b border-white/5 mb-1">
                  Study Mode
                </div>
                {MODES.map((mode) => {
                  const isSelected = selectedMode === mode;
                  return (
                    <button
                      key={mode}
                      onClick={() => {
                        onModeChange(mode);
                        setModeOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors hover:bg-white/10"
                      style={{
                        color: isSelected ? '#B49CFF' : 'rgba(255,255,255,0.8)',
                        fontWeight: isSelected ? 600 : 400,
                        background: isSelected ? 'rgba(180,156,255,0.08)' : 'transparent',
                      }}
                      role="menuitem"
                    >
                      <span className="flex items-center gap-2">
                        <span>{MODE_ICONS[mode]}</span>
                        <span>{mode}</span>
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5" style={{ color: '#B49CFF' }} />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
