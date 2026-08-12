// src/pages/Insights.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowRight, ShieldAlert } from 'lucide-react';
import type { LearningInsight } from '../types/intelligence';
import { generateLearningInsights } from '../lib/intelligence/insights';

export default function InsightsPage() {
  const navigate = useNavigate();
  const [insights, setInsights] = useState<LearningInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInsights();
  }, []);

  async function loadInsights() {
    setLoading(true);
    const data = await generateLearningInsights('GATE');
    setInsights(data);
    setLoading(false);
  }

  const warnings = insights.filter((i) => i.is_warning);

  return (
    <>
      <Helmet>
        <title>Learning Insights | Study Hub Intelligence</title>
        <meta name="description" content="Statistically supported study patterns and calm early warnings." />
      </Helmet>

      <div className="min-h-screen pb-16 pt-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Learning Insights & Early Warnings</h1>
              <p className="text-slate-400 text-sm mt-0.5">Empirical study patterns backed strictly by actual data.</p>
            </div>
          </div>
        </div>

        {/* Early Warning Banner if active */}
        {warnings.length > 0 && (
          <div className="mb-8 p-6 rounded-3xl bg-amber-500/10 border border-amber-500/30 backdrop-blur-xl">
            <div className="flex items-center space-x-3 mb-4">
              <ShieldAlert className="w-6 h-6 text-amber-400" />
              <h2 className="text-xl font-bold text-amber-300">Early Warning Notifications</h2>
            </div>
            <div className="space-y-3">
              {warnings.map((w) => (
                <div key={w.id} className="p-4 rounded-2xl bg-slate-950/80 border border-amber-500/20 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-200 mb-0.5">{w.title}</h3>
                    <p className="text-xs text-slate-400">{w.description}</p>
                  </div>
                  {w.action_link && (
                    <button
                      onClick={() => navigate(w.action_link!)}
                      className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1 hover:bg-amber-500/30 transition-colors"
                    >
                      Take Action <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Insights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            [1, 2].map((i) => (
              <div key={i} className="h-48 rounded-2xl bg-slate-900/40 border border-slate-800 animate-pulse" />
            ))
          ) : insights.length === 0 ? (
            <div className="col-span-2 p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400 text-sm">
              Complete practice sessions and revisions to generate statistically supported insights!
            </div>
          ) : (
            insights.map((ins) => (
              <motion.div
                key={ins.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-6 rounded-3xl bg-slate-900/60 border backdrop-blur-xl ${
                  ins.is_warning ? 'border-amber-500/30' : 'border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full bg-slate-800 text-xs font-semibold text-cyan-400">
                    {ins.insight_type.replace('_', ' ').toUpperCase()}
                  </span>
                  {ins.metric_value && (
                    <span className="text-xs font-bold text-slate-300">{ins.metric_value}</span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-slate-100 mb-2">{ins.title}</h3>
                <p className="text-slate-400 text-sm mb-6">{ins.description}</p>

                {ins.action_link && (
                  <button
                    onClick={() => navigate(ins.action_link!)}
                    className="text-xs text-cyan-400 font-bold hover:text-cyan-300 flex items-center gap-1"
                  >
                    Explore Details <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
