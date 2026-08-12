// src/pages/ExamSetup.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, Target, Compass, Layers, CheckCircle2, ArrowRight, ArrowLeft,
  Calendar, Search
} from 'lucide-react';
import { fetchExamCatalog, type ExamCatalogItem } from '../lib/exam/examCatalog';
import { saveStudentProfile, saveSubjectRatings } from '../lib/studentCoreApi';
import { useAuth } from '../context/AuthContext';
import type {
  EducationPath, EducationStage, SchoolClass, SchoolBoard, CollegeDegree,
  CollegeYear, BranchMajor, ExamCategory, TargetGoal, CurrentLevel, SelfRating
} from '../types/student-core';

export default function ExamSetup() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<number>(1);
  const [isSaving, setIsSaving] = useState(false);

  // Path Choice State
  const [pathChoice, setPathChoice] = useState<EducationPath>('college');
  
  // School / College State
  const [educationStage, setEducationStage] = useState<EducationStage>('undergraduate');
  const [schoolClass, setSchoolClass] = useState<SchoolClass>('Class 12');
  const [schoolBoard, setSchoolBoard] = useState<SchoolBoard>('CBSE');
  const [collegeDegree, setCollegeDegree] = useState<CollegeDegree>('B.Tech / B.E.');
  const [collegeYear, setCollegeYear] = useState<CollegeYear>('3rd Year');
  const [branchMajor, setBranchMajor] = useState<BranchMajor>('Information Technology');
  const [semesterSubjectsText, setSemesterSubjectsText] = useState('Computer Networks, DBMS, Operating Systems, Software Engineering');

  // Competitive Exam State
  const [examCatalog, setExamCatalog] = useState<ExamCatalogItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [targetExam, setTargetExam] = useState<ExamCategory>('GATE');
  const [targetYear, setTargetYear] = useState<string>('2027');
  const [targetGoal, setTargetGoal] = useState<TargetGoal>('Top Rank');
  const [targetRank] = useState<string>('');
  const [targetScore] = useState<string>('');
  const [currentLevel, setCurrentLevel] = useState<CurrentLevel>('Some preparation done');
  const [subjectRatings] = useState<Record<string, SelfRating>>({});
  const [dailyHours, setDailyHours] = useState<number>(3);
  const [examDate, setExamDate] = useState<string>('2027-02-06');
  const [unknownDate, setUnknownDate] = useState(false);

  // Load Exam Catalog on Mount
  useEffect(() => {
    async function loadCatalog() {
      const catalog = await fetchExamCatalog();
      setExamCatalog(catalog);
      const gate = catalog.find((e) => e.id === 'GATE') || catalog[0];
      if (gate) {
        setTargetExam(gate.id);
        if (gate.defaultExamDate) setExamDate(gate.defaultExamDate);
      }
    }
    loadCatalog();
  }, []);

  const handleSelectExam = (examItem: ExamCatalogItem) => {
    setTargetExam(examItem.id);
    if (examItem.defaultExamDate) {
      setExamDate(examItem.defaultExamDate);
      setUnknownDate(false);
    }
  };

  const handleCompleteSetup = async () => {
    setIsSaving(true);
    const dailyStudyMinutes = dailyHours * 60;
    const collegeSubjs = semesterSubjectsText.split(',').map((s) => s.trim()).filter(Boolean);

    await saveStudentProfile({
      user_id: user?.id || 'guest',
      education_path: pathChoice,
      education_stage: educationStage,
      school_class: schoolClass,
      school_board: schoolBoard,
      degree: collegeDegree,
      college_year: collegeYear,
      branch_major: branchMajor,
      college_subjects: collegeSubjs,
      competitive_exam_enabled: pathChoice === 'competitive' || pathChoice === 'both',
      active_context: pathChoice === 'school' || pathChoice === 'college' ? 'college' : 'competitive',
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

    if (targetExam) {
      await saveSubjectRatings(targetExam, subjectRatings);
    }

    setIsSaving(false);
    navigate('/dashboard', { replace: true });
  };

  const filteredExams = examCatalog.filter(
    (e) =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.shortDesc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Helmet>
        <title>What are you here to achieve? — Study Hub</title>
        <meta name="description" content="Personalize your Study Hub experience." />
      </Helmet>

      <div className="min-h-screen py-12 px-6 max-w-4xl mx-auto flex flex-col justify-center">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-xs uppercase tracking-widest text-cyan-400 font-semibold liquid-glass px-4 py-1.5 rounded-full inline-block mb-3 border border-cyan-500/20">
            Step {step} of {pathChoice === 'school' || pathChoice === 'college' ? 3 : 5}
          </span>
          <h1
            className="text-4xl sm:text-5xl font-normal text-foreground tracking-tight"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            What are you here to achieve?
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            We'll personalize Study Hub around the way you actually study.
          </p>
        </div>

        <div className="liquid-glass-card rounded-3xl p-6 sm:p-10 relative overflow-hidden border border-white/10 shadow-2xl">
          <AnimatePresence mode="wait">
            {/* STEP 1: PATH CHOICE */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-medium text-foreground flex items-center gap-2">
                  <Compass className="w-5 h-5 text-cyan-400" />
                  What describes you best?
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Card 1: School / College */}
                  <button
                    type="button"
                    onClick={() => {
                      setPathChoice('college');
                      setEducationStage('undergraduate');
                    }}
                    className={`text-left p-6 rounded-2xl border transition-all flex flex-col justify-between group ${
                      pathChoice === 'college' || pathChoice === 'school'
                        ? 'bg-cyan-500/10 border-cyan-400 text-foreground ring-1 ring-cyan-400/50'
                        : 'liquid-glass border-white/10 text-muted-foreground hover:text-foreground hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-3 rounded-xl bg-cyan-400/20 text-cyan-300">
                        <GraduationCap className="w-6 h-6" />
                      </div>
                      {(pathChoice === 'college' || pathChoice === 'school') && <CheckCircle2 className="w-5 h-5 text-cyan-400" />}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">🎓 I'm in School / College</h3>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        Preparing for classes, assignments, semester exams, and academic learning.
                      </p>
                    </div>
                  </button>

                  {/* Card 2: Competitive Exam */}
                  <button
                    type="button"
                    onClick={() => setPathChoice('competitive')}
                    className={`text-left p-6 rounded-2xl border transition-all flex flex-col justify-between group ${
                      pathChoice === 'competitive'
                        ? 'bg-indigo-500/10 border-indigo-400 text-foreground ring-1 ring-indigo-400/50'
                        : 'liquid-glass border-white/10 text-muted-foreground hover:text-foreground hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-3 rounded-xl bg-indigo-400/20 text-indigo-300">
                        <Target className="w-6 h-6" />
                      </div>
                      {pathChoice === 'competitive' && <CheckCircle2 className="w-5 h-5 text-indigo-400" />}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">🎯 I'm preparing for a Competitive Exam</h3>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        Structured preparation for entrance, government, technical, medical or competitive exams.
                      </p>
                    </div>
                  </button>

                  {/* Card 3: Exploring */}
                  <button
                    type="button"
                    onClick={() => setPathChoice('exploring')}
                    className={`text-left p-6 rounded-2xl border transition-all flex flex-col justify-between group ${
                      pathChoice === 'exploring'
                        ? 'bg-purple-500/10 border-purple-400 text-foreground ring-1 ring-purple-400/50'
                        : 'liquid-glass border-white/10 text-muted-foreground hover:text-foreground hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-3 rounded-xl bg-purple-400/20 text-purple-300">
                        <Compass className="w-6 h-6" />
                      </div>
                      {pathChoice === 'exploring' && <CheckCircle2 className="w-5 h-5 text-purple-400" />}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">🧭 I'm exploring</h3>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        I want to learn and figure out what I should prepare for.
                      </p>
                    </div>
                  </button>

                  {/* Card 4: Both (College + Competitive) */}
                  <button
                    type="button"
                    onClick={() => setPathChoice('both')}
                    className={`text-left p-6 rounded-2xl border transition-all flex flex-col justify-between group ${
                      pathChoice === 'both'
                        ? 'bg-amber-500/10 border-amber-400 text-foreground ring-1 ring-amber-400/50'
                        : 'liquid-glass border-white/10 text-muted-foreground hover:text-foreground hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-3 rounded-xl bg-amber-400/20 text-amber-300">
                        <Layers className="w-6 h-6" />
                      </div>
                      {pathChoice === 'both' && <CheckCircle2 className="w-5 h-5 text-amber-400" />}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">🔄 I'm doing both</h3>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        Example: A college student preparing for GATE. Balance semester exams & competitive targets.
                      </p>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: SCHOOL / COLLEGE SPECIFIC DETAILS */}
            {step === 2 && (pathChoice === 'college' || pathChoice === 'school' || pathChoice === 'both') && (
              <motion.div
                key="step2-academic"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-medium text-foreground flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-cyan-400" />
                  Where are you studying?
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {(['school', 'diploma', 'undergraduate', 'postgraduate', 'other'] as EducationStage[]).map((stg) => (
                    <button
                      key={stg}
                      type="button"
                      onClick={() => setEducationStage(stg)}
                      className={`p-3.5 rounded-xl border text-center capitalize text-xs transition-all ${
                        educationStage === stg
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                          : 'liquid-glass border-white/10 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {stg}
                    </button>
                  ))}
                </div>

                {educationStage === 'school' ? (
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Class</label>
                        <select
                          value={schoolClass}
                          onChange={(e) => setSchoolClass(e.target.value as SchoolClass)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-cyan-400"
                        >
                          <option value="Class 9" className="bg-slate-900">Class 9</option>
                          <option value="Class 10" className="bg-slate-900">Class 10</option>
                          <option value="Class 11" className="bg-slate-900">Class 11</option>
                          <option value="Class 12" className="bg-slate-900">Class 12</option>
                          <option value="Other" className="bg-slate-900">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Board</label>
                        <select
                          value={schoolBoard}
                          onChange={(e) => setSchoolBoard(e.target.value as SchoolBoard)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-cyan-400"
                        >
                          <option value="CBSE" className="bg-slate-900">CBSE</option>
                          <option value="CISCE" className="bg-slate-900">CISCE</option>
                          <option value="State Board" className="bg-slate-900">State Board</option>
                          <option value="Other" className="bg-slate-900">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 pt-4 border-t border-white/10">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Degree</label>
                        <select
                          value={collegeDegree}
                          onChange={(e) => setCollegeDegree(e.target.value as CollegeDegree)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-cyan-400"
                        >
                          <option value="B.Tech / B.E." className="bg-slate-900">B.Tech / B.E.</option>
                          <option value="B.Sc" className="bg-slate-900">B.Sc</option>
                          <option value="B.Com" className="bg-slate-900">B.Com</option>
                          <option value="BBA" className="bg-slate-900">BBA</option>
                          <option value="BA" className="bg-slate-900">BA</option>
                          <option value="BCA" className="bg-slate-900">BCA</option>
                          <option value="MBBS" className="bg-slate-900">MBBS</option>
                          <option value="Other" className="bg-slate-900">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Year</label>
                        <select
                          value={collegeYear}
                          onChange={(e) => setCollegeYear(e.target.value as CollegeYear)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-cyan-400"
                        >
                          <option value="1st Year" className="bg-slate-900">1st Year</option>
                          <option value="2nd Year" className="bg-slate-900">2nd Year</option>
                          <option value="3rd Year" className="bg-slate-900">3rd Year</option>
                          <option value="4th Year" className="bg-slate-900">4th Year</option>
                          <option value="Other" className="bg-slate-900">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Branch / Major</label>
                        <select
                          value={branchMajor}
                          onChange={(e) => setBranchMajor(e.target.value as BranchMajor)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-cyan-400"
                        >
                          <option value="Computer Science" className="bg-slate-900">Computer Science</option>
                          <option value="Information Technology" className="bg-slate-900">Information Technology</option>
                          <option value="Mechanical" className="bg-slate-900">Mechanical</option>
                          <option value="Civil" className="bg-slate-900">Civil</option>
                          <option value="Electrical" className="bg-slate-900">Electrical</option>
                          <option value="Electronics" className="bg-slate-900">Electronics</option>
                          <option value="Mathematics" className="bg-slate-900">Mathematics</option>
                          <option value="Physics" className="bg-slate-900">Physics</option>
                          <option value="Other" className="bg-slate-900">Other</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Subjects this semester (Comma separated)</label>
                      <input
                        type="text"
                        value={semesterSubjectsText}
                        onChange={(e) => setSemesterSubjectsText(e.target.value)}
                        placeholder="e.g. Computer Networks, DBMS, OS, Data Structures"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 2/3: COMPETITIVE EXAM SELECTION */}
            {((step === 2 && (pathChoice === 'competitive' || pathChoice === 'exploring')) || (step === 3 && pathChoice === 'both')) && (
              <motion.div
                key="step-exam-select"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <h2 className="text-xl font-medium text-foreground flex items-center gap-2">
                    <Target className="w-5 h-5 text-indigo-400" />
                    Which exam are you preparing for?
                  </h2>

                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Search exam (e.g. GATE, JEE, NEET)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-foreground focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                  {filteredExams.map((item) => {
                    const isSel = targetExam === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectExam(item)}
                        className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all group ${
                          isSel
                            ? 'bg-indigo-500/15 border-indigo-400 text-foreground ring-1 ring-indigo-400/50'
                            : 'liquid-glass border-white/10 text-muted-foreground hover:text-foreground hover:border-white/30'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 uppercase font-semibold">
                            {item.category}
                          </span>
                          {isSel && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-foreground">{item.name}</h3>
                          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{item.shortDesc}</p>
                        </div>
                        <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-indigo-300">
                          <span>Cycle: {item.currentCycle}</span>
                          <span className="text-emerald-400">{item.availabilityBadge}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 3/4: EXAM TARGET, LEVEL & DAILY TIME */}
            {((step === 3 && (pathChoice === 'competitive' || pathChoice === 'exploring')) || (step === 4 && pathChoice === 'both')) && (
              <motion.div
                key="step-exam-details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-medium text-foreground flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-cyan-400" />
                  Target Year, Goal & Prep Schedule for {targetExam}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Target Year</label>
                    <select
                      value={targetYear}
                      onChange={(e) => setTargetYear(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-cyan-400"
                    >
                      <option value="2026" className="bg-slate-900">2026</option>
                      <option value="2027" className="bg-slate-900">2027</option>
                      <option value="2028" className="bg-slate-900">2028</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Preparation Goal</label>
                    <select
                      value={targetGoal}
                      onChange={(e) => setTargetGoal(e.target.value as TargetGoal)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-cyan-400"
                    >
                      <option value="Top Rank" className="bg-slate-900">Top Rank</option>
                      <option value="High Score" className="bg-slate-900">High Score</option>
                      <option value="Strong Score" className="bg-slate-900">Strong Score</option>
                      <option value="Qualify / Clear" className="bg-slate-900">Qualify / Clear</option>
                      <option value="I'm exploring" className="bg-slate-900">I'm exploring</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Daily Study Time</label>
                    <select
                      value={dailyHours}
                      onChange={(e) => setDailyHours(Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-cyan-400"
                    >
                      <option value={1} className="bg-slate-900">1 hour / day</option>
                      <option value={2} className="bg-slate-900">2 hours / day</option>
                      <option value={3} className="bg-slate-900">3 hours / day</option>
                      <option value={4} className="bg-slate-900">4 hours / day</option>
                      <option value={5} className="bg-slate-900">5+ hours / day</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <label className="text-xs text-muted-foreground mb-2 block">How far along are you in your preparation?</label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {(['Not started', 'Just started', 'Some preparation done', 'Well prepared', 'Revision phase'] as CurrentLevel[]).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setCurrentLevel(lvl)}
                        className={`p-3 rounded-xl border text-center text-xs transition-all ${
                          currentLevel === lvl
                            ? 'bg-purple-500/20 border-purple-400 text-purple-300 font-bold'
                            : 'liquid-glass border-white/10 text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-white/10">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="liquid-glass px-5 py-2.5 rounded-full text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : <div />}

            {(pathChoice === 'school' || pathChoice === 'college') && step === 2 ? (
              <button
                type="button"
                disabled={isSaving}
                onClick={handleCompleteSetup}
                className="gradient-cta px-8 py-3 rounded-full text-xs text-slate-950 font-bold hover:scale-105 transition-transform flex items-center gap-2 shadow-lg"
              >
                {isSaving ? 'Personalizing your study space...' : 'Open Academic Dashboard →'}
              </button>
            ) : step < (pathChoice === 'both' ? 4 : 3) ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="gradient-cta px-6 py-2.5 rounded-full text-xs text-slate-950 font-bold hover:scale-105 transition-transform flex items-center gap-2"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSaving}
                onClick={handleCompleteSetup}
                className="gradient-cta px-8 py-3 rounded-full text-xs text-slate-950 font-bold hover:scale-105 transition-transform flex items-center gap-2 shadow-lg"
              >
                {isSaving ? 'Personalizing your study space...' : 'Complete Setup & Open Dashboard →'}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
