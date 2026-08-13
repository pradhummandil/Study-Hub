import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { MOTION_TOKENS } from '../../../lib/motion/tokens';

interface HoverCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  scale?: number;
  translateY?: number;
  dataCursor?: string;
}

export const HoverCard: React.FC<HoverCardProps> = ({
  children,
  className = '',
  onClick,
  scale = 1.03,
  translateY = -4,
  dataCursor,
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      onClick={onClick}
      data-cursor={dataCursor}
      whileHover={
        shouldReduceMotion
          ? {}
          : {
              scale: scale,
              y: translateY,
              boxShadow: '0 20px 30px -10px rgba(40,123,255,0.15), 0 8px 16px -4px rgba(6,43,61,0.06)',
              borderColor: 'rgba(40,123,255,0.4)',
            }
      }
      whileTap={{ scale: 0.98 }}
      transition={{
        type: 'spring',
        stiffness: MOTION_TOKENS.spring.normal.stiffness,
        damping: MOTION_TOKENS.spring.normal.damping,
      }}
      className={`transition-all duration-300 rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-md cursor-pointer ${className}`}
    >
      {children}
    </motion.div>
  );
};
