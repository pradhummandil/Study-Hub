// src/pages/MockTestPlayer.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Clock, ArrowLeft, ArrowRight, Bookmark, Send
} from 'lucide-react';
import { getMockTestById, loadMockStateLocally, syncMockStateToSupabase, submitMockAttempt } from '../lib/mockApi';
import { fetchPracticeQuestions } from '../lib/practiceApi';
import type { MockTest, PracticeQuestion } from '../types/student-core';

export default function MockTestPlayer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [mockTest, setMockTest] = useState<MockTest | null>(null);
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Test State
  const [attemptId] = useState<string>(() => `attempt_${id}_${Date.now()}`);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(1800); // default 30 min
  const [timeSpentSeconds, setTimeSpentSeconds] = useState<number>(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load test & questions
  useEffect(() => {
    async function initTest() {
      if (!id) return;
      setLoading(true);
      const test = await getMockTestById(id);
      setMockTest(test);
      if (test) {
        setTimeLeftSeconds(test.duration_minutes * 60);
      }
      const qList = await fetchPracticeQuestions({ exam: test?.exam || 'GATE', limit: test?.total_questions || 15 });
      setQuestions(qList);

      // Check if previous attempt state exists in local storage
      const restored = loadMockStateLocally(id);
      if (restored) {
        setUserAnswers(restored.answers || {});
        setMarkedForReview(restored.markedForReview || {});
        setTimeSpentSeconds(restored.timeSpentSeconds || 0);
      }

      setLoading(false);
    }
    initTest();
  }, [id]);

  // Countdown timer loop
  useEffect(() => {
    if (loading || !mockTest || showSubmitModal) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
      setTimeSpentSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, mockTest, showSubmitModal]);

  // Auto-save test state to Supabase / LocalStorage (debounced every 5 seconds)
  useEffect(() => {
    if (!id || loading) return;
    const saveTimer = setTimeout(() => {
      syncMockStateToSupabase({
        attemptId,
        mockTestId: id,
        answers: userAnswers,
        markedForReview,
        timeSpentSeconds,
      });
    }, 2000);

    return () => clearTimeout(saveTimer);
  }, [id, userAnswers, markedForReview, timeSpentSeconds, loading, attemptId]);

  const handleSelectOption = (optKey: string) => {
    if (!currentQ) return;
    if (currentQ.question_type === 'MSQ') {
      const currentList: string[] = userAnswers[currentQ.id] || [];
      const updated = currentList.includes(optKey)
        ? currentList.filter((k) => k !== optKey)
        : [...currentList, optKey];
      setUserAnswers({ ...userAnswers, [currentQ.id]: updated });
    } else {
      setUserAnswers({ ...userAnswers, [currentQ.id]: optKey });
    }
  };

  const handleNumericalInput = (val: string) => {
    if (!currentQ) return;
    setUserAnswers({ ...userAnswers, [currentQ.id]: val });
  };

  const handleAutoSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    if (!mockTest) return;

    const result = await submitMockAttempt(
      attemptId,
      mockTest,
      questions,
      userAnswers,
      markedForReview,
      timeSpentSeconds
    );
    navigate(`/mock-tests/${id}/result`, { state: { result, mockTest } });
  };

  const handleConfirmSubmit = async () => {
    await handleAutoSubmit();
  };

  if (loading || !mockTest) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-3 h-3 rounded-full bg-muted-foreground skeleton-pulse" />
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(userAnswers).length;
  const markedCount = Object.values(markedForReview).filter(Boolean).length;
  const unansweredCount = questions.length - answeredCount;

  const minutesLeft = Math.floor(timeLeftSeconds / 60);
  const secondsLeft = timeLeftSeconds % 60;

  return (
    <>
      <Helmet>
        <title>{`${mockTest.title} — Mock Test Player | Study Hub`}</title>
      </Helmet>

      <div className="min-h-screen bg-background px-6 pt-6 pb-24 max-w-6xl mx-auto flex flex-col justify-between">
        {/* Test Header Bar */}
        <div className="liquid-glass-card rounded-2xl p-4 border border-white/10 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-base sm:text-lg font-semibold text-foreground">{mockTest.title}</h1>
            <p className="text-xs text-muted-foreground">{mockTest.exam} • {questions.length} Questions</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Timer Badge */}
            <div className={`liquid-glass px-4 py-2 rounded-xl border flex items-center gap-2 font-mono font-bold text-sm ${
              timeLeftSeconds < 300 ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse' : 'text-cyan-300 border-cyan-500/30'
            }`}>
              <Clock className="w-4 h-4" />
              <span>{String(minutesLeft).padStart(2, '0')}:{String(secondsLeft).padStart(2, '0')}</span>
            </div>

            <button
              onClick={() => setShowSubmitModal(true)}
              className="gradient-cta rounded-full px-5 py-2 text-xs text-black font-semibold hover:scale-105 transition-transform flex items-center gap-1.5 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              Submit Test
            </button>
          </div>
        </div>

        {/* Main Grid: Question Player + Question Palette */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
          
          {/* Left 3 Columns: Question Screen */}
          <div className="lg:col-span-3 space-y-6">
            {currentQ && (
              <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="text-xs text-cyan-400 font-mono font-semibold">
                    Question {currentIndex + 1} of {questions.length} ({currentQ.question_type})
                  </span>
                  <button
                    onClick={() => setMarkedForReview((prev) => ({ ...prev, [currentQ.id]: !prev[currentQ.id] }))}
                    className={`text-xs px-3 py-1 rounded-full transition-all flex items-center gap-1.5 ${
                      markedForReview[currentQ.id]
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    {markedForReview[currentQ.id] ? 'Marked for Review' : 'Mark for Review'}
                  </button>
                </div>

                <div className="text-base sm:text-lg text-foreground font-normal leading-relaxed">
                  {currentQ.question_text}
                </div>

                {/* Option selection */}
                <div className="space-y-3 pt-2">
                  {currentQ.question_type === 'Numerical' ? (
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Your Answer:</label>
                      <input
                        type="text"
                        placeholder="Enter numerical answer"
                        value={userAnswers[currentQ.id] || ''}
                        onChange={(e) => handleNumericalInput(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-base text-foreground font-mono focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  ) : (
                    currentQ.options?.map((opt, optIdx) => {
                      const optKey = String.fromCharCode(65 + optIdx);
                      const isSel = Array.isArray(userAnswers[currentQ.id])
                        ? userAnswers[currentQ.id].includes(optKey)
                        : userAnswers[currentQ.id] === optKey;

                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectOption(optKey)}
                          className={`w-full text-left p-4 rounded-2xl border text-sm transition-all ${
                            isSel
                              ? 'bg-cyan-500/10 border-cyan-400 text-foreground ring-1 ring-cyan-400/50 font-semibold'
                              : 'liquid-glass border-white/10 hover:border-white/30 text-foreground'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
                className="liquid-glass rounded-full px-5 py-2 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Previous
              </button>

              <button
                onClick={() => setCurrentIndex(Math.min(questions.length - 1, currentIndex + 1))}
                disabled={currentIndex === questions.length - 1}
                className="gradient-cta rounded-full px-6 py-2 text-xs text-black font-semibold hover:scale-105 transition-transform disabled:opacity-50 flex items-center gap-1.5"
              >
                Next Question <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Question Palette */}
          <div className="space-y-6">
            <div className="liquid-glass-card rounded-3xl p-6 border border-white/10 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Question Palette</h3>
              
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => {
                  const isAns = userAnswers[q.id] !== undefined && userAnswers[q.id] !== '';
                  const isMarked = !!markedForReview[q.id];
                  const isCurrent = idx === currentIndex;

                  let colorClass = 'liquid-glass border-white/10 text-muted-foreground';
                  if (isCurrent) colorClass = 'border-cyan-400 text-cyan-300 ring-2 ring-cyan-400/50 font-bold';
                  else if (isAns) colorClass = 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-semibold';
                  else if (isMarked) colorClass = 'bg-amber-500/20 border-amber-500/40 text-amber-300';

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-10 rounded-xl border text-xs flex items-center justify-center transition-all ${colorClass}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-white/10 space-y-2 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-md bg-emerald-500/30 border border-emerald-400 inline-block" /> Answered ({answeredCount})</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-md bg-amber-500/30 border border-amber-400 inline-block" /> Marked ({markedCount})</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-md bg-white/5 border border-white/20 inline-block" /> Unanswered ({unansweredCount})</div>
              </div>
            </div>
          </div>

        </div>

        {/* Submit Confirmation Modal */}
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="liquid-glass-card rounded-3xl p-8 max-w-md w-full border border-white/20 space-y-6 shadow-2xl animate-fade-rise">
              <h3 className="text-2xl font-normal text-foreground" style={{ fontFamily: "'Instrument Serif', serif" }}>
                Submit Mock Test?
              </h3>

              <div className="space-y-3 text-xs">
                <div className="liquid-glass p-3 rounded-xl flex justify-between">
                  <span className="text-muted-foreground">Answered Questions:</span>
                  <span className="font-semibold text-emerald-400">{answeredCount} / {questions.length}</span>
                </div>
                <div className="liquid-glass p-3 rounded-xl flex justify-between">
                  <span className="text-muted-foreground">Marked for Review:</span>
                  <span className="font-semibold text-amber-400">{markedCount}</span>
                </div>
                <div className="liquid-glass p-3 rounded-xl flex justify-between">
                  <span className="text-muted-foreground">Unanswered:</span>
                  <span className="font-semibold text-rose-400">{unansweredCount}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Continue Test
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirmSubmit}
                  className="gradient-cta rounded-full px-6 py-2 text-xs text-black font-semibold"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Test Now'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
