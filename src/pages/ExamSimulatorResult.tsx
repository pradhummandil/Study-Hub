import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Trophy, Clock, AlertTriangle, Sparkles, ArrowRight, Bot, RotateCcw, FileText } from 'lucide-react';
import { getExamAttemptById, startOrCreateExamAttempt, type ExamAttemptRecord } from '../lib/exam/examSimulatorApi';
import { useStudentContext } from '../context/StudentContext';

export default function ExamSimulatorResult() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userId } = useStudentContext();

  const [attempt, setAttempt] = useState<ExamAttemptRecord | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    const found = getExamAttemptById(id);
    if (found) {
      setAttempt(found);
    } else {
      // Try parsing from session storage fallback
      const cached = sessionStorage.getItem(`exam_sim_result_${id}`);
      if (cached) {
        try { setAttempt(JSON.parse(cached)); } catch {}
      }
    }
    setLoading(false);
  }, [id]);

  const handleRetryTest = async () => {
    if (!attempt) return;
    const { attempt: newAttempt } = await startOrCreateExamAttempt(attempt.test_id, userId);
    navigate(`/exam-simulator/runner/${newAttempt.test_id}`);
  };

  const handleReviewSolutions = () => {
    if (!attempt) return;
    navigate(`/exam-simulator/review/${attempt.id}`);
  };

  const handleAskStudyMateReview = () => {
    if (!attempt) return;
    setLoadingAi(true);
    setTimeout(() => {
      setLoadingAi(false);
      setAiAnalysis(`### StudyMate Empirical Test Breakdown — ${attempt.test_title}

**What Went Well:**
- **Accuracy:** ${attempt.accuracy_pct}% accuracy on attempted questions.
- **Top Subjects:** ${attempt.topic_performance.filter((t) => t.correct > 0).map((t) => t.topic).join(', ') || 'General Aptitude'}.

**AreasSurrendering Marks:**
- **Negative Marking Penalty:** Surrendered **-${attempt.negative_marks_lost} marks** to incorrect options.
- **Unattempted Questions:** ${attempt.skipped_count} questions left unattempted.

**Actionable 3-Step Study Plan:**
1. Open **Mistakes Notebook** to review step-by-step verified explanations.
2. Complete 15 minutes of **Adaptive Practice** on weak topics.
3. Re-attempt this simulation test in 3 days to verify retention.`);
    }, 1200);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#062B3D] text-white">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mb-3" />
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="min-h-screen bg-[#062B3D] text-white flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold mb-2">Test Attempt Not Found</h2>
        <p className="text-xs text-slate-400 mb-4">The specified test attempt ID could not be loaded.</p>
        <button
          onClick={() => navigate('/exam-simulator')}
          className="px-6 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
        >
          Return to Exam Simulator
        </button>
      </div>
    );
  }

  const timeMinutes = Math.floor(attempt.time_spent_seconds / 60);
  const timeSecs = attempt.time_spent_seconds % 60;
  const potentialScore = Math.round((attempt.score + attempt.negative_marks_lost) * 10) / 10;

  return (
    <div className="min-h-screen bg-[#062B3D] text-white py-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>{`${attempt.test_title} Result & Analytics | Study Hub`}</title>
      </Helmet>

      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-widest">
            <Trophy className="w-4 h-4" /> {attempt.exam} Simulation Completed
          </div>
          <h1 className="text-3xl md:text-5xl font-normal text-foreground" style={{ fontFamily: "'Instrument Serif', serif" }}>
            {attempt.test_title} Result
          </h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">Empirical score metrics, negative marking analysis, and topic breakdown.</p>
        </div>

        {/* Score & Core Metrics Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="liquid-glass-card p-6 rounded-3xl border border-cyan-500/30 text-center space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Score</span>
            <div className="text-3xl font-semibold text-[#5CE1E6] tracking-tight">{attempt.score} / {attempt.max_score}</div>
          </div>

          <div className="liquid-glass-card p-6 rounded-3xl border border-white/10 text-center space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Accuracy</span>
            <div className="text-3xl font-semibold text-emerald-400 tracking-tight">{attempt.accuracy_pct}%</div>
          </div>

          <div className="liquid-glass-card p-6 rounded-3xl border border-white/10 text-center space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Correct / Total</span>
            <div className="text-3xl font-semibold text-indigo-400 tracking-tight">{attempt.correct_count} / {attempt.total_questions}</div>
          </div>

          <div className="liquid-glass-card p-6 rounded-3xl border border-white/10 text-center space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Negative Marks Lost</span>
            <div className="text-3xl font-semibold text-rose-400 tracking-tight">-{attempt.negative_marks_lost}</div>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl liquid-glass-card border border-white/10">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRetryTest}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-2 hover:bg-cyan-400 transition-all shadow-md"
            >
              <RotateCcw className="w-4 h-4" /> Retry Test (New Attempt)
            </button>

            <button
              onClick={handleReviewSolutions}
              className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-2 hover:bg-slate-700 transition-all"
            >
              <FileText className="w-4 h-4 text-cyan-400" /> Question-by-Question Solution Review
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
            <Clock className="w-4 h-4 text-amber-400" /> Time Spent: {timeMinutes}m {timeSecs}s
          </div>
        </div>

        {/* Negative Marking & Potential Score Analysis */}
        {attempt.negative_marks_lost > 0 && (
          <div className="p-6 rounded-3xl bg-rose-500/10 border border-rose-500/30 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-200">
            <div>
              <h3 className="text-sm font-bold text-rose-300 uppercase tracking-wider flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" /> Negative Marking Analysis
              </h3>
              <p className="text-slate-300 leading-relaxed">
                You lost <strong className="text-rose-400 font-mono">-{attempt.negative_marks_lost} marks</strong> from incorrect MCQ responses.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-around font-mono">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Actual Score</span>
                <span className="text-xl font-bold text-rose-400">{attempt.score}</span>
              </div>
              <span className="text-slate-600 text-lg">→</span>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Potential (Zero Negatives)</span>
                <span className="text-xl font-bold text-emerald-400">{potentialScore}</span>
              </div>
            </div>
          </div>
        )}

        {/* Topic-by-Topic Performance */}
        {attempt.topic_performance.length > 0 && (
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Topic Performance Breakdown</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {attempt.topic_performance.map((tp, idx) => {
                const pct = tp.total > 0 ? Math.round((tp.correct / tp.total) * 100) : 0;
                return (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-200 truncate">{tp.topic}</span>
                      <span className="font-mono text-cyan-300">{pct}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${pct >= 70 ? 'bg-emerald-400' : pct >= 40 ? 'bg-amber-400' : 'bg-rose-400'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono block text-right">
                      {tp.correct} / {tp.total} Correct
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Question Status Palette Overview */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Question Status Overview</h3>
          <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-10 gap-2">
            {attempt.questions.map((q, qI) => {
              const userAns = attempt.answers[qI];
              const isCorrect = userAns && String(userAns).trim().toUpperCase() === String(q.correct_answer).trim().toUpperCase();
              const isSkipped = !userAns;

              return (
                <button
                  key={qI}
                  onClick={handleReviewSolutions}
                  className={`h-10 rounded-xl text-xs font-mono flex items-center justify-center gap-1 border transition-all ${
                    isCorrect
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold'
                      : isSkipped
                      ? 'bg-slate-950 border-slate-800 text-slate-500'
                      : 'bg-rose-500/20 border-rose-500/40 text-rose-300 font-bold'
                  }`}
                >
                  Q{qI + 1} {isCorrect ? '✓' : isSkipped ? '-' : '✕'}
                </button>
              );
            })}
          </div>
        </div>

        {/* StudyMate AI Post-Mock Review */}
        <div className="p-6 md:p-8 rounded-3xl bg-slate-900/90 border border-cyan-500/30 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-[#5CE1E6]">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">StudyMate AI Recovery Plan</h3>
                <p className="text-xs text-slate-400">Grounded post-mock analysis and custom review roadmap</p>
              </div>
            </div>

            {!aiAnalysis && (
              <button
                onClick={handleAskStudyMateReview}
                disabled={loadingAi}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 font-bold text-xs text-slate-950 flex items-center gap-2 hover:brightness-110 transition-all disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" /> {loadingAi ? 'Analyzing Test...' : 'Analyze My Test'}
              </button>
            )}
          </div>

          {aiAnalysis && (
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-cyan-500/30 text-xs text-slate-300 space-y-3 leading-relaxed animate-in fade-in">
              <div className="prose prose-invert prose-xs max-w-none">
                <div dangerouslySetInnerHTML={{ __html: aiAnalysis.replace(/\n/g, '<br/>') }} />
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-4">
          <button
            onClick={() => navigate('/exam-simulator')}
            className="px-6 py-3 rounded-2xl border border-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-800"
          >
            Back to Exam Simulator
          </button>

          <button
            onClick={() => navigate('/mistakes')}
            className="px-6 py-3 rounded-2xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 flex items-center gap-2"
          >
            Review Mistakes in Notebook <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
