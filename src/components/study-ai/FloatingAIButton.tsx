import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface FloatingAIButtonProps {
  show?: boolean;
}

export function FloatingAIButton({ show = true }: FloatingAIButtonProps) {
  const navigate = useNavigate();
  const prefersReduced = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = () => {
    setIsPressed(true);
    setTimeout(() => {
      setIsPressed(false);
      navigate('/study-ai');
    }, 180);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.4, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.4, y: 24 }}
          transition={{
            duration: 0.5,
            delay: 1.8,
            ease: [0.34, 1.56, 0.64, 1], // spring overshoot
          }}
          className="fixed z-50"
          style={{
            bottom: 'clamp(16px, 3vw, 24px)',
            right:  'clamp(16px, 3vw, 24px)',
          }}
        >
          {/* Hover Tooltip */}
          <motion.div
            className="absolute right-full mr-3 top-1/2 -translate-y-1/2 pointer-events-none whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xl"
            style={{
              background:     'rgba(6, 43, 61, 0.95)',
              border:         '1px solid rgba(92, 225, 230, 0.3)',
              color:          '#FFFFFF',
              backdropFilter: 'blur(16px)',
              letterSpacing:  '0.01em',
              boxShadow:      '0 4px 20px rgba(0,0,0,0.4)',
            }}
            initial={{ opacity: 0, x: 8, scale: 0.92 }}
            animate={{
              opacity: isHovered ? 1 : 0,
              x:       isHovered ? 0 : 8,
              scale:   isHovered ? 1 : 0.92,
            }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            Ask StudyMate AI
          </motion.div>

          {/* Outer ambient glow ring */}
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              inset: -10,
              background: 'radial-gradient(circle, rgba(92,225,230,0.4) 0%, rgba(124,131,253,0.2) 50%, transparent 70%)',
              filter: 'blur(10px)',
            }}
            animate={prefersReduced ? {} : {
              opacity: isHovered ? 1 : [0.6, 0.9, 0.6],
              scale:   isHovered ? 1.15 : [1, 1.1, 1],
            }}
            transition={
              isHovered
                ? { duration: 0.25 }
                : { duration: 3.5, repeat: Infinity, ease: 'easeInOut' }
            }
          />

          {/* Hover border glow */}
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              inset: -3,
              border: '1.5px solid rgba(92,225,230,0.6)',
              borderRadius: '9999px',
            }}
            animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.88 }}
            transition={{ duration: 0.2 }}
          />

          {/* Floating Action Button containing /video/chatbot.mp4 */}
          <motion.button
            onClick={handleClick}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            onTapStart={() => setIsPressed(true)}
            onTap={() => setIsPressed(false)}
            onTapCancel={() => setIsPressed(false)}
            animate={prefersReduced ? {} : {
              y:     [0, -5, 0],
              scale: isPressed ? 0.92 : isHovered ? 1.08 : [1, 1.03, 1],
            }}
            transition={
              isPressed
                ? { duration: 0.12, ease: [0.34, 1.56, 0.64, 1] }
                : isHovered
                ? { duration: 0.25, ease: 'easeOut' }
                : {
                    y:     { duration: 4, repeat: Infinity, ease: 'easeInOut' },
                    scale: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
                  }
            }
            className="relative focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5CE1E6]"
            style={{
              width:        'clamp(56px, 5vw, 64px)',
              height:       'clamp(56px, 5vw, 64px)',
              borderRadius: '9999px',
              overflow:     'hidden',
              cursor:       'pointer',
              boxShadow:    isHovered
                ? '0 12px 40px rgba(92,225,230,0.5), 0 4px 16px rgba(0,0,0,0.6)'
                : '0 8px 28px rgba(92,225,230,0.35), 0 4px 12px rgba(0,0,0,0.5)',
              transition:   'box-shadow 0.25s ease',
              display:      'block',
              padding:       0,
              border:        '1px solid rgba(92, 225, 230, 0.4)',
              background:    '#062B3D',
            }}
            aria-label="Ask StudyMate AI"
            id="floating-studymate-btn"
          >
            {/* Circular Video Player */}
            <video
              src="/video/chatbot.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover rounded-full pointer-events-none select-none"
            />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
