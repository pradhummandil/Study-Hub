import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, ArrowRight, ArrowLeft, Search, Clock, Sparkles, Check
} from 'lucide-react';
import { fetchExamCatalog, type ExamCatalogItem } from '../lib/exam/examCatalog';
import { saveStudentProfile } from '../lib/studentCoreApi';
import { useAuth } from '../context/AuthContext';
import type { EducationPath, EducationStage, SchoolClass, SchoolBoard, CollegeDegree, CollegeYear, BranchMajor, ExamCategory, TargetGoal } from '../types/student-core';

export default function ExamSetup() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Step State: 1 to 5 (Form), 6 (Preview), 7 (Celebration Boot -> /dashboard)
  const [step, setStep] = useState<number>(1);
  const [isSaving, setIsSaving] = useState(false);

  // Step 1: Goal Choice
  const [pathChoice, setPathChoice] = useState<EducationPath>('competitive');

  // Step 2: Exam / Academic Setup
  const [examCatalog, setExamCatalog] = useState<ExamCatalogItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [targetExam, setTargetExam] = useState<ExamCategory>('GATE');
  
  // Academic fields
  const educationStage: EducationStage = 'undergraduate';
  const schoolClass: SchoolClass = 'Class 12';
  const schoolBoard: SchoolBoard = 'CBSE';
  const collegeDegree: CollegeDegree = 'B.Tech / B.E.';
  const collegeYear: CollegeYear = '3rd Year';
  const branchMajor: BranchMajor = 'Computer Science';
  const semesterSubjectsText = 'Computer Networks, DBMS, Operating Systems';

  // Step 3: Target Cycle & Goal
  const [targetYear, setTargetYear] = useState<string>('2027');
  const [targetGoal, setTargetGoal] = useState<TargetGoal>('Top Rank');

  // Step 4: Daily Hours
  const [dailyHoursText, setDailyHoursText] = useState<string>('3 hours');
  const [dailyStudyMinutes, setDailyStudyMinutes] = useState<number>(180);

  // Step 5: Primary Needs (Multi-Select)
  const [primaryNeeds, setPrimaryNeeds] = useState<string[]>([
    'Understand concepts', 'Practice questions', 'Previous year papers', 'Mock tests', 'Revision', 'Ask StudyMate'
  ]);

  // Load Exam Catalog
  useEffect(() => {
    async function loadCatalog() {
      const catalog = await fetchExamCatalog();
      setExamCatalog(catalog);
      const defaultExam = catalog.find((e) => e.id === 'GATE') || catalog[0];
      if (defaultExam) {
        setTargetExam(defaultExam.id);
        if (defaultExam.currentCycle) setTargetYear(defaultExam.currentCycle);
      }
    }
    loadCatalog();
  }, []);

  // Filter Categories
  const categories = ['All', 'Engineering', 'Medical', 'University', 'Government', 'Management', 'Law', 'Defence', 'Teaching', 'Design'];

  const filteredExams = examCatalog.filter((e) => {
    const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) || e.shortDesc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || e.category.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCat;
  });

  const toggleNeed = (need: string) => {
    if (primaryNeeds.includes(need)) {
      setPrimaryNeeds(primaryNeeds.filter((n) => n !== need));
    } else {
      setPrimaryNeeds([...primaryNeeds, need]);
    }
  };

  const handleSelectHours = (label: string, minutes: number) => {
    setDailyHoursText(label);
    setDailyStudyMinutes(minutes);
  };

  const handleProceedToPreview = () => {
    setStep(6);
  };

  const handleFinalSubmit = async () => {
    setIsSaving(true);
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
      daily_study_minutes: dailyStudyMinutes,
      onboarding_completed: true,
    });

    // Step 7: Celebration transition duration 800ms
    setStep(7);
    setTimeout(() => {
      setIsSaving(false);
      navigate('/dashboard', { replace: true });
    }, 850);
  };

  return (
    <>
      <Helmet>
        <title>First-Time Onboarding — Study Hub</title>
        <meta name="description" content="Personalize your Study Hub experience." />
      </Helmet>

      <div className="min-h-screen py-12 px-6 max-w-4xl mx-auto flex flex-col justify-center bg-gradient-to-b from-[#F8FCFF] via-[#EDF6FF] to-[#FFFFFF]">
        
        {/* Step Indicator Header */}
        {step <= 5 && (
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-[#287BFF] bg-white px-4 py-1.5 rounded-full inline-block mb-3 border border-[#287BFF]/20 shadow-sm">
              0{step} / 05
            </span>
            <h1
              className="text-4xl sm:text-5xl font-normal text-[#062B3D] tracking-tight"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Let's build your study space.
            </h1>
            <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
              We'll personalize Study Hub specifically around your targets and schedule.
            </p>
          </div>
        )}

        {/* Glass Card Container */}
        <div className="bg-[#062B3D] text-white rounded-3xl p-6 sm:p-10 relative overflow-hidden border border-white/10 shadow-2xl">
          
          <AnimatePresence mode="wait">
            
            {/* STEP 1: WHAT ARE YOU HERE TO ACHIEVE? */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="mb-4">
                  <span className="text-[#5CE1E6] text-xs font-bold uppercase tracking-wider">Step 01</span>
                  <h2 className="text-2xl font-bold text-white mt-1">What are you here to achieve?</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Card 1: School */}
                  <button
                    type="button"
                    onClick={() => setPathChoice('school')}
                    className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      pathChoice === 'school'
                        ? 'bg-[#287BFF]/20 border-[#287BFF] ring-2 ring-[#287BFF]/50 text-white'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl">🎓</span>
                      {pathChoice === 'school' && <CheckCircle2 className="w-5 h-5 text-[#5CE1E6]" />}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">School</h3>
                      <p className="text-xs text-slate-300 mt-1">I'm studying for school classes and board exams.</p>
                    </div>
                  </button>

                  {/* Card 2: College */}
                  <button
                    type="button"
                    onClick={() => setPathChoice('college')}
                    className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      pathChoice === 'college'
                        ? 'bg-[#287BFF]/20 border-[#287BFF] ring-2 ring-[#287BFF]/50 text-white'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl">🏫</span>
                      {pathChoice === 'college' && <CheckCircle2 className="w-5 h-5 text-[#5CE1E6]" />}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">College</h3>
                      <p className="text-xs text-slate-300 mt-1">I'm managing classes, semesters and academic work.</p>
                    </div>
                  </button>

                  {/* Card 3: Competitive Exam */}
                  <button
                    type="button"
                    onClick={() => setPathChoice('competitive')}
                    className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      pathChoice === 'competitive'
                        ? 'bg-[#287BFF]/20 border-[#287BFF] ring-2 ring-[#287BFF]/50 text-white'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl">🎯</span>
                      {pathChoice === 'competitive' && <CheckCircle2 className="w-5 h-5 text-[#5CE1E6]" />}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">Competitive Exam</h3>
                      <p className="text-xs text-slate-300 mt-1">I'm preparing for an entrance or government exam.</p>
                    </div>
                  </button>

                  {/* Card 4: Both */}
                  <button
                    type="button"
                    onClick={() => setPathChoice('both')}
                    className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      pathChoice === 'both'
                        ? 'bg-[#287BFF]/20 border-[#287BFF] ring-2 ring-[#287BFF]/50 text-white'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl">🔀</span>
                      {pathChoice === 'both' && <CheckCircle2 className="w-5 h-5 text-[#5CE1E6]" />}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">Both</h3>
                      <p className="text-xs text-slate-300 mt-1">I'm in school/college & preparing for a competitive exam.</p>
                    </div>
                  </button>

                  {/* Card 5: Exploring */}
                  <button
                    type="button"
                    onClick={() => setPathChoice('exploring')}
                    className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between sm:col-span-2 ${
                      pathChoice === 'exploring'
                        ? 'bg-[#287BFF]/20 border-[#287BFF] ring-2 ring-[#287BFF]/50 text-white'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">🧭</span>
                      {pathChoice === 'exploring' && <CheckCircle2 className="w-5 h-5 text-[#5CE1E6]" />}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">I'm exploring</h3>
                      <p className="text-xs text-slate-300">I don't know yet — help me decide.</p>
                    </div>
                  </button>

                </div>
              </motion.div>
            )}

            {/* STEP 2: WHICH EXAM ARE YOU PREPARING FOR? */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[#5CE1E6] text-xs font-bold uppercase tracking-wider">Step 02</span>
                    <h2 className="text-2xl font-bold text-white mt-1">Which exam are you preparing for?</h2>
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Search (e.g. GATE, JEE, NEET)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white/5 border border-white/15 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-[#5CE1E6]"
                    />
                  </div>
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 custom-scrollbar">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-[#287BFF] text-white'
                          : 'bg-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Exam Catalog Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[45vh] overflow-y-auto pr-2 custom-scrollbar">
                  {filteredExams.map((item) => {
                    const isSel = targetExam === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setTargetExam(item.id);
                          if (item.currentCycle) setTargetYear(item.currentCycle);
                        }}
                        className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          isSel
                            ? 'bg-[#287BFF]/25 border-[#287BFF] ring-2 ring-[#287BFF]/50 text-white'
                            : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] uppercase font-bold text-[#5CE1E6] bg-[#5CE1E6]/20 px-2 py-0.5 rounded">
                            {item.category}
                          </span>
                          {isSel && <CheckCircle2 className="w-4 h-4 text-[#5CE1E6]" />}
                        </div>
                        <h3 className="text-sm font-bold text-white">{item.name}</h3>
                        <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">{item.shortDesc}</p>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 3: WHEN ARE YOU TARGETING? */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <span className="text-[#5CE1E6] text-xs font-bold uppercase tracking-wider">Step 03</span>
                  <h2 className="text-2xl font-bold text-white mt-1">When are you targeting?</h2>
                  <p className="text-xs text-slate-300 mt-1">Select your exam cycle and target outcome for {targetExam}.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 mb-2 block">Target Exam Year</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['2025', '2026', '2027', '2028'].map((yr) => (
                        <button
                          key={yr}
                          type="button"
                          onClick={() => setTargetYear(yr)}
                          className={`py-3 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                            targetYear === yr
                              ? 'bg-[#287BFF] border-[#287BFF] text-white'
                              : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                          }`}
                        >
                          {yr}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 mb-2 block">Preparation Target</label>
                    <select
                      value={targetGoal}
                      onChange={(e) => setTargetGoal(e.target.value as TargetGoal)}
                      className="w-full bg-slate-900 border border-white/15 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#5CE1E6]"
                    >
                      <option value="Top Rank">Top Rank / Under AIR 100</option>
                      <option value="High Score">High Score / Tier-1 College</option>
                      <option value="Strong Score">Strong Score / Qualification</option>
                      <option value="Qualify / Clear">Qualify / Clear Cutoff</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4: REALISTIC STUDY DAY */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <span className="text-[#5CE1E6] text-xs font-bold uppercase tracking-wider">Step 04</span>
                  <h2 className="text-2xl font-bold text-white mt-1">What does a realistic study day look like?</h2>
                  <p className="text-xs text-slate-300 mt-1">Be honest — we'll set daily goal milestones based on this.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: '1 hour', mins: 60 },
                    { label: '2 hours', mins: 120 },
                    { label: '3 hours', mins: 180 },
                    { label: '4 hours', mins: 240 },
                    { label: '5+ hours', mins: 300 },
                    { label: 'Changes daily', mins: 180 },
                  ].map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => handleSelectHours(item.label, item.mins)}
                      className={`p-4 rounded-2xl border text-center font-bold text-xs transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                        dailyHoursText === item.label
                          ? 'bg-[#287BFF] border-[#287BFF] text-white ring-2 ring-[#287BFF]/50'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <Clock className="w-4 h-4 text-[#5CE1E6]" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 5: WHAT DO YOU WANT STUDY HUB TO HELP WITH MOST? */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <span className="text-[#5CE1E6] text-xs font-bold uppercase tracking-wider">Step 05</span>
                  <h2 className="text-2xl font-bold text-white mt-1">What do you want Study Hub to help with most?</h2>
                  <p className="text-xs text-slate-300 mt-1">Select all options that apply.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    'Understand concepts', 'Practice questions', 'Previous year papers',
                    'Mock tests', 'Revision', 'Build a study plan',
                    'Stay consistent', 'Ask StudyMate', 'Find resources'
                  ].map((need) => {
                    const isSel = primaryNeeds.includes(need);
                    return (
                      <button
                        key={need}
                        type="button"
                        onClick={() => toggleNeed(need)}
                        className={`p-3.5 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                          isSel
                            ? 'bg-[#287BFF]/30 border-[#287BFF] text-white'
                            : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        <span>{need}</span>
                        {isSel && <Check className="w-4 h-4 text-[#5CE1E6]" />}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 6: PERSONALIZATION PREVIEW */}
            {step === 6 && (
              <motion.div
                key="step6-preview"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6 py-4"
              >
                <div className="text-center">
                  <Sparkles className="w-8 h-8 text-[#5CE1E6] mx-auto mb-2" />
                  <h2 className="text-3xl font-bold text-white">Your study library is ready.</h2>
                  <p className="text-xs text-slate-300 mt-1">We've customized your personal study space for {targetExam} {targetYear}.</p>
                </div>

                <div className="bg-white/10 rounded-2xl p-6 border border-white/15 max-w-lg mx-auto space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-xs font-bold text-[#5CE1E6] uppercase tracking-wider">{targetExam} {targetYear}</span>
                    <span className="text-xs text-slate-300 font-semibold">{dailyHoursText} daily target</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-200">
                    {['Question Bank', 'Revision Notes', 'Video Lectures', 'Flashcards', 'Mock Tests', 'Spaced Revision'].map((item) => (
                      <div key={item} className="flex items-center gap-1.5 p-2 rounded-lg bg-white/5 border border-white/10 font-semibold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#5CE1E6] shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-center pt-4">
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={handleFinalSubmit}
                    className="px-10 py-4 rounded-full bg-gradient-to-r from-[#287BFF] via-[#6F7CFF] to-[#5CE1E6] text-white font-bold text-sm shadow-xl hover:scale-105 transition-transform flex items-center justify-center gap-2 mx-auto cursor-pointer"
                  >
                    <span>{isSaving ? 'Preparing space...' : "Let's take the first step →"}</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 7: CELEBRATION & FAST BOOT (600-900ms) */}
            {step === 7 && (
              <motion.div
                key="step7-celebration"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-16 text-center space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#5CE1E6] to-[#287BFF] flex items-center justify-center mx-auto animate-pulse">
                  <Sparkles className="w-8 h-8 text-[#062B3D]" />
                </div>
                <h3 className="text-2xl font-bold text-white">✨ Your study space is ready.</h3>
                <p className="text-xs text-slate-300">Opening your personalized dashboard...</p>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Step Navigation Controls */}
          {step <= 5 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2 rounded-full bg-white/5 text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              ) : <div />}

              {step < 5 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="px-7 py-3 rounded-full bg-[#287BFF] hover:bg-[#287BFF]/90 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleProceedToPreview}
                  className="px-8 py-3 rounded-full bg-gradient-to-r from-[#287BFF] to-[#6F7CFF] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg"
                >
                  <span>See Personalization Preview →</span>
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
}
