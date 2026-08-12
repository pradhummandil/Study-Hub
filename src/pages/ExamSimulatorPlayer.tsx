import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Clock, Calculator, Bookmark, CheckCircle, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { SAMPLE_EXAM_CONFIGS, calculateExamSimulationResult } from '../lib/exam/examSimulator';

const SAMPLE_SIMULATION_QUESTIONS = [
  {
    id: 'q1',
    section: 'Computer Science & IT',
    topic: 'Computer Networks',
    question: 'Consider a network using CSMA/CD protocol with a bit rate of 10 Mbps and maximum segment length of 1 km. Signal velocity is 2 x 10^8 m/s. What is the minimum frame size?',
    options: ['A) 100 bits', 'B) 200 bits', 'C) 100 bytes', 'D) 64 bytes'],
    correctAnswer: 'B',
  },
  {
    id: 'q2',
    section: 'Computer Science & IT',
    topic: 'Computer Networks',
    question: 'What is the number of host addresses available in a subnetwork assigned with CIDR prefix /27?',
    options: ['A) 32', 'B) 30', 'C) 64', 'D) 16'],
    correctAnswer: 'B',
  },
  {
    id: 'q3',
    section: 'General Aptitude',
    topic: 'Quantitative Aptitude',
    question: 'If 3 men or 6 women can do a piece of work in 16 days, in how many days can 12 men and 8 women do the same work?',
    options: ['A) 3 days', 'B) 4 days', 'C) 5 days', 'D) 6 days'],
    correctAnswer: 'A',
  },
];

export default function ExamSimulatorPlayer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const config = SAMPLE_EXAM_CONFIGS.find((c) => c.id === id) || SAMPLE_EXAM_CONFIGS[0];

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({});
  const [timerSec, setTimerSec] = useState(config.durationMinutes * 60);
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcDisplay, setCalcDisplay] = useState('0');

  useEffect(() => {
    const timer = setInterval(() => {
      setTimerSec((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (optionLetter: string) => {
    setAnswers((prev) => ({ ...prev, [currentIdx]: optionLetter }));
  };

  const toggleReview = () => {
    setMarkedForReview((prev) => ({ ...prev, [currentIdx]: !prev[currentIdx] }));
  };

  const handleSubmitExam = () => {
    const timeSpent = config.durationMinutes * 60 - timerSec;
    const result = calculateExamSimulationResult(config, answers, SAMPLE_SIMULATION_QUESTIONS, timeSpent);
    sessionStorage.setItem(`exam_sim_result_${config.id}`, JSON.stringify(result));
    navigate(`/exam-simulator/result/${config.id}`);
  };

  const currentQ = SAMPLE_SIMULATION_QUESTIONS[currentIdx] || SAMPLE_SIMULATION_QUESTIONS[0];

  return (
    <div className="min-h-screen bg-[#041D29] text-white flex flex-col font-sans">
      <Helmet>
        <title>{config.title} | Realistic Simulation</title>
      </Helmet>

      {/* Calm Exam Top Header */}
      <header className="h-16 px-6 bg-[#062B3D] border-b border-cyan-500/20 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-[#5CE1E6]" />
          <div>
            <h1 className="text-sm font-bold text-white">{config.title}</h1>
            <span className="text-[11px] text-slate-400">Official Exam Environment</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {config.calculatorAllowed && (
            <button
              onClick={() => setShowCalculator(!showCalculator)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-semibold text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 hover:bg-slate-700"
            >
              <Calculator className="w-4 h-4" /> Calculator
            </button>
          )}

          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-amber-500/30 text-amber-400 font-mono font-bold text-sm">
            <Clock className="w-4 h-4" /> {formatTimer(timerSec)}
          </div>

          <button
            onClick={handleSubmitExam}
            className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors"
          >
            Submit Test
          </button>
        </div>
      </header>

      {/* Calculator Modal Overlay */}
      {showCalculator && (
        <div className="absolute top-20 right-6 z-40 w-64 bg-slate-900 border border-cyan-500/40 rounded-2xl p-4 shadow-2xl space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span>Scientific Calculator</span>
            <button onClick={() => setShowCalculator(false)} className="text-slate-500 hover:text-white">✕</button>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl text-right font-mono text-lg text-[#5CE1E6] truncate">
            {calcDisplay}
          </div>
          <div className="grid grid-cols-4 gap-2 text-xs font-bold">
            {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', 'C', '0', '=', '+'].map((btn) => (
              <button
                key={btn}
                onClick={() => {
                  if (btn === 'C') setCalcDisplay('0');
                  else if (btn === '=') {
                    try {
                      // Safe arithmetic evaluation
                      const sanitized = calcDisplay.replace(/[^0-9+\-*/.]/g, '');
                      const calcResult = Function(`"use strict"; return (${sanitized})`)();
                      setCalcDisplay(String(calcResult));
                    } catch {
                      setCalcDisplay('Error');
                    }
                  } else {
                    setCalcDisplay((prev) => (prev === '0' ? btn : prev + btn));
                  }
                }}
                className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white"
              >
                {btn}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Question Area */}
        <main className="flex-1 p-6 md:p-8 flex flex-col justify-between overflow-y-auto space-y-6">
          <div className="space-y-6">
            {/* Question Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                Question {currentIdx + 1} of {SAMPLE_SIMULATION_QUESTIONS.length} • {currentQ.section}
              </span>
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
            <div className="text-sm md:text-base font-medium text-slate-100 leading-relaxed">
              {currentQ.question}
            </div>

            {/* Options */}
            <div className="space-y-3 pt-4">
              {currentQ.options.map((opt, oIdx) => {
                const letter = opt.charAt(0);
                const isSelected = answers[currentIdx] === letter;
                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelectOption(letter)}
                    className={`w-full text-left p-4 rounded-2xl border text-xs md:text-sm font-medium transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-cyan-500/20 border-[#5CE1E6] text-cyan-300 shadow-md'
                        : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span>{opt}</span>
                    {isSelected && <CheckCircle className="w-4 h-4 text-[#5CE1E6]" />}
                  </button>
                );
              })}
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
              onClick={() => setCurrentIdx((prev) => Math.min(SAMPLE_SIMULATION_QUESTIONS.length - 1, prev + 1))}
              disabled={currentIdx === SAMPLE_SIMULATION_QUESTIONS.length - 1}
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
            
            <div className="grid grid-cols-4 gap-2.5">
              {SAMPLE_SIMULATION_QUESTIONS.map((_, qI) => {
                const isAns = !!answers[qI];
                const isRev = !!markedForReview[qI];
                const isCur = qI === currentIdx;

                let badgeStyle = 'bg-slate-900 border-slate-800 text-slate-400';
                if (isCur) badgeStyle = 'border-2 border-[#5CE1E6] text-white';
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
