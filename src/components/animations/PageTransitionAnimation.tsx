import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Major routes eligible for page transition animation
const MAJOR_ROUTES = [
  '/',
  '/dashboard',
  '/studio',
  '/study-ai',
  '/roadmap',
  '/practice',
  '/mock-tests',
  '/exam-simulator',
  '/revision',
  '/mistakes',
  '/flashcards',
  '/adaptive-practice',
  '/performance',
  '/community',
  '/journal',
  '/about',
  '/reach-us',
  '/exams',
  '/video-learning'
];

function isMajorRoute(path: string): boolean {
  const cleanPath = path.split('?')[0].split('#')[0];
  if (cleanPath === '/') return true;
  return MAJOR_ROUTES.some(r => r !== '/' && cleanPath.startsWith(r));
}

export const PageTransitionAnimation: React.FC = () => {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const isFirstRender = useRef(true);
  const previousPathname = useRef(location.pathname);
  const isTransitioningRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Preload navigation video asset on mount
  useEffect(() => {
    const linkMp4 = document.createElement('link');
    linkMp4.rel = 'preload';
    linkMp4.as = 'video';
    linkMp4.href = '/assets/animations/studyhub-navigation.mp4';
    linkMp4.type = 'video/mp4';
    document.head.appendChild(linkMp4);
  }, []);

  const endTransition = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsTransitioning(false);
    isTransitioningRef.current = false;
  };

  useEffect(() => {
    // Ignore initial direct URL page load
    if (isFirstRender.current) {
      isFirstRender.current = false;
      previousPathname.current = location.pathname;
      return;
    }

    // Ignore if pathname hasn't changed (e.g. hash or search param changes)
    if (previousPathname.current === location.pathname) {
      return;
    }

    // Prevent double transition triggers on rapid link clicks
    if (isTransitioningRef.current) {
      previousPathname.current = location.pathname;
      return;
    }

    const prevPath = previousPathname.current;
    const currentPath = location.pathname;
    previousPathname.current = currentPath;

    // Check if transition should trigger (must involve major routes)
    if (!isMajorRoute(currentPath) && !isMajorRoute(prevPath)) {
      return;
    }

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsTransitioning(true);
      isTransitioningRef.current = true;
      timeoutRef.current = setTimeout(endTransition, 250);
      return;
    }

    // Trigger transition overlay & reset video playback
    setIsTransitioning(true);
    isTransitioningRef.current = true;

    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch((err) => {
        console.warn('Autoplay prevented or interrupted:', err);
      });
    }

    // Safety fallback: if video ended event does not fire within 1200ms, auto finish
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(endTransition, 1200);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [location.pathname]);

  const handleVideoEnded = () => {
    endTransition();
  };

  const handleVideoError = () => {
    endTransition();
  };

  return (
    <AnimatePresence>
      {isTransitioning && (
        <motion.div
          key="studyhub-page-transition-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[99990] flex items-center justify-center bg-white pointer-events-none select-none overflow-hidden"
        >
          {/* Subtle Top Accent Progress Line in Study Hub Brand Color */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#287BFF] via-[#5CE1E6] to-[#287BFF] animate-pulse" />

          {/* Pure Visual Animation - Background #FFFFFF Matches Video #FFFFFF Seamlessly */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="relative z-10 flex flex-col items-center justify-center w-full max-w-[560px] px-6 text-center"
          >
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              preload="auto"
              poster="/assets/animations/studyhub-navigation-poster.webp"
              onEnded={handleVideoEnded}
              onError={handleVideoError}
              className="w-full h-auto max-h-[70vh] object-contain"
            >
              <source src="/assets/animations/studyhub-navigation.mp4" type="video/mp4" />
              <source src="/assets/animations/studyhub-navigation.webm" type="video/webm" />
            </video>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
