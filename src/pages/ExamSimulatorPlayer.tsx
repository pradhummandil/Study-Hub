import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Clock, Calculator, Bookmark, CheckCircle, ArrowLeft, ArrowRight, ShieldCheck, WifiOff } from 'lucide-react';
import { useStudentContext } from '../context/StudentContext';
import { ScientificCalculator } from '../components/exam/ScientificCalculator';
import {
  getExamTestById,
  startOrCreateExamAttempt,
  saveExamAnswersProgress,
  completeAndGradeExamAttempt,
  type ExamTestSummary,
  type ExamAttemptRecord,
} from '../lib/exam/examSimulatorApi';
import type { PracticeQuestion } from '../types/student-core';

export default function ExamSimulatorPlayer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userId } = useStudentContext();

  const [test, setTest] = useState<ExamTestSummary | null>(null);
  const [attempt, setAttempt] = useState<ExamAttemptRecord | null>(null);
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({});
  const [timerSec, setTimerSec] = useState(180 * 60);
  const [showCalculator, setShowCalculator] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Online / Offline status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initialize Test Session
  useEffect(() => {
    async function initSession() {
      if (!id) return;
      setLoading(true);
      const testData = await getExamTestById(id);
      setTest(testData);

      const { attempt: attRecord, questions: qList } = await startOrCreateExamAttempt(id, userId);
      setAttempt(attRecord);
      setQuestions(qList);
      setAnswers(attRecord.answers || {});
      setMarkedForReview(attRecord.marked_for_review || {});

      // Derive timer from started_at and duration
      const startTime = new Date(attRecord.started_at).getTime();
      const elapsedSec = Math.floor((Date.now() - startTime) / 1000);
      const remainingSec = Math.max(0, testData.durationMinutes * 60 - elapsedSec);

      setTimerSec(remainingSec);
      setLoading(false);
    }
    initSession();
  }, [id, userId]);

  // Main Timer loop
  useEffect(() => {
    if (loading || !test) return;

    const timer = setInterval(() => {
      setTimerSec((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          void handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, test]);

  // Debounced Autosave Progress
  const saveTimeoutRef = useRef<any | null>(null);
  const triggerAutosave = (newAnswers: Record<number, string>, newReview: Record<number, boolean>) => {
    if (!attempt || !test) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(() => {
      const timeSpent = test.durationMinutes * 60 - timerSec;
      saveExamAnswersProgress(attempt.id, newAnswers, newReview, timeSpent);
    }, 500);
  };

  const handleSelectOption = (optionLetter: string) => {
    const nextAnswers = { ...answers, [currentIdx]: optionLetter };
    setAnswers(nextAnswers);
    triggerAutosave(nextAnswers, markedForReview);
  };

  const handleNumericalInput = (val: string) => {
    const nextAnswers = { ...answers, [currentIdx]: val };
    setAnswers(nextAnswers);
    triggerAutosave(nextAnswers, markedForReview);
  };

  const toggleReview = () => {
    const nextReview = { ...markedForReview, [currentIdx]: !markedForReview[currentIdx] };
    setMarkedForReview(nextReview);
    triggerAutosave(answers, nextReview);
  };

  const handleSubmitExam = async () => {
    if (!attempt || !test) return;
    const timeSpent = test.durationMinutes * 60 - timerSec;
    const completedRecord = await completeAndGradeExamAttempt(attempt.id, answers, markedForReview, timeSpent, test, questions);
    navigate(`/exam-simulator/result/${completedRecord.id}`);
  };

  const formatTimer = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading || !test || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#041D29] text-white">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mb-3" />
        <p className="text-xs text-slate-400">Loading authentic exam simulation environment...</p>
      </div>
    );
  }

  const currentQ = questions[currentIdx] || questions[0];

  return (
    <div className="min-h-screen bg-[#041D29] text-white flex flex-col font-sans relative overflow-hidden">
      <Helmet>
        <title>{`${test.title} | Realistic Simulation`}</title>
      </Helmet>

      {/* Network Disconnection Banner */}
      {isOffline && (
        <div className="bg-amber-500/20 border-b border-amber-500/40 px-4 py-2 text-xs text-amber-300 flex items-center justify-center gap-2 font-medium">
          <WifiOff className="w-4 h-4" /> Connection interrupted. Your answers are saved locally and will sync upon reconnecting.
        </div>
      )}

      {/* Calm Exam Top Header */}
      <header className="h-16 px-6 bg-[#062B3D] border-b border-cyan-500/20 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-[#5CE1E6]" />
          <div>
            <h1 className="text-sm font-bold text-white leading-tight">{test.title}</h1>
            <span className="text-[11px] text-slate-400">{test.exam} Official Environment</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {test.calculatorAllowed && (
            <button
              onClick={() => setShowCalculator(!showCalculator)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-semibold text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 hover:bg-slate-700"
            >
              <Calculator className="w-4 h-4 text-cyan-400" /> Scientific Calculator
            </button>
          )}

          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-amber-500/30 text-amber-400 font-mono font-bold text-sm">
            <Clock className="w-4 h-4" /> {formatTimer(timerSec)}
          </div>

          <button
            onClick={handleSubmitExam}
            className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors shadow-lg"
          >
            Submit Test
          </button>
        </div>
      </header>

      {/* GATE Scientific Calculator Component Overlay */}
      {showCalculator && test.calculatorAllowed && (
        <ScientificCalculator onClose={() => setShowCalculator(false)} />
      )}

      {/* Main Runner Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Question Area */}
        <main className="flex-1 p-6 md:p-8 flex flex-col justify-between overflow-y-auto space-y-6">
          <div className="space-y-6">
            {/* Question Header Metadata */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono">
                  Question {currentIdx + 1} of {questions.length}
                </span>
                <span className="text-xs text-slate-400">• {currentQ.subject}</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-slate-900 text-emerald-400 border border-emerald-500/20">
                  {currentQ.question_type}
                </span>
              </div>

              <button
                onClick={toggleReview}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                  markedForReview[currentIdx]
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                {markedForReview[currentIdx] ? 'Marked for Review' : 'Mark for Review'}
              </button>
            </div>

            {/* Question Statement */}
            <div className="text-base md:text-lg font-medium text-slate-100 leading-relaxed">
              {currentQ.question_text}
            </div>

            {/* Options / Input Field */}
            <div className="space-y-3 pt-4">
              {currentQ.question_type === 'Numerical' ? (
                <div className="max-w-md">
                  <label className="text-xs text-slate-400 mb-1 block">Enter Numerical Value:</label>
                  <input
                    type="text"
                    value={answers[currentIdx] || ''}
                    onChange={(e) => handleNumericalInput(e.target.value)}
                    placeholder="Type value (e.g. 52.4)"
                    className="w-full bg-slate-950 border border-cyan-500/30 rounded-xl px-4 py-3 text-base text-cyan-300 font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
              ) : (
                currentQ.options?.map((opt, oIdx) => {
                  const letter = opt.charAt(0);
                  const isSelected = answers[currentIdx] === letter;
                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectOption(letter)}
                      className={`w-full text-left p-4 rounded-2xl border text-xs md:text-sm font-medium transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-cyan-500/20 border-[#5CE1E6] text-cyan-300 shadow-md ring-1 ring-cyan-400'
                          : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span>{opt}</span>
                      {isSelected && <CheckCircle className="w-4 h-4 text-[#5CE1E6]" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Question Nav Bottom Bar */}
          <div className="flex items-center justify-between border-t border-slate-800 pt-4">
            <button
              onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className="px-5 py-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-300 disabled:opacity-30 hover:bg-slate-800 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Previous
            </button>

            <button
              onClick={() => setCurrentIdx((prev) => Math.min(questions.length - 1, prev + 1))}
              disabled={currentIdx === questions.length - 1}
              className="px-6 py-2.5 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold disabled:opacity-30 hover:bg-cyan-400 flex items-center gap-2"
            >
              Next Question <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </main>

        {/* Right: Question Palette Sidebar */}
        <aside className="w-72 bg-[#062B3D] border-l border-slate-800 p-5 flex flex-col justify-between hidden md:flex">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Question Palette</h3>

            <div className="grid grid-cols-4 gap-2">
              {questions.map((_, qI) => {
                const isAns = !!answers[qI];
                const isRev = !!markedForReview[qI];
                const isCur = qI === currentIdx;

                let badgeStyle = 'bg-slate-900 border-slate-800 text-slate-400';
                if (isCur) badgeStyle = 'border-2 border-[#5CE1E6] text-white font-bold';
                if (isAns) badgeStyle = 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold';
                if (isRev) badgeStyle = 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold';

                return (
                  <button
                    key={qI}
                    onClick={() => setCurrentIdx(qI)}
                    className={`h-10 rounded-xl text-xs font-mono flex items-center justify-center border transition-all ${badgeStyle}`}
                  >
                    {qI + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2 text-[11px] text-slate-400 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500/30 border border-emerald-500" /> Answered
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500/30 border border-amber-500" /> Marked for Review
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-800 border border-slate-700" /> Unanswered
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
