import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Cpu, Sparkles, CheckCircle2, ArrowRight, HelpCircle, Layers } from 'lucide-react';
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
    <section ref={sectionRef} className="py-20 md:py-28 bg-[#1B3022] text-[#FFFFFF] relative overflow-hidden border-b border-[#FFFFFF]/10">
      
      <div className="max-w-6xl mx-auto px-6 md:px-8 relative z-10">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2D5A3F]/50 border border-[#2D5A3F] text-[#D4AF37] text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>AI-Powered Learning Companion</span>
          </div>

          <h2
            className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-[#FFFFFF] tracking-tight"
          >
            Meet StudyMate AI.
          </h2>

          <p className="text-base sm:text-lg text-[#EDE8DB] mt-4 leading-relaxed font-sans">
            Your personal 24/7 study partner for explanations, practice, revision and planning — around the exam, subjects and goals that matter to you.
          </p>
        </motion.div>

        {/* Showcase Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
        >
          {/* Interactive AI Query Box */}
          <div className="lg:col-span-7 bg-[#1C201D] border border-[#FFFFFF]/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#FFFFFF]/10 pb-3">
              <div className="flex items-center gap-3">
                <AIOrb state={aiState} size={40} />
                <div>
                  <h4 className="text-xs font-bold text-[#FFFFFF]">StudyMate Assistant</h4>
                  <span className="text-[10px] text-[#EDE8DB] uppercase tracking-wider font-mono">{aiState}</span>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-[#2D5A3F]/30 text-[#D4AF37] text-[10px] font-bold border border-[#2D5A3F]">
                Interactive preview
              </span>
            </div>

            <div className="space-y-3 font-sans text-xs">
              <div className="p-3.5 rounded-2xl bg-[#FFFFFF]/5 border border-[#FFFFFF]/10">
                <span className="text-[10px] text-[#D4AF37] font-bold uppercase block mb-1">Student Question:</span>
                <p className="text-[#FFFFFF]">{userQuery}</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#2D5A3F]/20 border border-[#2D5A3F]/40 space-y-3">
                <div className="flex items-center gap-2 text-[#D4AF37] font-bold">
                  <Cpu className="w-4 h-4 text-[#C86D51]" />
                  <span>StudyMate:</span>
                </div>

                <p className="text-[#EDE8DB] leading-relaxed">
                  Think of TCP congestion control like regulating traffic flow on a busy highway:
                </p>

                <div className="space-y-1.5 text-[11px] text-[#EDE8DB]">
                  <p><strong className="text-[#FFFFFF]">1. Slow Start:</strong> Probe network capacity by doubling window size each round trip.</p>
                  <p><strong className="text-[#FFFFFF]">2. Congestion Avoidance:</strong> Switch to linear growth (+1 MSS) once threshold is reached.</p>
                  <p><strong className="text-[#FFFFFF]">3. Fast Recovery:</strong> 3 duplicate ACKs trigger instant retransmission without waiting for timeout.</p>
                </div>

                {/* Instant Actions Bar */}
                <div className="flex items-center gap-2 pt-2 border-t border-[#FFFFFF]/10 flex-wrap">
                  <button
                    onClick={() => handleAction('Practice Questions', '/practice')}
                    className="px-3 py-1.5 rounded-xl bg-[#2D5A3F] text-[#FFFFFF] text-[11px] font-bold flex items-center gap-1 shadow-sm"
                  >
                    <HelpCircle className="w-3.5 h-3.5" /> Practice Questions
                  </button>
                  <button
                    onClick={() => handleAction('Generate Flashcards', '/flashcards')}
                    className="px-3 py-1.5 rounded-xl bg-[#EDE8DB] text-[#1C201D] text-[11px] font-bold flex items-center gap-1"
                  >
                    <Layers className="w-3.5 h-3.5 text-[#2D5A3F]" /> Save Flashcard
                  </button>
                </div>
              </div>
            </div>

            {/* Prompt Selector Pills */}
            <div className="pt-2">
              <span className="text-[10px] text-[#EDE8DB] font-semibold block mb-2">Try another sample question:</span>
              <div className="flex flex-wrap gap-2 text-[11px]">
                {[
                  'Explain Selection Sort vs QuickSort with time complexity.',
                  'Solve GATE 2023 question on virtual memory paging.',
                  'Give 3 key memory tricks for Organic Chemistry mechanisms.',
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => handlePromptSubmit(q)}
                    className="px-3 py-1.5 rounded-xl bg-[#FFFFFF]/5 hover:bg-[#2D5A3F]/30 text-[#EDE8DB] border border-[#FFFFFF]/10 text-left transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {actionFeedback && (
              <div className="p-2 rounded-lg bg-[#2D5A3F] text-[#FFFFFF] text-xs font-bold text-center animate-fade-rise">
                {actionFeedback}
              </div>
            )}
          </div>

          {/* Right Column: Why StudyMate is different */}
          <div className="lg:col-span-5 space-y-6">
            <h3 className="text-2xl font-serif font-bold text-[#FFFFFF]">Why StudyMate is different:</h3>

            <div className="space-y-4 text-xs font-sans">
              <div className="p-4 rounded-2xl bg-[#1C201D] border border-[#FFFFFF]/10 space-y-1">
                <div className="flex items-center gap-2 font-bold text-[#FFFFFF] text-sm">
                  <CheckCircle2 className="w-4 h-4 text-[#2D5A3F]" />
                  <span>Syllabus-Aligned Answers</span>
                </div>
                <p className="text-[#EDE8DB] leading-relaxed">
                  Doesn't give generic internet explanations. Answers specifically for GATE, JEE, NEET, or your university branch.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#1C201D] border border-[#FFFFFF]/10 space-y-1">
                <div className="flex items-center gap-2 font-bold text-[#FFFFFF] text-sm">
                  <CheckCircle2 className="w-4 h-4 text-[#2D5A3F]" />
                  <span>Step-by-Step PYQ Solution Breakdown</span>
                </div>
                <p className="text-[#EDE8DB] leading-relaxed">
                  Stuck on a numerical? StudyMate breaks down mathematical steps line-by-line.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#1C201D] border border-[#FFFFFF]/10 space-y-1">
                <div className="flex items-center gap-2 font-bold text-[#FFFFFF] text-sm">
                  <CheckCircle2 className="w-4 h-4 text-[#2D5A3F]" />
                  <span>Instant Flashcard Generation</span>
                </div>
                <p className="text-[#EDE8DB] leading-relaxed">
                  Turn any explanation into spaced repetition flashcards with a single click.
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/study-ai')}
              className="w-full py-3 rounded-xl bg-[#C86D51] hover:bg-[#C86D51]/90 text-[#FFFFFF] font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <span>Open StudyMate AI Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
