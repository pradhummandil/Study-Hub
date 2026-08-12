// src/pages/ExamSetup.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cpu, Atom, Zap, HeartPulse, GraduationCap, Landmark, BookOpen, Scale, Palette, Sparkles,
  CheckCircle2, ArrowRight, ArrowLeft, Calendar, Clock, Target, Award, BookMarked, UserCheck
} from 'lucide-react';
import { EXAM_CONFIGS, type ExamCategory, type TargetGoal, type CurrentLevel, type SelfRating } from '../types/student-core';
import { saveStudentProfile, saveSubjectRatings } from '../lib/studentCoreApi';
import { useAuth } from '../context/AuthContext';

const iconComponents: Record<string, any> = {
  Cpu, Atom, Zap, HeartPulse, GraduationCap, Landmark, BookOpen, Scale, Palette, Sparkles
};

export default function ExamSetup() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<number>(1);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [targetExam, setTargetExam] = useState<ExamCategory>('GATE');
  const [targetYear, setTargetYear] = useState<string>('2027');
  const [targetGoal, setTargetGoal] = useState<TargetGoal>('Top Rank');
  const [targetRank, setTargetRank] = useState<string>('');
  const [targetScore, setTargetScore] = useState<string>('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(EXAM_CONFIGS['GATE'].subjects);
  const [currentLevel, setCurrentLevel] = useState<CurrentLevel>('Intermediate');
  const [subjectRatings, setSubjectRatings] = useState<Record<string, SelfRating>>({});
  const [dailyHours, setDailyHours] = useState<number>(3); // 3 hours = 180 min
  const [examDate, setExamDate] = useState<string>(EXAM_CONFIGS['GATE'].defaultExamDate || '2027-02-06');
  const [unknownDate, setUnknownDate] = useState(false);

  const selectedExamConfig = EXAM_CONFIGS[targetExam] || EXAM_CONFIGS['GATE'];

  const handleSelectExam = (exam: ExamCategory) => {
    setTargetExam(exam);
    const config = EXAM_CONFIGS[exam];
    setSelectedSubjects(config.subjects);
    if (config.defaultExamDate) {
      setExamDate(config.defaultExamDate);
      setUnknownDate(false);
    }
  };

  const handleToggleSubject = (subject: string) => {
    if (selectedSubjects.includes(subject)) {
      if (selectedSubjects.length > 1) {
        setSelectedSubjects(selectedSubjects.filter((s) => s !== subject));
      }
    } else {
      setSelectedSubjects([...selectedSubjects, subject]);
    }
  };

  const handleRateSubject = (subject: string, rating: SelfRating) => {
    setSubjectRatings((prev) => ({ ...prev, [subject]: rating }));
  };

  const handleCompleteSetup = async () => {
    setIsSaving(true);
    const dailyStudyMinutes = dailyHours * 60;

    await saveStudentProfile({
      user_id: user?.id || 'guest',
      target_exam: targetExam,
      target_exam_year: targetYear,
      target_goal: targetGoal,
      target_rank: targetRank.trim() || undefined,
      target_score: targetScore.trim() || undefined,
      daily_study_minutes: dailyStudyMinutes,
      current_level: currentLevel,
      exam_date: unknownDate ? null : examDate,
      onboarding_completed: true,
      subject_ratings: subjectRatings,
    });

    await saveSubjectRatings(targetExam, subjectRatings);

    setIsSaving(false);
    navigate('/dashboard', { replace: true });
  };

  const currentYearInt = new Date().getFullYear();
  const yearOptions = [
    String(currentYearInt + 1),
    String(currentYearInt + 2),
    String(currentYearInt + 3),
    'Not sure yet',
  ];

  return (
    <>
      <Helmet>
        <title>Exam Setup — Study Hub</title>
        <meta name="description" content="Personalize your Study Hub experience." />
      </Helmet>

      <div className="min-h-screen py-12 px-6 max-w-4xl mx-auto flex flex-col justify-center">
        {/* Top Header */}
        <div className="text-center mb-8">
          <span className="text-xs uppercase tracking-widest text-cyan-400 font-semibold liquid-glass px-4 py-1.5 rounded-full inline-block mb-3 border border-cyan-500/20">
            Step {step} of 7
          </span>
          <h1
            className="text-4xl sm:text-5xl font-normal text-foreground tracking-tight"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Let's build your study path.
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            Tell us what you're preparing for. We'll personalize Study Hub around you.
          </p>
        </div>

        {/* Step Content Container */}
        <div className="liquid-glass-card rounded-3xl p-6 sm:p-10 relative overflow-hidden border border-white/10 shadow-2xl">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-medium text-foreground flex items-center gap-2">
                  <Target className="w-5 h-5 text-cyan-400" />
                  Step 1 — Target Exam
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(Object.keys(EXAM_CONFIGS) as ExamCategory[]).map((examKey) => {
                    const info = EXAM_CONFIGS[examKey];
                    const IconComponent = iconComponents[info.iconName] || Sparkles;
                    const isSelected = targetExam === examKey;

                    return (
                      <button
                        key={examKey}
                        type="button"
                        onClick={() => handleSelectExam(examKey)}
                        className={`text-left p-5 rounded-2xl border transition-all flex flex-col justify-between group ${
                          isSelected
                            ? 'bg-cyan-500/10 border-cyan-400 text-foreground ring-1 ring-cyan-400/50'
                            : 'liquid-glass border-white/10 text-muted-foreground hover:text-foreground hover:border-white/30'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-cyan-400/20 text-cyan-300' : 'bg-white/5 text-muted-foreground group-hover:text-foreground'}`}>
                            <IconComponent className="w-5 h-5" />
                          </div>
                          {isSelected && <CheckCircle2 className="w-5 h-5 text-cyan-400" />}
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-foreground">{info.name}</h3>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                            {info.shortDesc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-medium text-foreground flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-400" />
                  Step 2 — Which year are you targeting for {targetExam}?
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {yearOptions.map((yr) => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => setTargetYear(yr)}
                      className={`p-6 rounded-2xl border text-center transition-all ${
                        targetYear === yr
                          ? 'bg-indigo-500/10 border-indigo-400 text-foreground font-semibold ring-1 ring-indigo-400/50'
                          : 'liquid-glass border-white/10 text-muted-foreground hover:text-foreground hover:border-white/30'
                      }`}
                    >
                      <span className="text-2xl font-sans">{yr}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-medium text-foreground flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  Step 3 — What are you aiming for in {targetExam} {targetYear}?
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {(['Top Rank', 'Excellent Score', 'Strong Score', 'Just Clear the Exam', "I'm Exploring"] as TargetGoal[]).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setTargetGoal(g)}
                      className={`p-5 rounded-2xl border text-left transition-all ${
                        targetGoal === g
                          ? 'bg-amber-500/10 border-amber-400 text-foreground font-semibold ring-1 ring-amber-400/50'
                          : 'liquid-glass border-white/10 text-muted-foreground hover:text-foreground hover:border-white/30'
                      }`}
                    >
                      <span className="text-base">{g}</span>
                    </button>
                  ))}
                </div>

                <div className="pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Target Rank (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Under AIR 100"
                      value={targetRank}
                      onChange={(e) => setTargetRank(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Target Score / Marks (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. 75+ / 100"
                      value={targetScore}
                      onChange={(e) => setTargetScore(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-medium text-foreground flex items-center gap-2">
                  <BookMarked className="w-5 h-5 text-emerald-400" />
                  Step 4 — Select subjects you are preparing
                </h2>
                <p className="text-xs text-muted-foreground">Pre-populated based on {targetExam}. Tap to select or unselect.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                  {selectedExamConfig.subjects.map((subj) => {
                    const isChecked = selectedSubjects.includes(subj);
                    return (
                      <button
                        key={subj}
                        type="button"
                        onClick={() => handleToggleSubject(subj)}
                        className={`p-3.5 rounded-xl border text-left flex items-center justify-between text-xs transition-all ${
                          isChecked
                            ? 'bg-emerald-500/10 border-emerald-400 text-foreground font-medium'
                            : 'liquid-glass border-white/10 text-muted-foreground'
                        }`}
                      >
                        <span className="truncate pr-2">{subj}</span>
                        {isChecked && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-medium text-foreground flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-violet-400" />
                  Step 5 — Where are you right now?
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(['Beginner', 'Intermediate', 'Advanced', "I've already started seriously"] as CurrentLevel[]).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setCurrentLevel(lvl)}
                      className={`p-5 rounded-2xl border text-left transition-all ${
                        currentLevel === lvl
                          ? 'bg-violet-500/10 border-violet-400 text-foreground font-semibold ring-1 ring-violet-400/50'
                          : 'liquid-glass border-white/10 text-muted-foreground hover:text-foreground hover:border-white/30'
                      }`}
                    >
                      <span className="text-base">{lvl}</span>
                    </button>
                  ))}
                </div>

                <div className="pt-4 border-t border-white/10 space-y-3">
                  <p className="text-xs font-medium text-foreground">Self-Rating per Subject (Optional):</p>
                  <div className="grid grid-cols-1 gap-2.5 max-h-[35vh] overflow-y-auto pr-2 custom-scrollbar">
                    {selectedSubjects.slice(0, 6).map((subj) => (
                      <div key={subj} className="liquid-glass p-3 rounded-xl flex items-center justify-between text-xs">
                        <span className="text-muted-foreground truncate max-w-[50%]">{subj}</span>
                        <div className="flex gap-2">
                          {(['Weak', 'Average', 'Strong'] as SelfRating[]).map((rate) => {
                            const isSel = subjectRatings[subj] === rate;
                            return (
                              <button
                                key={rate}
                                type="button"
                                onClick={() => handleRateSubject(subj, rate)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] transition-colors ${
                                  isSel
                                    ? rate === 'Weak' ? 'bg-red-500/20 text-red-300 font-bold border border-red-500/40'
                                      : rate === 'Average' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                                      : 'bg-green-500/20 text-green-300 font-bold border border-green-500/40'
                                    : 'bg-white/5 text-muted-foreground hover:text-foreground'
                                }`}
                              >
                                {rate}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 6 && (
              <motion.div
                key="step6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-medium text-foreground flex items-center gap-2">
                  <Clock className="w-5 h-5 text-cyan-400" />
                  Step 6 — How much time can you realistically study each day?
                </h2>
                <p className="text-xs text-muted-foreground">We use this to build a realistic daily plan. No impossible 10-hour schedules.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    { hrs: 1, label: '1 hour' },
                    { hrs: 2, label: '2 hours' },
                    { hrs: 3, label: '3 hours' },
                    { hrs: 4, label: '4 hours' },
                    { hrs: 5, label: '5+ hours' },
                    { hrs: 3, label: 'Flexible' },
                  ].map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setDailyHours(opt.hrs)}
                      className={`p-6 rounded-2xl border text-center transition-all ${
                        dailyHours === opt.hrs
                          ? 'bg-cyan-500/10 border-cyan-400 text-foreground font-semibold ring-1 ring-cyan-400/50'
                          : 'liquid-glass border-white/10 text-muted-foreground hover:text-foreground hover:border-white/30'
                      }`}
                    >
                      <span className="text-xl font-sans">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 7 && (
              <motion.div
                key="step7"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-medium text-foreground flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-rose-400" />
                  Step 7 — Exam Date
                </h2>
                <div className="liquid-glass p-6 rounded-2xl space-y-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="unknown-date"
                      checked={unknownDate}
                      onChange={(e) => setUnknownDate(e.target.checked)}
                      className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                    />
                    <label htmlFor="unknown-date" className="text-sm text-foreground cursor-pointer">
                      Official exam date is not declared yet / Unknown
                    </label>
                  </div>

                  {!unknownDate && (
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Official or Target Exam Date</label>
                      <input
                        type="date"
                        value={examDate}
                        onChange={(e) => setExamDate(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  )}
                </div>

                {/* Summary Card */}
                <div className="bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 border border-cyan-500/20 p-5 rounded-2xl">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-cyan-300 mb-2">Setup Summary</h3>
                  <p className="text-sm text-foreground font-medium">
                    {targetExam} {targetYear} • {targetGoal} • {dailyHours}h daily • {selectedSubjects.length} Subjects Selected
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-white/10">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="liquid-glass px-5 py-2.5 rounded-full text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            ) : <div />}

            {step < 7 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="gradient-cta px-6 py-2.5 rounded-full text-xs text-black font-semibold hover:scale-105 transition-transform flex items-center gap-2"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSaving}
                onClick={handleCompleteSetup}
                className="gradient-cta px-8 py-3 rounded-full text-xs text-black font-semibold hover:scale-105 transition-transform flex items-center gap-2 shadow-lg"
              >
                {isSaving ? 'Building your study path...' : 'Complete Setup & Open Dashboard →'}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
