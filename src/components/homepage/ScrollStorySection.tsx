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

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 20 });

  // Scene 1 -> 2 -> 3 -> 4 -> 5 step transformations
  const scene1Opacity = useTransform(smoothProgress, [0, 0.18, 0.22], [1, 1, 0]);
  const scene1Scale = useTransform(smoothProgress, [0, 0.18], [1, 1.12]);

  const scene2Opacity = useTransform(smoothProgress, [0.2, 0.25, 0.38, 0.42], [0, 1, 1, 0]);
  const scene2Scale = useTransform(smoothProgress, [0.2, 0.38], [0.92, 1]);

  const scene3Opacity = useTransform(smoothProgress, [0.4, 0.45, 0.58, 0.62], [0, 1, 1, 0]);
  const scene4Opacity = useTransform(smoothProgress, [0.6, 0.65, 0.78, 0.82], [0, 1, 1, 0]);
  const scene5Opacity = useTransform(smoothProgress, [0.8, 0.85, 1], [0, 1, 1]);

  // Horizontal Scroll Moment transformation
  const horizontalX = useTransform(smoothProgress, [0.42, 0.58], ['0%', '-60%']);

  return (
    <div ref={targetRef} className="relative bg-forest text-paper min-h-[450vh] selection:bg-terracotta/20">
      {/* Sticky Full-Viewport Camera Container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between p-6 sm:p-12 z-10">
        {/* Editorial Top Status Rail */}
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between z-20">
          <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gold/20 text-gold border border-gold/30 flex items-center gap-1.5 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" /> Spatial Study Storyteller
          </span>

          <div className="flex items-center gap-3 text-xs font-semibold text-sage">
            <span className="w-2 h-2 rounded-full bg-terracotta animate-pulse" />
            <span>Interactive 3D Scroll</span>
          </div>
        </div>

        {/* ============================================================
            SCENE 1: THE SCATTER
        ============================================================ */}
        <motion.div
          style={{ opacity: scene1Opacity, scale: scene1Scale }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 pointer-events-none"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-gold mb-3">Scene 01 — Unstructured Study</span>
          <h2 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal text-paper max-w-3xl leading-tight">
            Too many tabs. <br />
            Too many notes. <br />
            <span className="italic text-terracotta">Too many things to remember.</span>
          </h2>

          {/* Floating Spatial Cards */}
          <div className="relative w-full max-w-4xl h-64 mt-8 pointer-events-auto">
            <SpatialCard depth={120} rotate={-6} className="absolute left-4 top-2 w-52 bg-parchment/90 text-ink">
              <span className="text-[10px] font-bold text-terracotta uppercase">YouTube Video</span>
              <p className="text-xs font-bold mt-1">TCP 3-Way Handshake One Shot</p>
            </SpatialCard>

            <SpatialCard depth={160} rotate={8} className="absolute right-8 top-6 w-56 bg-paper text-ink">
              <span className="text-[10px] font-bold text-scholar uppercase">PDF Notes</span>
              <p className="text-xs font-bold mt-1">GATE DBMS Normalization Cheat Sheet</p>
            </SpatialCard>

            <SpatialCard depth={90} rotate={-3} className="absolute left-1/3 bottom-4 w-48 bg-parchment text-ink">
              <span className="text-[10px] font-bold text-gold uppercase">Calendar</span>
              <p className="text-xs font-bold mt-1">Exam in 42 Days</p>
            </SpatialCard>
          </div>
        </motion.div>

        {/* ============================================================
            SCENE 2: THE ORGANIZE
        ============================================================ */}
        <motion.div
          style={{ opacity: scene2Opacity, scale: scene2Scale }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 pointer-events-none"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-gold mb-3">Scene 02 — Central Ecosystem</span>
          <h2 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal text-paper max-w-3xl leading-tight">
            Bring it back to <span className="italic text-gold">one place.</span>
          </h2>
          <p className="text-sage text-base sm:text-lg max-w-xl mt-4">
            Study Hub organizes lectures, previous papers, revision flashcards, and AI tutoring into one synchronized space.
          </p>

          <div className="w-24 h-24 rounded-3xl bg-scholar border border-sage/30 flex items-center justify-center text-paper font-serif font-bold text-3xl mt-8 shadow-deep pointer-events-auto">
            SH
          </div>
        </motion.div>

        {/* ============================================================
            SCENE 3: HORIZONTAL SCROLL MOMENT — THE PLAN
        ============================================================ */}
        <motion.div
          style={{ opacity: scene3Opacity }}
          className="absolute inset-0 flex flex-col justify-center p-6 sm:p-12 pointer-events-none"
        >
          <div className="max-w-7xl mx-auto w-full space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-gold block">Scene 03 — Everything Inside Your Study Day</span>
            <h2 className="font-serif text-3xl sm:text-5xl text-paper">
              Now you know what comes next.
            </h2>

            {/* Controlled Horizontal Panning Panels */}
            <div className="overflow-hidden w-full pt-6 pointer-events-auto">
              <motion.div style={{ x: horizontalX }} className="flex gap-6 w-[200%]">
                {[
                  { step: '01', title: 'Learn', icon: BookOpen, desc: 'Synchronized YouTube lectures & verified channels', color: 'bg-scholar' },
                  { step: '02', title: 'Practice', icon: Zap, desc: '10,000+ official GATE, JEE, NEET past papers', color: 'bg-terracotta' },
                  { step: '03', title: 'Revise', icon: Clock, desc: 'Spaced flashcards and automated mistakes notebook', color: 'bg-gold/80 text-forest' },
                  { step: '04', title: 'Focus', icon: Brain, desc: 'Distraction-free focus timer and study studio', color: 'bg-scholar' },
                  { step: '05', title: 'Reflect', icon: Target, desc: 'Deep performance analytics & mastery readiness', color: 'bg-terracotta' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.step}
                      className={`min-w-[280px] sm:min-w-[340px] p-6 rounded-2xl border border-sage/20 shadow-card ${item.color}`}
                    >
                      <span className="text-xs font-bold opacity-80">PHASE {item.step}</span>
                      <Icon className="w-6 h-6 my-3" />
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
            SCENE 4: THE PRACTICE
        ============================================================ */}
        <motion.div
          style={{ opacity: scene4Opacity }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 pointer-events-none"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-gold mb-3">Scene 04 — Real Exam Practice</span>
          <h2 className="font-serif text-4xl sm:text-6xl text-paper max-w-3xl leading-tight">
            Targeted official question papers.
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl w-full mt-8 pointer-events-auto">
            {['GATE CS / DA', 'JEE Main & Adv', 'NEET UG'].map((exam, i) => (
              <SpatialCard key={exam} depth={100 + i * 20} rotate={i % 2 === 0 ? -3 : 3} className="bg-parchment text-ink p-5 text-left">
                <span className="text-[10px] font-bold text-terracotta uppercase">Verified PYQs</span>
                <h3 className="font-serif text-xl font-bold mt-1 text-ink">{exam}</h3>
                <p className="text-xs text-muted mt-1">Full step-by-step solution breakdowns & timed mock modes.</p>
              </SpatialCard>
            ))}
          </div>
        </motion.div>

        {/* ============================================================
            SCENE 5: THE CONFIDENCE
        ============================================================ */}
        <motion.div
          style={{ opacity: scene5Opacity }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 pointer-events-none"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-gold mb-3">Scene 05 — Student Certainty</span>
          <h2 className="font-serif text-5xl sm:text-7xl lg:text-8xl text-paper leading-tight">
            Less scattered. <br />
            <span className="italic text-terracotta">More certain.</span>
          </h2>

          <div className="mt-8 pointer-events-auto">
            <button
              onClick={() => navigate('/signup')}
              className="px-8 py-4 rounded-xl bg-terracotta hover:bg-terracotta/90 text-paper font-bold text-sm transition-all shadow-float hover:shadow-deep flex items-center gap-3 group"
            >
              <span>Start My Study Journey</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>

        {/* Editorial Scroll Progress Rail (Right) */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-4 text-[10px] font-bold font-mono text-sage z-20">
          {['01', '02', '03', '04', '05'].map((num) => (
            <span key={num} className="hover:text-gold cursor-pointer transition-colors">
              {num}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
