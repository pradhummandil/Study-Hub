import React from 'react';
import { motion } from 'framer-motion';

export type AIOrbState = 'idle' | 'hover' | 'listening' | 'thinking';

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
      {/* Outer Glow Halo */}
      <motion.div
        animate={{
          scale: state === 'listening' ? [1, 1.25, 1] : state === 'thinking' ? [1, 1.15, 1] : [1, 1.08, 1],
          opacity: state === 'hover' ? 0.9 : state === 'listening' ? 0.85 : 0.65,
        }}
        transition={{
          duration: state === 'listening' ? 1.4 : state === 'thinking' ? 1.8 : 3.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#287BFF] via-[#5CE1E6] to-[#6F7CFF] filter blur-xl pointer-events-none"
      />

      {/* Orbiting Particles (Active during 'thinking' state) */}
      {state === 'thinking' && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-[-12px] rounded-full border border-dashed border-[#5CE1E6]/60 pointer-events-none"
        >
          <div className="w-2 h-2 rounded-full bg-[#5CE1E6] shadow-[0_0_8px_#5CE1E6] absolute -top-1 left-1/2 -translate-x-1/2" />
          <div className="w-2 h-2 rounded-full bg-[#6F7CFF] shadow-[0_0_8px_#6F7CFF] absolute -bottom-1 left-1/2 -translate-x-1/2" />
        </motion.div>
      )}

      {/* Main Glass Orb Body */}
      <motion.div
        animate={{
          rotate: state === 'idle' ? [0, 360] : state === 'thinking' ? [0, 720] : 0,
          scale: state === 'hover' ? 1.06 : 1,
        }}
        transition={{
          rotate: { duration: state === 'thinking' ? 4 : 20, repeat: Infinity, ease: 'linear' },
          scale: { duration: 0.3 },
        }}
        className="relative z-10 w-full h-full rounded-full bg-gradient-to-br from-white/40 via-[#287BFF]/30 to-[#062B3D]/80 backdrop-blur-xl border border-white/60 shadow-2xl flex items-center justify-center overflow-hidden p-3"
      >
        {/* Inner Liquid Plasma Gradient */}
        <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#287BFF] via-[#5CE1E6] to-[#6F7CFF] opacity-80 mix-blend-overlay filter blur-md animate-pulse" />

        {/* Center Sparkle Badge */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-white shadow-[0_0_12px_#ffffff] animate-ping" />
        </div>
      </motion.div>
    </div>
  );
};
