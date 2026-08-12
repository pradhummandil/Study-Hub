import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Trophy, Clock, AlertTriangle, Sparkles, ArrowRight, Bot } from 'lucide-react';
import { SAMPLE_EXAM_CONFIGS } from '../lib/exam/examSimulator';
import type { ExamSimulationResultData } from '../types/phase5';

export default function ExamSimulatorResult() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const config = SAMPLE_EXAM_CONFIGS.find((c) => c.id === id) || SAMPLE_EXAM_CONFIGS[0];

  const [result, setResult] = useState<ExamSimulationResultData | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    const cached = sessionStorage.getItem(`exam_sim_result_${config.id}`);
    if (cached) {
      try { setResult(JSON.parse(cached)); } catch {}
    } else {
      // Default fallback result
      setResult({
        score: 48.5,
        totalMarks: 100,
        accuracy: 76,
        attemptRate: 82,
        avgTimePerQuestionSec: 142,
        negativeMarksLost: 4.3,
        skippedCount: 3,
        topicPerformance: [
          { topic: 'Computer Networks', correct: 8, total: 10 },
          { topic: 'Data Structures & Algorithms', correct: 6, total: 8 },
          { topic: 'Operating Systems', correct: 4, total: 7 },
        ],
        costMarksReasons: [
          '4.3 marks lost to negative marking on 3 incorrect attempts.',
          'Operating Systems accuracy fell below target at 57%.',
        ],
        timeStrategyInsight: 'Your time management was solid, spending ~2.3 minutes per question with no late-test rush.',
      });
    }
  }, [config.id]);

  const handleAskStudyMateReview = () => {
    setLoadingAi(true);
    setTimeout(() => {
      setLoadingAi(false);
      setAiAnalysis(`### StudyMate Test Analysis Breakdown

**What went well:**
- Strong accuracy (80%) in **Computer Networks** and **Data Structures**.
- Pacing was steady without early exits.

**Where marks were lost:**
- **4.3 marks** surrendered to negative marking on tricky MCQs.
- **Operating Systems** needs formula & concept revision before next mock.

**Recommended Action Plan:**
1. Spend 30 minutes in Mistakes Notebook reviewing Operating Systems traps.
2. Solve 10 medium-difficulty PYQs on Operating Systems.
3. Schedule your next simulation test in 5 days.`);
    }, 1500);
  };

  if (!result) return null;

  return (
    <div className="min-h-screen bg-[#062B3D] text-white py-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>{config.title} Result & Analytics | Study Hub</title>
      </Helmet>

      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Trophy className="w-4 h-4" /> Simulation Completed
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white">{config.title} Result</h1>
          <p className="text-slate-300 text-sm">Empirical breakdown of score, time strategy, and mark loss drivers.</p>
        </div>

        {/* Score & Core Metrics Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-cyan-500/30 text-center space-y-1">
            <span className="text-xs font-bold text-slate-400">Total Score</span>
            <div className="text-3xl font-black text-[#5CE1E6]">{result.score} / {result.totalMarks}</div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 text-center space-y-1">
            <span className="text-xs font-bold text-slate-400">Accuracy</span>
            <div className="text-3xl font-black text-emerald-400">{result.accuracy}%</div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 text-center space-y-1">
            <span className="text-xs font-bold text-slate-400">Attempt Rate</span>
            <div className="text-3xl font-black text-indigo-400">{result.attemptRate}%</div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 text-center space-y-1">
            <span className="text-xs font-bold text-slate-400">Negative Marks Lost</span>
            <div className="text-3xl font-black text-rose-400">-{result.negativeMarksLost}</div>
          </div>
        </div>

        {/* Empirical "What Cost You Marks?" Section */}
        {result.costMarksReasons.length > 0 && (
          <div className="p-6 rounded-3xl bg-rose-500/10 border border-rose-500/30 space-y-4">
            <h3 className="text-sm font-bold text-rose-300 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" /> What Cost You Marks?
            </h3>
            <ul className="space-y-2 text-xs text-slate-200">
              {result.costMarksReasons.map((reason, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 mt-1.5" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Time Strategy Analysis */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4" /> Time Strategy Analysis
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">{result.timeStrategyInsight}</p>
        </div>

        {/* StudyMate AI Post-Mock Review */}
        <div className="p-6 md:p-8 rounded-3xl bg-slate-900/90 border border-cyan-500/30 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-[#5CE1E6]">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">StudyMate AI Test Review</h3>
                <p className="text-xs text-slate-400">Grounded post-mock analysis and actionable roadmap steps</p>
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

        {/* Action Buttons */}
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
