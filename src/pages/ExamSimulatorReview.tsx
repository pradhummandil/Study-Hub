import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle, MinusCircle, Sparkles, Bookmark } from 'lucide-react';
import { getExamAttemptById, type ExamAttemptRecord } from '../lib/exam/examSimulatorApi';
import { toggleSaveMistake } from '../lib/practiceApi';

export default function ExamSimulatorReview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState<ExamAttemptRecord | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [savedMistakes, setSavedMistakes] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!id) return;
    const found = getExamAttemptById(id);
    if (found) {
      setAttempt(found);
    }
  }, [id]);

  if (!attempt) {
    return (
      <div className="min-h-screen bg-[#062B3D] text-white flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold mb-2">Attempt Not Found</h2>
        <p className="text-xs text-slate-400 mb-4">Could not load the specified test solution review.</p>
        <Link to="/exam-simulator" className="px-6 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs">
          Return to Simulator
        </Link>
      </div>
    );
  }

  const currentQ = attempt.questions[currentIdx] || attempt.questions[0];
  const userAns = attempt.answers[currentIdx];
  const isCorrect = userAns && String(userAns).trim().toUpperCase() === String(currentQ.correct_answer).trim().toUpperCase();
  const isSkipped = !userAns;

  const handleToggleSaveMistake = async () => {
    const nextState = !savedMistakes[currentQ.id];
    setSavedMistakes((prev) => ({ ...prev, [currentQ.id]: nextState }));
    await toggleSaveMistake(currentQ.id, nextState);
  };

  const handleAskStudyMate = () => {
    const prompt = `Please explain this ${attempt.exam} question step by step:\n\nQuestion: "${currentQ.question_text}"\nOptions: ${JSON.stringify(currentQ.options)}\nStudent Answer: ${JSON.stringify(userAns || 'Skipped')}\nCorrect Answer: ${JSON.stringify(currentQ.correct_answer)}\nExplanation: ${currentQ.explanation || 'N/A'}`;
    navigate('/study-ai', { state: { prompt, mode: 'Doubt Solving', topic: currentQ.topic, subject: currentQ.subject, exam: attempt.exam } });
  };

  return (
    <div className="min-h-screen bg-[#062B3D] text-white py-10 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>{`Solution Review — ${attempt.test_title} | Study Hub`}</title>
      </Helmet>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <button onClick={() => navigate(`/exam-simulator/result/${attempt.id}`)} className="flex items-center gap-1.5 hover:text-white font-bold">
            <ArrowLeft className="w-4 h-4" /> Back to Test Result
          </button>
          <span className="font-mono text-cyan-400 font-bold">{attempt.test_title}</span>
          <span className="font-mono text-slate-300">Question {currentIdx + 1} of {attempt.questions.length}</span>
        </div>

        {/* Question Review Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-full bg-slate-800 text-cyan-300 text-xs font-bold uppercase tracking-wider font-mono">
                {currentQ.subject} • {currentQ.topic}
              </span>
              <span className="text-xs text-slate-400">{currentQ.difficulty}</span>
            </div>

            {/* Answer Status Badge */}
            <div className="flex items-center gap-2">
              {isCorrect ? (
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Correct (+{currentQ.question_type === 'MCQ' ? 2 : 1})
                </span>
              ) : isSkipped ? (
                <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-xs font-bold flex items-center gap-1.5">
                  <MinusCircle className="w-4 h-4" /> Skipped (0)
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1.5">
                  <XCircle className="w-4 h-4" /> Wrong (-0.66)
                </span>
              )}
            </div>
          </div>

          {/* Question Text */}
          <div className="text-base sm:text-lg font-medium text-slate-100 leading-relaxed">
            {currentQ.question_text}
          </div>

          {/* Options Display */}
          <div className="space-y-3 pt-2">
            {currentQ.question_type === 'Numerical' ? (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono">
                <p className="text-slate-400 mb-1">Your Answer: <strong className={isCorrect ? 'text-emerald-400' : 'text-rose-400'}>{userAns || 'No Answer'}</strong></p>
                <p className="text-slate-400">Correct Answer: <strong className="text-emerald-400">{String(currentQ.correct_answer)}</strong></p>
              </div>
            ) : (
              currentQ.options?.map((opt, optIndex) => {
                const optKey = opt.charAt(0);
                const isUserChoice = userAns === optKey;
                const isCorrectOpt = String(currentQ.correct_answer).toUpperCase() === optKey;

                let badgeStyle = 'bg-slate-950 border-slate-800 text-slate-300';
                if (isCorrectOpt) {
                  badgeStyle = 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold';
                } else if (isUserChoice && !isCorrectOpt) {
                  badgeStyle = 'bg-rose-500/20 border-rose-400 text-rose-300';
                }

                return (
                  <div
                    key={optIndex}
                    className={`p-4 rounded-2xl border text-xs sm:text-sm font-medium flex items-center justify-between ${badgeStyle}`}
                  >
                    <span>{opt}</span>
                    {isCorrectOpt && <span className="text-xs font-bold text-emerald-400 font-mono">Correct Option ✓</span>}
                    {isUserChoice && !isCorrectOpt && <span className="text-xs font-bold text-rose-400 font-mono">Your Choice ✕</span>}
                  </div>
                );
              })
            )}
          </div>

          {/* Solution & Verification Box */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider font-mono">
                {currentQ.is_official_pyq ? 'Official Verified Solution' : 'Detailed Explanation'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleSaveMistake}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                    savedMistakes[currentQ.id]
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  {savedMistakes[currentQ.id] ? 'Saved to Mistakes ✓' : 'Save to Mistakes'}
                </button>

                <button
                  onClick={handleAskStudyMate}
                  className="px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold text-xs flex items-center gap-1.5 hover:bg-purple-500/30"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Ask StudyMate
                </button>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              {currentQ.explanation || 'Detailed step-by-step concept derivation complete.'}
            </p>
          </div>
        </div>

        {/* Bottom Pagination controls */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
            disabled={currentIdx === 0}
            className="px-5 py-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-300 disabled:opacity-30 hover:bg-slate-800 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Previous Question
          </button>

          <button
            onClick={() => setCurrentIdx((prev) => Math.min(attempt.questions.length - 1, prev + 1))}
            disabled={currentIdx === attempt.questions.length - 1}
            className="px-6 py-2.5 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold disabled:opacity-30 hover:bg-cyan-400 flex items-center gap-2"
          >
            Next Question <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
