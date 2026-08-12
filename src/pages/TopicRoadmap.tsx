// src/pages/TopicRoadmap.tsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowLeft, CheckCircle2, BookOpen, CheckSquare, FileText, Sparkles, HelpCircle
} from 'lucide-react';
import { getTopicById, updateTopicProgress } from '../lib/roadmapApi';
import type { RoadmapTopic } from '../types/student-core';

export default function TopicRoadmap() {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const [topic, setTopic] = useState<RoadmapTopic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTopic() {
      setLoading(true);
      if (topicId) {
        const found = await getTopicById(topicId);
        setTopic(found);
      }
      setLoading(false);
    }
    loadTopic();
  }, [topicId]);

  const handleMarkComplete = async () => {
    if (!topic) return;
    const newStatus = topic.status === 'completed' ? 'in_progress' : 'completed';
    const newPct = newStatus === 'completed' ? 100 : 50;
    setTopic({ ...topic, status: newStatus, progress_pct: newPct });
    await updateTopicProgress(topic.id, newStatus, newPct);
  };

  const handleAskStudyMate = (subtopic?: string) => {
    const promptText = `Explain ${subtopic || topic?.title || 'this topic'} in depth for GATE exam preparation with key formulas, code examples, and PYQ strategy.`;
    navigate('/study-ai', {
      state: {
        mode: 'Explain',
        prompt: promptText,
        subject: topic?.subject,
      },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-3 h-3 rounded-full bg-muted-foreground skeleton-pulse" />
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6">
        <h2 className="text-2xl font-normal text-foreground" style={{ fontFamily: "'Instrument Serif', serif" }}>
          Topic Not Found
        </h2>
        <Link to="/roadmap" className="gradient-cta rounded-full px-6 py-2 text-xs text-black mt-4">
          Back to Roadmap
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{topic.title} — Roadmap | Study Hub</title>
        <meta name="description" content={`Learn and practice ${topic.title}.`} />
      </Helmet>

      <div className="px-6 pt-10 max-w-4xl mx-auto pb-24 space-y-8">
        {/* Back Link */}
        <Link to="/roadmap" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Roadmap
        </Link>

        {/* Topic Header Card */}
        <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <span className="text-xs uppercase tracking-widest text-cyan-400 font-semibold font-mono">
                {topic.subject}
              </span>
              <h1
                className="text-3xl sm:text-4xl font-normal text-foreground mt-1"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                {topic.title}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed max-w-xl">
                {topic.description}
              </p>
            </div>

            <button
              onClick={handleMarkComplete}
              className={`liquid-glass rounded-full px-5 py-2.5 text-xs font-semibold shrink-0 border transition-all flex items-center gap-2 ${
                topic.status === 'completed'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'border-white/20 text-foreground hover:bg-white/10'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {topic.status === 'completed' ? 'Completed ✓' : 'Mark Completed'}
            </button>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5 font-mono">
              <span>Topic Progress</span>
              <span className="text-foreground font-semibold">{topic.progress_pct || 0}%</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden p-0.5 border border-white/10">
              <div
                className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${topic.progress_pct || 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Every Topic Feature Action Hub */}
        <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 border border-white/10">
          <h2 className="text-xs uppercase tracking-widest text-cyan-400 font-semibold mb-4">
            FEATURE INTEGRATIONS — STUDY THIS TOPIC NOW
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <Link
              to="/studio"
              className="liquid-glass p-4 rounded-2xl border border-white/10 hover:border-cyan-500/40 text-center flex flex-col items-center gap-2 group transition-all"
            >
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-foreground">Learn</span>
              <span className="text-[10px] text-muted-foreground">Studio Resources</span>
            </Link>

            <Link
              to={`/practice?subject=${encodeURIComponent(topic.subject)}`}
              className="liquid-glass p-4 rounded-2xl border border-white/10 hover:border-emerald-500/40 text-center flex flex-col items-center gap-2 group transition-all"
            >
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                <CheckSquare className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-foreground">Practice</span>
              <span className="text-[10px] text-muted-foreground">Topic Questions</span>
            </Link>

            <Link
              to={`/practice?subject=${encodeURIComponent(topic.subject)}&type=PYQ`}
              className="liquid-glass p-4 rounded-2xl border border-white/10 hover:border-indigo-500/40 text-center flex flex-col items-center gap-2 group transition-all"
            >
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-foreground">PYQs</span>
              <span className="text-[10px] text-muted-foreground">Past Exam Papers</span>
            </Link>

            <Link
              to="/study-ai"
              state={{ mode: 'Quiz', prompt: `Generate a 5-question test on ${topic.title}` }}
              className="liquid-glass p-4 rounded-2xl border border-white/10 hover:border-amber-500/40 text-center flex flex-col items-center gap-2 group transition-all"
            >
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
                <HelpCircle className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-foreground">Quiz</span>
              <span className="text-[10px] text-muted-foreground">AI Quick Quiz</span>
            </Link>

            <button
              onClick={() => handleAskStudyMate()}
              className="liquid-glass p-4 rounded-2xl border border-white/10 hover:border-violet-500/40 text-center flex flex-col items-center gap-2 group transition-all col-span-2 sm:col-span-1"
            >
              <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400 group-hover:scale-110 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-foreground">Ask StudyMate</span>
              <span className="text-[10px] text-muted-foreground">Explain Topic</span>
            </button>
          </div>
        </div>

        {/* Subtopics Checklist */}
        <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
          <h2 className="text-xl font-normal text-foreground" style={{ fontFamily: "'Instrument Serif', serif" }}>
            Subtopic Syllabus Breakdown
          </h2>

          <div className="space-y-3">
            {topic.subtopics.map((sub, i) => (
              <div
                key={i}
                className="liquid-glass p-4 rounded-2xl flex items-center justify-between gap-4 border border-white/5 hover:border-white/20 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-cyan-400 font-semibold">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-xs sm:text-sm font-medium text-foreground">{sub}</span>
                </div>

                <button
                  onClick={() => handleAskStudyMate(sub)}
                  className="liquid-glass rounded-full px-3 py-1.5 text-[11px] text-violet-300 hover:bg-violet-500/20 transition-colors inline-flex items-center gap-1 shrink-0 border border-violet-500/30"
                >
                  <Sparkles className="w-3 h-3" />
                  Ask AI
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
