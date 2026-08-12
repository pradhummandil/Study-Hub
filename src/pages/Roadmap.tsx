// src/pages/Roadmap.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CheckCircle2, Disc, Lock, ArrowRight } from 'lucide-react';
import { getRoadmap } from '../lib/roadmapApi';
import { getStudentProfile } from '../lib/studentCoreApi';
import type { RoadmapData, ExamCategory } from '../types/student-core';

export default function Roadmap() {
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [targetExam, setTargetExam] = useState<ExamCategory>('GATE');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const profile = await getStudentProfile();
      const exam = profile?.target_exam || 'GATE';
      setTargetExam(exam);
      const data = await getRoadmap(exam);
      setRoadmap(data);
      setLoading(false);
    }
    loadData();
  }, []);

  return (
    <>
      <Helmet>
        <title>My Roadmap — Study Hub</title>
        <meta name="description" content="A clear path from where you are to where you want to be." />
      </Helmet>

      {/* Header */}
      <div className="px-6 pt-12 max-w-5xl mx-auto text-center">
        <span className="text-xs uppercase tracking-widest text-cyan-400 font-semibold liquid-glass px-4 py-1.5 rounded-full inline-block mb-3 border border-cyan-500/20">
          {targetExam} Personalized Path
        </span>
        <h1
          className="text-4xl sm:text-5xl font-normal text-foreground tracking-tight"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          My Roadmap
        </h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
          A clear path from where you are to where you want to be.
        </p>

        {/* Progress Overview Bar */}
        {roadmap && (
          <div className="liquid-glass-card rounded-2xl p-6 mt-8 max-w-2xl mx-auto border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Overall Completion</p>
              <p className="text-2xl font-semibold text-foreground font-sans mt-0.5">
                {roadmap.overall_progress}% <span className="text-xs font-normal text-muted-foreground">({roadmap.completed_topics} of {roadmap.total_topics} topics completed)</span>
              </p>
            </div>
            <div className="w-full sm:w-48 bg-white/5 rounded-full h-3 overflow-hidden p-0.5 border border-white/10">
              <div
                className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${roadmap.overall_progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Sections List */}
      <div className="px-6 mt-10 max-w-5xl mx-auto pb-24 space-y-8">
        {loading ? (
          <div className="py-20 text-center text-xs text-muted-foreground skeleton-pulse">Loading personalized roadmap...</div>
        ) : !roadmap ? (
          <div className="text-center py-12">No roadmap available</div>
        ) : (
          roadmap.sections.map((sec) => (
            <div key={sec.id} className="liquid-glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 liquid-glass px-3 py-1 rounded-full border border-cyan-500/20">
                    {sec.category}
                  </span>
                  <h2 className="text-2xl font-normal text-foreground" style={{ fontFamily: "'Instrument Serif', serif" }}>
                    {sec.title}
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sec.topics.map((topic) => {
                  const topicSlug = topic.id || topic.subject.toLowerCase().replace(/\s+/g, '-');
                  const isCompleted = topic.status === 'completed';
                  const isInProgress = topic.status === 'in_progress';

                  return (
                    <Link
                      key={topic.id}
                      to={`/roadmap/${topicSlug}`}
                      className={`liquid-glass rounded-2xl p-5 border transition-all hover:scale-[1.01] flex flex-col justify-between group ${
                        isCompleted
                          ? 'border-emerald-500/30 bg-emerald-500/5'
                          : isInProgress
                          ? 'border-cyan-500/30 bg-cyan-500/5 ring-1 ring-cyan-500/20'
                          : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs text-muted-foreground font-mono">{topic.subject}</span>
                          <div className="flex items-center gap-1 text-xs">
                            {isCompleted ? (
                              <span className="text-emerald-400 font-medium flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" /> Completed
                              </span>
                            ) : isInProgress ? (
                              <span className="text-cyan-400 font-medium flex items-center gap-1">
                                <Disc className="w-4 h-4 animate-spin-slow" /> Current ({topic.progress_pct}%)
                              </span>
                            ) : (
                              <span className="text-muted-foreground flex items-center gap-1">
                                <Lock className="w-3.5 h-3.5" /> Upcoming
                              </span>
                            )}
                          </div>
                        </div>

                        <h3 className="text-lg font-semibold text-foreground group-hover:text-cyan-300 transition-colors">
                          {topic.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">
                          {topic.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Est. {topic.estimated_hours} hours</span>
                        <span className="text-cyan-400 font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                          Open Topic <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
