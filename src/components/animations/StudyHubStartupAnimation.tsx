import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LottiePlayer } from '../ui/motion/LottiePlayer';
import { LOTTIE_ASSET_REGISTRY } from '../../config/lottie-assets';

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
  const [showLogoReveal, setShowLogoReveal] = useState(false);
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

    // Safety fallback: if intro doesn't complete within 7.5s, force finish
    timeoutRef.current = setTimeout(() => {
      handleFinish();
    }, 7500);

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

  const triggerLogoThenFinish = () => {
    setShowLogoReveal(true);
    setTimeout(() => {
      handleFinish();
    }, 1200);
  };

  const handleVideoEnded = () => {
    triggerLogoThenFinish();
  };

  const handleVideoError = () => {
    setVideoError(true);
    // If video fails, try Lottie startup loader
    setTimeout(() => {
      triggerLogoThenFinish();
    }, 2000);
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
          className="fixed inset-0 z-[99999] bg-[#10233F] text-white overflow-hidden select-none"
        >
          {/* Full Screen Video Container - Primary Pinterest Animation */}
          <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-[#10233F]">
            {!videoError && !showLogoReveal ? (
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
            ) : videoError && !showLogoReveal ? (
              /* Fallback Lottie Startup Animation */
              <div className="flex flex-col items-center justify-center p-8 gap-4 text-center">
                <LottiePlayer
                  src={LOTTIE_ASSET_REGISTRY.startup_loader.localPath}
                  className="w-24 h-24"
                />
                <p className="text-xs text-[#4E88B7] font-semibold tracking-wider uppercase">Loading Study Hub</p>
              </div>
            ) : (
              /* Brand Logo Reveal Sequence */
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center justify-center p-8 gap-4 text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-[#1F5F8B] flex items-center justify-center shadow-2xl border border-white/20">
                  <span className="font-serif text-3xl font-bold text-[#F7E7D0]">S</span>
                </div>
                <h1 className="font-serif text-2xl md:text-3xl text-[#FCFBF8] tracking-tight">STUDY HUB</h1>
                <p className="text-xs text-[#4E88B7] font-medium tracking-wide">Your whole study journey, in one place.</p>
              </motion.div>
            )}
          </div>

          {/* Top Right Skip Button */}
          <div className="absolute top-6 right-6 z-20">
            <button
              onClick={handleFinish}
              className="px-4 py-2 rounded-full bg-[#10233F]/80 hover:bg-[#10233F] text-white/90 hover:text-white text-xs font-semibold backdrop-blur-md border border-white/20 shadow-lg transition-all flex items-center gap-1.5"
            >
              Skip Intro →
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

