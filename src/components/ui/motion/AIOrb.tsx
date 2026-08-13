import React from 'react';
import { motion } from 'framer-motion';

export type AIOrbState = 'idle' | 'hover' | 'listening' | 'thinking' | 'success';

interface AIOrbProps {
  state?: AIOrbState;
  size?: number;
  className?: string;
  onClick?: () => void;
}

export const AIOrb: React.FC<AIOrbProps> = ({
  state = 'idle',
  size = 140,
  className = '',
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      aria-label={`StudyMate AI Orb (${state} state)`}
      className={`relative flex items-center justify-center cursor-pointer group ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Outer Soft Blue & Peach Halo */}
      <motion.div
        animate={{
          scale: state === 'listening' ? [1, 1.22, 1] : state === 'thinking' ? [1, 1.15, 1] : [1, 1.06, 1],
          opacity: state === 'hover' ? 0.9 : state === 'listening' ? 0.85 : 0.65,
        }}
        transition={{
          duration: state === 'listening' ? 1.4 : state === 'thinking' ? 1.8 : 3.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={`absolute inset-0 rounded-full filter blur-xl pointer-events-none ${
          state === 'success'
            ? 'bg-gradient-to-tr from-[#2E8B72] via-[#4E88B7] to-[#FCDAB7]'
            : 'bg-gradient-to-tr from-[#1F5F8B] via-[#4E88B7] to-[#FCDAB7]'
        }`}
      />

      {/* Orbiting Ring (Active during 'thinking' state) */}
      {state === 'thinking' && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-[-12px] rounded-full border border-dashed border-[#4E88B7]/60 pointer-events-none"
        >
          <div className="w-2 h-2 rounded-full bg-[#4E88B7] shadow-[0_0_8px_#4E88B7] absolute -top-1 left-1/2 -translate-x-1/2" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#FCDAB7] shadow-[0_0_8px_#FCDAB7] absolute -bottom-1 left-1/2 -translate-x-1/2" />
        </motion.div>
      )}

      {/* Main Orb Core */}
      <motion.div
        animate={{
          rotate: state === 'idle' ? [0, 360] : state === 'thinking' ? [0, 720] : 0,
          scale: state === 'hover' ? 1.06 : 1,
        }}
        transition={{
          rotate: { duration: state === 'thinking' ? 4 : 20, repeat: Infinity, ease: 'linear' },
          scale: { duration: 0.3 },
        }}
        className="relative z-10 w-full h-full rounded-full bg-gradient-to-br from-white/30 via-[#1F5F8B]/50 to-[#10233F] backdrop-blur-xl border border-white/40 shadow-2xl flex items-center justify-center overflow-hidden p-3"
      >
        {/* Inner Liquid Gradient */}
        <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#1F5F8B] via-[#4E88B7] to-[#FCDAB7] opacity-80 mix-blend-overlay filter blur-sm animate-pulse" />

        {/* Center Peach Highlight Sparkle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3.5 h-3.5 rounded-full bg-[#FCDAB7] shadow-[0_0_12px_#FCDAB7] animate-ping" />
        </div>
      </motion.div>
    </div>
  );
};

