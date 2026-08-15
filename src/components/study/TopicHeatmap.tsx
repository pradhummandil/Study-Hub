import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Play, Video, BookOpen, RotateCcw, Layers, AlertCircle } from 'lucide-react';

export interface TopicHeatmapItem {
  topic: string;
  accuracyPct: number;
  questionCount: number;
  videoCount: number;
  notesCount: number;
  revisionCount: number;
  mistakesCount: number;
}

interface TopicHeatmapProps {
  subject: string;
  topics: TopicHeatmapItem[];
}

export const TopicHeatmap: React.FC<TopicHeatmapProps> = ({ subject, topics }) => {
  const [selectedTopic, setSelectedTopic] = useState<TopicHeatmapItem | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-ink font-mono uppercase tracking-wider">
          {subject} Topic Strength Heatmap
        </h3>
        <span className="text-xs text-muted font-mono">{topics.length} Topics</span>
      </div>

      <div className="space-y-2.5">
        {topics.map((item) => {
          // Palette colors based on accuracy
          let barBg = 'bg-rose-500';
          let textColor = 'text-rose-700';
          if (item.accuracyPct >= 75) {
            barBg = 'bg-emerald-600';
            textColor = 'text-emerald-700';
          } else if (item.accuracyPct >= 50) {
            barBg = 'bg-scholar';
            textColor = 'text-scholar';
          }

          return (
            <div
              key={item.topic}
              onClick={() => setSelectedTopic(item)}
              className="bg-parchment/60 hover:bg-parchment p-3.5 rounded-2xl border border-forest/10 cursor-pointer transition-all flex items-center justify-between gap-4 group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-ink group-hover:text-scholar transition-colors truncate">
                    {item.topic}
                  </span>
                  <span className={`text-xs font-mono font-bold ${textColor}`}>
                    {item.accuracyPct}% Accuracy
                  </span>
                </div>

                <div className="w-full bg-forest/10 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barBg}`}
                    style={{ width: `${Math.max(5, item.accuracyPct)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Slide-Over Drawer / Drawer Modal on Topic Click */}
      {selectedTopic && (
        <div className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-paper border border-forest/15 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-forest/10">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-muted font-bold">
                  {subject}
                </span>
                <h2 className="text-xl font-normal text-ink" style={{ fontFamily: "'Instrument Serif', serif" }}>
                  {selectedTopic.topic}
                </h2>
              </div>
              <button
                onClick={() => setSelectedTopic(null)}
                className="p-1.5 rounded-xl hover:bg-parchment text-muted hover:text-ink transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-parchment/60 p-3 rounded-2xl border border-forest/10">
                <span className="text-xs text-muted font-mono block">Accuracy</span>
                <span className="text-xl font-bold font-mono text-scholar">{selectedTopic.accuracyPct}%</span>
              </div>
              <div className="bg-parchment/60 p-3 rounded-2xl border border-forest/10">
                <span className="text-xs text-muted font-mono block">Questions</span>
                <span className="text-xl font-bold font-mono text-ink">{selectedTopic.questionCount}</span>
              </div>
            </div>

            {/* Actions Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <Link
                to={`/practice?subject=${encodeURIComponent(subject)}&topic=${encodeURIComponent(selectedTopic.topic)}`}
                className="p-3 bg-scholar text-paper rounded-2xl text-xs font-bold flex items-center gap-2 hover:bg-forest transition-colors shadow-xs"
              >
                <Play className="w-4 h-4 fill-paper" />
                <span>Practice Topic</span>
              </Link>

              <Link
                to={`/video-learning?subject=${encodeURIComponent(subject)}&topic=${encodeURIComponent(selectedTopic.topic)}`}
                className="p-3 bg-parchment border border-forest/15 text-ink rounded-2xl text-xs font-bold flex items-center gap-2 hover:bg-paper transition-colors"
              >
                <Video className="w-4 h-4 text-scholar" />
                <span>Watch Videos ({selectedTopic.videoCount})</span>
              </Link>

              <Link
                to={`/notes?subject=${encodeURIComponent(subject)}&topic=${encodeURIComponent(selectedTopic.topic)}`}
                className="p-3 bg-parchment border border-forest/15 text-ink rounded-2xl text-xs font-bold flex items-center gap-2 hover:bg-paper transition-colors"
              >
                <BookOpen className="w-4 h-4 text-terracotta" />
                <span>Read Notes ({selectedTopic.notesCount})</span>
              </Link>

              <Link
                to={`/revision?subject=${encodeURIComponent(subject)}&topic=${encodeURIComponent(selectedTopic.topic)}`}
                className="p-3 bg-parchment border border-forest/15 text-ink rounded-2xl text-xs font-bold flex items-center gap-2 hover:bg-paper transition-colors"
              >
                <RotateCcw className="w-4 h-4 text-gold" />
                <span>Spaced Revision ({selectedTopic.revisionCount})</span>
              </Link>

              <Link
                to={`/flashcards?subject=${encodeURIComponent(subject)}&topic=${encodeURIComponent(selectedTopic.topic)}`}
                className="p-3 bg-parchment border border-forest/15 text-ink rounded-2xl text-xs font-bold flex items-center gap-2 hover:bg-paper transition-colors"
              >
                <Layers className="w-4 h-4 text-scholar" />
                <span>Flashcards</span>
              </Link>

              <Link
                to={`/mistakes?subject=${encodeURIComponent(subject)}&topic=${encodeURIComponent(selectedTopic.topic)}`}
                className="p-3 bg-parchment border border-forest/15 text-ink rounded-2xl text-xs font-bold flex items-center gap-2 hover:bg-paper transition-colors"
              >
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>Mistakes ({selectedTopic.mistakesCount})</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
