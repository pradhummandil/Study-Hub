import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Cpu, Zap, Trophy, RotateCcw,
  ArrowRight, Clock, Calculator, Eye, ChevronRight
} from 'lucide-react';

type DemoTab = 'dashboard' | 'studymate' | 'practice' | 'mock' | 'revision';

export const InteractiveProductDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DemoTab>('dashboard');
  const [practiceAnswered, setPracticeAnswered] = useState<number | null>(null);
  const [cardFlipped, setCardFlipped] = useState(false);
  const navigate = useNavigate();

  const tabs: { id: DemoTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'studymate', label: 'StudyMate AI', icon: Cpu },
    { id: 'practice', label: 'PYQ Practice', icon: Zap },
    { id: 'mock', label: 'Mock Test', icon: Trophy },
    { id: 'revision', label: 'Revision', icon: RotateCcw },
  ];

  return (
    <section className="py-20 md:py-28 bg-white border-b border-slate-100 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#287BFF]/10 text-[#287BFF] text-xs font-bold uppercase tracking-wider mb-3">
            Interactive Product Demo
          </div>
          <h2
            className="text-4xl sm:text-5xl font-normal text-[#062B3D] tracking-tight"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Experience Study Hub before you create an account.
          </h2>
          <p className="text-base text-slate-600 mt-3">
            Click through our main tools to see how Study Hub simplifies your daily preparation.
          </p>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/80 max-w-full overflow-x-auto no-scrollbar gap-1">
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
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                    isSel
                      ? 'bg-[#062B3D] text-white shadow-md'
                      : 'text-slate-600 hover:text-[#062B3D] hover:bg-slate-200/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSel ? 'text-[#5CE1E6]' : 'text-slate-400'}`} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Canvas Frame */}
        <div className="relative rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden p-6 md:p-10 text-white min-h-[460px]">
          
          {/* Header Bar inside demo */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="ml-2 font-mono text-[11px] text-slate-400">studyhub-demo.app / {activeTab}</span>
            </div>
            
            {/* Prominent Label as required */}
            <span className="px-3 py-1 rounded-full bg-[#287BFF]/20 text-[#5CE1E6] font-semibold text-[11px] border border-[#287BFF]/30">
              Interactive preview
            </span>
          </div>

          {/* Dynamic Tab Content */}
          <AnimatePresence mode="wait">
            
            {/* TAB 1: DASHBOARD */}
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard-demo"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/60 p-5 rounded-2xl border border-slate-700/50">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-[#5CE1E6]">Academic Target</span>
                    <h3 className="text-xl font-bold text-white">GATE 2027 • Computer Science</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Targeting Top Rank • 3 Hours Daily Prep</p>
                  </div>
                  <button
                    onClick={() => navigate('/signup')}
                    className="px-5 py-2.5 rounded-full bg-[#287BFF] hover:bg-[#287BFF]/90 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-lg"
                  >
                    <span>Customize Your Path</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/40">
                    <p className="text-xs text-slate-400 font-medium mb-1">Today's Focus Subject</p>
                    <p className="text-base font-bold text-white">Computer Networks</p>
                    <div className="w-full bg-slate-700 h-2 rounded-full mt-3 overflow-hidden">
                      <div className="bg-[#5CE1E6] h-full rounded-full w-[65%]" />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 inline-block">65% topic coverage</span>
                  </div>

                  <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/40">
                    <p className="text-xs text-slate-400 font-medium mb-1">Spaced Revision</p>
                    <p className="text-base font-bold text-emerald-400">12 Cards Due</p>
                    <p className="text-[11px] text-slate-300 mt-2">Optimal interval calculated by AI</p>
                  </div>

                  <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/40">
                    <p className="text-xs text-slate-400 font-medium mb-1">Mock Exam Status</p>
                    <p className="text-base font-bold text-amber-400">Full Test 04 Ready</p>
                    <p className="text-[11px] text-slate-300 mt-2">65 Questions • 180 Minutes</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 2: STUDYMATE AI */}
            {activeTab === 'studymate' && (
              <motion.div
                key="studymate-demo"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700 text-xs text-slate-200 self-end max-w-xl ml-auto">
                  <p className="font-semibold text-slate-400 mb-1">Student:</p>
                  <p className="text-sm">Explain TCP Congestion Control simply with an example.</p>
                </div>

                <div className="bg-[#062B3D] rounded-2xl p-5 border border-[#5CE1E6]/30 text-xs text-slate-100 max-w-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Cpu className="w-4 h-4 text-[#5CE1E6]" />
                    <span className="font-bold text-[#5CE1E6]">StudyMate AI:</span>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-200">
                    Think of TCP congestion control like driving a car on a highway:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1.5 text-slate-300 text-xs">
                    <li><strong className="text-white">Slow Start:</strong> Start slow, then double speed as long as the road is clear.</li>
                    <li><strong className="text-white">Congestion Avoidance:</strong> When traffic increases, increase speed linearly (+1 packet per round-trip).</li>
                    <li><strong className="text-white">Fast Recovery:</strong> If a packet drops, immediately drop window size to relieve network congestion.</li>
                  </ul>
                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                    <span>💡 Ask a follow-up question or practice numerical problems</span>
                    <button
                      onClick={() => navigate('/signup')}
                      className="text-[#5CE1E6] font-semibold hover:underline flex items-center gap-1"
                    >
                      Try StudyMate live →
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 3: PRACTICE */}
            {activeTab === 'practice' && (
              <motion.div
                key="practice-demo"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 max-w-3xl mx-auto"
              >
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="font-mono text-[#5CE1E6]">GATE 2024 • Computer Networks • Question 4 of 20</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">2 Marks</span>
                </div>

                <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 text-sm">
                  <p className="font-medium text-slate-100 leading-relaxed mb-4">
                    In a TCP connection, the congestion window size is currently 16 KB. If a timeout occurs, what will be the new value of the threshold and congestion window size?
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {[
                      { id: 1, text: 'Threshold = 8 KB, Congestion Window = 1 MSS (2 KB)' },
                      { id: 2, text: 'Threshold = 16 KB, Congestion Window = 8 KB' },
                      { id: 3, text: 'Threshold = 4 KB, Congestion Window = 4 KB' },
                      { id: 4, text: 'Threshold = 8 KB, Congestion Window = 8 KB' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setPracticeAnswered(opt.id)}
                        className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer ${
                          practiceAnswered === opt.id
                            ? opt.id === 1
                              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                              : 'bg-red-500/20 border-red-400 text-red-200'
                            : 'bg-slate-900/60 border-slate-700 text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        <span className="font-bold mr-2">{String.fromCharCode(64 + opt.id)}.</span> {opt.text}
                      </button>
                    ))}
                  </div>

                  {practiceAnswered !== null && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 p-3.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300"
                    >
                      <p className="font-bold text-emerald-400 mb-1">
                        {practiceAnswered === 1 ? 'Correct Answer!' : 'Incorrect — Option A is correct.'}
                      </p>
                      <p className="text-slate-300">
                        Upon timeout, Threshold becomes half of current window size (16 / 2 = 8 KB) and Congestion Window resets to 1 MSS.
                      </p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB 4: MOCK TEST */}
            {activeTab === 'mock' && (
              <motion.div
                key="mock-demo"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between bg-slate-800 p-3.5 rounded-xl border border-slate-700 text-xs">
                  <div className="flex items-center gap-3 font-semibold text-white">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>GATE CS Official Mock Simulator</span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-300">
                    <span className="flex items-center gap-1 font-mono text-emerald-400 font-bold">
                      <Clock className="w-3.5 h-3.5" /> 02:41:32
                    </span>
                    <button className="px-2.5 py-1 rounded bg-slate-700 text-slate-200 flex items-center gap-1">
                      <Calculator className="w-3.5 h-3.5" /> Calc
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-3 bg-slate-800/60 p-5 rounded-2xl border border-slate-700/50">
                    <span className="text-[10px] text-slate-400 font-mono">Question 12 of 65 (Multiple Choice Question)</span>
                    <p className="text-sm font-medium text-slate-100 mt-2 mb-4 leading-relaxed">
                      Which of the following routing algorithms suffers from the count-to-infinity problem?
                    </p>
                    <div className="space-y-2 text-xs">
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-300">A. Link State Routing Algorithm</div>
                      <div className="p-3 rounded-xl bg-[#287BFF]/20 border border-[#287BFF] text-white font-semibold">B. Distance Vector Routing Algorithm</div>
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-300">C. Hierarchical Routing Algorithm</div>
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-300">D. Path Vector Routing Algorithm</div>
                    </div>
                  </div>

                  <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/40 text-xs">
                    <p className="font-bold text-slate-300 mb-3">Question Palette</p>
                    <div className="grid grid-cols-5 gap-1.5">
                      {Array.from({ length: 15 }).map((_, idx) => (
                        <div
                          key={idx}
                          className={`w-7 h-7 rounded text-[11px] font-bold flex items-center justify-center ${
                            idx === 11
                              ? 'bg-[#287BFF] text-white ring-2 ring-white'
                              : idx < 8
                              ? 'bg-emerald-500/30 text-emerald-300'
                              : 'bg-slate-700 text-slate-400'
                          }`}
                        >
                          {idx + 1}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 5: REVISION */}
            {activeTab === 'revision' && (
              <motion.div
                key="revision-demo"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center py-6"
              >
                <div className="text-center mb-4">
                  <span className="text-xs text-[#5CE1E6] font-bold uppercase tracking-wider">Spaced Flashcard Deck</span>
                  <h4 className="text-lg font-bold text-white mt-1">Computer Networks • 12 Cards Due</h4>
                </div>

                <div
                  onClick={() => setCardFlipped(!cardFlipped)}
                  className="w-full max-w-md h-52 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-6 flex flex-col justify-between items-center text-center cursor-pointer shadow-2xl hover:border-[#5CE1E6]/50 transition-all group"
                >
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                    {cardFlipped ? 'Answer (Click to flip)' : 'Question (Click to flip)'}
                  </span>

                  <p className="text-base font-semibold text-white">
                    {cardFlipped
                      ? 'SYN Flood attack overwhelms the server queue during the TCP 3-way handshake.'
                      : 'What security vulnerability is mitigated by TCP SYN Cookies?'}
                  </p>

                  <div className="flex items-center gap-1 text-xs text-[#5CE1E6] font-semibold group-hover:underline">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{cardFlipped ? 'Click to view question' : 'Click to reveal answer'}</span>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Footer Callout inside demo */}
          <div className="mt-8 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <span>Like what you see? Personalize this exact interface for your exam.</span>
            <button
              onClick={() => navigate('/signup')}
              className="px-6 py-2.5 rounded-full bg-[#287BFF] text-white font-semibold flex items-center gap-1.5 hover:bg-[#287BFF]/90 transition-all cursor-pointer shadow-md"
            >
              <span>Get full access now</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};
