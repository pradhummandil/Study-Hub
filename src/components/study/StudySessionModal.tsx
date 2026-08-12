import React, { useState, useEffect } from 'react';
import { X, Play, CheckCircle2, Star, Sparkles, BookOpen, Target, Clock, ArrowRight } from 'lucide-react';
import { saveSessionReflection } from '../../lib/intelligence/recommendationsV2';
import type { NextBestActionRecommendation } from '../../lib/intelligence/recommendationsV2';

interface StudySessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  recommendation: NextBestActionRecommendation;
  userId?: string;
}

export const StudySessionModal: React.FC<StudySessionModalProps> = ({
  isOpen,
  onClose,
  recommendation,
  userId = 'anon_user',
}) => {
  const [step, setStep] = useState<'goal' | 'learn' | 'practice' | 'revision' | 'reflection' | 'completed'>('goal');
  const [timerSeconds, setTimerSeconds] = useState(recommendation.estimatedMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [confidenceScore, setConfidenceScore] = useState<number>(4);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    let interval: any = null;
    if (isRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timerSeconds]);

  if (!isOpen) return null;

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFinishReflection = async () => {
    await saveSessionReflection(
      userId,
      recommendation.topicId,
      recommendation.topicTitle,
      recommendation.estimatedMinutes,
      confidenceScore,
      notes
    );
    setStep('completed');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative w-full max-w-xl rounded-3xl bg-[#062B3D] border border-cyan-500/30 p-6 md:p-8 text-white shadow-2xl overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Phase progress indicator */}
        <div className="flex items-center justify-between gap-1 mb-6 border-b border-cyan-500/20 pb-4 text-xs font-semibold text-slate-400">
          <span className={step === 'goal' ? 'text-[#5CE1E6] font-bold' : ''}>1. Goal</span>
          <span>→</span>
          <span className={step === 'learn' ? 'text-[#5CE1E6] font-bold' : ''}>2. Learn</span>
          <span>→</span>
          <span className={step === 'practice' ? 'text-[#5CE1E6] font-bold' : ''}>3. Practice</span>
          <span>→</span>
          <span className={step === 'revision' ? 'text-[#5CE1E6] font-bold' : ''}>4. Revision</span>
          <span>→</span>
          <span className={step === 'reflection' || step === 'completed' ? 'text-[#5CE1E6] font-bold' : ''}>5. Reflection</span>
        </div>

        {step === 'goal' && (
          <div className="space-y-6 py-2">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-cyan-500/20 text-[#5CE1E6] border border-cyan-500/30">
                <Target className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-bold tracking-wider text-cyan-400 uppercase">
                  Recommended Study Session
                </span>
                <h3 className="text-xl font-black text-white">{recommendation.topicTitle}</h3>
                <p className="text-xs text-slate-300">{recommendation.subject} • {recommendation.exam}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs space-y-2 text-slate-300">
              <p className="font-medium text-[#5CE1E6]">Why this session now?</p>
              <p>{recommendation.reasonText}</p>
              <div className="flex items-center gap-4 pt-2 text-slate-400">
                <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-amber-400" /> {recommendation.estimatedMinutes} Mins</span>
                <span className="flex items-center gap-1"><BookOpen className="w-4 h-4 text-indigo-400" /> Verified Material</span>
              </div>
            </div>

            <button
              onClick={() => {
                setStep('learn');
                setIsRunning(true);
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#5CE1E6] to-indigo-600 font-bold text-slate-950 flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-lg shadow-cyan-500/20"
            >
              <Play className="w-5 h-5 fill-slate-950" /> Start 45-Minute Session
            </button>
          </div>
        )}

        {step === 'learn' && (
          <div className="space-y-6 py-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-400">Phase 1: Concept Learning (15 Mins)</span>
              <span className="text-lg font-mono font-bold text-amber-400">{formatTimer(timerSeconds)}</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-cyan-500/30 text-sm space-y-3">
              <h4 className="font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#5CE1E6]" /> Key Concept Overview
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Review the core principles of {recommendation.topicTitle}. Focus on formula parameters, physical assumptions, and common competitive exam traps.
              </p>
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                onClick={() => setStep('goal')}
                className="text-xs font-semibold text-slate-400 hover:text-white"
              >
                Back
              </button>
              <button
                onClick={() => setStep('practice')}
                className="px-6 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-2 hover:bg-cyan-400 transition-colors"
              >
                Proceed to Practice <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 'practice' && (
          <div className="space-y-6 py-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-400">Phase 2: PYQ & Adaptive Practice (20 Mins)</span>
              <span className="text-lg font-mono font-bold text-amber-400">{formatTimer(timerSeconds)}</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-indigo-500/30 text-sm space-y-3">
              <h4 className="font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" /> Active Problem Solving
              </h4>
              <p className="text-xs text-slate-300">
                Solve 8 adaptive standard questions on {recommendation.topicTitle}. Track speed and verify step-by-step reasoning.
              </p>
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                onClick={() => setStep('learn')}
                className="text-xs font-semibold text-slate-400 hover:text-white"
              >
                Back
              </button>
              <button
                onClick={() => setStep('revision')}
                className="px-6 py-2.5 rounded-xl bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 hover:bg-indigo-400 transition-colors"
              >
                Proceed to Revision <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 'revision' && (
          <div className="space-y-6 py-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400">Phase 3: Mistake Review & Notes (10 Mins)</span>
              <span className="text-lg font-mono font-bold text-amber-400">{formatTimer(timerSeconds)}</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-emerald-500/30 text-sm space-y-3">
              <h4 className="font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" /> High-Yield Summary
              </h4>
              <p className="text-xs text-slate-300">
                Reinforce formulas, add key learnings to your Mistake Notebook, and verify high-frequency exam mnemonics.
              </p>
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                onClick={() => setStep('practice')}
                className="text-xs font-semibold text-slate-400 hover:text-white"
              >
                Back
              </button>
              <button
                onClick={() => setStep('reflection')}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-2 hover:bg-emerald-400 transition-colors"
              >
                Complete & Reflect <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 'reflection' && (
          <div className="space-y-6 py-2">
            <div>
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Phase 5: Session Reflection</span>
              <h3 className="text-lg font-bold text-white mt-1">How confident are you in this topic now?</h3>
              <p className="text-xs text-slate-400">This empirical feedback directly updates your Study Hub Mastery Model V2.</p>
            </div>

            <div className="flex items-center justify-center gap-3 py-3">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  onClick={() => setConfidenceScore(score)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-2xl border transition-all ${
                    confidenceScore === score
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 scale-110'
                      : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  <Star className={`w-6 h-6 ${confidenceScore >= score ? 'fill-amber-400 text-amber-400' : ''}`} />
                  <span className="text-xs font-bold">{score}</span>
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Session Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What concept or trick gave you clarity today?"
                rows={2}
                className="w-full rounded-xl bg-slate-900/80 border border-cyan-500/30 p-3 text-xs text-white focus:outline-none focus:border-[#5CE1E6]"
              />
            </div>

            <button
              onClick={handleFinishReflection}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-500 font-bold text-slate-950 hover:brightness-110 transition-all shadow-lg"
            >
              Save Session & Update Mastery
            </button>
          </div>
        )}

        {step === 'completed' && (
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-white">Study Session Completed!</h3>
            <p className="text-xs text-slate-300 max-w-md">
              Awesome work! Your mastery score for <strong>{recommendation.topicTitle}</strong> has been updated, and 25 XP has been added to your profile.
            </p>
            <button
              onClick={onClose}
              className="px-8 py-3 rounded-2xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
