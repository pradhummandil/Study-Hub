import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export const PageTransitionAnimation: React.FC = () => {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const isFirstRender = useRef(true);
  const previousPathname = useRef(location.pathname);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      previousPathname.current = location.pathname;
      return;
    }

    if (previousPathname.current === location.pathname) {
      return;
    }

    previousPathname.current = location.pathname;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    setIsTransitioning(true);

    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <AnimatePresence>
      {isTransitioning && (
        <motion.div
          key="page-transition-mask"
          initial={{ clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)' }}
          animate={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
          exit={{ clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)' }}
          transition={{ duration: 0.5, ease: [0.77, 0, 0.175, 1] }}
          className="fixed inset-0 z-[99990] bg-forest flex items-center justify-center pointer-events-none select-none overflow-hidden"
        >
          {/* Gold Editorial Moving Line */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="w-full h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
