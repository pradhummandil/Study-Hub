// src/pages/Practice.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Filter, Play } from 'lucide-react';
import { EXAM_CONFIGS, type ExamCategory } from '../types/student-core';
import { getStudentProfile } from '../lib/studentCoreApi';
import { fetchPracticeQuestions } from '../lib/practiceApi';

export default function Practice() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlSubject = searchParams.get('subject') || '';

  const [exam, setExam] = useState<ExamCategory>('GATE');
  const [subject, setSubject] = useState<string>(urlSubject);
  const [year, setYear] = useState<string>('All');
  const [difficulty, setDifficulty] = useState<string>('All');
  const [questionType, setQuestionType] = useState<string>('All');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [loading, setLoading] = useState(true);
  const [availableCount, setAvailableCount] = useState(0);

  useEffect(() => {
    async function init() {
      setLoading(true);
      const profile = await getStudentProfile();
      const currentExam = profile?.target_exam || 'GATE';
      setExam(currentExam);
      if (!subject) {
        const subs = EXAM_CONFIGS[currentExam]?.subjects || EXAM_CONFIGS['GATE'].subjects;
        setSubject(subs[0]);
      }
      const questions = await fetchPracticeQuestions({ exam: currentExam });
      setAvailableCount(questions.length);
      setLoading(false);
    }
    init();
  }, []);

  const handleStartSession = () => {
    const sessionId = `session_${Date.now()}`;
    const params = new URLSearchParams();
    if (exam) params.set('exam', exam);
    if (subject) params.set('subject', subject);
    if (year !== 'All') params.set('year', year);
    if (difficulty !== 'All') params.set('difficulty', difficulty);
    if (questionType !== 'All') params.set('type', questionType);
    params.set('count', String(questionCount));

    navigate(`/practice/session/${sessionId}?${params.toString()}`);
  };

  const selectedExamConfig = EXAM_CONFIGS[exam] || EXAM_CONFIGS['GATE'];

  return (
    <>
      <Helmet>
        <title>Practice PYQs — Study Hub</title>
        <meta name="description" content="Turn years of real exam questions into daily practice." />
      </Helmet>

      <div className="px-6 pt-12 max-w-5xl mx-auto text-center">
        <span className="text-xs uppercase tracking-widest text-emerald-400 font-semibold liquid-glass px-4 py-1.5 rounded-full inline-block mb-3 border border-emerald-500/20">
          PYQ & Topic Practice
        </span>
        <h1
          className="text-4xl sm:text-5xl font-normal text-foreground tracking-tight"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Practice Previous Questions
        </h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
          Turn years of real exam questions into daily practice.
        </p>
      </div>

      {/* Filter & Setup Card */}
      <div className="px-6 mt-10 max-w-4xl mx-auto pb-24">
        <div className="liquid-glass-card rounded-3xl p-6 sm:p-10 border border-white/10 space-y-8 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Filter className="w-5 h-5 text-emerald-400" />
              Practice Session Filters
            </h2>
            <span className="text-xs text-muted-foreground font-mono">
              {availableCount} Questions Indexed
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Exam Filter */}
            <div>
              <label className="text-xs text-muted-foreground font-semibold mb-2 block uppercase tracking-wider">Target Exam</label>
              <select
                value={exam}
                onChange={(e) => {
                  const newExam = e.target.value as ExamCategory;
                  setExam(newExam);
                  setSubject(EXAM_CONFIGS[newExam]?.subjects[0] || '');
                }}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-emerald-400"
              >
                {(Object.keys(EXAM_CONFIGS) as ExamCategory[]).map((eKey) => (
                  <option key={eKey} value={eKey} className="bg-slate-900 text-foreground">{eKey}</option>
                ))}
              </select>
            </div>

            {/* Subject Filter */}
            <div>
              <label className="text-xs text-muted-foreground font-semibold mb-2 block uppercase tracking-wider">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-emerald-400"
              >
                {selectedExamConfig.subjects.map((subj) => (
                  <option key={subj} value={subj} className="bg-slate-900 text-foreground">{subj}</option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div>
              <label className="text-xs text-muted-foreground font-semibold mb-2 block uppercase tracking-wider">Exam Year</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-emerald-400"
              >
                <option value="All" className="bg-slate-900 text-foreground">All Years (2020–2026)</option>
                <option value="2025" className="bg-slate-900 text-foreground">2025</option>
                <option value="2024" className="bg-slate-900 text-foreground">2024</option>
                <option value="2023" className="bg-slate-900 text-foreground">2023</option>
                <option value="2022" className="bg-slate-900 text-foreground">2022</option>
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="text-xs text-muted-foreground font-semibold mb-2 block uppercase tracking-wider">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-emerald-400"
              >
                <option value="All" className="bg-slate-900 text-foreground">All Difficulties</option>
                <option value="Easy" className="bg-slate-900 text-foreground">Easy</option>
                <option value="Medium" className="bg-slate-900 text-foreground">Medium</option>
                <option value="Hard" className="bg-slate-900 text-foreground">Hard</option>
              </select>
            </div>

            {/* Question Type */}
            <div>
              <label className="text-xs text-muted-foreground font-semibold mb-2 block uppercase tracking-wider">Question Type</label>
              <select
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-emerald-400"
              >
                <option value="All" className="bg-slate-900 text-foreground">All Types (MCQ, MSQ, NAT)</option>
                <option value="MCQ" className="bg-slate-900 text-foreground">MCQ (Single Choice)</option>
                <option value="MSQ" className="bg-slate-900 text-foreground">MSQ (Multiple Select)</option>
                <option value="Numerical" className="bg-slate-900 text-foreground">Numerical (NAT Input)</option>
                <option value="True/False" className="bg-slate-900 text-foreground">True / False</option>
              </select>
            </div>

            {/* Question Count */}
            <div>
              <label className="text-xs text-muted-foreground font-semibold mb-2 block uppercase tracking-wider">Questions per Session</label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-emerald-400"
              >
                <option value={5} className="bg-slate-900 text-foreground">5 Questions (Express)</option>
                <option value={10} className="bg-slate-900 text-foreground">10 Questions (Standard)</option>
                <option value={20} className="bg-slate-900 text-foreground">20 Questions (Marathon)</option>
              </select>
            </div>
          </div>

          {/* Action CTA */}
          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              Official PYQ answers are verified with detailed step-by-step explanations.
            </p>
            <button
              onClick={handleStartSession}
              disabled={loading}
              className="gradient-cta rounded-full px-8 py-3 text-xs text-black font-semibold hover:scale-105 transition-transform flex items-center gap-2 shadow-lg"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>Start Practice Session →</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
