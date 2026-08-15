import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { RotateCcw, CheckCircle2 } from 'lucide-react';
import { fetchRevisionItems, getRevisionStats } from '../../lib/intelligence/revision';
import type { RevisionItem } from '../../types/intelligence';
import { useStudentContext } from '../../context/StudentContext';

export const RevisionQueue: React.FC = () => {
  const { targetExam } = useStudentContext();
  const [items, setItems] = useState<RevisionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadRevision() {
      setLoading(true);
      const res = await fetchRevisionItems(targetExam);
      if (isMounted) {
        setItems(res);
        setLoading(false);
      }
    }
    loadRevision();
    return () => {
      isMounted = false;
    };
  }, [targetExam]);

  const stats = getRevisionStats(items);
  const topicsSet = Array.from(new Set(items.map((i) => i.subject || i.topic))).slice(0, 4);

  return (
    <div className="bg-paper rounded-3xl p-5 border border-forest/10 shadow-card space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-forest/10">
        <div>
          <h3 className="text-[10px] uppercase tracking-wider text-muted font-bold font-mono">
            REVISION DUE TODAY
          </h3>
          <span className="text-xs text-ink font-semibold block mt-0.5 font-mono">
            {stats.dueToday} cards · {topicsSet.length > 0 ? topicsSet.length : 1} topics
          </span>
        </div>
        <span className="text-[10px] font-mono font-bold text-gold bg-gold/15 px-2.5 py-1 rounded-full border border-gold/30">
          {stats.dueToday > 0 ? `${stats.dueToday} Due` : 'Up to date'}
        </span>
      </div>

      {loading ? (
        <div className="h-16 bg-parchment animate-pulse rounded-xl" />
      ) : topicsSet.length > 0 ? (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
            {topicsSet.map((tName) => (
              <span key={tName} className="px-2.5 py-1 bg-parchment/80 rounded-lg text-ink font-semibold border border-forest/10">
                {tName}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-3 bg-parchment/40 rounded-xl text-center text-xs text-muted font-sans flex items-center justify-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-scholar" />
          <span>All spaced revisions for today are complete!</span>
        </div>
      )}

      <Link
        to="/revision"
        className="w-full py-2 bg-scholar hover:bg-forest text-paper font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>Start revision →</span>
      </Link>
    </div>
  );
};
