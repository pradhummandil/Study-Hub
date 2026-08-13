import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Cpu, Sparkles, Send, CheckCircle2, ArrowRight, RefreshCw, HelpCircle, Layers, Bookmark } from 'lucide-react';
import { AIOrb, type AIOrbState } from '../ui/motion/AIOrb';

export const StudyMateShowcase: React.FC = () => {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  const [aiState, setAiState] = useState<AIOrbState>('thinking');
  const [userQuery, setUserQuery] = useState('Explain TCP congestion control simply with real-world analogy.');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (isInView) {
      const timer1 = setTimeout(() => {
        setAiState('generating');
      }, 1000);
      const timer2 = setTimeout(() => {
        setAiState('complete');
      }, 2200);
      const timer3 = setTimeout(() => {
        setAiState('idle');
      }, 3500);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [isInView]);

  const handlePromptSubmit = (promptText?: string) => {
    if (promptText) setUserQuery(promptText);
    setAiState('thinking');
    setActionFeedback(null);

    setTimeout(() => {
      setAiState('generating');
    }, 1000);

    setTimeout(() => {
      setAiState('complete');
    }, 2200);

    setTimeout(() => {
      setAiState('idle');
    }, 3500);
  };

  const handleAction = (actionName: string, path?: string) => {
    setActionFeedback(`Triggered: ${actionName}`);
    setTimeout(() => setActionFeedback(null), 2500);
    if (path) {
      navigate(path);
    }
  };

  return (
    <section ref={sectionRef} className="py-20 md:py-28 bg-[#10233F] text-[#FCFBF8] relative overflow-hidden border-b border-white/10">
      
      {/* Background Restrained Glow Orbs */}
      <div className="absolute top-1/2 -left-20 -translate-y-1/2 w-[400px] h-[400px] bg-radial from-[#4E88B7]/15 via-[#1F5F8B]/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-radial from-[#FCDAB7]/10 via-transparent to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 md:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#4E88B7]/20 border border-[#4E88B7]/30 text-[#4E88B7] text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#FCDAB7]" />
            <span>AI-Powered Learning Companion</span>
          </div>

          <h2
            className="text-4xl sm:text-5xl md:text-6xl font-normal text-white tracking-tight"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Meet StudyMate AI.
          </h2>

          <p className="text-base sm:text-lg text-white/75 mt-4 leading-relaxed">
            Your personal 24/7 study partner for explanations, practice, revision and planning — around the exam, subjects and goals that matter to you.
          </p>
        </div>

        {/* Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column — Interactive Simulated Chat UI */}
          <div className="lg:col-span-7 bg-white/06 rounded-3xl p-6 sm:p-8 border border-white/12 shadow-2xl backdrop-blur-xl relative">
            
            {/* Top Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6 text-xs text-white/70">
              <div className="flex items-center gap-3">
                <AIOrb state={aiState} size={36} />
                <div>
                  <p className="font-semibold text-white">StudyMate Assistant</p>
                  <p className="text-[10px] text-[#4E88B7] uppercase tracking-wider">
                    {aiState === 'thinking' ? 'Thinking...' : aiState === 'generating' ? 'Generating answer...' : aiState === 'complete' ? 'Response complete' : 'Idle'}
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-[#4E88B7]/20 text-[#4E88B7] font-semibold text-[11px] border border-[#4E88B7]/30">
                Interactive preview
              </span>
            </div>

            {/* Chat Conversation */}
            <div className="space-y-4 min-h-[300px] flex flex-col justify-end">
              
              {/* User Message */}
              <div className="bg-white/10 p-4 rounded-2xl border border-white/10 max-w-lg ml-auto text-xs sm:text-sm text-white">
                <p className="font-semibold text-white/60 text-[11px] mb-1">Student Question:</p>
                <p>{userQuery}</p>
              </div>

              {/* AI Response Container */}
              <div className="bg-[#10233F] p-5 rounded-2xl border border-[#4E88B7]/30 max-w-xl text-xs sm:text-sm text-white space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-[#4E88B7]" />
                    <span className="font-semibold text-[#4E88B7]">StudyMate:</span>
                  </div>
                  {actionFeedback && (
                    <span className="text-[11px] text-[#FCDAB7] bg-[#FCDAB7]/10 px-2 py-0.5 rounded border border-[#FCDAB7]/30">
                      {actionFeedback}
                    </span>
                  )}
                </div>

                {aiState === 'thinking' ? (
                  <div className="flex items-center gap-3 py-4 text-white/70">
                    <span className="text-xs">Analyzing TCP window mechanics & network congestion...</span>
                  </div>
                ) : aiState === 'generating' ? (
                  <div className="flex items-center gap-3 py-2 text-[#4E88B7]">
                    <span className="text-xs font-medium animate-pulse">Streaming response content...</span>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-3 leading-relaxed text-white/85"
                  >
                    <p>
                      Think of TCP congestion control like regulating traffic flow on a busy highway:
                    </p>
                    <div className="bg-white/5 p-3 rounded-xl border border-white/10 space-y-1.5 text-xs text-white/80">
                      <p><strong className="text-[#4E88B7]">1. Slow Start:</strong> Probe network capacity by doubling window size each round trip.</p>
                      <p><strong className="text-[#4E88B7]">2. Congestion Avoidance:</strong> Switch to linear growth (+1 MSS) once threshold is reached.</p>
                      <p><strong className="text-[#4E88B7]">3. Fast Recovery:</strong> 3 duplicate ACKs trigger instant retransmission without waiting for timeout.</p>
                    </div>

                    {/* Phase J — Actionable Related Buttons */}
                    <div className="pt-3 border-t border-white/10 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handlePromptSubmit('Explain TCP congestion control again with simpler visual diagram.')}
                        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white/90 text-[11px] font-medium transition-colors flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3 h-3 text-[#4E88B7]" />
                        <span>Explain again</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAction('Quiz me', '/practice')}
                        className="px-3 py-1.5 rounded-lg bg-[#1F5F8B]/40 hover:bg-[#1F5F8B]/60 text-white text-[11px] font-medium transition-colors flex items-center gap-1.5 border border-[#4E88B7]/30"
                      >
                        <HelpCircle className="w-3 h-3 text-[#FCDAB7]" />
                        <span>Quiz me</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAction('Make flashcards', '/flashcards')}
                        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white/90 text-[11px] font-medium transition-colors flex items-center gap-1.5"
                      >
                        <Layers className="w-3 h-3 text-[#4E88B7]" />
                        <span>Make flashcards</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAction('Save for revision', '/revision')}
                        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white/90 text-[11px] font-medium transition-colors flex items-center gap-1.5"
                      >
                        <Bookmark className="w-3 h-3 text-[#FCDAB7]" />
                        <span>Save for revision</span>
                      </button>
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
                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#4E88B7]"
              />
              <button
                type="button"
                onClick={() => handlePromptSubmit()}
                className="p-2.5 rounded-xl bg-[#1F5F8B] text-white hover:bg-[#1F5F8B]/80 transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Right Column — AI Capabilities Highlights */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white/06 p-6 rounded-3xl border border-white/12 backdrop-blur-md">
              <h3 className="text-xl font-bold text-white mb-4">Why StudyMate is different:</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-[#4E88B7]/20 text-[#4E88B7] shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Syllabus-Aligned Answers</h4>
                    <p className="text-xs text-white/70 mt-0.5">Doesn't give generic internet explanations. Answers specifically for GATE, JEE, NEET, or your university branch.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-[#1F5F8B]/30 text-[#4E88B7] shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Step-by-Step PYQ Solution Breakdown</h4>
                    <p className="text-xs text-white/70 mt-0.5">Stuck on a numerical? StudyMate breaks down mathematical steps line-by-line.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-[#F7E7D0]/20 text-[#FCDAB7] shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Instant Flashcard Generation</h4>
                    <p className="text-xs text-white/70 mt-0.5">Turn any explanation into spaced repetition flashcards with a single click.</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => navigate('/study-ai')}
                  className="w-full py-3.5 rounded-full gradient-cta text-white font-semibold text-sm shadow-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 cursor-pointer"
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


