import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { ShieldAlert, Play, CheckCircle, Clock, Cpu } from 'lucide-react';
import { getAiQualityMetrics, runAiRegressionSuite } from '../../lib/admin/aiQualityApi';
import type { AiQualityOverview, AiRegressionTestItem } from '../../lib/admin/aiQualityApi';

export default function AdminAiQuality() {
  const [metrics, setMetrics] = useState<AiQualityOverview | null>(null);
  const [regressionTests, setRegressionTests] = useState<AiRegressionTestItem[]>([]);
  const [runningSuite, setRunningSuite] = useState(false);

  useEffect(() => {
    getAiQualityMetrics().then(setMetrics);
  }, []);

  const handleRunRegression = () => {
    setRunningSuite(true);
    setTimeout(() => {
      setRegressionTests(runAiRegressionSuite());
      setRunningSuite(false);
    }, 1200);
  };

  if (!metrics) return null;

  return (
    <div className="p-6 md:p-8 space-y-8 text-white">
      <Helmet>
        <title>AI Quality & Trust Center | Admin Console</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Cpu className="w-4 h-4 text-[#5CE1E6]" /> StudyMate Trust & Safety
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white">AI Quality & Grounding Center</h1>
          <p className="text-xs text-slate-400">Monitor model latency, citation fidelity, hallucination reports, and regression test suites.</p>
        </div>

        <button
          onClick={handleRunRegression}
          disabled={runningSuite}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 font-bold text-xs text-slate-950 flex items-center gap-2 hover:brightness-110 transition-all disabled:opacity-50"
        >
          <Play className="w-4 h-4 fill-slate-950" /> {runningSuite ? 'Running Suite...' : 'Run Automated AI Regression Suite'}
        </button>
      </div>

      {/* Overview Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-400">Citation Accuracy</span>
          <div className="text-2xl font-black text-emerald-400">{metrics.citationAccuracyPct}%</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-400">Avg Model Latency</span>
          <div className="text-2xl font-black text-cyan-400">{metrics.avgLatencyMs} ms</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-400">Hallucination Rate</span>
          <div className="text-2xl font-black text-amber-400">{metrics.hallucinationRatePct}%</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-400">Pending User Reports</span>
          <div className="text-2xl font-black text-rose-400">{metrics.pendingReportsCount}</div>
        </div>
      </div>

      {/* Regression Suite Results */}
      {regressionTests.length > 0 && (
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-cyan-500/30 space-y-4 animate-in fade-in">
          <h3 className="text-sm font-bold text-[#5CE1E6] uppercase tracking-wider flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> AI Regression Test Results
          </h3>

          <div className="space-y-3">
            {regressionTests.map((t) => (
              <div key={t.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{t.name}</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-400">{t.category}</span>
                  </div>
                  <p className="text-slate-400">Expected: {t.expectedBehavior}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-slate-500 flex items-center gap-1 font-mono"><Clock className="w-3 h-3" /> {t.latencyMs}ms</span>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                    {t.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Answer Reports Queue */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" /> Student Answer Reports Queue
        </h3>

        <div className="space-y-3">
          {metrics.reports.length === 0 ? (
            <p className="text-xs text-slate-500">No pending reports.</p>
          ) : (
            metrics.reports.map((rep) => (
              <div key={rep.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                    {rep.reason}
                  </span>
                  <span className="text-slate-500">{new Date(rep.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-slate-300">{rep.details || 'Student reported answer quality.'}</p>
                <div className="flex justify-end gap-2 pt-2">
                  <button className="px-3 py-1.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800">
                    Dismiss
                  </button>
                  <button className="px-3 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-bold">
                    Refine Prompt / Index
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
