import React from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { MOTION_TOKENS } from '../../../lib/motion/tokens';

interface MotionSectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  delay?: number;
  staggerChildren?: number;
}

export const MotionSection: React.FC<MotionSectionProps> = ({
  children,
  className = '',
  id,
  delay = 0,
  staggerChildren = 0.1,
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <section id={id} className={className}>
        {children}
      </section>
    );
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: MOTION_TOKENS.duration.smooth,
        ease: MOTION_TOKENS.easing.easeOut,
        delayChildren: delay,
        staggerChildren: staggerChildren,
      },
    },
  };

  return (
    <motion.section
      id={id}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      className={className}
    >
      {children}
    </motion.section>
  );
};
