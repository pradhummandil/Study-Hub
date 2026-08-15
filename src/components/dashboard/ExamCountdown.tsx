import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Shield } from 'lucide-react';
import { useStudentContext } from '../../context/StudentContext';
import { EXAM_CONFIGS } from '../../types/student-core';

export const ExamCountdown: React.FC = () => {
  const { profile, targetExam, targetExamYear } = useStudentContext();

  const examConfig = EXAM_CONFIGS[targetExam];
  const targetDateStr = profile?.exam_date || examConfig?.defaultExamDate;

  let daysRemaining: number | null = null;
  let formattedTargetDate = `${targetExamYear}`;

  if (targetDateStr) {
    const target = new Date(targetDateStr);
    const targetMs = target.getTime();
    const nowMs = new Date().getTime();
    const diff = Math.ceil((targetMs - nowMs) / (1000 * 60 * 60 * 24));
    if (diff > 0) daysRemaining = diff;

    formattedTargetDate = target.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  }

  return (
    <div className="bg-forest text-paper rounded-3xl p-6 border border-forest/20 shadow-deep space-y-4 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono font-bold text-gold uppercase tracking-wider bg-gold/15 px-2.5 py-1 rounded-full border border-gold/30 flex items-center gap-1.5">
          <Shield className="w-3 h-3" />
          {targetExam} {targetExamYear}
        </span>
        <Calendar className="w-4 h-4 text-sage" />
      </div>

      {daysRemaining !== null ? (
        <div className="text-center py-2 font-mono">
          <span className="text-4xl sm:text-5xl font-extrabold text-gold block tracking-tight leading-none">
            {daysRemaining}
          </span>
          <span className="text-[11px] text-sage uppercase tracking-widest block mt-2 font-sans font-semibold">
            DAYS UNTIL EXAM
          </span>
          <span className="text-xs text-paper/70 block mt-0.5">
            Target: {formattedTargetDate}
          </span>
        </div>
      ) : (
        <div className="text-center py-4 space-y-1 font-mono">
          <span className="text-lg font-bold text-paper block">Exam date not confirmed</span>
          <span className="text-xs text-sage block font-sans">Official schedule pending for {targetExam}</span>
        </div>
      )}

      <Link
        to="/exams"
        className="w-full py-2.5 bg-scholar hover:bg-scholar/90 text-paper font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
      >
        <span>View exam plan →</span>
      </Link>
    </div>
  );
};
