import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { useStudentContext } from '../../context/StudentContext';
import { getStudyMaterials, type StudyMaterial } from '../../lib/studyMaterialsApi';

export const RecommendedNotes: React.FC = () => {
  const { targetExam } = useStudentContext();
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadNotes() {
      setLoading(true);
      const items = await getStudyMaterials({ exam_code: targetExam });
      if (isMounted) {
        setMaterials(items.slice(0, 2));
        setLoading(false);
      }
    }
    loadNotes();
    return () => {
      isMounted = false;
    };
  }, [targetExam]);

  return (
    <div className="bg-paper rounded-3xl p-6 sm:p-8 border border-forest/10 shadow-card space-y-4">
      <div className="flex items-center justify-between">
        <span className="px-2.5 py-1 bg-scholar/10 text-scholar font-mono text-[10px] uppercase font-bold rounded-full border border-scholar/20">
          RECOMMENDED FOR YOU
        </span>
        <span className="text-xs text-muted font-mono">{targetExam} Handbooks</span>
      </div>

      <div>
        <h3 className="text-xl sm:text-2xl font-normal text-ink" style={{ fontFamily: "'Instrument Serif', serif" }}>
          Revise {targetExam} Core High-Yield Notes
        </h3>
        <p className="text-xs text-muted mt-1 leading-relaxed">
          Chapter-wise formula sheets, revision summaries, and high-yield handbooks verified for {targetExam}.
        </p>
      </div>

      {loading ? (
        <div className="h-16 bg-parchment animate-pulse rounded-2xl" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {materials.map((m) => (
            <div
              key={m.id}
              className="p-4 rounded-2xl bg-parchment/50 border border-forest/10 flex items-start gap-3 hover:border-scholar/30 transition-all"
            >
              <div className="p-2 rounded-xl bg-paper text-scholar shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <span className="text-[10px] font-mono text-terracotta uppercase font-semibold block">
                  {m.material_type.replace('_', ' ')}
                </span>
                <h4 className="text-xs font-bold text-ink truncate mt-0.5">{m.title}</h4>
                <span className="text-[10px] text-muted font-mono block mt-1">
                  {m.subject} • {m.format}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="pt-2 flex justify-end">
        <Link
          to={`/study-materials?exam=${encodeURIComponent(targetExam)}`}
          className="px-5 py-2.5 rounded-xl bg-scholar hover:bg-forest text-paper font-bold text-xs flex items-center gap-2 transition-colors shadow-sm"
        >
          <span>Open notes →</span>
        </Link>
      </div>
    </div>
  );
};
