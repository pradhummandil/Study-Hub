import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Play,
  Video,
  FileText,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import type { ExamTaxonomyNode } from '../../lib/questionEngineApi';
import { useStudentContext } from '../../context/StudentContext';
import { createOrUpdateRevisionItem } from '../../lib/intelligence/revision';

interface CurriculumExplorerProps {
  taxonomyNodes: ExamTaxonomyNode[];
}

export const CurriculumExplorer: React.FC<CurriculumExplorerProps> = ({
  taxonomyNodes,
}) => {
  const { targetExam } = useStudentContext();
  const [expandedSubject, setExpandedSubject] = useState<string | null>(
    taxonomyNodes.length > 0 ? taxonomyNodes[0].subject : null
  );
  const [addedRevisionTopic, setAddedRevisionTopic] = useState<string | null>(null);

  const handleAddRevision = async (e: React.MouseEvent, subject: string, topic: string) => {
    e.stopPropagation();
    await createOrUpdateRevisionItem({
      exam: targetExam,
      subject,
      topic,
      sourceType: 'concept',
      title: `${topic} — High Yield Revision`,
      summaryNotes: `Added from Curriculum Command Center for ${targetExam}.`,
    });
    setAddedRevisionTopic(topic);
    setTimeout(() => setAddedRevisionTopic(null), 2500);
  };

  const getTopicStatusBadge = (solved: number, accuracy: number) => {
    if (solved === 0) return { label: 'LIMITED DATA', style: 'bg-parchment text-muted border-forest/10' };
    if (solved < 5) return { label: 'DEVELOPING', style: 'bg-gold/15 text-gold border-gold/30' };
    if (accuracy >= 80) return { label: 'STRONG', style: 'bg-scholar/15 text-scholar border-scholar/30' };
    if (accuracy >= 60) return { label: 'READY', style: 'bg-scholar/10 text-scholar border-scholar/20' };
    return { label: 'REVISION DUE', style: 'bg-terracotta/15 text-terracotta border-terracotta/30' };
  };

  return (
    <div className="bg-paper rounded-3xl p-5 sm:p-6 border border-forest/10 shadow-card space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-forest/10">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-muted font-bold font-mono">
            YOUR PREPARATION
          </span>
          <h2 className="text-xl sm:text-2xl font-normal text-ink mt-0.5" style={{ fontFamily: "'Instrument Serif', serif" }}>
            {targetExam} · {taxonomyNodes.length} subjects
          </h2>
        </div>
        <span className="text-[11px] text-muted font-mono bg-parchment px-3 py-1 rounded-xl border border-forest/10 shrink-0 font-semibold self-start sm:self-auto">
          {taxonomyNodes.reduce((acc, n) => acc + n.totalQuestions, 0)} Total Questions
        </span>
      </div>

      <div className="space-y-2.5">
        {taxonomyNodes.map((node) => {
          const isExpanded = expandedSubject === node.subject;
          const totalTopics = node.chapters.reduce((acc, c) => acc + c.topics.length, 0);
          const totalQuestions = node.totalQuestions || 42;

          return (
            <div
              key={node.subject}
              className={`border rounded-2xl overflow-hidden transition-all ${
                isExpanded
                  ? 'border-scholar/30 bg-parchment/50 shadow-xs'
                  : 'border-forest/10 bg-parchment/30 hover:border-forest/20'
              }`}
            >
              {/* Subject Row Header */}
              <button
                onClick={() => setExpandedSubject(isExpanded ? null : node.subject)}
                className="w-full px-4 py-3 flex items-center justify-between text-left transition-colors cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-xl ${isExpanded ? 'bg-scholar text-paper' : 'bg-parchment text-scholar'}`}>
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-ink">{node.subject}</h3>
                    <p className="text-[10px] text-muted font-mono">
                      {totalQuestions} questions • {totalTopics} topics
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="hidden sm:block text-right font-mono">
                    <span className="text-[11px] font-bold text-ink">
                      {totalQuestions} Qs
                    </span>
                    <div className="w-20 bg-paper rounded-full h-1.5 overflow-hidden border border-forest/10 mt-1">
                      <div className="bg-scholar h-full w-[40%] rounded-full" />
                    </div>
                  </div>

                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-scholar" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted" />
                  )}
                </div>
              </button>

              {/* Subject Detail Panel (Expandable) */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden border-t border-forest/10 bg-paper"
                  >
                    <div className="p-4 space-y-4">
                      {/* Chapters & Topics List */}
                      <div className="space-y-3">
                        {node.chapters.map((chap) => (
                          <div key={chap.name} className="space-y-2">
                            <div className="text-[10px] font-bold text-muted uppercase tracking-wider font-mono border-b border-forest/10 pb-1">
                              {chap.name}
                            </div>

                            <div className="space-y-2">
                              {chap.topics.map((top) => {
                                const status = getTopicStatusBadge(top.solvedQuestions, top.accuracyPct);
                                return (
                                  <div
                                    key={top.name}
                                    className="p-3 bg-parchment/30 rounded-xl border border-forest/10 flex flex-col md:flex-row md:items-center justify-between gap-2 hover:border-scholar/30 transition-all group"
                                  >
                                    <div className="space-y-0.5">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-ink">{top.name}</span>
                                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${status.style}`}>
                                          {status.label}
                                        </span>
                                      </div>
                                      <div className="text-[10px] text-muted font-mono">
                                        {top.totalQuestions || 10} Questions • PYQ {top.pyqCoveragePct || 85}%
                                      </div>
                                    </div>

                                    {/* 4 Compact Hover/Expand Buttons */}
                                    <div className="flex flex-wrap items-center gap-1 shrink-0 opacity-90 group-hover:opacity-100 transition-opacity">
                                      <Link
                                        to={`/practice?subject=${encodeURIComponent(node.subject)}&topic=${encodeURIComponent(top.name)}`}
                                        className="px-2.5 py-1 bg-scholar text-paper rounded-lg text-[10px] font-bold inline-flex items-center gap-1 hover:bg-forest transition-colors shadow-xs"
                                      >
                                        <Play className="w-2.5 h-2.5 fill-paper" />
                                        <span>Practice</span>
                                      </Link>

                                      <Link
                                        to={`/video-learning?subject=${encodeURIComponent(node.subject)}&topic=${encodeURIComponent(top.name)}`}
                                        className="px-2.5 py-1 bg-paper text-ink border border-forest/15 rounded-lg text-[10px] font-semibold inline-flex items-center gap-1 hover:bg-parchment transition-colors"
                                      >
                                        <Video className="w-2.5 h-2.5 text-scholar" />
                                        <span>Watch</span>
                                      </Link>

                                      <Link
                                        to={`/study-materials?subject=${encodeURIComponent(node.subject)}&topic=${encodeURIComponent(top.name)}`}
                                        className="px-2.5 py-1 bg-paper text-ink border border-forest/15 rounded-lg text-[10px] font-semibold inline-flex items-center gap-1 hover:bg-parchment transition-colors"
                                      >
                                        <FileText className="w-2.5 h-2.5 text-terracotta" />
                                        <span>Notes</span>
                                      </Link>

                                      <button
                                        onClick={(e) => handleAddRevision(e, node.subject, top.name)}
                                        className="px-2.5 py-1 bg-paper text-ink border border-forest/15 rounded-lg text-[10px] font-semibold inline-flex items-center gap-1 hover:bg-parchment transition-colors cursor-pointer"
                                        title="Add to Spaced Revision Queue"
                                      >
                                        {addedRevisionTopic === top.name ? (
                                          <>
                                            <CheckCircle2 className="w-2.5 h-2.5 text-scholar" />
                                            <span className="text-scholar">Added!</span>
                                          </>
                                        ) : (
                                          <>
                                            <RotateCcw className="w-2.5 h-2.5 text-gold" />
                                            <span>Revise</span>
                                          </>
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};
