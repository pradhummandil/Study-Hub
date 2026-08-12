import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { ExamType, StudyMode } from '../../types/study-ai';
import { StudyAIAvatar } from './StudyAIAvatar';
import { StudyAIExamSelector } from './StudyAIExamSelector';
import { ArrowLeft, Wifi, WifiOff, Menu } from 'lucide-react';

interface StudyAIHeaderProps {
  selectedExam: ExamType;
  selectedMode: StudyMode;
  onExamChange: (exam: ExamType) => void;
  onModeChange: (mode: StudyMode) => void;
  isConnected: boolean;
  onToggleMobileSidebar?: () => void;
}

export function StudyAIHeader({
  selectedExam,
  selectedMode,
  onExamChange,
  onModeChange,
  isConnected,
  onToggleMobileSidebar,
}: StudyAIHeaderProps) {
  return (
    <header className="relative z-[100] w-full shrink-0">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between px-4 py-3"
        style={{
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(6,43,61,0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        {/* Left: Back + Mobile Drawer Menu + Identity */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/"
            className="text-white/40 hover:text-white/80 transition-colors p-1 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          {onToggleMobileSidebar && (
            <button
              onClick={onToggleMobileSidebar}
              className="md:hidden text-white/60 hover:text-white transition-colors p-1 rounded-lg focus:outline-none"
              aria-label="Toggle chat history drawer"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-2.5">
            <StudyAIAvatar size="sm" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-white leading-none">StudyMate AI</span>
              </div>
              <span className="text-[10px] leading-none" style={{ color: 'rgba(159,179,200,0.6)' }}>
                Your study partner, whenever you need one.
              </span>
            </div>
          </div>
        </div>

        {/* Center: Selectors (Desktop) */}
        <div className="hidden sm:flex items-center">
          <StudyAIExamSelector
            selectedExam={selectedExam}
            selectedMode={selectedMode}
            onExamChange={onExamChange}
            onModeChange={onModeChange}
          />
        </div>

        {/* Right: Status */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
            {isConnected ? (
              <>
                <Wifi className="w-3 h-3" style={{ color: '#5CE1E6' }} />
                <span className="text-[10px] font-medium hidden sm:block" style={{ color: '#5CE1E6' }}>
                  Online
                </span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-white/40" />
                <span className="text-[10px] font-medium hidden sm:block text-white/40">Offline</span>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </header>
  );
}
