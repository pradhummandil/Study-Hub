import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { getRoadmap } from '../../lib/roadmapApi';
import type { RoadmapData } from '../../types/student-core';
import { useStudentContext } from '../../context/StudentContext';

export const RoadmapSnapshot: React.FC = () => {
  const { targetExam } = useStudentContext();
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadRoadmapData() {
      const data = await getRoadmap(targetExam);
      if (isMounted) setRoadmap(data);
    }
    loadRoadmapData();
    return () => {
      isMounted = false;
    };
  }, [targetExam]);

  const stagesList = [
    { name: 'Foundation', status: 'completed' },
    { name: 'Core Concepts', status: 'completed' },
    { name: 'Practice', status: 'current' },
    { name: 'Revision', status: 'upcoming' },
    { name: 'Mock', status: 'upcoming' },
    { name: 'Mastery', status: 'upcoming' },
  ];

  return (
    <div className="bg-paper rounded-3xl p-5 border border-forest/10 shadow-card space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-forest/10">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-muted font-bold font-mono">
            CURRENT STAGE
          </span>
          <h3 className="text-sm font-bold text-ink font-mono mt-0.5">
            PRACTICE STAGE
          </h3>
        </div>
        <span className="text-[10px] font-mono font-bold text-scholar bg-scholar/10 px-2.5 py-0.5 rounded-full border border-scholar/20">
          {roadmap?.overall_progress || 40}% Complete
        </span>
      </div>

      <div className="space-y-1 font-mono text-[11px] py-1">
        {stagesList.map((st) => (
          <div key={st.name} className="flex items-center gap-2">
            <span className={`w-3.5 text-center ${st.status === 'completed' ? 'text-scholar font-bold' : st.status === 'current' ? 'text-gold font-bold' : 'text-muted'}`}>
              {st.status === 'completed' ? '✓' : st.status === 'current' ? '●' : '○'}
            </span>
            <span className={st.status === 'current' ? 'font-bold text-ink bg-gold/15 px-2 py-0.5 rounded border border-gold/30' : st.status === 'completed' ? 'text-ink/80' : 'text-muted'}>
              {st.name}
            </span>
          </div>
        ))}
      </div>

      <Link
        to="/roadmap"
        className="w-full py-2 bg-paper hover:bg-parchment text-ink border border-forest/15 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
      >
        <BookOpen className="w-3.5 h-3.5 text-scholar" />
        <span>Open roadmap →</span>
      </Link>
    </div>
  );
};
