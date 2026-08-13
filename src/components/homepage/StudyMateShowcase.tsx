import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Cpu, Sparkles, Send, CheckCircle2, ArrowRight } from 'lucide-react';

export const StudyMateShowcase: React.FC = () => {
  const navigate = useNavigate();

  // Simulated interactive chat state
  const [typingState, setTypingState] = useState<'typing' | 'done'>('typing');
  const [userQuery, setUserQuery] = useState('Explain TCP congestion control simply with real-world analogy.');

  useEffect(() => {
    const timer = setTimeout(() => {
      setTypingState('done');
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="py-20 md:py-28 bg-[#062B3D] text-white relative overflow-hidden border-b border-white/10">
      
      {/* Background Decorative Glow Orbs */}
      <div className="absolute top-1/2 -left-20 -translate-y-1/2 w-[400px] h-[400px] bg-radial from-[#5CE1E6]/15 via-[#287BFF]/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-radial from-[#6F7CFF]/15 via-transparent to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 md:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#5CE1E6]/10 border border-[#5CE1E6]/30 text-[#5CE1E6] text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Learning Companion</span>
          </div>

          <h2
            className="text-4xl sm:text-5xl md:text-6xl font-normal text-white tracking-tight"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Meet StudyMate AI.
          </h2>

          <p className="text-base sm:text-lg text-slate-300 mt-4 leading-relaxed">
            Your personal 24/7 study partner for instant explanations, customized practice questions, revision summaries, and exam guidance.
          </p>
        </div>

        {/* Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column — Interactive Simulated Chat UI */}
          <div className="lg:col-span-7 bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl backdrop-blur-xl relative">
            
            {/* Top Bar with Prominent "Interactive preview" label */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6 text-xs text-slate-300">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#5CE1E6] to-[#6F7CFF] flex items-center justify-center text-[#062B3D] font-bold">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-white">StudyMate Assistant</p>
                  <p className="text-[10px] text-[#5CE1E6]">Context-aware exam AI</p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-[#5CE1E6]/20 text-[#5CE1E6] font-semibold text-[11px] border border-[#5CE1E6]/30">
                Interactive preview
              </span>
            </div>

            {/* Chat Conversation */}
            <div className="space-y-4 min-h-[300px] flex flex-col justify-end">
              
              {/* User Message */}
              <div className="bg-white/10 p-4 rounded-2xl border border-white/10 max-w-lg ml-auto text-xs sm:text-sm text-slate-100">
                <p className="font-semibold text-slate-400 text-[11px] mb-1">Student Question:</p>
                <p>{userQuery}</p>
              </div>

              {/* AI Response */}
              <div className="bg-[#062B3D] p-5 rounded-2xl border border-[#5CE1E6]/30 max-w-xl text-xs sm:text-sm text-slate-100 space-y-3">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#5CE1E6]" />
                  <span className="font-bold text-[#5CE1E6]">StudyMate:</span>
                </div>

                {typingState === 'typing' ? (
                  <div className="flex items-center gap-1.5 py-2">
                    <span className="w-2 h-2 rounded-full bg-[#5CE1E6] animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-[#5CE1E6] animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 rounded-full bg-[#5CE1E6] animate-bounce [animation-delay:0.4s]" />
                    <span className="text-xs text-slate-400 ml-2">Analyzing TCP window mechanics...</span>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-2 leading-relaxed text-slate-200"
                  >
                    <p>
                      Think of network congestion control like regulating traffic flow on a busy highway:
                    </p>
                    <div className="bg-white/5 p-3 rounded-xl border border-white/10 space-y-1.5 text-xs text-slate-300">
                      <p><strong className="text-[#5CE1E6]">1. Slow Start:</strong> Probe network capacity by doubling window size each round trip.</p>
                      <p><strong className="text-[#5CE1E6]">2. Congestion Avoidance:</strong> Switch to linear growth (+1 MSS) once threshold is reached.</p>
                      <p><strong className="text-[#5CE1E6]">3. Fast Retransmit:</strong> 3 duplicate ACKs trigger instant retransmission without waiting for timeout.</p>
                    </div>
                  </motion.div>
                )}
              </div>

            </div>

            {/* Input Bar Preview */}
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-3">
              <input
                type="text"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder="Ask StudyMate anything about your syllabus..."
                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#5CE1E6]"
              />
              <button
                type="button"
                onClick={() => setTypingState('typing')}
                className="p-2.5 rounded-xl bg-[#287BFF] text-white hover:bg-[#287BFF]/90 transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Right Column — AI Capabilities Highlights */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-md">
              <h3 className="text-xl font-bold text-white mb-4">Why StudyMate is different:</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-[#5CE1E6]/10 text-[#5CE1E6] shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Syllabus-Aligned Answers</h4>
                    <p className="text-xs text-slate-300 mt-0.5">Doesn't give generic internet explanations. Answers specifically for GATE, JEE, NEET, or your university branch.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-[#287BFF]/10 text-[#287BFF] shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Step-by-Step PYQ Solution Breakdown</h4>
                    <p className="text-xs text-slate-300 mt-0.5">Stuck on a numerical? StudyMate breaks down mathematical steps line-by-line.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-[#6F7CFF]/10 text-[#6F7CFF] shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Instant Flashcard Generation</h4>
                    <p className="text-xs text-slate-300 mt-0.5">Turn any explanation into spaced repetition flashcards with a single click.</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => navigate('/signup')}
                  className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#5CE1E6] via-[#287BFF] to-[#6F7CFF] text-[#062B3D] font-bold text-sm shadow-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Start studying with StudyMate AI</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
