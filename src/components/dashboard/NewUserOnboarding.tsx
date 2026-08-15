import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import { useStudentContext } from '../../context/StudentContext';
import { EXAM_CONFIGS, type ExamCategory, type CurrentLevel } from '../../types/student-core';

interface NewUserOnboardingProps {
  onComplete: () => void;
  onStartDiagnostic: () => void;
}

export const NewUserOnboarding: React.FC<NewUserOnboardingProps> = ({
  onComplete,
  onStartDiagnostic,
}) => {
  const { profile, updateProfile, switchExam } = useStudentContext();
  const [step, setStep] = useState(1);
  const [selectedExam, setSelectedExam] = useState<ExamCategory>(profile?.target_exam || 'GATE');
  const [selectedYear, setSelectedYear] = useState(profile?.target_exam_year || '2027');
  const [dailyMinutes, setDailyMinutes] = useState(profile?.daily_study_minutes || 180);
  const [level, setLevel] = useState<CurrentLevel>(profile?.current_level || 'Just started');

  const handleFinishStep = async () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      await switchExam(selectedExam, selectedYear);
      await updateProfile({
        daily_study_minutes: dailyMinutes,
        current_level: level,
        onboarding_completed: true,
      });
      onComplete();
      onStartDiagnostic();
    }
  };

  return (
    <div className="bg-forest text-paper rounded-3xl p-6 sm:p-10 border border-forest/20 shadow-deep space-y-6">
      <div className="flex items-center justify-between border-b border-sage/20 pb-4">
        <div>
          <span className="text-[10px] uppercase font-bold text-gold tracking-widest font-mono">
            WELCOME TO STUDY HUB
          </span>
          <h2 className="text-2xl sm:text-3xl font-normal text-paper mt-0.5" style={{ fontFamily: "'Instrument Serif', serif" }}>
            Let's build your preparation around what matters.
          </h2>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-xs text-sage">
          <span className="font-bold text-gold">STEP {step}</span> / 4
        </div>
      </div>

      {/* Step 1: Target Exam */}
      {step === 1 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-paper font-sans">STEP 1: Choose your target exam</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(Object.keys(EXAM_CONFIGS) as ExamCategory[]).slice(0, 8).map((examKey) => {
              const isSelected = selectedExam === examKey;
              return (
                <button
                  key={examKey}
                  onClick={() => setSelectedExam(examKey)}
                  className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gold text-slate-950 font-bold border-gold shadow-md'
                      : 'bg-scholar/30 text-paper border-sage/20 hover:bg-scholar/50'
                  }`}
                >
                  <Shield className="w-4 h-4 mb-2 opacity-80" />
                  <span className="text-xs font-bold block">{examKey}</span>
                  <span className="text-[10px] opacity-75 font-mono block">
                    {EXAM_CONFIGS[examKey].currentCycle}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 2: Target Year */}
      {step === 2 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-paper font-sans">STEP 2: Choose your target year for {selectedExam}</h3>
          <div className="grid grid-cols-3 gap-3 max-w-md">
            {['2026', '2027', '2028'].map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`p-4 rounded-2xl text-center border font-mono text-lg font-bold transition-all cursor-pointer ${
                  selectedYear === year
                    ? 'bg-gold text-slate-950 border-gold shadow-md'
                    : 'bg-scholar/30 text-paper border-sage/20 hover:bg-scholar/50'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Daily Availability */}
      {step === 3 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-paper font-sans">STEP 3: Daily study availability</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { min: 60, label: '1 hour / day' },
              { min: 120, label: '2 hours / day' },
              { min: 180, label: '3 hours / day' },
              { min: 240, label: '4+ hours / day' },
            ].map(({ min, label }) => (
              <button
                key={min}
                onClick={() => setDailyMinutes(min)}
                className={`p-4 rounded-2xl text-center border font-mono text-xs font-bold transition-all cursor-pointer ${
                  dailyMinutes === min
                    ? 'bg-gold text-slate-950 border-gold shadow-md'
                    : 'bg-scholar/30 text-paper border-sage/20 hover:bg-scholar/50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 4: Preparation Level */}
      {step === 4 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-paper font-sans">STEP 4: What is your current preparation level?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'Just started', title: 'Just Started', desc: 'Covering fundamentals and basic theory' },
              { id: 'Some preparation done', title: 'Intermediate', desc: 'Practicing PYQs and chapter drills' },
              { id: 'Revision phase', title: 'Revision Phase', desc: 'Mock tests and spaced memory drills' },
            ].map(({ id, title, desc }) => (
              <button
                key={id}
                onClick={() => setLevel(id as CurrentLevel)}
                className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
                  level === id
                    ? 'bg-gold text-slate-950 font-bold border-gold shadow-md'
                    : 'bg-scholar/30 text-paper border-sage/20 hover:bg-scholar/50'
                }`}
              >
                <span className="text-xs font-bold block">{title}</span>
                <span className="text-[11px] opacity-80 block mt-1 leading-relaxed">{desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="pt-4 flex justify-between items-center border-t border-sage/20">
        {step > 1 ? (
          <button
            onClick={() => setStep(step - 1)}
            className="text-xs text-sage hover:text-paper font-mono underline cursor-pointer"
          >
            ← Previous step
          </button>
        ) : <div />}

        <button
          onClick={handleFinishStep}
          className="px-6 py-2.5 bg-gold hover:bg-gold/90 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
        >
          <span>{step === 4 ? 'Your first study day is ready →' : 'Continue →'}</span>
        </button>
      </div>
    </div>
  );
};
