import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StudyHubStartupAnimationProps {
  onComplete?: () => void;
  forceShow?: boolean;
}

const WORDS = ['Study.', 'Practice.', 'Remember.', 'Grow.'];

export const StudyHubStartupAnimation: React.FC<StudyHubStartupAnimationProps> = ({
  onComplete,
  forceShow = false,
}) => {
  const [isReturningUser] = useState<boolean>(() => {
    if (forceShow) return false;
    try {
      return !!sessionStorage.getItem('studyhub_startup_seen');
    } catch {
      return false;
    }
  });

  const [shouldShow, setShouldShow] = useState<boolean>(true);
  const [wordIndex, setWordIndex] = useState(0);
  const [showFinalLogo, setShowFinalLogo] = useState(isReturningUser);

  useEffect(() => {
    if (!shouldShow) return;

    if (isReturningUser) {
      // Short 400ms logo reveal for returning sessions
      const fastTimer = setTimeout(() => {
        handleFinish();
      }, 400);
      return () => clearTimeout(fastTimer);
    }

    // Full 2-second animation for new sessions
    const wordInterval = setInterval(() => {
      setWordIndex((prev) => {
        if (prev < WORDS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(wordInterval);
          setShowFinalLogo(true);
          return prev;
        }
      });
    }, 350);

    const timer = setTimeout(() => {
      handleFinish();
    }, 2000);

    return () => {
      clearInterval(wordInterval);
      clearTimeout(timer);
    };
  }, [shouldShow, isReturningUser]);


  const handleFinish = () => {
    if (!forceShow) {
      try {
        sessionStorage.setItem('studyhub_startup_seen', 'true');
      } catch {}
    }
    setShouldShow(false);
    onComplete?.();
  };

  if (!shouldShow) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="startup-overlay"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.02 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0 z-[99999] bg-forest text-paper flex flex-col items-center justify-center select-none overflow-hidden"
      >
        {/* Subtle radial ambient background glow */}
        <div className="absolute w-[450px] h-[450px] rounded-full bg-terracotta/15 blur-[120px] pointer-events-none" />

        {/* Central Content Box */}
        <div className="relative z-10 flex flex-col items-center gap-6 text-center">
          {/* Logo Mark */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="w-14 h-14 rounded-2xl bg-scholar text-paper border border-sage/30 flex items-center justify-center font-serif text-2xl font-bold shadow-deep"
          >
            SH
          </motion.div>

          {/* Thin Editorial Line Draw */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 140 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="h-[1px] bg-gold/50 my-1"
          />

          {/* Sequential Editorial Words vs Final Brand Logo */}
          <div className="h-16 flex items-center justify-center">
            {!showFinalLogo ? (
              <AnimatePresence mode="wait">
                <motion.span
                  key={WORDS[wordIndex]}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="font-serif text-3xl sm:text-4xl text-paper italic font-normal tracking-wide"
                >
                  {WORDS[wordIndex]}
                </motion.span>
              </AnimatePresence>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-1"
              >
                <h1 className="font-serif text-3xl sm:text-4xl text-paper font-normal tracking-tight">
                  STUDY HUB
                </h1>
                <p className="text-xs text-gold font-medium tracking-widest uppercase">
                  Intelligent Study Space
                </p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Skip button */}
        <button
          onClick={handleFinish}
          className="absolute top-6 right-6 px-4 py-2 rounded-full bg-scholar/40 hover:bg-scholar text-sage hover:text-paper text-xs font-semibold border border-sage/20 transition-all"
        >
          Skip Intro →
        </button>
      </motion.div>
    </AnimatePresence>
  );
};
