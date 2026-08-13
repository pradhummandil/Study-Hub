import React from 'react';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, BookOpen, Target, CheckCircle2, Clock, Zap } from 'lucide-react';
import { MOTION_TOKENS } from '../../lib/motion/tokens';
import { MagneticButton } from '../ui/motion/MagneticButton';
import { HoverCard } from '../ui/motion/HoverCard';

export const HeroSectionV2: React.FC = () => {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  // Mouse Parallax Effect using Framer Motion springs
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = MOTION_TOKENS.spring.heroTilt;
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Layer parallax transforms
  const bgX = useTransform(smoothX, [-0.5, 0.5], shouldReduceMotion ? [0, 0] : [-2, 2]);
  const bgY = useTransform(smoothY, [-0.5, 0.5], shouldReduceMotion ? [0, 0] : [-2, 2]);

  const frameX = useTransform(smoothX, [-0.5, 0.5], shouldReduceMotion ? [0, 0] : [-3, 3]);
  const frameY = useTransform(smoothY, [-0.5, 0.5], shouldReduceMotion ? [0, 0] : [-3, 3]);

  const studentX = useTransform(smoothX, [-0.5, 0.5], shouldReduceMotion ? [0, 0] : [-6, 6]);
  const studentY = useTransform(smoothY, [-0.5, 0.5], shouldReduceMotion ? [0, 0] : [-6, 6]);

  const card1X = useTransform(smoothX, [-0.5, 0.5], shouldReduceMotion ? [0, 0] : [-8, 8]);
  const card1Y = useTransform(smoothY, [-0.5, 0.5], shouldReduceMotion ? [0, 0] : [-8, 8]);

  const card2X = useTransform(smoothX, [-0.5, 0.5], shouldReduceMotion ? [0, 0] : [12, -12]);
  const card2Y = useTransform(smoothY, [-0.5, 0.5], shouldReduceMotion ? [0, 0] : [12, -12]);

  const card3X = useTransform(smoothX, [-0.5, 0.5], shouldReduceMotion ? [0, 0] : [-7, 7]);
  const card3Y = useTransform(smoothY, [-0.5, 0.5], shouldReduceMotion ? [0, 0] : [9, -9]);

  const card4X = useTransform(smoothX, [-0.5, 0.5], shouldReduceMotion ? [0, 0] : [9, -9]);
  const card4Y = useTransform(smoothY, [-0.5, 0.5], shouldReduceMotion ? [0, 0] : [-7, 7]);

  // Subtle Mouse Tilt (Max 2 degrees)
  const tiltX = useTransform(smoothY, [-0.5, 0.5], shouldReduceMotion ? [0, 0] : [1.5, -1.5]);
  const tiltY = useTransform(smoothX, [-0.5, 0.5], shouldReduceMotion ? [0, 0] : [-1.5, 1.5]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion) return;
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    mouseX.set(clientX / innerWidth - 0.5);
    mouseY.set(clientY / innerHeight - 0.5);
  };

  const scrollToExplore = () => {
    const exploreSection = document.getElementById('explore-section');
    if (exploreSection) {
      exploreSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/exams');
    }
  };

  return (
    <section
      onMouseMove={handleMouseMove}
      className="relative z-10 overflow-hidden pt-10 pb-20 md:pt-16 md:pb-28 bg-[#F7FBFF] transition-colors duration-300"
    >
      {/* Layer 1: Background Parallax Glow & Grain */}
      <motion.div style={{ x: bgX, y: bgY }} className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.16]"
          style={{
            background:
              'radial-gradient(circle at 15% 10%, rgba(40,123,255,0.25), transparent 35%), radial-gradient(circle at 85% 20%, rgba(92,225,230,0.22), transparent 38%)',
          }}
        />
        <div className="grain-overlay" />
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column — Sequenced Page Load Text & CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start text-left pt-2">
            {/* 250ms: Eyebrow Badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: MOTION_TOKENS.heroSequence.eyebrow / 1000,
                ease: MOTION_TOKENS.easing.easeOut,
              }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-[#287BFF]/20 shadow-sm text-xs font-semibold text-[#062B3D] mb-6 backdrop-blur-md"
            >
              <span className="w-2 h-2 rounded-full bg-[#5CE1E6] animate-pulse shrink-0" />
              <Sparkles className="w-3.5 h-3.5 text-[#287BFF]" />
              <span>AI-Native Learning Space Built For Students</span>
            </motion.div>

            {/* 400ms - 500ms: Line Reveal Headline */}
            <h1
              className="text-5xl sm:text-6xl md:text-7xl font-normal leading-[1.02] tracking-[-1.5px] text-[#062B3D] mb-6 overflow-hidden"
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
                  className="block"
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
                  className="block text-transparent bg-clip-text bg-gradient-to-r from-[#287BFF] via-[#5CE1E6] to-[#6F7CFF] animate-gradient-slow"
                >
                  in one place.
                </motion.span>
              </span>
            </h1>

            {/* 650ms: Paragraph Reveal */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: MOTION_TOKENS.heroSequence.paragraph / 1000,
                ease: MOTION_TOKENS.easing.easeOut,
              }}
              className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed mb-8 font-sans"
            >
              Learn, practice, revise, prepare and get guidance from StudyMate — around the exam,
              subjects and goals that matter to you.
            </motion.p>

            {/* 750ms: CTA Buttons */}
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
              {/* Primary Magnetic CTA */}
              <MagneticButton
                onClick={() => navigate('/signup')}
                className="w-full sm:w-auto px-8 py-4 rounded-full text-white text-sm font-semibold shadow-lg shadow-[#287BFF]/25 hover:shadow-xl hover:shadow-[#287BFF]/40 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 group"
                style={{
                  background: 'linear-gradient(135deg, #287BFF 0%, #6F7CFF 100%)',
                }}
              >
                <span>Start my study journey</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </MagneticButton>

              {/* Secondary CTA */}
              <button
                type="button"
                onClick={scrollToExplore}
                className="w-full sm:w-auto px-7 py-4 rounded-full bg-white/90 border border-slate-200 text-[#062B3D] text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 flex items-center justify-center cursor-pointer shadow-sm"
              >
                Explore Study Hub
              </button>
            </motion.div>

            {/* Verified Feature Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.85 }}
              className="pt-6 border-t border-slate-200/80 flex flex-wrap items-center gap-6 text-xs text-slate-600 font-medium"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#287BFF]" />
                <span>Official PYQs & Solutions</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#5CE1E6]" />
                <span>Verified Exam Papers</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#6F7CFF]" />
                <span>StudyMate AI Tutor</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column — Multi-Layered Tilt & Depth Parallax Visual */}
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
            {/* Layer 2: White Background Glow Frame */}
            <motion.div
              style={{ x: frameX, y: frameY }}
              className="absolute w-[360px] h-[360px] rounded-full bg-gradient-to-tr from-[#287BFF]/20 via-[#5CE1E6]/25 to-[#6F7CFF]/20 filter blur-3xl pointer-events-none"
            />

            {/* Main Hero Container Frame */}
            <div className="relative w-full max-w-[440px] aspect-[4/4.5] flex items-center justify-center">
              {/* Layer 3: Central Artwork Visual */}
              <motion.div
                style={{ x: studentX, y: studentY }}
                className="relative z-10 w-full h-full flex items-center justify-center p-2"
              >
                <div className="relative rounded-3xl overflow-hidden border border-white/80 bg-white/60 backdrop-blur-xl shadow-2xl p-4 w-full h-full flex flex-col items-center justify-center group">
                  <video
                    src="/assets/pinterest/actual-pin-682858362229488216.mp4"
                    poster="/assets/pinterest/actual-pin-682858362229488216-poster.webp"
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-contain max-h-[360px] rounded-2xl filter drop-shadow-xl transition-transform duration-500 group-hover:scale-[1.02]"
                  />

                  <div className="absolute bottom-3 left-4 right-4 text-center">
                    <span className="inline-block px-3 py-1 rounded-full bg-[#062B3D]/90 backdrop-blur-md text-[11px] font-medium text-slate-200 border border-white/10 shadow-sm">
                      Selected Visual — Pin 682858362229488216
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Layer 4: Unsynchronized Floating Concept Card 1 — GATE 2027 (8s Float) */}
              <motion.div
                style={{ x: card1X, y: card1Y }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={
                  shouldReduceMotion
                    ? { opacity: 1, scale: 1 }
                    : {
                        opacity: 1,
                        scale: 1,
                        y: [0, -8, 0],
                      }
                }
                transition={
                  shouldReduceMotion
                    ? { delay: 0.95 }
                    : {
                        delay: 0.95,
                        y: {
                          duration: MOTION_TOKENS.floatingDurations.card1,
                          repeat: Infinity,
                          repeatType: 'mirror',
                          ease: 'easeInOut',
                        },
                      }
                }
                className="absolute -top-3 -left-4 sm:-left-8 z-20"
              >
                <HoverCard dataCursor="DRAG" className="p-3.5 min-w-[190px] border-l-4 border-l-[#287BFF]">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#287BFF] bg-[#287BFF]/10 px-2 py-0.5 rounded">
                      GATE 2027
                    </span>
                    <Target className="w-3.5 h-3.5 text-[#287BFF]" />
                  </div>
                  <p className="text-xs font-semibold text-[#062B3D]">78% Practice Accuracy</p>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-[#287BFF] h-full rounded-full w-[78%]" />
                  </div>
                </HoverCard>
              </motion.div>

              {/* Layer 4: Floating Concept Card 2 — PYQ Practice (10s Float) */}
              <motion.div
                style={{ x: card2X, y: card2Y }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={
                  shouldReduceMotion
                    ? { opacity: 1, scale: 1 }
                    : {
                        opacity: 1,
                        scale: 1,
                        y: [0, 10, 0],
                      }
                }
                transition={
                  shouldReduceMotion
                    ? { delay: 1.05 }
                    : {
                        delay: 1.05,
                        y: {
                          duration: MOTION_TOKENS.floatingDurations.card2,
                          repeat: Infinity,
                          repeatType: 'mirror',
                          ease: 'easeInOut',
                        },
                      }
                }
                className="absolute -bottom-2 -right-4 sm:-right-6 z-20"
              >
                <HoverCard dataCursor="DRAG" className="p-3.5 min-w-[180px] border-l-4 border-l-[#5CE1E6]">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#062B3D] bg-[#5CE1E6]/30 px-2 py-0.5 rounded">
                      PYQ Practice
                    </span>
                    <Zap className="w-3.5 h-3.5 text-[#062B3D]" />
                  </div>
                  <p className="text-xs font-bold text-[#062B3D]">Computer Networks</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">14 solved today</p>
                </HoverCard>
              </motion.div>

              {/* Layer 4: Floating Concept Card 3 — Spaced Revision (12s Float) */}
              <motion.div
                style={{ x: card3X, y: card3Y }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={
                  shouldReduceMotion
                    ? { opacity: 1, scale: 1 }
                    : {
                        opacity: 1,
                        scale: 1,
                        y: [0, -6, 0],
                      }
                }
                transition={
                  shouldReduceMotion
                    ? { delay: 1.15 }
                    : {
                        delay: 1.15,
                        y: {
                          duration: MOTION_TOKENS.floatingDurations.card3,
                          repeat: Infinity,
                          repeatType: 'mirror',
                          ease: 'easeInOut',
                        },
                      }
                }
                className="absolute top-1/2 -translate-y-1/2 -left-6 sm:-left-12 z-20"
              >
                <div className="bg-[#062B3D] text-white rounded-2xl p-3.5 shadow-2xl min-w-[195px] border border-white/10 hover:border-[#5CE1E6]/50 transition-all duration-300">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#5CE1E6] to-[#6F7CFF] flex items-center justify-center text-[#062B3D]">
                      <BookOpen className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-[#5CE1E6]">Revision</span>
                  </div>
                  <p className="text-[11px] text-slate-200 leading-snug">12 cards due today</p>
                </div>
              </motion.div>

              {/* Layer 4: Floating Concept Card 4 — Focus Session (9s Float) */}
              <motion.div
                style={{ x: card4X, y: card4Y }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={
                  shouldReduceMotion
                    ? { opacity: 1, scale: 1 }
                    : {
                        opacity: 1,
                        scale: 1,
                        y: [0, 8, 0],
                      }
                }
                transition={
                  shouldReduceMotion
                    ? { delay: 1.25 }
                    : {
                        delay: 1.25,
                        y: {
                          duration: MOTION_TOKENS.floatingDurations.card4,
                          repeat: Infinity,
                          repeatType: 'mirror',
                          ease: 'easeInOut',
                        },
                      }
                }
                className="absolute -top-4 -right-4 sm:-right-8 z-20"
              >
                <HoverCard dataCursor="VIEW" className="p-3 border-l-4 border-l-[#6F7CFF] flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-[#6F7CFF]/15 text-[#6F7CFF] flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Focus</p>
                    <p className="text-xs font-bold text-[#062B3D]">50:00 Session</p>
                  </div>
                </HoverCard>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
