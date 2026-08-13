import React, { useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, BookOpen, Target, CheckCircle2, Clock, Zap } from 'lucide-react';

export const HeroSectionV2: React.FC = () => {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  // Mouse Parallax Effect using Framer Motion springs
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 180 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Layer parallax transforms (Back 1-2px, Orb 3-4px, Student 4-6px, Floating cards 6-10px)
  const bgX = useTransform(smoothX, [-0.5, 0.5], shouldReduceMotion ? [0, 0] : [-2, 2]);
  const bgY = useTransform(smoothY, [-0.5, 0.5], shouldReduceMotion ? [0, 0] : [-2, 2]);

  const orbX = useTransform(smoothX, [-0.5, 0.5], shouldReduceMotion ? [0, 0] : [-4, 4]);
  const orbY = useTransform(smoothY, [-0.5, 0.5], shouldReduceMotion ? [0, 0] : [-4, 4]);

  const studentX = useTransform(smoothX, [-0.5, 0.5], shouldReduceMotion ? [0, 0] : [-6, 6]);
  const studentY = useTransform(smoothY, [-0.5, 0.5], shouldReduceMotion ? [0, 0] : [-6, 6]);

  const card1X = useTransform(smoothX, [-0.5, 0.5], shouldReduceMotion ? [0, 0] : [-8, 8]);
  const card1Y = useTransform(smoothY, [-0.5, 0.5], shouldReduceMotion ? [0, 0] : [-8, 8]);

  const card2X = useTransform(smoothX, [-0.5, 0.5], shouldReduceMotion ? [0, 0] : [10, -10]);
  const card2Y = useTransform(smoothY, [-0.5, 0.5], shouldReduceMotion ? [0, 0] : [10, -10]);

  const card3X = useTransform(smoothX, [-0.5, 0.5], shouldReduceMotion ? [0, 0] : [-7, 7]);
  const card3Y = useTransform(smoothY, [-0.5, 0.5], shouldReduceMotion ? [0, 0] : [9, -9]);

  const card4X = useTransform(smoothX, [-0.5, 0.5], shouldReduceMotion ? [0, 0] : [9, -9]);
  const card4Y = useTransform(smoothY, [-0.5, 0.5], shouldReduceMotion ? [0, 0] : [-7, 7]);

  // Magnetic button shift
  const [btnOffset, setBtnOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion) return;
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    mouseX.set((clientX / innerWidth) - 0.5);
    mouseY.set((clientY / innerHeight) - 0.5);
  };

  const handleBtnMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (shouldReduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distX = (e.clientX - centerX) * 0.12;
    const distY = (e.clientY - centerY) * 0.12;
    setBtnOffset({ x: Math.min(Math.max(distX, -5), 5), y: Math.min(Math.max(distY, -5), 5) });
  };

  const handleBtnMouseLeave = () => {
    setBtnOffset({ x: 0, y: 0 });
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
      {/* Background Layer (1-2px motion) */}
      <motion.div
        style={{ x: bgX, y: bgY }}
        className="absolute inset-0 pointer-events-none"
      >
        <div
          className="absolute inset-0 opacity-[0.14]"
          style={{
            background:
              'radial-gradient(circle at 15% 10%, rgba(40,123,255,0.25), transparent 35%), radial-gradient(circle at 85% 20%, rgba(92,225,230,0.22), transparent 38%)',
          }}
        />
        <div className="grain-overlay" />
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column — Text & CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start text-left pt-2">
            
            {/* Small pill badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-[#287BFF]/20 shadow-sm text-xs font-semibold text-[#062B3D] mb-6 backdrop-blur-md"
            >
              <span className="w-2 h-2 rounded-full bg-[#5CE1E6] animate-pulse shrink-0" />
              <Sparkles className="w-3.5 h-3.5 text-[#287BFF]" />
              <span>AI-Native Learning Space Built For Students</span>
            </motion.div>

            {/* H1 Headline — Instrument Serif */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-6xl md:text-7xl font-normal leading-[1.02] tracking-[-1.5px] text-[#062B3D] mb-6"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Your whole study journey, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#287BFF] via-[#6F7CFF] to-[#5CE1E6]">
                in one place.
              </span>
            </motion.h1>

            {/* Subtitle — Inter */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed mb-8 font-sans"
            >
              Learn, practice, revise, prepare and get guidance from StudyMate — around the exam, subjects and goals that matter to you.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 w-full sm:w-auto mb-10"
            >
              {/* Primary CTA */}
              <button
                type="button"
                onClick={() => navigate('/signup')}
                onMouseMove={handleBtnMouseMove}
                onMouseLeave={handleBtnMouseLeave}
                style={{
                  transform: `translate3d(${btnOffset.x}px, ${btnOffset.y}px, 0)`,
                  background: 'linear-gradient(135deg, #287BFF 0%, #6F7CFF 100%)',
                }}
                className="w-full sm:w-auto px-8 py-4 rounded-full text-white text-sm font-semibold shadow-lg shadow-[#287BFF]/25 hover:shadow-xl hover:shadow-[#287BFF]/40 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 group"
              >
                <span>Start my study journey</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Secondary CTA */}
              <button
                type="button"
                onClick={scrollToExplore}
                className="w-full sm:w-auto px-7 py-4 rounded-full bg-white/90 border border-slate-200 text-[#062B3D] text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 flex items-center justify-center cursor-pointer shadow-sm"
              >
                Explore Study Hub
              </button>
            </motion.div>

            {/* Verified feature badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
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

          {/* Right Column — Multi-Layered Spring Parallax Visual */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            
            {/* Mid Layer — Glowing AI Orb (3-4px motion) */}
            <motion.div
              style={{ x: orbX, y: orbY }}
              className="absolute w-[350px] h-[350px] rounded-full bg-gradient-to-tr from-[#287BFF]/25 via-[#5CE1E6]/25 to-[#6F7CFF]/20 filter blur-3xl pointer-events-none"
            />

            {/* Main Visual Frame */}
            <div className="relative w-full max-w-[440px] aspect-[4/4.5] flex items-center justify-center">
              
              {/* Front Layer — Central Student Artwork (4-6px motion) */}
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
                  
                  {/* Subtle Label */}
                  <div className="absolute bottom-3 left-4 right-4 text-center">
                    <span className="inline-block px-3 py-1 rounded-full bg-[#062B3D]/90 backdrop-blur-md text-[11px] font-medium text-slate-200 border border-white/10 shadow-sm">
                      Selected Visual — Pin 682858362229488216
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Floating Concept Card 1 — GATE 2027 (6-10px motion) */}
              <motion.div
                style={{ x: card1X, y: card1Y }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute -top-3 -left-4 sm:-left-8 z-20 bg-white/95 backdrop-blur-xl border border-slate-100 rounded-2xl p-3.5 shadow-xl min-w-[190px] border-l-4 border-l-[#287BFF]"
              >
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
              </motion.div>

              {/* Floating Concept Card 2 — PYQ Practice (6-10px motion) */}
              <motion.div
                style={{ x: card2X, y: card2Y }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute -bottom-2 -right-4 sm:-right-6 z-20 bg-white/95 backdrop-blur-xl border border-slate-100 rounded-2xl p-3.5 shadow-xl min-w-[180px] border-l-4 border-l-[#5CE1E6]"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#062B3D] bg-[#5CE1E6]/30 px-2 py-0.5 rounded">
                    PYQ Practice
                  </span>
                  <Zap className="w-3.5 h-3.5 text-[#062B3D]" />
                </div>
                <p className="text-xs font-bold text-[#062B3D]">Computer Networks</p>
                <p className="text-[10px] text-slate-500 mt-0.5">14 solved today</p>
              </motion.div>

              {/* Floating Concept Card 3 — Spaced Revision (6-10px motion) */}
              <motion.div
                style={{ x: card3X, y: card3Y }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute top-1/2 -translate-y-1/2 -left-6 sm:-left-12 z-20 bg-[#062B3D] text-white rounded-2xl p-3.5 shadow-2xl min-w-[195px] border border-white/10"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#5CE1E6] to-[#6F7CFF] flex items-center justify-center text-[#062B3D]">
                    <BookOpen className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-[#5CE1E6]">Revision</span>
                </div>
                <p className="text-[11px] text-slate-200 leading-snug">
                  12 cards due today
                </p>
              </motion.div>

              {/* Floating Concept Card 4 — Focus Timer & StudyMate AI */}
              <motion.div
                style={{ x: card4X, y: card4Y }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute -top-4 -right-4 sm:-right-8 z-20 bg-white/95 backdrop-blur-xl border border-slate-100 rounded-2xl p-3 shadow-lg flex items-center gap-2.5 border-l-4 border-l-[#6F7CFF]"
              >
                <div className="w-7 h-7 rounded-xl bg-[#6F7CFF]/15 text-[#6F7CFF] flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Focus</p>
                  <p className="text-xs font-bold text-[#062B3D]">50:00 Session</p>
                </div>
              </motion.div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
