import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { StudyAIAvatar } from './StudyAIAvatar';

const THINKING_PHRASES = [
  'StudyMate is thinking...',
  'Breaking this down...',
  'Checking the concept...',
  'Building the explanation...',
  'Finding the best way to explain it...',
  'Preparing your answer...',
];

export function StudyAIThinking() {
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % THINKING_PHRASES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="flex items-start gap-3 my-3"
    >
      {/* 1. Left side: Circular Video Chatbot Avatar */}
      <div className="shrink-0 mt-1">
        <StudyAIAvatar size="sm" showSparkle={true} />
      </div>

      {/* 2. Right side: Thinking phrase + bouncing dots pill */}
      <div
        className="flex items-center gap-2 px-3.5 py-2 rounded-2xl backdrop-blur-md"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(92, 225, 230, 0.25)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
        }}
      >
        <span className="text-xs font-medium text-white/90">
          {THINKING_PHRASES[phraseIndex]}
        </span>
        <span className="inline-flex gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#5CE1E6] animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-[#7C83FD] animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-[#B49CFF] animate-bounce" style={{ animationDelay: '300ms' }} />
        </span>
      </div>
    </motion.div>
  );
}
