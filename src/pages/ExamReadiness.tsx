// src/pages/ExamReadiness.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Award, ArrowRight } from 'lucide-react';
import type { ExamReadinessSnapshot } from '../types/intelligence';
import { calculateExamReadiness } from '../lib/intelligence/readiness';

export default function ExamReadinessPage() {
  const navigate = useNavigate();
  const [snapshot, setSnapshot] = useState<ExamReadinessSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReadiness();
  }, []);

  async function loadReadiness() {
    setLoading(true);
    const data = await calculateExamReadiness('GATE');
    setSnapshot(data);
    setLoading(false);
  }

  return (
    <>
      <Helmet>
        <title>Exam Readiness | Study Hub Intelligence</title>
        <meta name="description" content="Multi-dimensional readiness estimate based on syllabus, PYQ accuracy, mock tests, and revision." />
      </Helmet>

      <div className="min-h-screen pb-16 pt-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Exam Readiness Engine</h1>
              <p className="text-slate-400 text-sm mt-0.5">Multi-dimensional estimate derived from real student attempts.</p>
            </div>
          </div>
        </div>

        {loading || !snapshot ? (
          <div className="h-96 rounded-3xl bg-slate-900/40 border border-slate-800 animate-pulse" />
        ) : (
          <div className="space-y-8">
            {/* Overall Score Badge */}
            <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-cyan-500/30 text-center relative overflow-hidden shadow-2xl">
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-slate-800 text-xs text-slate-400 font-semibold border border-slate-700">
                Study Hub readiness estimate
              </div>

              <div className="max-w-md mx-auto py-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400 block mb-2">Overall Exam Readiness Indicator</span>
                <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 mb-3">
                  {snapshot.overall_readiness}%
                </div>
                <p className="text-slate-400 text-xs">
                  This indicator is computed dynamically across 5 measurable preparation metrics. It is not an official rank prediction.
                </p>
              </div>
            </div>

            {/* 5 Dimensional Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
                <span className="text-xs text-slate-400 font-semibold block mb-2">Syllabus Coverage</span>
                <div className="text-2xl font-bold text-cyan-400 mb-2">{snapshot.syllabus_coverage_pct}%</div>
                <div className="w-full bg-slate-950 rounded-full h-2">
                  <div className="bg-cyan-400 h-2 rounded-full" style={{ width: `${snapshot.syllabus_coverage_pct}%` }} />
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
                <span className="text-xs text-slate-400 font-semibold block mb-2">PYQ Accuracy</span>
                <div className="text-2xl font-bold text-indigo-400 mb-2">{snapshot.pyq_accuracy_pct}%</div>
                <div className="w-full bg-slate-950 rounded-full h-2">
                  <div className="bg-indigo-400 h-2 rounded-full" style={{ width: `${snapshot.pyq_accuracy_pct}%` }} />
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
                <span className="text-xs text-slate-400 font-semibold block mb-2">Mock Performance</span>
                <div className="text-2xl font-bold text-purple-400 mb-2">{snapshot.mock_performance_pct}%</div>
                <div className="w-full bg-slate-950 rounded-full h-2">
                  <div className="bg-purple-400 h-2 rounded-full" style={{ width: `${snapshot.mock_performance_pct}%` }} />
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
                <span className="text-xs text-slate-400 font-semibold block mb-2">Revision Health</span>
                <div className="text-2xl font-bold text-emerald-400 mb-2">{snapshot.revision_health_pct}%</div>
                <div className="w-full bg-slate-950 rounded-full h-2">
                  <div className="bg-emerald-400 h-2 rounded-full" style={{ width: `${snapshot.revision_health_pct}%` }} />
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
                <span className="text-xs text-slate-400 font-semibold block mb-2">Consistency</span>
                <div className="text-2xl font-bold text-amber-400 mb-2">{snapshot.consistency_pct}%</div>
                <div className="w-full bg-slate-950 rounded-full h-2">
                  <div className="bg-amber-400 h-2 rounded-full" style={{ width: `${snapshot.consistency_pct}%` }} />
                </div>
              </div>
            </div>

            {/* Insights & Recommended Action */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
                <span className="text-xs font-semibold text-emerald-400 uppercase block mb-1">Your Strongest Area</span>
                <h3 className="text-xl font-bold text-slate-100 mb-2">{snapshot.strongest_area}</h3>
                <p className="text-xs text-slate-400">Keep maintaining regular spaced reviews for this area.</p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
                <span className="text-xs font-semibold text-amber-400 uppercase block mb-1">Biggest Opportunity</span>
                <h3 className="text-xl font-bold text-slate-100 mb-2">{snapshot.biggest_opportunity}</h3>
                <p className="text-xs text-slate-400">Targeting this metric will yield the highest readiness score boost.</p>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 border border-cyan-500/30">
                <span className="text-xs font-semibold text-cyan-400 uppercase block mb-1">Recommended Next Step</span>
                <h3 className="text-base font-bold text-slate-100 mb-4">{snapshot.recommended_next_step}</h3>
                <button
                  onClick={() => navigate('/practice')}
                  className="w-full py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1 hover:bg-cyan-400 transition-colors"
                >
                  Execute Action <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
