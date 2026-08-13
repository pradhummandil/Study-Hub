import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StudyHubStartupAnimationProps {
  onComplete?: () => void;
  forceShow?: boolean;
}

export const StudyHubStartupAnimation: React.FC<StudyHubStartupAnimationProps> = ({
  onComplete,
  forceShow = false
}) => {
  const [shouldShow, setShouldShow] = useState<boolean>(() => {
    if (forceShow) return true;
    try {
      const seen = sessionStorage.getItem('studyhub_startup_seen');
      return !seen;
    } catch {
      return true;
    }
  });

  const [isExiting, setIsExiting] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion && !forceShow) {
      handleFinish();
      return;
    }

    if (!shouldShow) return;

    // Safety fallback: if video doesn't end within 7 seconds, auto finish
    timeoutRef.current = setTimeout(() => {
      handleFinish();
    }, 7000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [shouldShow, forceShow]);

  const handleFinish = () => {
    setIsExiting(true);
    setTimeout(() => {
      if (!forceShow) {
        try {
          sessionStorage.setItem('studyhub_startup_seen', 'true');
        } catch (e) {
          console.warn('Could not save startup state', e);
        }
      }
      setShouldShow(false);
      onComplete?.();
    }, 400); // 400ms exit fade
  };

  const handleVideoEnded = () => {
    handleFinish();
  };

  const handleVideoError = () => {
    setVideoError(true);
    setTimeout(() => {
      handleFinish();
    }, 1500);
  };

  if (!shouldShow) return null;

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          key="studyhub-startup-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[99999] bg-[#062B3D] text-white overflow-hidden select-none"
        >
          {/* Full Screen Video Container - No Box, No Background Padding */}
          <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-[#062B3D]">
            {!videoError ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                poster="/assets/animations/studyhub-startup-poster.webp"
                onEnded={handleVideoEnded}
                onError={handleVideoError}
                onLoadedData={() => setIsLoaded(true)}
                className="w-full h-full object-cover transition-opacity duration-500"
                style={{ opacity: isLoaded ? 1 : 0.8 }}
              >
                <source src="/assets/animations/studyhub-startup.mp4" type="video/mp4" />
                <source src="/assets/animations/studyhub-startup.webm" type="video/webm" />
              </video>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 gap-3">
                <img src="/images/logo.png" alt="Study Hub Logo" className="h-14 w-auto object-contain animate-pulse" />
                <p className="text-xs text-[#5CE1E6] font-medium tracking-wide">Initializing Intelligent Study Hub...</p>
              </div>
            )}
          </div>

          {/* Top Right Skip Button */}
          <div className="absolute top-6 right-6 z-20">
            <button
              onClick={handleFinish}
              className="px-4 py-2 rounded-full bg-slate-900/60 hover:bg-slate-900/80 text-white/90 hover:text-white text-xs font-semibold backdrop-blur-md border border-white/20 shadow-lg transition-all flex items-center gap-1.5"
            >
              Skip Intro →
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
