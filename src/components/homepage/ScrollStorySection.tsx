import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles, CheckCircle2, Zap, Target, Brain, ArrowRight } from 'lucide-react';
import { RevealText } from '../ui/motion/RevealText';
import { MagneticButton } from '../ui/motion/MagneticButton';
import { useNavigate } from 'react-router-dom';

const STORY_PHASES = [
  {
    id: 'learn',
    title: 'Learn Intelligently',
    tagline: 'StudyMate AI breaks down hard topics into simple mental models.',
    icon: Brain,
    color: '#287BFF',
    badge: 'StudyMate AI',
    detail: 'Computer Networks — Socket Programming & TCP Handshake',
    actionText: 'Ask StudyMate a question',
  },
  {
    id: 'practice',
    title: 'Practice Target PYQs',
    tagline: 'Real official exam questions with step-by-step verified solutions.',
    icon: Zap,
    color: '#5CE1E6',
    badge: 'GATE 2027 PYQs',
    detail: '14 solved today • 82% Speed Accuracy Index',
    actionText: 'Start PYQ Session',
  },
  {
    id: 'improve',
    title: 'Fix Weak Points',
    tagline: 'Spaced flashcards and automated mistakes notebook to master gaps.',
    icon: Target,
    color: '#6F7CFF',
    badge: 'Revision Engine',
    detail: '12 cards due for review • Spaced Memory Interval',
    actionText: 'Review Mistakes Notebook',
  },
];

export const ScrollStorySection: React.FC = () => {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);

  const activePhase = STORY_PHASES[activePhaseIndex];

  return (
    <section className="relative bg-[#062B3D] text-white py-24 md:py-36 overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none opacity-25">
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-[#287BFF] rounded-full filter blur-[120px]" />
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-[#5CE1E6] rounded-full filter blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
        {/* Section Headline */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-[#5CE1E6] mb-6 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[#5CE1E6]" />
            <span>Interactive Study Flow</span>
          </div>

          <RevealText
            text={"Everything you need.\nNothing you don't."}
            as="h2"
            gradientText="Nothing you don't."
            className="text-4xl sm:text-5xl md:text-6xl font-normal leading-[1.08] tracking-[-1px] text-white"
            fontFamily="'Instrument Serif', serif"
          />

          <p className="text-slate-300 text-base sm:text-lg mt-6 font-sans leading-relaxed">
            One cohesive study space that connects learning, targeted PYQ practice, spaced revision, and AI tutoring.
          </p>
        </div>

        {/* Pinned / Interactive 3-Phase Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Narrative Stepper */}
          <div className="lg:col-span-5 flex flex-col space-y-6">
            {STORY_PHASES.map((phase, idx) => {
              const isActive = activePhaseIndex === idx;
              const Icon = phase.icon;

              return (
                <motion.div
                  key={phase.id}
                  onClick={() => setActivePhaseIndex(idx)}
                  whileHover={shouldReduceMotion ? {} : { x: 6 }}
                  className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 border ${
                    isActive
                      ? 'bg-white/10 border-[#5CE1E6]/50 shadow-2xl backdrop-blur-xl'
                      : 'bg-white/5 border-white/10 hover:bg-white/8 opacity-75'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-[#062B3D] font-bold shadow-md"
                      style={{ backgroundColor: phase.color }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span
                      className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                      style={{ backgroundColor: `${phase.color}25`, color: phase.color }}
                    >
                      Step 0{idx + 1}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">{phase.title}</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">{phase.tagline}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Right Sticky Dynamic Visual Display */}
          <div className="lg:col-span-7 relative">
            <div className="relative rounded-3xl border border-white/20 bg-slate-900/90 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl overflow-hidden min-h-[420px] flex flex-col justify-between">
              {/* Dynamic Phase Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full animate-ping"
                    style={{ backgroundColor: activePhase.color }}
                  />
                  <span className="text-xs font-mono text-slate-400">ACTIVE ENGINE: {activePhase.badge}</span>
                </div>
                <span className="text-xs text-[#5CE1E6] font-semibold">Live Interactive Preview</span>
              </div>

              {/* Center Active Engine Presentation */}
              <motion.div
                key={activePhase.id}
                initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="my-auto py-6"
              >
                <div className="inline-block px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-white mb-4 border border-white/15">
                  {activePhase.badge}
                </div>

                <h4 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                  {activePhase.title}
                </h4>
                <p className="text-slate-300 text-sm max-w-lg mb-6 leading-relaxed">
                  {activePhase.detail}
                </p>

                {/* Progress Indicators */}
                <div className="space-y-3 max-w-md">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>Target Mastery Progress</span>
                    <span className="text-[#5CE1E6] font-bold">88%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '88%' }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: activePhase.color }}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Interactive CTA */}
              <div className="pt-6 border-t border-white/10 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-[#5CE1E6]" />
                  <span>Real-time Sync with Student Account</span>
                </div>

                <MagneticButton
                  onClick={() => navigate('/practice')}
                  glowColor={activePhase.color}
                  className="px-5 py-2.5 rounded-full text-xs font-semibold text-[#062B3D] flex items-center gap-2"
                  style={{ backgroundColor: activePhase.color }}
                >
                  <span>{activePhase.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </MagneticButton>
              </div>
            </div>
          </div>
        </div>

        {/* Signature Section — "From Confusion to Clarity" */}
        <div className="mt-32 pt-20 border-t border-white/10 text-center">
          <RevealText
            text={"From confusion\nto clarity."}
            as="h2"
            gradientText="to clarity."
            className="text-4xl sm:text-5xl md:text-6xl font-normal leading-[1.08] text-white mb-8"
            fontFamily="'Instrument Serif', serif"
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-xs font-mono text-[#287BFF] font-bold">01. Organizes</span>
              <p className="text-xs font-bold text-white mt-1">Structured Exam Target</p>
              <p className="text-[11px] text-slate-400 mt-1">Clear path mapped out</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-xs font-mono text-[#5CE1E6] font-bold">02. Explains</span>
              <p className="text-xs font-bold text-white mt-1">StudyMate AI Tutor</p>
              <p className="text-[11px] text-slate-400 mt-1">Instant doubt clearance</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-xs font-mono text-[#6F7CFF] font-bold">03. Tests</span>
              <p className="text-xs font-bold text-white mt-1">Official PYQ Practice</p>
              <p className="text-[11px] text-slate-400 mt-1">Verified past papers</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-xs font-mono text-emerald-400 font-bold">04. Masters</span>
              <p className="text-xs font-bold text-white mt-1">Spaced Revision</p>
              <p className="text-[11px] text-slate-400 mt-1">Never forget key concepts</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
