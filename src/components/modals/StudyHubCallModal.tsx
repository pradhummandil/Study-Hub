import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, Bot, Sparkles, Calendar, Clock } from 'lucide-react';
import { ModalShell } from './ModalShell';
import { LottiePlayer } from '../ui/motion/LottiePlayer';
import { CAL_COM_EVENT_URL } from '../../config/cal';

export interface StudyHubCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookSuccess?: () => void;
}

export const StudyHubCallModal: React.FC<StudyHubCallModalProps> = ({
  isOpen,
  onClose,
  onBookSuccess,
}) => {
  const [viewState, setViewState] = useState<'prompt' | 'calEmbed' | 'success'>('prompt');
  const [loadingBooking, setLoadingBooking] = useState(false);

  // Reset view state when modal opens
  useEffect(() => {
    if (isOpen) {
      setViewState('prompt');
      setLoadingBooking(false);
    }
  }, [isOpen]);

  const handleBookClick = async () => {
    setLoadingBooking(true);
    // Transition to Cal.com embed view inside modal
    setTimeout(() => {
      setLoadingBooking(false);
      setViewState('calEmbed');
    }, 450);
  };

  const handleFinishBooking = () => {
    setViewState('success');
    if (onBookSuccess) onBookSuccess();
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      maxWidthClassName={viewState === 'calEmbed' ? 'max-w-4xl' : 'max-w-3xl'}
      titleId="study-hub-call-title"
      descriptionId="study-hub-call-desc"
    >
      <AnimatePresence mode="wait">
        {/* VIEW 1: PROMPT MODAL WITH LOTTIE ANIMATION */}
        {viewState === 'prompt' && (
          <motion.div
            key="prompt-view"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="p-6 sm:p-8 md:p-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
          >
            {/* LEFT COLUMN: ADVANCED LOTTIE ANIMATION */}
            <div className="md:col-span-5 relative flex flex-col items-center justify-center text-center">
              {/* Ambient Glow behind animation */}
              <div className="absolute inset-0 bg-scholar/15 rounded-full blur-3xl transform scale-90 pointer-events-none" />

              <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
                {/* Vector Lottie Study Animation */}
                <LottiePlayer
                  src="/assets/lottie-v2/education/student-study.svg"
                  className="w-full h-full object-contain relative z-10"
                  loop={true}
                  autoplay={true}
                />

                {/* AI Floating Coach Badge */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 z-20 px-3.5 py-1.5 rounded-full bg-forest text-gold border border-gold/30 text-[11px] font-mono font-bold flex items-center gap-1.5 shadow-deep"
                >
                  <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                  <Bot className="w-3.5 h-3.5 text-gold" />
                  <span>AI Study Coach</span>
                </motion.div>
              </div>
            </div>

            {/* RIGHT COLUMN: COPY & ACTIONS */}
            <div className="md:col-span-7 space-y-5 text-left">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-1 rounded-full bg-scholar/10 border border-scholar/20 text-[10px] font-mono font-bold uppercase tracking-wider text-scholar inline-flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-gold" />
                    STUDY HUB ADVISORY
                  </span>
                </div>

                <h2
                  id="study-hub-call-title"
                  className="text-3xl sm:text-4xl md:text-5xl font-normal leading-[1.05] text-ink"
                  style={{ fontFamily: "'Instrument Serif', serif" }}
                >
                  Still figuring out your next step?
                </h2>
              </div>

              <p
                id="study-hub-call-desc"
                className="text-xs sm:text-sm text-ink/80 leading-relaxed font-sans"
              >
                Take a quick 20-minute conversation with a Study Coach and leave with a clear direction for what to study, what to prioritize, and how to structure your prep.
              </p>

              {/* TRUST POINTS ROW */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-ink/80 pt-1 font-sans">
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-scholar stroke-[2.5]" />
                  Student-focused strategy
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-scholar stroke-[2.5]" />
                  20-minute conversation
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-scholar stroke-[2.5]" />
                  No obligation
                </span>
              </div>

              {/* ACTION BUTTONS & MICROCOPY */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleBookClick}
                  disabled={loadingBooking}
                  className="w-full h-13 sm:h-14 rounded-2xl bg-scholar hover:bg-forest text-paper font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-md hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-75 cursor-pointer"
                >
                  {loadingBooking ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-paper border-t-transparent animate-spin" />
                      Opening booking schedule...
                    </>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4 text-gold" />
                      <span>Book a free call</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between px-1 font-mono text-[11px]">
                  <span className="text-muted flex items-center gap-1">
                    <Clock className="w-3 h-3 text-scholar" />
                    Free • 20 minutes • No obligation
                  </span>

                  <button
                    onClick={onClose}
                    className="text-xs text-muted hover:text-ink font-sans font-semibold transition-colors cursor-pointer"
                  >
                    Maybe later
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* VIEW 2: CAL.COM EMBED VIEW */}
        {viewState === 'calEmbed' && (
          <motion.div
            key="cal-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.22 }}
            className="p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-forest/10 pb-3">
              <div>
                <span className="text-[10px] font-bold text-scholar font-mono uppercase tracking-wider">
                  STUDY HUB ADVISORY
                </span>
                <h3 className="text-lg font-bold text-ink">
                  Select Your 20-Min Guidance Slot
                </h3>
              </div>

              <button
                onClick={handleFinishBooking}
                className="px-3.5 py-1.5 rounded-xl bg-scholar/10 text-scholar border border-scholar/20 text-xs font-bold hover:bg-scholar hover:text-paper transition-all cursor-pointer font-mono"
              >
                Simulate Booking Complete
              </button>
            </div>

            {/* CAL.COM IFRAME CONTAINER */}
            <div className="w-full h-[500px] rounded-2xl overflow-hidden bg-parchment/40 border border-forest/10 shadow-inner">
              <iframe
                src={`${CAL_COM_EVENT_URL}?embed=true`}
                title="Schedule 20-Min Study Guidance Call"
                className="w-full h-full border-0"
              />
            </div>
          </motion.div>
        )}

        {/* VIEW 3: SUCCESS STATE */}
        {viewState === 'success' && (
          <motion.div
            key="success-view"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="p-8 sm:p-12 text-center space-y-6 flex flex-col items-center justify-center min-h-[360px]"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 15, stiffness: 200 }}
              className="w-20 h-20 rounded-full bg-scholar/15 border-2 border-scholar flex items-center justify-center text-scholar shadow-md"
            >
              <Check className="w-10 h-10 stroke-[2.5]" />
            </motion.div>

            <div className="space-y-2 max-w-md">
              <h2
                className="text-4xl sm:text-5xl font-normal text-ink"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                You're booked.
              </h2>
              <p className="text-xs sm:text-sm text-ink/80 leading-relaxed font-sans">
                Your session is locked in. Check your email inbox for confirmation details and meeting link.
              </p>
            </div>

            <button
              onClick={onClose}
              className="px-8 py-3 rounded-xl bg-scholar hover:bg-forest text-paper font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              Back to Study Hub Command Center
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </ModalShell>
  );
};
