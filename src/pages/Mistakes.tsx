// src/pages/Mistakes.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Filter,
  Flame,
  Sparkles,
  Zap,
  BookOpen,
  PlusCircle,
  X,
  ArrowUpDown,
} from 'lucide-react';
import type { MistakeRecord } from '../types/intelligence';
import { fetchMistakeNotebook, markMistakeMastered } from '../lib/intelligence/mistakes';
import { generateSimilarQuestion } from '../lib/intelligence/adaptive';
import { createFlashcard } from '../lib/intelligence/flashcards';

export default function MistakesPage() {
  const navigate = useNavigate();
  const [mistakes, setMistakes] = useState<MistakeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [showMastered, setShowMastered] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'recent' | 'repeated' | 'severity' | 'due'>('recent');

  const [activeModalMistake, setActiveModalMistake] = useState<MistakeRecord | null>(null);
  const [practiceSimilarQuestion, setPracticeSimilarQuestion] = useState<any | null>(null);
  const [flashcardSaved, setFlashcardSaved] = useState<boolean>(false);

  useEffect(() => {
    loadMistakes();
  }, [selectedExam, selectedSubject, selectedType, selectedSeverity, showMastered, sortBy]);

  async function loadMistakes() {
    setLoading(true);
    const data = await fetchMistakeNotebook({
      exam: selectedExam !== 'all' ? selectedExam : undefined,
      subject: selectedSubject !== 'all' ? selectedSubject : undefined,
      mistakeType: selectedType !== 'all' ? selectedType : undefined,
      severity: selectedSeverity !== 'all' ? selectedSeverity : undefined,
      mastered: showMastered ? undefined : false,
      sortBy,
    });
    setMistakes(data);
    setLoading(false);
  }

  async function handleToggleMastered(id: string, currentStatus: boolean) {
    await markMistakeMastered(id, !currentStatus);
    setMistakes((prev) =>
      prev.map((m) => (m.id === id ? { ...m, mastered: !currentStatus } : m))
    );
    if (activeModalMistake?.id === id) {
      setActiveModalMistake((prev) => (prev ? { ...prev, mastered: !currentStatus } : null));
    }
  }

  function handleAskStudyMate(m: MistakeRecord) {
    const prompt = `I got this ${m.subject} question wrong on ${m.topic}.\nQuestion: "${m.question_snapshot.question_text}"\nMy answer: ${JSON.stringify(m.student_answer)}\nCorrect answer: ${JSON.stringify(m.correct_answer)}\nCan you explain what went wrong, the underlying concept, and how to avoid this mistake in the future?`;
    navigate('/study-ai', { state: { prompt, mode: 'Doubt Solving', topic: m.topic, subject: m.subject, exam: m.exam } });
  }

  function handlePracticeSimilar(m: MistakeRecord) {
    const generated = generateSimilarQuestion({
      topic: m.topic,
      subject: m.subject,
      exam: m.exam,
    });
    setPracticeSimilarQuestion(generated);
  }

  async function handleAddToFlashcards(m: MistakeRecord) {
    await createFlashcard({
      exam: m.exam,
      subject: m.subject,
      topic: m.topic,
      front: m.question_snapshot.question_text,
      back: `Correct Answer: ${JSON.stringify(m.correct_answer)}\n\nExplanation: ${m.explanation || 'Review topic formula and fundamentals.'}`,
      sourceType: 'mistake',
      sourceId: m.id,
    });
    setFlashcardSaved(true);
    setTimeout(() => setFlashcardSaved(false), 3000);
  }

  const subjects = Array.from(new Set(mistakes.map((m) => m.subject)));

  return (
    <>
      <Helmet>
        <title>My Mistakes | Study Hub Intelligence</title>
        <meta name="description" content="Every mistake is a step toward mastery. Review and resolve your learning weak spots." />
      </Helmet>

      <div className="min-h-screen pb-16 pt-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-100 tracking-tight">My Mistakes</h1>
              <p className="text-slate-400 text-sm mt-0.5">Every mistake is a step toward mastery.</p>
            </div>
          </div>
        </div>

        {/* Filter & Sort Bar */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl mb-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Filter className="w-4 h-4 text-cyan-400" /> Filter:
              </span>
              
              <select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className="bg-slate-950/80 text-slate-200 border border-slate-700/60 rounded-lg px-3 py-1.5 focus:border-cyan-400 focus:outline-none"
              >
                <option value="all">All Exams</option>
                <option value="GATE">GATE</option>
                <option value="JEE Main">JEE Main</option>
                <option value="NEET">NEET</option>
              </select>

              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="bg-slate-950/80 text-slate-200 border border-slate-700/60 rounded-lg px-3 py-1.5 focus:border-cyan-400 focus:outline-none"
              >
                <option value="all">All Subjects</option>
                {subjects.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-slate-950/80 text-slate-200 border border-slate-700/60 rounded-lg px-3 py-1.5 focus:border-cyan-400 focus:outline-none"
              >
                <option value="all">All Mistake Types</option>
                <option value="concept_gap">Concept Gap</option>
                <option value="careless_error">Careless Error</option>
                <option value="calculation_error">Calculation Error</option>
                <option value="time_pressure">Time Pressure</option>
                <option value="unknown">Unknown</option>
              </select>

              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="bg-slate-950/80 text-slate-200 border border-slate-700/60 rounded-lg px-3 py-1.5 focus:border-cyan-400 focus:outline-none"
              >
                <option value="all">All Severities</option>
                <option value="high">High Severity</option>
                <option value="medium">Medium Severity</option>
                <option value="low">Low Severity</option>
              </select>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showMastered}
                  onChange={(e) => setShowMastered(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-cyan-400 focus:ring-cyan-400"
                />
                Show Mastered
              </label>

              <div className="flex items-center gap-2 text-slate-400">
                <ArrowUpDown className="w-4 h-4 text-indigo-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-slate-950/80 text-slate-200 border border-slate-700/60 rounded-lg px-3 py-1.5 focus:border-indigo-400 focus:outline-none"
                >
                  <option value="recent">Most Recent</option>
                  <option value="repeated">Most Repeated</option>
                  <option value="severity">Highest Severity</option>
                  <option value="due">Due for Revision</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Mistakes Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-slate-900/40 border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : mistakes.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-xl font-semibold text-slate-200">No unmastered mistakes found</h3>
            <p className="text-slate-400 text-sm mt-1 max-w-md mx-auto">
              Great job! Complete more practice sessions and mock tests to automatically track any missed concepts.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mistakes.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className={`group relative rounded-2xl p-5 bg-gradient-to-b from-slate-900/90 to-slate-950/90 border transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/5 ${
                  m.mastered
                    ? 'border-emerald-500/30 opacity-75'
                    : m.severity === 'high'
                    ? 'border-red-500/40'
                    : 'border-slate-800 hover:border-cyan-500/50'
                }`}
              >
                {/* Exam & Subject */}
                <div className="flex items-center justify-between mb-3 text-xs">
                  <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-semibold tracking-wide">
                    {m.exam} • {m.year || 'Practice'}
                  </span>
                  <span className="text-slate-400 font-medium">{m.subject}</span>
                </div>

                {/* Topic Title */}
                <h3 className="text-lg font-bold text-slate-100 mb-2 group-hover:text-cyan-300 transition-colors">
                  {m.topic}
                </h3>

                {/* Why You Missed It */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-4 text-xs">
                  <span className="text-slate-400 font-semibold block mb-1">Why you missed it:</span>
                  <p className="text-slate-300">
                    {m.explanation
                      ? m.explanation.slice(0, 100) + '...'
                      : `Missed on attempt #${m.attempt_count}. Classed as ${m.mistake_type.replace('_', ' ')}.`}
                  </p>
                </div>

                {/* Accuracy & Attempt Badges */}
                <div className="flex items-center justify-between text-xs text-slate-400 mb-5">
                  <span>Attempts: <strong className="text-slate-200">{m.attempt_count}</strong></span>
                  <span className={`font-semibold ${m.severity === 'high' ? 'text-red-400' : 'text-amber-400'}`}>
                    {m.severity.toUpperCase()} SEVERITY
                  </span>
                </div>

                {/* Card Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/60 text-xs font-semibold">
                  <button
                    onClick={() => setActiveModalMistake(m)}
                    className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center gap-1 transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5" /> Details
                  </button>

                  <button
                    onClick={() => handleAskStudyMate(m)}
                    className="py-2 px-3 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 flex items-center justify-center gap-1 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Ask StudyMate
                  </button>

                  <button
                    onClick={() => {
                      setActiveModalMistake(m);
                      handlePracticeSimilar(m);
                    }}
                    className="py-2 px-3 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center gap-1 transition-colors"
                  >
                    <Zap className="w-3.5 h-3.5 text-cyan-400" /> Practice Similar
                  </button>

                  <button
                    onClick={() => handleToggleMastered(m.id, m.mastered)}
                    className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1 transition-colors ${
                      m.mastered
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> {m.mastered ? 'Mastered' : 'Master'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Mistake Detail Modal */}
        <AnimatePresence>
          {activeModalMistake && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-2xl rounded-3xl p-6 bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
              >
                <button
                  onClick={() => {
                    setActiveModalMistake(null);
                    setPracticeSimilarQuestion(null);
                  }}
                  className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2 text-xs text-cyan-400 font-semibold mb-2">
                  <span>{activeModalMistake.exam}</span> • <span>{activeModalMistake.subject}</span> • <span>{activeModalMistake.topic}</span>
                </div>

                <h2 className="text-xl font-bold text-slate-100 mb-4">Mistake Deep-Dive</h2>

                {/* Original Question */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 mb-4">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Original Question</h4>
                  <p className="text-slate-200 text-sm font-medium mb-3">{activeModalMistake.question_snapshot.question_text}</p>
                  
                  {activeModalMistake.question_snapshot.options && (
                    <div className="space-y-1.5 text-xs text-slate-300">
                      {activeModalMistake.question_snapshot.options.map((opt, i) => (
                        <div key={i} className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/60">
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Answers & Explanation */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300">
                    <span className="font-semibold block mb-1">Your Answer:</span>
                    <code>{JSON.stringify(activeModalMistake.student_answer || 'No answer')}</code>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                    <span className="font-semibold block mb-1">Correct Answer:</span>
                    <code>{JSON.stringify(activeModalMistake.correct_answer)}</code>
                  </div>
                </div>

                {activeModalMistake.explanation && (
                  <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-slate-200 text-xs mb-4">
                    <span className="text-indigo-400 font-semibold block mb-1">Official Explanation:</span>
                    <p>{activeModalMistake.explanation}</p>
                  </div>
                )}

                {/* AI Practice Similar View */}
                {practiceSimilarQuestion && (
                  <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-semibold">AI-generated practice</span>
                      <span className="text-slate-400">Practice Similar</span>
                    </div>
                    <p className="text-slate-100 font-medium mb-2">{practiceSimilarQuestion.question_text}</p>
                    <div className="space-y-1 text-slate-300">
                      {practiceSimilarQuestion.options?.map((opt: string, idx: number) => (
                        <div key={idx} className="p-2 rounded bg-slate-900 border border-slate-800">{opt}</div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Modal Footer Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAddToFlashcards(activeModalMistake)}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1.5"
                    >
                      <PlusCircle className="w-4 h-4 text-cyan-400" />
                      {flashcardSaved ? 'Added to Flashcards!' : 'Add to Flashcards'}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAskStudyMate(activeModalMistake)}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold flex items-center gap-1.5"
                    >
                      <Sparkles className="w-4 h-4" /> Ask StudyMate
                    </button>
                    <button
                      onClick={() => handleToggleMastered(activeModalMistake.id, activeModalMistake.mastered)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {activeModalMistake.mastered ? 'Mastered' : 'Mark Mastered'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
