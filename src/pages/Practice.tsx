// src/pages/Practice.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Filter, Play, History } from 'lucide-react';
import { EXAM_CONFIGS, type ExamCategory } from '../types/student-core';
import { useStudentContext } from '../context/StudentContext';
import { fetchPracticeQuestions, getLocalSavedMistakes } from '../lib/practiceApi';

export default function Practice() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { targetExam } = useStudentContext();

  const urlSubject = searchParams.get('subject') || '';

  const [activeTab, setActiveTab] = useState<'pyqs' | 'topic' | 'weak' | 'recent' | 'saved' | 'ai'>('pyqs');
  const [exam, setExam] = useState<ExamCategory>(targetExam);
  const [subject, setSubject] = useState<string>(urlSubject);
  const [year, setYear] = useState<string>('All');
  const [difficulty, setDifficulty] = useState<string>('All');
  const [questionType, setQuestionType] = useState<string>('All');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [loading, setLoading] = useState(true);
  const [availableCount, setAvailableCount] = useState(0);
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    setExam(targetExam);
  }, [targetExam]);

  useEffect(() => {
    async function init() {
      setLoading(true);
      const subs = EXAM_CONFIGS[exam]?.subjects || EXAM_CONFIGS['GATE'].subjects;
      if (!subject || !subs.includes(subject)) {
        setSubject(subs[0]);
      }
      const questions = await fetchPracticeQuestions({ exam });
      setAvailableCount(questions.length);
      setSavedCount(getLocalSavedMistakes().length);
      setLoading(false);
    }
    init();
  }, [exam]);

  const handleStartSession = () => {
    const sessionId = `practice_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const params = new URLSearchParams();
    if (exam) params.set('exam', exam);
    if (subject) params.set('subject', subject);
    if (year !== 'All') params.set('year', year);
    if (difficulty !== 'All') params.set('difficulty', difficulty);
    if (questionType !== 'All') params.set('type', questionType);
    params.set('count', String(questionCount));
    params.set('tab', activeTab);

    navigate(`/practice/session/${sessionId}?${params.toString()}`);
  };

  const selectedExamConfig = EXAM_CONFIGS[exam] || EXAM_CONFIGS['GATE'];

  return (
    <>
      <Helmet>
        <title>Practice PYQs & Topic Bank — Study Hub</title>
        <meta name="description" content="Turn years of real exam questions into daily practice." />
      </Helmet>

      <div className="px-6 pt-12 max-w-5xl mx-auto text-center space-y-4">
        <span className="text-xs uppercase tracking-widest text-terracotta font-semibold bg-terracotta/10 px-4 py-1.5 rounded-full inline-block border border-terracotta/20 font-mono">
          {exam} Verified Question Bank
        </span>
        <h1
          className="text-4xl sm:text-5xl font-normal text-ink tracking-tight"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Practice what matters.
        </h1>
        <p className="text-sm text-muted max-w-md mx-auto">
          Official PYQs with step-by-step verified explanations and real exam paper filters.
        </p>

        {/* Real Origin Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-[11px] font-semibold">
          <span className="px-3 py-1 rounded-full bg-scholar/10 text-scholar border border-scholar/20">
            ✓ Official PYQ Bank
          </span>
          <span className="px-3 py-1 rounded-full bg-terracotta/10 text-terracotta border border-terracotta/20">
            ✓ Verified Solutions
          </span>
          <span className="px-3 py-1 rounded-full bg-gold/10 text-gold border border-gold/20">
            ✓ Difficulty Filters
          </span>
        </div>

        {/* Action Bar */}
        <div className="flex justify-center gap-3 pt-2">
          <Link
            to="/practice/history"
            className="bg-parchment rounded-xl px-4 py-2 text-xs font-semibold text-scholar border border-forest/10 hover:bg-parchment/80 flex items-center gap-1.5"
          >
            <History className="w-4 h-4" /> Practice History
          </Link>
        </div>
      </div>

      {/* Practice Category Tabs */}
      <div className="px-6 mt-8 max-w-4xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 p-1.5 rounded-2xl bg-parchment/60 border border-forest/10 text-xs font-medium">
          {[
            { id: 'pyqs', label: 'Official PYQs' },
            { id: 'topic', label: 'Topic Drill' },
            { id: 'weak', label: 'Weak Areas' },
            { id: 'recent', label: 'Recent' },
            { id: 'saved', label: `Saved (${savedCount})` },
            { id: 'ai', label: 'AI Drills' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === t.id
                  ? 'bg-scholar text-paper font-bold shadow-sm'
                  : 'text-muted hover:text-ink'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>


      {/* Filter & Setup Card */}
      <div className="px-6 mt-6 max-w-4xl mx-auto pb-24">
        <div className="liquid-glass-card rounded-3xl p-6 sm:p-10 border border-white/10 space-y-8 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Filter className="w-5 h-5 text-emerald-400" />
              Practice Filters & Options
            </h2>
            <span className="text-xs text-muted-foreground font-mono">
              {availableCount} Questions Indexed for {exam}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Exam Filter */}
            <div>
              <label className="text-xs text-muted font-bold mb-2 block uppercase tracking-wider">Target Exam</label>
              <select
                value={exam}
                onChange={(e) => {
                  const newExam = e.target.value as ExamCategory;
                  setExam(newExam);
                  setSubject(EXAM_CONFIGS[newExam]?.subjects[0] || '');
                }}
                className="w-full bg-parchment/80 border border-forest/15 rounded-xl px-4 py-3 text-sm text-ink font-semibold focus:outline-none focus:border-scholar focus:ring-2 focus:ring-scholar/15 transition-all shadow-sm"
              >
                {(Object.keys(EXAM_CONFIGS) as ExamCategory[]).map((eKey) => (
                  <option key={eKey} value={eKey} className="bg-paper text-ink font-medium">{eKey}</option>
                ))}
              </select>
            </div>

            {/* Subject Filter */}
            <div>
              <label className="text-xs text-muted font-bold mb-2 block uppercase tracking-wider">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-parchment/80 border border-forest/15 rounded-xl px-4 py-3 text-sm text-ink font-semibold focus:outline-none focus:border-scholar focus:ring-2 focus:ring-scholar/15 transition-all shadow-sm"
              >
                {selectedExamConfig.subjects.map((subj) => (
                  <option key={subj} value={subj} className="bg-paper text-ink font-medium">{subj}</option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div>
              <label className="text-xs text-muted font-bold mb-2 block uppercase tracking-wider font-mono">Exam Year</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full bg-parchment/80 border border-forest/15 rounded-xl px-4 py-3 text-sm text-ink font-semibold focus:outline-none focus:border-scholar focus:ring-2 focus:ring-scholar/15 transition-all shadow-sm"
              >
                <option value="All" className="bg-paper text-ink font-medium">All Years (2007–2026)</option>
                <option value="2026" className="bg-paper text-ink font-medium">2026</option>
                <option value="2025" className="bg-paper text-ink font-medium">2025</option>
                <option value="2024" className="bg-paper text-ink font-medium">2024</option>
                <option value="2023" className="bg-paper text-ink font-medium">2023</option>
                <option value="2022" className="bg-paper text-ink font-medium">2022</option>
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="text-xs text-muted font-bold mb-2 block uppercase tracking-wider">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-parchment/80 border border-forest/15 rounded-xl px-4 py-3 text-sm text-ink font-semibold focus:outline-none focus:border-scholar focus:ring-2 focus:ring-scholar/15 transition-all shadow-sm"
              >
                <option value="All" className="bg-paper text-ink font-medium">All Difficulties</option>
                <option value="Easy" className="bg-paper text-ink font-medium">Easy</option>
                <option value="Medium" className="bg-paper text-ink font-medium">Medium</option>
                <option value="Hard" className="bg-paper text-ink font-medium">Hard</option>
              </select>
            </div>

            {/* Question Type */}
            <div>
              <label className="text-xs text-muted font-bold mb-2 block uppercase tracking-wider">Question Type</label>
              <select
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value)}
                className="w-full bg-parchment/80 border border-forest/15 rounded-xl px-4 py-3 text-sm text-ink font-semibold focus:outline-none focus:border-scholar focus:ring-2 focus:ring-scholar/15 transition-all shadow-sm"
              >
                <option value="All" className="bg-paper text-ink font-medium">All Types (MCQ, MSQ, NAT)</option>
                <option value="MCQ" className="bg-paper text-ink font-medium">MCQ (Single Choice)</option>
                <option value="MSQ" className="bg-paper text-ink font-medium">MSQ (Multiple Select)</option>
                <option value="Numerical" className="bg-paper text-ink font-medium">Numerical (NAT Input)</option>
              </select>
            </div>

            {/* Question Count */}
            <div>
              <label className="text-xs text-muted font-bold mb-2 block uppercase tracking-wider">Questions per Session</label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full bg-parchment/80 border border-forest/15 rounded-xl px-4 py-3 text-sm text-ink font-semibold focus:outline-none focus:border-scholar focus:ring-2 focus:ring-scholar/15 transition-all shadow-sm"
              >
                <option value={5} className="bg-paper text-ink font-medium">5 Questions (Express)</option>
                <option value={10} className="bg-paper text-ink font-medium">10 Questions (Standard)</option>
                <option value={20} className="bg-paper text-ink font-medium">20 Questions (Marathon)</option>
              </select>
            </div>
          </div>

          {/* Action CTA */}
          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              Progress & attempts are automatically saved to your student profile.
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
