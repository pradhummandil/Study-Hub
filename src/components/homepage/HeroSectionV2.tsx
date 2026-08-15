import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Target, CheckCircle2, Clock, Zap } from 'lucide-react';
import { MOTION_TOKENS } from '../../lib/motion/tokens';
import { MagneticButton } from '../ui/motion/MagneticButton';
import { HoverCard } from '../ui/motion/HoverCard';
import { LottiePlayer } from '../ui/motion/LottiePlayer';

const ROTATING_PHRASES = [
  "Study smarter.",
  "Practice with purpose.",
  "Revise with confidence.",
  "Know what to do next."
];

const RotatingStatement: React.FC<{ shouldReduceMotion?: boolean }> = ({ shouldReduceMotion }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (shouldReduceMotion) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % ROTATING_PHRASES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [shouldReduceMotion]);

  if (shouldReduceMotion) {
    return (
      <span className="text-lg font-medium text-scholar font-serif italic">
        {ROTATING_PHRASES[0]}
      </span>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={ROTATING_PHRASES[index]}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.4, ease: MOTION_TOKENS.easing.easeOut }}
        className="text-lg font-medium text-scholar font-serif italic inline-block"
      >
        {ROTATING_PHRASES[index]}
      </motion.span>
    </AnimatePresence>
  );
};

