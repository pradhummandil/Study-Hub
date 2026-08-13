import React from 'react';
import { motion } from 'framer-motion';
import { LottiePlayer } from './LottiePlayer';
import { LOTTIE_ASSET_REGISTRY } from '../../../config/lottie-assets';

export type AIOrbState = 'idle' | 'hover' | 'listening' | 'thinking' | 'generating' | 'complete' | 'success';

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
      {/* THINKING STATE — Lottie AI Loading */}
      {state === 'thinking' && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <LottiePlayer
            src={LOTTIE_ASSET_REGISTRY.studymate_thinking.localPath}
            className="w-full h-full"
          />
        </div>
      )}

      {/* GENERATING STATE — Lottie Generating Wave */}
      {state === 'generating' && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <LottiePlayer
            src={LOTTIE_ASSET_REGISTRY.studymate_generating.localPath}
            className="w-full h-full"
          />
        </div>
      )}

      {/* COMPLETE / SUCCESS STATE — Short Success Lottie */}
      {(state === 'complete' || state === 'success') && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <LottiePlayer
            src={LOTTIE_ASSET_REGISTRY.quiz_success.localPath}
            loop={false}
            className="w-full h-full"
          />
        </div>
      )}

      {/* IDLE & HOVER & LISTENING STATE — Subtle Orb Glow */}
      {(state === 'idle' || state === 'hover' || state === 'listening') && (
        <>
          {/* Outer Soft Blue & Peach Halo */}
          <motion.div
            animate={{
              scale: state === 'listening' ? [1, 1.22, 1] : [1, 1.06, 1],
              opacity: state === 'hover' ? 0.9 : 0.65,
            }}
            transition={{
              duration: state === 'listening' ? 1.4 : 3.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute inset-0 rounded-full filter blur-xl pointer-events-none bg-gradient-to-tr from-[#1F5F8B] via-[#4E88B7] to-[#FCDAB7]"
          />

          {/* Main Orb Core */}
          <motion.div
            animate={{
              rotate: [0, 360],
              scale: state === 'hover' ? 1.06 : 1,
            }}
            transition={{
              rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
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
        </>
      )}
    </div>
  );
};


