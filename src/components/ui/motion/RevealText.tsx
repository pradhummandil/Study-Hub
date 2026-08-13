import React from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { MOTION_TOKENS } from '../../../lib/motion/tokens';

interface RevealTextProps {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
  className?: string;
  delay?: number;
  duration?: number;
  staggerChildren?: number;
  fontFamily?: string;
  gradientText?: string;
  onComplete?: () => void;
}

export const RevealText: React.FC<RevealTextProps> = ({
  text,
  as = 'h2',
  className = '',
  delay = 0,
  duration = 0.8,
  staggerChildren = 0.12,
  fontFamily,
  gradientText,
  onComplete,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const Tag = as;

  const lines = text.split('\n');

  if (shouldReduceMotion) {
    return (
      <Tag className={className} style={{ fontFamily }}>
        {text}
      </Tag>
    );
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: delay,
        staggerChildren: staggerChildren,
      },
    },
  };

  const lineVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 70,
      clipPath: 'inset(100% 0 0 0)',
    },
    visible: {
      opacity: 1,
      y: 0,
      clipPath: 'inset(0% 0 0 0)',
      transition: {
        duration: duration,
        ease: MOTION_TOKENS.easing.editorialText,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      onAnimationComplete={onComplete}
      className="inline-block max-w-full"
    >
      <Tag className={className} style={{ fontFamily }}>
        {lines.map((line, lineIdx) => {
          const isGradient = gradientText && line.includes(gradientText);

          return (
            <span key={lineIdx} className="block overflow-hidden py-0.5">
              <motion.span variants={lineVariants} className="inline-block">
                {isGradient ? (
                  <>
                    {line.split(gradientText)[0]}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#287BFF] via-[#6F7CFF] to-[#5CE1E6] animate-gradient-slow">
                      {gradientText}
                    </span>
                    {line.split(gradientText)[1]}
                  </>
                ) : (
                  line
                )}
              </motion.span>
            </span>
          );
        })}
      </Tag>
    </motion.div>
  );
};