export const HeroSectionV2: React.FC = () => {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  // Mouse Parallax Motion Values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 120, damping: 20 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const tiltX = useTransform(smoothMouseY, [-0.5, 0.5], [4, -4]);
  const tiltY = useTransform(smoothMouseX, [-0.5, 0.5], [-5, 5]);

  const card1X = useTransform(smoothMouseX, [-0.5, 0.5], [-12, 12]);
  const card1Y = useTransform(smoothMouseY, [-0.5, 0.5], [-12, 12]);

  const card2X = useTransform(smoothMouseX, [-0.5, 0.5], [14, -14]);
  const card2Y = useTransform(smoothMouseY, [-0.5, 0.5], [14, -14]);

  const card3X = useTransform(smoothMouseX, [-0.5, 0.5], [-16, 16]);
  const card3Y = useTransform(smoothMouseY, [-0.5, 0.5], [10, -10]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const scrollToExplore = () => {
    const el = document.getElementById('signature-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-[90vh] flex items-center justify-center pt-8 pb-16 px-4 sm:px-6 lg:px-8 bg-paper overflow-hidden select-none"
    >
      {/* Background Soft Atmosphere Glow */}
      <div className="absolute inset-0 bg-radial-vignette opacity-40 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-scholar/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column — Editorial Headline & Primary CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start text-left pt-2">
            {/* Subtle Editorial Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-parchment border border-forest/10 text-scholar text-xs font-semibold tracking-wider uppercase mb-6"
            >
              <Sparkles className="w-3.5 h-3.5 text-scholar" />
              <span>Intelligent Study Space</span>
            </motion.div>

            {/* Editorial Headline */}
            <h1
              className="text-5xl sm:text-6xl md:text-7xl font-normal leading-[1.02] tracking-[-1.5px] text-ink mb-4 overflow-hidden"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              <span className="block overflow-hidden py-0.5">
                <motion.span
                  initial={{ opacity: 0, y: 70, clipPath: 'inset(100% 0 0 0)' }}
                  animate={{ opacity: 1, y: 0, clipPath: 'inset(0% 0 0 0)' }}
                  transition={{
                    duration: 0.9,
                    delay: MOTION_TOKENS.heroSequence.headlineLine1 / 1000,
                    ease: MOTION_TOKENS.easing.editorialText,
                  }}
                  className="block text-ink"
                >
                  Your whole study journey,
                </motion.span>
              </span>

              <span className="block overflow-hidden py-0.5">
                <motion.span
                  initial={{ opacity: 0, y: 70, clipPath: 'inset(100% 0 0 0)' }}
                  animate={{ opacity: 1, y: 0, clipPath: 'inset(0% 0 0 0)' }}
                  transition={{
                    duration: 0.9,
                    delay: MOTION_TOKENS.heroSequence.headlineLine2 / 1000,
                    ease: MOTION_TOKENS.easing.editorialText,
                  }}
                  className="inline-block text-terracotta"
                >
                  in one place.
                </motion.span>
              </span>
            </h1>

            {/* Secondary Rotating Statement */}
            <div className="h-8 mb-6 overflow-hidden relative w-full">
              <RotatingStatement shouldReduceMotion={Boolean(shouldReduceMotion)} />
            </div>

            {/* Paragraph Reveal */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: MOTION_TOKENS.heroSequence.paragraph / 1000,
                ease: MOTION_TOKENS.easing.easeOut,
              }}
              className="text-base sm:text-lg text-ink/80 max-w-[560px] leading-relaxed mb-8 font-sans"
            >
              Learn, practice, revise and prepare in one calm space — with guidance that adapts to what you're studying.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: MOTION_TOKENS.heroSequence.primaryCta / 1000,
                ease: MOTION_TOKENS.easing.easeOut,
              }}
              className="flex flex-wrap items-center gap-4 w-full sm:w-auto mb-10"
            >
              <MagneticButton
                onClick={() => navigate('/signup')}
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-paper text-sm font-semibold shadow-card hover:shadow-[0_12px_28px_rgba(45,90,63,0.25)] hover:-translate-y-0.5 active:scale-98 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 group bg-forest hover:bg-scholar"
              >
                <span>Start my study journey</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </MagneticButton>

              <button
                type="button"
                onClick={scrollToExplore}
                className="w-full sm:w-auto px-7 py-4 rounded-xl bg-paper border border-[#1B3022]/14 text-ink text-sm font-medium hover:bg-parchment hover:border-forest/25 transition-all duration-200 flex items-center justify-center cursor-pointer shadow-sm"
              >
                Explore Study Hub
              </button>
            </motion.div>

            {/* Verified Feature Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.85 }}
              className="pt-6 border-t border-forest/10 flex flex-wrap items-center gap-6 text-xs text-ink/70 font-medium"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-scholar" />
                <span>Official PYQs & Solutions</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-scholar" />
                <span>Verified Exam Papers</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-terracotta" />
                <span>StudyMate AI Tutor</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column — Premium Vector Lottie Animation & Attached Contextual Overlays */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.8,
              delay: MOTION_TOKENS.heroSequence.heroVisual / 1000,
              ease: MOTION_TOKENS.easing.easeOut,
            }}
            style={{ rotateX: tiltX, rotateY: tiltY }}
            className="lg:col-span-5 relative flex justify-center items-center perspective-1000"
          >
            {/* Soft Ambient Atmosphere Glow */}
            <div className="absolute w-[440px] h-[440px] rounded-full bg-gradient-to-tr from-scholar/15 via-gold/10 to-terracotta/15 filter blur-3xl pointer-events-none" />

            {/* Lottie Vector Canvas & Contextual Overlays */}
            <div className="relative w-full max-w-[480px] h-[400px] sm:h-[460px] flex items-center justify-center">
              {/* Premium Vector Lottie Knowledge Book Animation */}
              <LottiePlayer
                src="/assets/lottie-v2/education/knowledge-book.svg"
                className="w-full h-full object-contain relative z-10 drop-shadow-[0_12px_28px_rgba(45,90,63,0.15)]"
                loop={true}
                autoplay={true}
              />

              {/* Attached Contextual Overlay 1 — GATE 2027 */}
              <motion.div
                style={{ x: card1X, y: card1Y }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.95 }}
                className="absolute top-2 -left-2 sm:-left-6 z-20"
              >
                <HoverCard className="p-3 min-w-[170px] bg-paper/95 backdrop-blur-md border border-forest/10 border-l-4 border-l-scholar shadow-card">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-scholar bg-scholar/10 px-2 py-0.5 rounded">
                      GATE 2027
                    </span>
                    <Target className="w-3.5 h-3.5 text-scholar" />
                  </div>
                  <p className="text-xs font-semibold text-ink">78% Practice Accuracy</p>
                  <div className="w-full bg-parchment h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div className="bg-scholar h-full rounded-full w-[78%]" />
                  </div>
                </HoverCard>
              </motion.div>

              {/* Attached Contextual Overlay 2 — Active Recall */}
              <motion.div
                style={{ x: card2X, y: card2Y }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.05 }}
                className="absolute bottom-4 -right-2 sm:-right-4 z-20"
              >
                <HoverCard className="p-3 min-w-[160px] bg-paper/95 backdrop-blur-md border border-forest/10 border-l-4 border-l-terracotta shadow-card">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-terracotta bg-terracotta/10 px-2 py-0.5 rounded">
                      Active Recall
                    </span>
                    <Zap className="w-3.5 h-3.5 text-terracotta" />
                  </div>
                  <p className="text-xs font-semibold text-ink">14 Cards Due Today</p>
                </HoverCard>
              </motion.div>

              {/* Attached Contextual Overlay 3 — Focus Session */}
              <motion.div
                style={{ x: card3X, y: card3Y }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.15 }}
                className="absolute -bottom-2 left-4 z-20"
              >
                <div className="px-3.5 py-2 bg-paper/95 backdrop-blur-md border border-forest/10 rounded-xl shadow-card flex items-center gap-2 text-xs font-medium text-ink">
                  <Clock className="w-4 h-4 text-gold" />
                  <span>25m Focus Timer Active</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
