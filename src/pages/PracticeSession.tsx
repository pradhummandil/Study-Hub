// src/pages/PracticeSession.tsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowLeft, ArrowRight, CheckCircle2, Bookmark, Sparkles, AlertTriangle, RotateCcw
} from 'lucide-react';
import { fetchPracticeQuestions, recordQuestionAttempt, toggleSaveMistake, calculateSessionSummary } from '../lib/practiceApi';
import type { PracticeQuestion, PracticeSessionResult } from '../types/student-core';

export default function PracticeSession() {
  const { id: sessionId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const exam = searchParams.get('exam') || 'GATE';
  const subject = searchParams.get('subject') || 'Computer Networks';

  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [submittedQuestions, setSubmittedQuestions] = useState<Record<string, boolean>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [savedMistakes, setSavedMistakes] = useState<Record<string, boolean>>({});
  const [timeTakenMap, setTimeTakenMap] = useState<Record<string, number>>({});
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [summary, setSummary] = useState<PracticeSessionResult | null>(null);
  const [loading, setLoading] = useState(true);

  // Timer ref
  const currentQuestionStartTime = useRef<number>(Date.now());

  // Load questions and restore saved session state from localStorage if available
  useEffect(() => {
    async function loadSessionData() {
      setLoading(true);

      // Check for persisted local session state
      const sessionKey = `practice_session_state_${sessionId}`;
      const savedStateRaw = localStorage.getItem(sessionKey);

      const qList = await fetchPracticeQuestions({ exam, subject });
      setQuestions(qList);

      if (savedStateRaw) {
        try {
          const parsed = JSON.parse(savedStateRaw);
          setCurrentIndex(parsed.currentIndex || 0);
          setUserAnswers(parsed.userAnswers || {});
          setSubmittedQuestions(parsed.submittedQuestions || {});
          setMarkedForReview(parsed.markedForReview || {});
          setSavedMistakes(parsed.savedMistakes || {});
          setTimeTakenMap(parsed.timeTakenMap || {});
          if (parsed.sessionCompleted) {
            setSessionCompleted(true);
            setSummary(parsed.summary);
          }
        } catch {
          // ignore
        }
      }

      setLoading(false);
      currentQuestionStartTime.current = Date.now();
    }
    loadSessionData();
  }, [sessionId, exam, subject]);

  // Persist session state to localStorage on state changes
  useEffect(() => {
    if (!sessionId || loading || questions.length === 0) return;
    const sessionKey = `practice_session_state_${sessionId}`;
    const stateToSave = {
      currentIndex,
      userAnswers,
      submittedQuestions,
      markedForReview,
      savedMistakes,
      timeTakenMap,
      sessionCompleted,
      summary,
      updatedAt: Date.now(),
    };
    localStorage.setItem(sessionKey, JSON.stringify(stateToSave));
  }, [sessionId, currentIndex, userAnswers, submittedQuestions, markedForReview, savedMistakes, timeTakenMap, sessionCompleted, summary, loading, questions.length]);

  const currentQ = questions[currentIndex];

  // Track time spent on current question
  const recordCurrentQuestionTime = () => {
    if (!currentQ) return;
    const now = Date.now();
    const elapsed = Math.round((now - currentQuestionStartTime.current) / 1000);
    setTimeTakenMap((prev) => ({
      ...prev,
      [currentQ.id]: (prev[currentQ.id] || 0) + elapsed,
    }));
    currentQuestionStartTime.current = now;
  };

  const handleSelectOption = (optKey: string) => {
    if (!currentQ || submittedQuestions[currentQ.id]) return;

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
    if (!currentQ || submittedQuestions[currentQ.id]) return;
    setUserAnswers({ ...userAnswers, [currentQ.id]: val });
  };

  const handleCheckAnswer = async () => {
    if (!currentQ) return;
    recordCurrentQuestionTime();

    const userAns = userAnswers[currentQ.id];
    let isCorrect = false;

    if (Array.isArray(currentQ.correct_answer)) {
      if (Array.isArray(userAns)) {
        isCorrect =
          currentQ.correct_answer.length === userAns.length &&
          currentQ.correct_answer.every((val) => userAns.includes(val));
      }
    } else {
      isCorrect = String(userAns || '').trim().toUpperCase() === String(currentQ.correct_answer).trim().toUpperCase();
    }

    setSubmittedQuestions((prev) => ({ ...prev, [currentQ.id]: true }));

    await recordQuestionAttempt({
      question_id: currentQ.id,
      exam: currentQ.exam,
      subject: currentQ.subject,
      topic: currentQ.topic,
      user_answer: userAns,
      is_correct: isCorrect,
      time_taken_seconds: timeTakenMap[currentQ.id] || 10,
      marked_for_review: !!markedForReview[currentQ.id],
      saved_as_mistake: !!savedMistakes[currentQ.id],
    });
  };

  const handleToggleMistake = async () => {
    if (!currentQ) return;
    const nextSaved = !savedMistakes[currentQ.id];
    setSavedMistakes((prev) => ({ ...prev, [currentQ.id]: nextSaved }));
    await toggleSaveMistake(currentQ.id, nextSaved);
  };

  const handleAskStudyMate = () => {
    if (!currentQ) return;
    const userAns = userAnswers[currentQ.id];
    const promptText = `Please explain this ${currentQ.exam} question step by step:\n\nQuestion: ${currentQ.question_text}\nOptions: ${JSON.stringify(currentQ.options)}\nStudent's Answer: ${JSON.stringify(userAns)}\nCorrect Answer: ${JSON.stringify(currentQ.correct_answer)}\nOfficial Explanation: ${currentQ.explanation || 'N/A'}`;

    navigate('/study-ai', {
      state: {
        mode: 'Explain',
        prompt: promptText,
        subject: currentQ.subject,
      },
    });
  };

  const handleNext = () => {
    recordCurrentQuestionTime();
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleCompleteSession();
    }
  };

  const handlePrev = () => {
    recordCurrentQuestionTime();
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleCompleteSession = () => {
    recordCurrentQuestionTime();
    const summaryData = calculateSessionSummary(questions, userAnswers, timeTakenMap);
    setSummary(summaryData);
    setSessionCompleted(true);
  };

  const handleRetrySession = () => {
    const newSessionId = `practice_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    navigate(`/practice/session/${newSessionId}?exam=${exam}&subject=${encodeURIComponent(subject)}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mb-3" />
        <p className="text-xs text-muted-foreground">Preparing practice session...</p>
      </div>
    );
  }

  // Session Summary View
  if (sessionCompleted && summary) {
    return (
      <>
        <Helmet>
          <title>Session Results — Study Hub</title>
        </Helmet>
        <div className="px-6 pt-12 max-w-4xl mx-auto pb-24 text-center">
          <span className="text-xs uppercase tracking-widest text-emerald-400 font-semibold liquid-glass px-4 py-1.5 rounded-full inline-block mb-3 border border-emerald-500/20 font-mono">
            Session Completed
          </span>
          <h1
            className="text-4xl sm:text-5xl font-normal text-foreground tracking-tight"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Practice Session Results
          </h1>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 max-w-3xl mx-auto">
            <div className="liquid-glass-card rounded-2xl p-5 border border-white/10 text-center">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Accuracy</p>
              <p className="text-3xl font-semibold text-emerald-400 font-sans mt-1">{summary.accuracyPct}%</p>
            </div>
            <div className="liquid-glass-card rounded-2xl p-5 border border-white/10 text-center">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Correct</p>
              <p className="text-3xl font-semibold text-foreground font-sans mt-1">{summary.correctCount} / {summary.totalQuestions}</p>
            </div>
            <div className="liquid-glass-card rounded-2xl p-5 border border-white/10 text-center">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Time Spent</p>
              <p className="text-3xl font-semibold text-cyan-400 font-mono mt-1">
                {Math.floor(summary.totalTimeSeconds / 60)}m {summary.totalTimeSeconds % 60}s
              </p>
            </div>
            <div className="liquid-glass-card rounded-2xl p-5 border border-white/10 text-center">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Questions</p>
              <p className="text-3xl font-semibold text-foreground font-sans mt-1">{summary.totalQuestions}</p>
            </div>
          </div>

          {/* Strong / Weak Topics breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8 max-w-3xl mx-auto text-left">
            <div className="liquid-glass-card rounded-2xl p-6 border border-emerald-500/30">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-3 flex items-center gap-1.5 font-mono">
                <CheckCircle2 className="w-4 h-4" /> Strong Topics
              </h3>
              {summary.strongTopics.length > 0 ? (
                <ul className="space-y-1.5 text-xs text-foreground font-medium">
                  {summary.strongTopics.map((t) => <li key={t}>✓ {t}</li>)}
                </ul>
              ) : <p className="text-xs text-muted-foreground">Keep practicing to build strong topics!</p>}
            </div>

            <div className="liquid-glass-card rounded-2xl p-6 border border-rose-500/30">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-rose-400 mb-3 flex items-center gap-1.5 font-mono">
                <AlertTriangle className="w-4 h-4" /> Needs Attention
              </h3>
              {summary.weakTopics.length > 0 ? (
                <ul className="space-y-1.5 text-xs text-foreground font-medium">
                  {summary.weakTopics.map((t) => <li key={t}>• {t}</li>)}
                </ul>
              ) : <p className="text-xs text-muted-foreground">No weak topics in this session! Great job!</p>}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            <button
              onClick={handleRetrySession}
              className="gradient-cta rounded-full px-6 py-2.5 text-xs text-black font-semibold hover:scale-105 transition-transform flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" /> Retry Practice Session
            </button>
            <button
              onClick={() => navigate(`/practice?subject=${encodeURIComponent(subject)}`)}
              className="liquid-glass rounded-full px-6 py-2.5 text-xs text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/10 transition-colors"
            >
              Practice Weak Topics →
            </button>
            <button
              onClick={() => navigate('/study-ai')}
              className="liquid-glass rounded-full px-6 py-2.5 text-xs text-violet-300 border border-violet-500/30 hover:bg-violet-500/20 transition-colors inline-flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" /> Ask StudyMate AI
            </button>
            <Link
              to="/dashboard"
              className="liquid-glass rounded-full px-6 py-2.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </>
    );
  }

  if (!currentQ) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6">
        <h2 className="text-2xl font-normal text-foreground" style={{ fontFamily: "'Instrument Serif', serif" }}>
          No Questions Available
        </h2>
        <Link to="/practice" className="gradient-cta rounded-full px-6 py-2 text-xs text-black mt-4">
          Back to Practice Lobby
        </Link>
      </div>
    );
  }

  const isSubmitted = !!submittedQuestions[currentQ.id];
  const userAns = userAnswers[currentQ.id];

  return (
    <>
      <Helmet>
        <title>Question {currentIndex + 1} of {questions.length} — Practice | Study Hub</title>
      </Helmet>

      <div className="px-6 pt-8 max-w-4xl mx-auto pb-24 space-y-6">
        {/* Top Progress & Exam Metadata Bar */}
        <div className="flex items-center justify-between text-xs">
          <Link to="/practice" className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5">
            <ArrowLeft className="w-4 h-4" />
            Exit Practice
          </Link>

          <div className="flex items-center gap-3">
            <span className="liquid-glass px-3 py-1 rounded-full text-cyan-300 font-mono font-semibold border border-cyan-500/20">
              {currentQ.exam} {currentQ.year || ''}
            </span>
            <span className="text-muted-foreground font-medium">{currentQ.subject}</span>
          </div>

          <span className="font-mono text-foreground font-semibold">
            Question {currentIndex + 1} / {questions.length}
          </span>
        </div>

        {/* Question Card */}
        <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6 shadow-2xl">
          {/* Header Metadata */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2 text-xs">
              <span className="liquid-glass px-2.5 py-1 rounded-lg text-emerald-400 font-semibold border border-emerald-500/20 font-mono">
                {currentQ.question_type}
              </span>
              <span className="text-muted-foreground">• Topic: {currentQ.topic}</span>
              <span className="text-muted-foreground">• Difficulty: {currentQ.difficulty}</span>
            </div>

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

          {/* Question Text */}
          <div className="text-base sm:text-lg text-foreground font-normal leading-relaxed">
            {currentQ.question_text}
          </div>

          {/* Options / Input Field depending on Question Type */}
          <div className="space-y-3 pt-2">
            {currentQ.question_type === 'Numerical' ? (
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Enter Numerical Answer:</label>
                <input
                  type="text"
                  disabled={isSubmitted}
                  placeholder="e.g. 5 or 42.5"
                  value={userAns || ''}
                  onChange={(e) => handleNumericalInput(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-base text-foreground font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>
            ) : (
              currentQ.options?.map((opt, optIndex) => {
                const optKey = String.fromCharCode(65 + optIndex); // 'A', 'B', 'C', 'D'
                const isSelected = Array.isArray(userAns) ? userAns.includes(optKey) : userAns === optKey;

                let optClass = 'liquid-glass border-white/10 hover:border-white/30 text-foreground';
                if (isSubmitted) {
                  const isCorrectOpt = Array.isArray(currentQ.correct_answer)
                    ? currentQ.correct_answer.includes(optKey)
                    : String(currentQ.correct_answer).toUpperCase() === optKey;

                  if (isCorrectOpt) {
                    optClass = 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-semibold';
                  } else if (isSelected && !isCorrectOpt) {
                    optClass = 'bg-rose-500/20 border-rose-400 text-rose-300';
                  }
                } else if (isSelected) {
                  optClass = 'bg-cyan-500/10 border-cyan-400 text-foreground ring-1 ring-cyan-400/50 font-semibold';
                }

                return (
                  <button
                    key={optIndex}
                    disabled={isSubmitted}
                    onClick={() => handleSelectOption(optKey)}
                    className={`w-full text-left p-4 rounded-2xl border text-sm transition-all flex items-center justify-between ${optClass}`}
                  >
                    <span>{opt}</span>
                    {isSubmitted && (
                      Array.isArray(currentQ.correct_answer) ? currentQ.correct_answer.includes(optKey) : String(currentQ.correct_answer).toUpperCase() === optKey
                    ) && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>

          {/* Action Row: Check Answer */}
          {!isSubmitted ? (
            <div className="flex justify-end pt-4">
              <button
                onClick={handleCheckAnswer}
                disabled={userAns === undefined || userAns === ''}
                className="gradient-cta rounded-full px-6 py-2.5 text-xs text-black font-semibold hover:scale-105 transition-transform disabled:opacity-50"
              >
                Submit Answer
              </button>
            </div>
          ) : (
            /* Solution & Explanation Box */
            <div className="mt-6 p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4 animate-fade-rise">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-cyan-300 font-mono">Explanation & Verification</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleMistake}
                    className={`text-xs px-3 py-1 rounded-full border transition-all ${
                      savedMistakes[currentQ.id]
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'liquid-glass text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {savedMistakes[currentQ.id] ? 'Saved to Mistakes ✓' : 'Save to Mistakes'}
                  </button>
                  <button
                    onClick={handleAskStudyMate}
                    className="liquid-glass rounded-full px-3 py-1 text-xs text-violet-300 border border-violet-500/30 hover:bg-violet-500/20 transition-colors inline-flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Ask StudyMate
                  </button>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                {currentQ.explanation || 'Detailed solution step verification complete.'}
              </p>
            </div>
          )}
        </div>

        {/* Footer Navigation Bar */}
        <div className="flex items-center justify-between pt-4">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="liquid-glass rounded-full px-5 py-2 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Previous
          </button>

          {currentIndex < questions.length - 1 ? (
            <button
              onClick={handleNext}
              className="gradient-cta rounded-full px-6 py-2 text-xs text-black font-semibold hover:scale-105 transition-transform flex items-center gap-1.5"
            >
              Next Question <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleCompleteSession}
              className="gradient-cta rounded-full px-8 py-2.5 text-xs text-black font-semibold hover:scale-105 transition-transform"
            >
              Complete & View Results →
            </button>
          )}
        </div>
      </div>
    </>
  );
}
