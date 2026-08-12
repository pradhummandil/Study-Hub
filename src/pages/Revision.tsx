// src/pages/Revision.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  Clock,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Play,
  BookOpen,
} from 'lucide-react';
import type { RevisionItem, SpacedRating } from '../types/intelligence';
import { fetchRevisionItems, reviewRevisionItem, getRevisionStats } from '../lib/intelligence/revision';

export default function RevisionPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<RevisionItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Revision Mode Session State
  const [sessionActive, setSessionActive] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    loadRevisions();
  }, []);

  async function loadRevisions() {
    setLoading(true);
    const data = await fetchRevisionItems('GATE');
    setItems(data);
    setLoading(false);
  }

  const stats = getRevisionStats(items);
  const dueItems = items.filter((item) => new Date(item.next_review_at).getTime() <= Date.now() + 86400000);
  const currentItem = sessionActive && dueItems.length > 0 ? dueItems[currentIndex] : null;

  async function handleRating(rating: SpacedRating) {
    if (!currentItem) return;
    await reviewRevisionItem(currentItem.id, rating);
    
    if (currentIndex + 1 < dueItems.length) {
      setCurrentIndex((prev) => prev + 1);
      setRevealed(false);
    } else {
      setSessionActive(false);
      loadRevisions();
    }
  }

  function handleAskStudyMateForConcept(topic: string, notes?: string) {
    const prompt = `Explain ${topic} again clearly, using a simple real-world analogy. Key notes: "${notes || topic}"`;
    navigate('/study-ai', { state: { prompt, mode: 'Explain', topic } });
  }

  return (
    <>
      <Helmet>
        <title>Revision Center | Study Hub Intelligence</title>
        <meta name="description" content="Review the right concept at the right time using spaced repetition algorithms." />
      </Helmet>

      <div className="min-h-screen pb-16 pt-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                <RotateCcw className="w-6 h-6 animate-spin-slow" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Revision Center</h1>
                <p className="text-slate-400 text-sm mt-0.5">Review the right concept at the right time.</p>
              </div>
            </div>
          </div>

          {!sessionActive && dueItems.length > 0 && (
            <button
              onClick={() => {
                setSessionActive(true);
                setCurrentIndex(0);
                setRevealed(false);
              }}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all transform hover:scale-105"
            >
              <Play className="w-5 h-5 fill-current" /> Start Revision Session ({dueItems.length})
            </button>
          )}
        </div>

        {/* Revision Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
            <div className="flex items-center justify-between text-slate-400 text-sm mb-2">
              <span>Due Today</span>
              <Clock className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-extrabold text-cyan-400">{stats.dueToday}</div>
            <p className="text-xs text-slate-500 mt-1">Ready for memory retention review</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
            <div className="flex items-center justify-between text-slate-400 text-sm mb-2">
              <span>Overdue</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-extrabold text-amber-400">{stats.overdue}</div>
            <p className="text-xs text-slate-500 mt-1">High priority for memory decay protection</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
            <div className="flex items-center justify-between text-slate-400 text-sm mb-2">
              <span>Upcoming</span>
              <BookOpen className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-3xl font-extrabold text-indigo-400">{stats.upcoming}</div>
            <p className="text-xs text-slate-500 mt-1">Scheduled for future spaced intervals</p>
          </div>
        </div>

        {/* Active Session Mode */}
        {sessionActive && currentItem ? (
          <div className="max-w-2xl mx-auto mb-12">
            <div className="p-1 rounded-3xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 shadow-2xl">
              <div className="p-8 rounded-[22px] bg-slate-950 text-center">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-6">
                  <span>Item {currentIndex + 1} of {dueItems.length}</span>
                  <span className="px-2.5 py-1 rounded-full bg-slate-800 text-cyan-400 font-semibold">{currentItem.subject}</span>
                </div>

                <h2 className="text-2xl font-bold text-slate-100 mb-3">{currentItem.topic}</h2>
                <p className="text-slate-300 font-medium mb-6">{currentItem.title}</p>

                {!revealed ? (
                  <div className="py-12 border-t border-slate-800/80">
                    <p className="text-slate-400 text-sm mb-6">What do you remember about this concept?</p>
                    <button
                      onClick={() => setRevealed(true)}
                      className="px-8 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 font-bold transition-all"
                    >
                      [ Reveal Memory Notes ]
                    </button>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-6 border-t border-slate-800/80"
                  >
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-sm text-left mb-6">
                      <span className="text-xs text-indigo-400 font-semibold uppercase block mb-1">Key Summary Notes:</span>
                      <p>{currentItem.summary_notes || 'Review core formulas, time complexity, and edge cases.'}</p>
                    </div>

                    <div className="flex justify-end mb-6">
                      <button
                        onClick={() => handleAskStudyMateForConcept(currentItem.topic, currentItem.summary_notes)}
                        className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> I'm confused — Ask StudyMate AI
                      </button>
                    </div>

                    <p className="text-xs text-slate-400 mb-3">How well did you know this?</p>
                    <div className="grid grid-cols-4 gap-2">
                      <button
                        onClick={() => handleRating('Again')}
                        className="py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-xs font-bold transition-all"
                      >
                        Again (1d)
                      </button>
                      <button
                        onClick={() => handleRating('Hard')}
                        className="py-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all"
                      >
                        Hard (2d)
                      </button>
                      <button
                        onClick={() => handleRating('Good')}
                        className="py-3 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 text-xs font-bold transition-all"
                      >
                        Good (+1.7x)
                      </button>
                      <button
                        onClick={() => handleRating('Easy')}
                        className="py-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all"
                      >
                        Easy (+2.5x)
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {/* Revision Queue List */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
          <h3 className="text-lg font-bold text-slate-100 mb-4">Today's Scheduled Revisions</h3>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-slate-800/40 animate-pulse" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              No revision items scheduled. Practice questions or add roadmap topics to generate spaced revisions!
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((r) => {
                const isDue = new Date(r.next_review_at).getTime() <= Date.now() + 86400000;
                return (
                  <div
                    key={r.id}
                    className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-4 transition-all ${
                      isDue
                        ? 'bg-slate-950 border-cyan-500/40 text-slate-100'
                        : 'bg-slate-950/50 border-slate-800/80 text-slate-400'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 text-xs mb-1">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-400 font-semibold">{r.subject}</span>
                        <span className="text-slate-500">• {r.topic}</span>
                        {isDue && <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold">DUE TODAY</span>}
                      </div>
                      <h4 className="text-sm font-bold text-slate-200">{r.title}</h4>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-slate-500">Interval: {r.interval_days}d</span>
                      <button
                        onClick={() => handleAskStudyMateForConcept(r.topic, r.summary_notes)}
                        className="px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 font-medium hover:bg-purple-500/30 transition-colors"
                      >
                        Explain
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
