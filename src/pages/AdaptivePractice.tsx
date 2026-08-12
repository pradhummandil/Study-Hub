import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Brain, Zap, ArrowRight } from 'lucide-react';
import type { PracticeQuestion, QuestionDifficulty } from '../types/student-core';
import { selectAdaptiveQuestions, determineNextDifficulty, generateSimilarQuestion } from '../lib/intelligence/adaptive';
import { recordQuestionAttempt } from '../lib/practiceApi';

export default function AdaptivePracticePage() {
  const [exam, setExam] = useState('GATE');

  // Session state
  const [sessionActive, setSessionActive] = useState(false);
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentDifficulty, setCurrentDifficulty] = useState<QuestionDifficulty>('Medium');
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [reasoning, setReasoning] = useState('');
  const [similarQuestion, setSimilarQuestion] = useState<PracticeQuestion | null>(null);

  const currentQ = sessionActive && questions.length > 0 ? questions[currentIndex] : null;

  async function handleStartSession() {
    const { questions: fetched, reason } = await selectAdaptiveQuestions({
      exam,
      totalQuestions: 10,
    });
    setQuestions(fetched);
    setReasoning(reason);
    setCurrentIndex(0);
    setCurrentDifficulty('Medium');
    setUserAnswers({});
    setShowExplanation(false);
    setSimilarQuestion(null);
    setSessionActive(true);
  }

  async function handleAnswerSubmit(qId: string, answer: any) {
    if (!currentQ) return;
    setUserAnswers((prev) => ({ ...prev, [qId]: answer }));
    setShowExplanation(true);

    let isCorrect = false;
    if (Array.isArray(currentQ.correct_answer)) {
      isCorrect = Array.isArray(answer) && currentQ.correct_answer.every((val) => answer.includes(val));
    } else {
      isCorrect = String(answer).trim().toUpperCase() === String(currentQ.correct_answer).trim().toUpperCase();
    }

    // Record attempt & trigger intelligence pipeline
    await recordQuestionAttempt({
      question_id: currentQ.id,
      exam: currentQ.exam,
      subject: currentQ.subject,
      topic: currentQ.topic,
      user_answer: answer,
      is_correct: isCorrect,
      time_taken_seconds: 45,
    });

    // Update dynamic difficulty
    const answeredCount = Object.keys(userAnswers).length + 1;
    const correctCount = Object.values(userAnswers).filter(Boolean).length + (isCorrect ? 1 : 0);
    const accuracyPct = Math.round((correctCount / answeredCount) * 100);

    const nextDiff = determineNextDifficulty({ recentAccuracyPct: accuracyPct });
    setCurrentDifficulty(nextDiff);

    // If incorrect, offer Practice Similar
    if (!isCorrect) {
      const sim = generateSimilarQuestion({
        topic: currentQ.topic,
        subject: currentQ.subject,
        exam: currentQ.exam,
        difficulty: nextDiff,
      });
      setSimilarQuestion(sim);
    }
  }

  function handleNextQuestion() {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setShowExplanation(false);
      setSimilarQuestion(null);
    } else {
      setSessionActive(false);
    }
  }

  return (
    <>
      <Helmet>
        <title>Adaptive Practice | Study Hub Intelligence</title>
        <meta name="description" content="Questions adapt dynamically based on your accuracy, topic mastery, and response speed." />
      </Helmet>

      <div className="min-h-screen pb-16 pt-6 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Zap className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Adaptive Practice Engine</h1>
              <p className="text-slate-400 text-sm mt-0.5">The next question depends on your previous performance.</p>
            </div>
          </div>
        </div>

        {!sessionActive ? (
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl text-center max-w-xl mx-auto">
            <Brain className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-100 mb-2">Smart Performance Drill</h2>
            <p className="text-slate-400 text-sm mb-6">
              Our intelligence engine selects weak topics and automatically scales question difficulty in real time.
            </p>

            <div className="space-y-4 text-left mb-8 text-sm">
              <div>
                <label className="text-slate-400 block mb-1 font-medium">Target Exam</label>
                <select
                  value={exam}
                  onChange={(e) => setExam(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:border-cyan-400 focus:outline-none"
                >
                  <option value="GATE">GATE</option>
                  <option value="JEE Main">JEE Main</option>
                  <option value="NEET">NEET</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleStartSession}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-base shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all transform hover:scale-105"
            >
              <Zap className="w-5 h-5 fill-current" /> Start Adaptive Session
            </button>
          </div>
        ) : (
          <div>
            {/* Live Session Info Bar */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 mb-6 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <span className="text-slate-400 font-medium">Question {currentIndex + 1} of {questions.length}</span>
                <span className="px-2.5 py-1 rounded-full bg-slate-800 text-cyan-400 font-semibold">{currentQ?.subject} • {currentQ?.topic}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400">Current Level:</span>
                <span className={`px-2.5 py-1 rounded-full font-bold uppercase ${
                  currentDifficulty === 'Hard' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                  currentDifficulty === 'Medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {currentDifficulty}
                </span>
              </div>
            </div>

            {reasoning && (
              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs mb-6">
                💡 <strong>Adaptive Topic Priority:</strong> {reasoning}
              </div>
            )}

            {/* Question Card */}
            {currentQ && (
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl mb-8">
                <p className="text-lg font-bold text-slate-100 mb-6">{currentQ.question_text}</p>

                {currentQ.options && (
                  <div className="space-y-3 mb-6">
                    {currentQ.options.map((opt, i) => {
                      const optionLabel = opt.charAt(0);
                      const isSelected = userAnswers[currentQ.id] === optionLabel;
                      return (
                        <button
                          key={i}
                          disabled={showExplanation}
                          onClick={() => handleAnswerSubmit(currentQ.id, optionLabel)}
                          className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition-all ${
                            isSelected
                              ? 'bg-cyan-500/20 border-cyan-500 text-cyan-200'
                              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Explanation & Next */}
                {showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-slate-300"
                  >
                    <span className="text-xs font-semibold text-cyan-400 uppercase block mb-1">Explanation & Reasoning</span>
                    <p className="mb-4">{currentQ.explanation}</p>

                    {similarQuestion && (
                      <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 mb-4 text-xs">
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-semibold">AI-generated practice</span>
                          <span className="text-slate-400">Practice Similar</span>
                        </div>
                        <p className="text-slate-100 font-medium mb-2">{similarQuestion.question_text}</p>
                        <div className="space-y-1 text-slate-300">
                          {similarQuestion.options?.map((o, idx) => (
                            <div key={idx} className="p-2 rounded bg-slate-900 border border-slate-800">{o}</div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end">
                      <button
                        onClick={handleNextQuestion}
                        className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-2"
                      >
                        Next Question <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
