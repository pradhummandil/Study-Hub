import React from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { MOTION_TOKENS } from '../../../lib/motion/tokens';

interface ScrollShelfProps {
  children: React.ReactNode[];
  className?: string;
  staggerDelay?: number;
}

export const ScrollShelf: React.FC<ScrollShelfProps> = ({
  children,
  className = '',
  staggerDelay = 0.08,
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div className={`flex gap-6 overflow-x-auto pb-4 scrollbar-none ${className}`}>
        {children}
      </div>
    );
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: 40, scale: 0.96 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: MOTION_TOKENS.duration.smooth,
        ease: MOTION_TOKENS.easing.easeOut,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      className={`flex gap-6 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory ${className}`}
    >
      {React.Children.map(children, (child, idx) => (
        <motion.div key={idx} variants={itemVariants} className="snap-start shrink-0">
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};
