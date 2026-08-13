import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { MOTION_TOKENS } from '../../../lib/motion/tokens';

interface MagneticButtonProps {
  children: React.ReactNode;
  maxOffset?: number;
  className?: string;
  glowColor?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  maxOffset = 6,
  className = '',
  glowColor = 'rgba(40,123,255,0.3)',
  style,
  onClick,
  type = 'button',
  disabled = false,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (shouldReduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distX = (e.clientX - centerX) * 0.15;
    const distY = (e.clientY - centerY) * 0.15;

    const clampedX = Math.min(Math.max(distX, -maxOffset), maxOffset);
    const clampedY = Math.min(Math.max(distY, -maxOffset), maxOffset);

    setOffset({ x: clampedX, y: clampedY });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setOffset({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      animate={{
        x: offset.x,
        y: offset.y,
        scale: isHovered ? 1.02 : 1,
      }}
      whileTap={{ scale: 0.97 }}
      transition={{
        type: 'spring',
        stiffness: MOTION_TOKENS.spring.heroTilt.stiffness,
        damping: MOTION_TOKENS.spring.heroTilt.damping,
      }}
      className={`relative cursor-pointer transition-shadow duration-300 ${className}`}
      style={{
        ...style,
        boxShadow: isHovered ? `0 12px 28px -6px ${glowColor}` : '0 4px 12px rgba(0,0,0,0.05)',
      }}
    >
      {children}
    </motion.button>
  );
};
