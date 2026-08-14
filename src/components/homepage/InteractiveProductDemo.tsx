import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Cpu, Zap, Trophy, RotateCcw,
  Clock, Play, Pause
} from 'lucide-react';

type DemoTab = 'dashboard' | 'studymate' | 'practice' | 'mock' | 'revision' | 'focus';

export const InteractiveProductDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DemoTab>('dashboard');
  const [practiceAnswered, setPracticeAnswered] = useState<number | null>(null);
  const [cardFlipped, setCardFlipped] = useState(false);
  const [focusRunning, setFocusRunning] = useState(false);
  const navigate = useNavigate();

  const tabs: { id: DemoTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'studymate', label: 'StudyMate AI', icon: Cpu },
    { id: 'practice', label: 'Practice', icon: Zap },
    { id: 'mock', label: 'Mock Tests', icon: Trophy },
    { id: 'revision', label: 'Revision', icon: RotateCcw },
    { id: 'focus', label: 'Focus Room', icon: Clock },
  ];

  return (
    <section className="py-20 md:py-28 bg-[#F8F6F0] text-[#1C201D] border-b border-[#1C201D]/10 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2D5A3F]/10 text-[#2D5A3F] border border-[#2D5A3F]/20 text-xs font-bold uppercase tracking-wider mb-3">
            See How Study Hub Works
          </div>
          <h2
            className="text-4xl sm:text-5xl font-serif font-bold text-[#1C201D] tracking-tight"
          >
            Experience Study Hub before signing up.
          </h2>
          <p className="text-sm sm:text-base text-[#6C706D] mt-3 leading-relaxed">
            Click through our main tools to see how Study Hub brings clarity to your daily routine.
          </p>
        </motion.div>

        {/* Tab Navigation Controls */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1.5 bg-[#EDE8DB]/70 rounded-2xl border border-[#1C201D]/10 max-w-full overflow-x-auto no-scrollbar gap-1">
            {tabs.map((t) => {
              const Icon = t.icon;
              const isSel = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(t.id);
                    setCardFlipped(false);
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                    isSel
                      ? 'bg-[#2D5A3F] text-[#FFFFFF] shadow-sm'
                      : 'text-[#6C706D] hover:text-[#1C201D] hover:bg-[#FFFFFF]/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSel ? 'text-[#D4AF37]' : 'text-[#6C706D]'}`} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Demo Viewport Canvas */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="bg-[#1C201D] border border-[#1C201D]/20 rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl min-h-[460px] text-[#FFFFFF] relative overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#2D5A3F]/20 border border-[#2D5A3F]/30">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37]">Academic Target</span>
                    <h3 className="text-lg font-bold text-[#FFFFFF]">GATE 2027 • Computer Science</h3>
                    <p className="text-xs text-[#EDE8DB] mt-0.5">Targeting Top Rank • 3 Hours Daily Prep</p>
                  </div>
                  <button onClick={() => navigate('/signup')} className="px-4 py-2 rounded-xl bg-[#2D5A3F] hover:bg-[#2D5A3F]/90 text-[#FFFFFF] text-xs font-bold shrink-0 shadow-sm">
                    Customize Your Path →
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-[#FFFFFF]/5 border border-[#FFFFFF]/10 space-y-2">
                    <span className="text-xs text-[#EDE8DB]">Today's Focus Subject</span>
                    <h4 className="text-base font-bold text-[#FFFFFF]">Computer Networks</h4>
                    <div className="w-full h-1.5 bg-[#FFFFFF]/10 rounded-full overflow-hidden">
                      <div className="w-3/4 h-full bg-[#2D5A3F]" />
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FFFFFF]/5 border border-[#FFFFFF]/10 space-y-2">
                    <span className="text-xs text-[#EDE8DB]">Spaced Revision</span>
                    <h4 className="text-base font-bold text-[#D4AF37]">12 Cards Due</h4>
                    <p className="text-[11px] text-[#EDE8DB]">Optimal interval calculated by AI</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FFFFFF]/5 border border-[#FFFFFF]/10 space-y-2">
                    <span className="text-xs text-[#EDE8DB]">Mock Exam Status</span>
                    <h4 className="text-base font-bold text-[#C86D51]">Full Test 04 Ready</h4>
                    <p className="text-[11px] text-[#EDE8DB]">65 Questions • 180 Minutes</p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'studymate' && (
              <motion.div
                key="studymate"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-4"
              >
                <div className="p-4 rounded-2xl bg-[#FFFFFF]/5 border border-[#FFFFFF]/10 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#D4AF37]">
                    <Cpu className="w-4 h-4 text-[#C86D51]" />
                    <span>StudyMate AI Assistant</span>
                  </div>
                  <p className="text-xs text-[#EDE8DB] bg-[#1C201D] p-3 rounded-xl border border-[#FFFFFF]/10">
                    "Explain TCP congestion control simply with a real-world analogy."
                  </p>
                  <div className="p-3 rounded-xl bg-[#2D5A3F]/20 border border-[#2D5A3F]/30 text-xs text-[#FFFFFF] space-y-2 leading-relaxed">
                    <p className="font-semibold text-[#D4AF37]">Analogous to highway traffic flow control:</p>
                    <p className="text-[11px] text-[#EDE8DB]">1. Slow Start: Probe network capacity by doubling window size each round-trip time.</p>
                    <p className="text-[11px] text-[#EDE8DB]">2. Congestion Avoidance: Switch to linear growth (+1 MSS) once threshold is reached.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'practice' && (
              <motion.div
                key="practice"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-4"
              >
                <div className="p-4 rounded-2xl bg-[#FFFFFF]/5 border border-[#FFFFFF]/10 space-y-3">
                  <div className="flex items-center justify-between text-xs text-[#EDE8DB]">
                    <span className="font-bold text-[#D4AF37]">GATE CS 2024 • Computer Networks</span>
                    <span>Q. 42 / 65</span>
                  </div>
                  <p className="text-sm font-serif text-[#FFFFFF]">What is the maximum window size for Selective Repeat ARQ with 4-bit sequence numbers?</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {['A) 16', 'B) 8', 'C) 15', 'D) 7'].map((opt, idx) => (
                      <button
                        key={opt}
                        onClick={() => setPracticeAnswered(idx)}
                        className={`p-3 rounded-xl text-left border font-semibold transition-all ${
                          practiceAnswered === idx
                            ? idx === 1
                              ? 'bg-[#2D5A3F] border-[#2D5A3F] text-[#FFFFFF]'
                              : 'bg-[#C86D51] border-[#C86D51] text-[#FFFFFF]'
                            : 'bg-[#FFFFFF]/5 border-[#FFFFFF]/10 text-[#EDE8DB] hover:bg-[#FFFFFF]/10'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'mock' && (
              <motion.div
                key="mock"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-4"
              >
                <div className="p-4 rounded-2xl bg-[#FFFFFF]/5 border border-[#FFFFFF]/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="text-base font-serif font-bold text-[#FFFFFF]">Official GATE CS Full Mock Test #03</h4>
                    <p className="text-xs text-[#EDE8DB] mt-1">65 Questions • 180 Mins • Standard Gate Marking (+1, -0.33)</p>
                  </div>
                  <button onClick={() => navigate('/signup')} className="px-5 py-2.5 rounded-xl bg-[#2D5A3F] text-[#FFFFFF] text-xs font-bold shadow-sm">
                    Start Mock Test →
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'revision' && (
              <motion.div
                key="revision"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-4"
              >
                <div
                  onClick={() => setCardFlipped(!cardFlipped)}
                  className="p-6 rounded-2xl bg-[#FFFFFF]/5 border border-[#FFFFFF]/10 cursor-pointer min-h-[160px] flex flex-col items-center justify-center text-center space-y-2 hover:border-[#2D5A3F]/50 transition-all"
                >
                  <span className="text-[10px] font-bold uppercase text-[#D4AF37]">Flashcard • Click to Flip</span>
                  <h4 className="text-lg font-serif font-bold text-[#FFFFFF]">
                    {cardFlipped ? 'Answer: 2^n - 1' : 'Question: What is the maximum number of nodes in a binary tree of height n?'}
                  </h4>
                </div>
              </motion.div>
            )}

            {activeTab === 'focus' && (
              <motion.div
                key="focus"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-4 text-center py-6"
              >
                <span className="text-xs font-bold uppercase text-[#D4AF37]">Focus Timer</span>
                <h3 className="text-5xl font-mono font-bold text-[#FFFFFF]">25:00</h3>
                <button
                  onClick={() => setFocusRunning(!focusRunning)}
                  className="px-6 py-2.5 rounded-xl bg-[#2D5A3F] text-[#FFFFFF] text-xs font-bold inline-flex items-center gap-2 shadow-sm"
                >
                  {focusRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{focusRunning ? 'Pause Timer' : 'Start Focus Session'}</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};
