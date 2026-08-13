import React, { useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, BookOpen, Target, CheckCircle2, Cpu } from 'lucide-react';

export const HeroSectionV2: React.FC = () => {
  const navigate = useNavigate();

  // Mouse Parallax Effect using Framer Motion springs
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Parallax transforms for different layers
  const studentX = useTransform(smoothX, [-0.5, 0.5], [-8, 8]);
  const studentY = useTransform(smoothY, [-0.5, 0.5], [-8, 8]);

  const orbX = useTransform(smoothX, [-0.5, 0.5], [-18, 18]);
  const orbY = useTransform(smoothY, [-0.5, 0.5], [-18, 18]);

  const card1X = useTransform(smoothX, [-0.5, 0.5], [-14, 14]);
  const card1Y = useTransform(smoothY, [-0.5, 0.5], [-10, 10]);

  const card2X = useTransform(smoothX, [-0.5, 0.5], [12, -12]);
  const card2Y = useTransform(smoothY, [-0.5, 0.5], [14, -14]);

  const card3X = useTransform(smoothX, [-0.5, 0.5], [-10, 10]);
  const card3Y = useTransform(smoothY, [-0.5, 0.5], [12, -12]);

  // Magnetic button shift
  const [btnOffset, setBtnOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    mouseX.set((clientX / innerWidth) - 0.5);
    mouseY.set((clientY / innerHeight) - 0.5);
  };

  const handleBtnMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distX = (e.clientX - centerX) * 0.15;
    const distY = (e.clientY - centerY) * 0.15;
    setBtnOffset({ x: Math.min(Math.max(distX, -6), 6), y: Math.min(Math.max(distY, -6), 6) });
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
      className="relative z-10 overflow-hidden pt-12 pb-20 md:pt-16 md:pb-28 transition-colors duration-300"
      style={{
        background:
          'radial-gradient(circle at 15% 10%, rgba(40,123,255,0.12), transparent 32%), radial-gradient(circle at 85% 20%, rgba(92,225,230,0.12), transparent 35%), linear-gradient(180deg, #F8FCFF 0%, #EDF6FF 50%, #FFFFFF 100%)',
      }}
    >
      {/* Background Subtle Educational Grid Lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            'radial-gradient(#062B3D 1px, transparent 1px), radial-gradient(#062B3D 1px, #F8FCFF 1px)',
          backgroundSize: '36px 36px',
        }}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column — Value Proposition & CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start text-left pt-4">
            
            {/* Small interactive AI/Student badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-[#287BFF]/20 shadow-sm text-xs font-semibold text-[#062B3D] mb-6 backdrop-blur-md"
            >
              <span className="w-2 h-2 rounded-full bg-[#5CE1E6] animate-pulse shrink-0" />
              <Sparkles className="w-3.5 h-3.5 text-[#287BFF]" />
              <span>AI-Native Study Space Built Specially For Students</span>
            </motion.div>

            {/* H1 Headline — Instrument Serif */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-6xl md:text-7xl font-normal leading-[1.02] tracking-[-1.5px] text-[#062B3D] mb-6"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Study smarter. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#287BFF] via-[#6F7CFF] to-[#5CE1E6]">
                Build your future.
              </span>
            </motion.h1>

            {/* Subtitle — Inter */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed mb-8 font-sans"
            >
              One place for learning, practice, AI guidance, previous papers, revision, mocks and focused study. No scattered tabs. Just intentional growth.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 w-full sm:w-auto mb-12"
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

            {/* Real verified pills strip */}
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
                <span>Personalized AI Tutor</span>
              </div>
            </motion.div>

          </div>

          {/* Right Column — Layered Interactive Visual Artwork */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            
            {/* Soft Ambient Background Glow */}
            <motion.div
              style={{ x: orbX, y: orbY }}
              className="absolute w-[340px] h-[340px] rounded-full bg-gradient-to-tr from-[#287BFF]/20 via-[#5CE1E6]/20 to-[#6F7CFF]/15 filter blur-3xl pointer-events-none"
            />

            {/* Visual Container */}
            <div className="relative w-full max-w-[440px] aspect-[4/4.5] flex items-center justify-center">
              
              {/* Central Base Student Artwork */}
              <motion.div
                style={{ x: studentX, y: studentY }}
                className="relative z-10 w-full h-full flex items-center justify-center p-4"
              >
                <div className="relative rounded-3xl overflow-hidden border border-white/60 bg-white/40 backdrop-blur-md shadow-2xl p-4 w-full h-full flex flex-col items-center justify-center group">
                  <img
                    src="/images/study-ai-student.png"
                    alt="Study Hub Student & AI Companion"
                    className="w-full h-full object-contain max-h-[360px] filter drop-shadow-xl transition-transform duration-500 group-hover:scale-[1.02]"
                    loading="eager"
                  />
                  
                  {/* Subtle Label */}
                  <div className="absolute bottom-3 left-4 right-4 text-center">
                    <span className="inline-block px-3 py-1 rounded-full bg-[#062B3D]/80 backdrop-blur-md text-[11px] font-medium text-slate-200 border border-white/10 shadow-sm">
                      Example student dashboard preview
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Floating Concept Card 1 — GATE 2027 */}
              <motion.div
                style={{ x: card1X, y: card1Y }}
                initial={{ opacity: 0, scale: 0.9, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
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

              {/* Floating Concept Card 2 — Spaced Revision */}
              <motion.div
                style={{ x: card2X, y: card2Y }}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="absolute -bottom-2 -right-4 sm:-right-6 z-20 bg-white/95 backdrop-blur-xl border border-slate-100 rounded-2xl p-3.5 shadow-xl min-w-[185px] border-l-4 border-l-[#5CE1E6]"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#062B3D] bg-[#5CE1E6]/30 px-2 py-0.5 rounded">
                    Revision
                  </span>
                  <BookOpen className="w-3.5 h-3.5 text-[#062B3D]" />
                </div>
                <p className="text-xs font-bold text-[#062B3D]">12 items due today</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Spaced repetition active</p>
              </motion.div>

              {/* Floating Concept Card 3 — StudyMate AI */}
              <motion.div
                style={{ x: card3X, y: card3Y }}
                initial={{ opacity: 0, scale: 0.9, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="absolute top-1/2 -translate-y-1/2 -left-6 sm:-left-12 z-20 bg-[#062B3D] text-white rounded-2xl p-3.5 shadow-2xl min-w-[200px] border border-white/10"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#5CE1E6] to-[#6F7CFF] flex items-center justify-center text-[#062B3D]">
                    <Cpu className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-[#5CE1E6]">StudyMate AI</span>
                </div>
                <p className="text-[11px] text-slate-200 leading-snug">
                  "Your next recommended step is ready!"
                </p>
              </motion.div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
