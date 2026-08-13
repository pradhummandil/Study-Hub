import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, Bot } from 'lucide-react';
import { ModalShell } from './ModalShell';
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
    // Smooth transition to Cal.com embed view inside modal
    setTimeout(() => {
      setLoadingBooking(false);
      setViewState('calEmbed');
    }, 600);
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
        {/* VIEW 1: PROMPT MODAL */}
        {viewState === 'prompt' && (
          <motion.div
            key="prompt-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="p-6 sm:p-8 md:p-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
          >
            {/* LEFT COLUMN: AI STUDENT ILLUSTRATION */}
            <div className="md:col-span-5 relative flex flex-col items-center justify-center text-center">
              {/* Ambient Glow behind image */}
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/20 to-blue-600/30 rounded-full blur-2xl transform scale-90 pointer-events-none" />

              <div className="relative w-44 h-44 sm:w-52 sm:h-52 md:w-56 md:h-56 flex items-center justify-center">
                <img
                  src="/images/study-ai-student.png"
                  alt="Study Hub AI Student Guidance"
                  className="w-full h-full object-contain drop-shadow-[0_12px_24px_rgba(40,123,255,0.25)] relative z-10 transition-transform duration-700 hover:scale-105"
                  onError={(e) => {
                    // Fallback to SVG illustration if PNG missing
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />

                {/* AI Floating Card Tag */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 z-20 px-3 py-1.5 rounded-full bg-slate-900/90 border border-cyan-400/40 text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-lg backdrop-blur-md"
                >
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <Bot className="w-3.5 h-3.5 text-cyan-300" /> AI Study Coach
                </motion.div>
              </div>
            </div>

            {/* RIGHT COLUMN: COPY & ACTIONS */}
            <div className="md:col-span-7 space-y-5 text-left">
              <div>
                <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#287BFF] block mb-1">
                  STUDY HUB
                </span>

                <h2
                  id="study-hub-call-title"
                  className="text-3xl sm:text-4xl md:text-5xl font-normal leading-[1.04] text-[#062B3D] dark:text-white"
                  style={{ fontFamily: "'Instrument Serif', serif" }}
                >
                  Still figuring out your next step?
                </h2>
              </div>

              <p
                id="study-hub-call-desc"
                className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed"
              >
                Take a quick 20-minute conversation and leave with a clearer direction for what to study, what to prioritize, and where to go next.
              </p>

              {/* TRUST POINTS ROW */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-slate-600 dark:text-slate-300 pt-1">
                <span className="flex items-center gap-1 text-slate-700 dark:text-slate-200">
                  <Check className="w-3.5 h-3.5 text-[#287BFF]" /> Student-focused
                </span>
                <span className="flex items-center gap-1 text-slate-700 dark:text-slate-200">
                  <Check className="w-3.5 h-3.5 text-[#287BFF]" /> 20-minute conversation
                </span>
                <span className="flex items-center gap-1 text-slate-700 dark:text-slate-200">
                  <Check className="w-3.5 h-3.5 text-[#287BFF]" /> No obligation
                </span>
              </div>

              {/* ACTION BUTTONS & MICROCOPY */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleBookClick}
                  disabled={loadingBooking}
                  className="w-full h-13 sm:h-14 rounded-2xl bg-gradient-to-r from-[#287BFF] to-[#6366F1] hover:brightness-110 text-white font-semibold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-[0_8px_25px_rgba(40,123,255,0.35)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-75 cursor-pointer"
                >
                  {loadingBooking ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      Opening booking...
                    </>
                  ) : (
                    <>
                      Book a free call <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] text-slate-500 font-medium">
                    Free • 20 minutes • No obligation
                  </span>

                  <button
                    onClick={onClose}
                    className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium transition-colors cursor-pointer"
                  >
                    Maybe later
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* VIEW 2: CAL.COM INTEGRATED BOOKING SLIDE */}
        {viewState === 'calEmbed' && (
          <motion.div
            key="cal-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[11px] font-bold text-[#287BFF] uppercase tracking-wider">
                  STUDY HUB ADVISORY
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Select Your 20-Min Guidance Slot
                </h3>
              </div>

              <button
                onClick={handleFinishBooking}
                className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 text-xs font-semibold hover:bg-cyan-500/20 transition-all"
              >
                Simulate Booking Complete
              </button>
            </div>

            {/* CAL.COM IFRAME CONTAINER */}
            <div className="w-full h-[520px] rounded-2xl overflow-hidden bg-slate-950/5 border border-slate-200 dark:border-slate-800">
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
            transition={{ duration: 0.25 }}
            className="p-8 sm:p-12 text-center space-y-6 flex flex-col items-center justify-center min-h-[380px]"
          >
            {/* Cyan Check Mark Animation Circle */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 15, stiffness: 200 }}
              className="w-20 h-20 rounded-full bg-cyan-400/20 border-2 border-cyan-400 flex items-center justify-center text-cyan-400 shadow-[0_0_40px_rgba(92,225,230,0.4)]"
            >
              <Check className="w-10 h-10 stroke-[2.5]" />
            </motion.div>

            <div className="space-y-2 max-w-md">
              <h2
                className="text-4xl sm:text-5xl font-normal text-[#062B3D] dark:text-white"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                You're booked.
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
                Your next conversation is on the calendar. Check your inbox for confirmation details and link.
              </p>
            </div>

            <button
              onClick={onClose}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#287BFF] to-[#6366F1] text-white font-semibold text-sm hover:brightness-110 transition-all shadow-lg cursor-pointer"
            >
              Back to Study Hub
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </ModalShell>
  );
};
