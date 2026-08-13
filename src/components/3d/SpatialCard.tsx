import React from 'react';
import { motion } from 'framer-motion';

interface SpatialCardProps {
  children: React.ReactNode;
  depth?: number; // Spatial z depth offset (px)
  rotate?: number; // Base 2D/3D rotation (deg)
  parallax?: number; // Parallax scroll multiplier
  className?: string;
}

export const SpatialCard: React.FC<SpatialCardProps> = ({
  children,
  depth = 80,
  rotate = 0,
  className = '',
}) => {
  return (
    <motion.div
      whileHover={{
        y: -8,
        scale: 1.03,
        rotateZ: rotate + (rotate > 0 ? 2 : -2),
        transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
      }}
      style={{
        transformStyle: 'preserve-3d',
        transform: `translateZ(${depth}px) rotateZ(${rotate}deg)`,
      }}
      className={`relative rounded-2xl bg-paper border border-forest/10 p-6 shadow-card hover:shadow-float transition-all ${className}`}
    >
      {/* Subtle depth layer shadow accent */}
      <div className="absolute inset-0 rounded-2xl bg-parchment/40 -z-10 translate-z-[-20px] scale-[0.98] pointer-events-none" />
      {children}
    </motion.div>
  );
};
