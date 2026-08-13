import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Sparkles, ArrowRight, Target, BookOpen, Brain, Zap, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SpatialCard } from '../3d/SpatialCard';

export const ScrollStorySection: React.FC = () => {
  const navigate = useNavigate();
  const targetRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start start', 'end end'],
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });

  // Scene transformations
  const scene1Opacity = useTransform(smoothProgress, [0, 0.16, 0.2], [1, 1, 0]);
  const scene1Scale = useTransform(smoothProgress, [0, 0.16], [1, 0.9]);
  
  // Scatter convergence offsets for Scene 1 -> 2
  const bookX = useTransform(smoothProgress, [0, 0.18], [-280, 0]);
  const ytX = useTransform(smoothProgress, [0, 0.18], [260, 0]);
  const flashcardY = useTransform(smoothProgress, [0, 0.18], [-180, 0]);
  const calY = useTransform(smoothProgress, [0, 0.18], [190, 0]);

  const scene2Opacity = useTransform(smoothProgress, [0.18, 0.22, 0.38, 0.42], [0, 1, 1, 0]);
  const scene2Scale = useTransform(smoothProgress, [0.2, 0.38], [0.9, 1]);

  const scene3Opacity = useTransform(smoothProgress, [0.4, 0.44, 0.58, 0.62], [0, 1, 1, 0]);
  const scene4Opacity = useTransform(smoothProgress, [0.6, 0.64, 0.78, 0.82], [0, 1, 1, 0]);
  const scene5Opacity = useTransform(smoothProgress, [0.8, 0.84, 1], [0, 1, 1]);

  // Horizontal Scroll Moment transformation
  const horizontalX = useTransform(smoothProgress, [0.42, 0.58], ['0%', '-55%']);

  // Editorial step rail progress indicator (01 to 05)
  const activeIndex = useTransform(smoothProgress, [0, 0.2, 0.4, 0.6, 0.8, 1], [1, 2, 3, 4, 5, 5]);

  return (
    <div id="signature-section" ref={targetRef} className="relative bg-forest text-paper min-h-[450vh] selection:bg-terracotta/20">
      {/* Sticky Full-Viewport Camera Container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between p-6 sm:p-12 z-10">
        
        {/* Top Status Bar */}
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between z-20">
          <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-scholar text-paper border border-sage/30 flex items-center gap-1.5 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-gold" /> Signature Study Transformation
          </span>

          <div className="flex items-center gap-3 text-xs font-semibold text-sage">
            <span className="w-2 h-2 rounded-full bg-terracotta animate-pulse" />
            <span>Interactive Camera Scroll</span>
          </div>
        </div>

        {/* Right Side Editorial Progress Rail */}
        <div className="fixed right-6 top-1/2 -translate-y-1/2 z-30 hidden md:flex flex-col items-center gap-3 font-mono text-xs">
          {['01', '02', '03', '04', '05'].map((num, idx) => {
            const stepNum = idx + 1;
            return (
              <motion.div
                key={num}
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => {
                  if (targetRef.current) {
                    const top = targetRef.current.offsetTop + (idx / 4) * (targetRef.current.offsetHeight - window.innerHeight);
                    window.scrollTo({ top, behavior: 'smooth' });
                  }
                }}
              >
                <motion.span
                  className="font-bold transition-colors duration-300"
                  animate={{
                    color: Math.round(activeIndex.get()) === stepNum ? '#D4AF37' : '#769382',
                    scale: Math.round(activeIndex.get()) === stepNum ? 1.15 : 1,
                  }}
                >
                  {num}
                </motion.span>
                <motion.div
                  className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                  animate={{
                    backgroundColor: Math.round(activeIndex.get()) === stepNum ? '#D4AF37' : '#769382',
                    scale: Math.round(activeIndex.get()) === stepNum ? 1.4 : 0.8,
                  }}
                />
              </motion.div>
            );
          })}
        </div>

        {/* ============================================================
            SCENE 1: THE SCATTER ("Too many things to study.")
        ============================================================ */}
        <motion.div
          style={{ opacity: scene1Opacity, scale: scene1Scale }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 pointer-events-none"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-gold mb-3">SCENE 01 — UNSTRUCTURED STUDY</span>
          <h2 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal text-paper max-w-3xl leading-tight">
            Too many things to study.
          </h2>
          <p className="text-sage text-base sm:text-lg max-w-lg mt-3">
            Books, YouTube cards, PDFs, notes, PYQs, flashcards, and calendars floating in separate places.
          </p>

          {/* Floating Scattered Objects */}
          <div className="relative w-full max-w-4xl h-72 mt-8 pointer-events-auto">
            <motion.div style={{ x: bookX }} className="absolute left-6 top-4 z-10">
              <SpatialCard depth={120} rotate={-6} className="w-52 bg-parchment text-ink p-4 border border-forest/20 shadow-deep">
                <span className="text-[10px] font-bold text-scholar uppercase">Open Book</span>
                <p className="text-xs font-bold mt-1 text-ink">Operating Systems Concepts</p>
              </SpatialCard>
            </motion.div>

            <motion.div style={{ x: ytX }} className="absolute right-8 top-6 z-10">
              <SpatialCard depth={160} rotate={8} className="w-56 bg-paper text-ink p-4 border border-forest/20 shadow-deep">
                <span className="text-[10px] font-bold text-terracotta uppercase">YouTube Lecture</span>
                <p className="text-xs font-bold mt-1 text-ink">TCP/IP Protocol Stack</p>
              </SpatialCard>
            </motion.div>

            <motion.div style={{ y: flashcardY }} className="absolute left-1/3 -top-4 z-10">
              <SpatialCard depth={90} rotate={-3} className="w-48 bg-scholar text-paper p-4 shadow-deep">
                <span className="text-[10px] font-bold text-gold uppercase">Flashcards</span>
                <p className="text-xs font-bold mt-1">24 Active Recall Cards</p>
              </SpatialCard>
            </motion.div>

            <motion.div style={{ y: calY }} className="absolute right-1/3 bottom-2 z-10">
              <SpatialCard depth={140} rotate={5} className="w-48 bg-terracotta text-paper p-4 shadow-deep">
                <span className="text-[10px] font-bold text-paper uppercase">Exam Calendar</span>
                <p className="text-xs font-bold mt-1">Mock Exam in 12 Days</p>
              </SpatialCard>
            </motion.div>
          </div>
        </motion.div>

        {/* ============================================================
            SCENE 2: CONVERGENCE ("Bring it back to one place.")
        ============================================================ */}
        <motion.div
          style={{ opacity: scene2Opacity, scale: scene2Scale }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 pointer-events-none"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-gold mb-3">SCENE 02 — UNIFIED ECOSYSTEM</span>
          <h2 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal text-paper max-w-3xl leading-tight">
            Bring it back to <span className="italic text-gold">one place.</span>
          </h2>
          <p className="text-sage text-base sm:text-lg max-w-xl mt-4">
            Everything converges into one calm, organized Study Hub environment.
          </p>

          <div className="w-28 h-28 rounded-3xl bg-scholar border-2 border-gold/40 flex items-center justify-center text-paper font-serif font-bold text-4xl mt-8 shadow-deep pointer-events-auto">
            SH
          </div>
        </motion.div>

        {/* ============================================================
            SCENE 3: ROADMAP DOLLY ("Know what to do next.")
        ============================================================ */}
        <motion.div
          style={{ opacity: scene3Opacity }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 pointer-events-none"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-gold mb-3">SCENE 03 — GUIDED PROGRESSION</span>
          <h2 className="font-serif text-4xl sm:text-6xl text-paper max-w-3xl leading-tight mb-8">
            Know what to do next.
          </h2>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 max-w-4xl w-full pointer-events-auto">
            {[
              { step: '01', name: 'Foundation', desc: 'Core Lectures & Notes' },
              { step: '02', name: 'Practice', desc: 'Targeted Official PYQs' },
              { step: '03', name: 'Revision', desc: 'Spaced Flashcards' },
              { step: '04', name: 'Mock', desc: 'Exam Simulator' },
              { step: '05', name: 'Mastery', desc: 'Exam Readiness 95%+' },
            ].map((item, idx) => (
              <div key={item.step} className="flex items-center gap-3">
                <div className="p-4 rounded-2xl bg-scholar/40 border border-sage/30 text-left min-w-[150px] sm:min-w-[170px] shadow-card">
                  <span className="text-[10px] font-bold text-gold uppercase">PHASE {item.step}</span>
                  <h3 className="font-serif text-lg font-bold text-paper mt-0.5">{item.name}</h3>
                  <p className="text-[11px] text-sage">{item.desc}</p>
                </div>
                {idx < 4 && <span className="text-gold font-bold text-lg hidden sm:inline">→</span>}
              </div>
            ))}
          </div>
        </motion.div>

        {/* ============================================================
            SCENE 4: HORIZONTAL SCROLL ("Everything your study day needs.")
        ============================================================ */}
        <motion.div
          style={{ opacity: scene4Opacity }}
          className="absolute inset-0 flex flex-col justify-center p-6 sm:p-12 pointer-events-none"
        >
          <div className="max-w-7xl mx-auto w-full space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-gold block">SCENE 04 — DAILY WORKFLOW</span>
            <h2 className="font-serif text-3xl sm:text-5xl text-paper">
              Everything your study day needs.
            </h2>

            {/* Controlled Horizontal Panning Panels */}
            <div className="overflow-hidden w-full pt-6 pointer-events-auto">
              <motion.div style={{ x: horizontalX }} className="flex gap-6 w-[180%]">
                {[
                  { step: '01', title: 'Learn', icon: BookOpen, desc: 'Curated YouTube lectures & official playlists', color: 'bg-scholar' },
                  { step: '02', title: 'Practice', icon: Zap, desc: '10,000+ official GATE, JEE, NEET past papers', color: 'bg-terracotta' },
                  { step: '03', title: 'Revise', icon: Clock, desc: 'Spaced flashcards & automated mistake log', color: 'bg-scholar' },
                  { step: '04', title: 'Focus', icon: Brain, desc: 'Distraction-free timer & studio environment', color: 'bg-forest border border-sage/30' },
                  { step: '05', title: 'Reflect', icon: Target, desc: 'Deep performance analytics & mastery score', color: 'bg-terracotta' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.step}
                      className={`min-w-[280px] sm:min-w-[340px] p-6 rounded-2xl border border-sage/20 shadow-card ${item.color}`}
                    >
                      <span className="text-xs font-bold opacity-80">PHASE {item.step}</span>
                      <Icon className="w-6 h-6 my-3 text-gold" />
                      <h3 className="font-serif text-2xl font-normal mb-1">{item.title}</h3>
                      <p className="text-xs opacity-90 leading-relaxed">{item.desc}</p>
                    </div>
                  );
                })}
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* ============================================================
            SCENE 5: FINAL CALL TO ACTION
        ============================================================ */}
        <motion.div
          style={{ opacity: scene5Opacity }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 pointer-events-none"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-gold mb-3">SCENE 05 — READY TO BEGIN</span>
          <h2 className="font-serif text-5xl sm:text-7xl lg:text-8xl text-paper leading-tight">
            Less scattered. <br />
            <span className="italic text-terracotta">More certain.</span>
          </h2>

          <div className="mt-8 pointer-events-auto">
            <button
              onClick={() => navigate('/signup')}
              className="px-8 py-4 rounded-xl bg-terracotta hover:bg-terracotta/90 text-paper font-bold text-sm transition-all shadow-float flex items-center gap-3 group cursor-pointer"
            >
              <span>Start My Study Journey</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

