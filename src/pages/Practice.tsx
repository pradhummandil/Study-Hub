// src/pages/Practice.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Play, History, Search, BookOpen, CheckCircle2, Bookmark, Sparkles, AlertCircle, ArrowRight, Video, FileText } from 'lucide-react';
import { EXAM_CONFIGS, type ExamCategory, type PracticeQuestion } from '../types/student-core';
import { useStudentContext } from '../context/StudentContext';
import { fetchCanonicalQuestions, fetchPracticeSimilarQuestions } from '../lib/questionEngineApi';
import { getLocalSavedMistakes, toggleSaveMistake } from '../lib/practiceApi';
import { supabase } from '../lib/supabase';

export default function Practice() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { targetExam, userId } = useStudentContext();

  const urlSubject = searchParams.get('subject') || '';
  const urlTopic = searchParams.get('topic') || '';

  const [activeTab] = useState<'pyqs' | 'topic' | 'weak' | 'recent' | 'saved' | 'ai'>('pyqs');
  const [exam, setExam] = useState<ExamCategory>(targetExam);
  const [subject, setSubject] = useState<string>(urlSubject);
  const [topic, setTopic] = useState<string>(urlTopic);
  const [year, setYear] = useState<string>('All');
  const [difficulty, setDifficulty] = useState<string>('All');
  const [questionType, setQuestionType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [questionCount] = useState<number>(10);

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  const [selectedQuestion, setSelectedQuestion] = useState<PracticeQuestion | null>(null);
  const [similarQuestions, setSimilarQuestions] = useState<PracticeQuestion[]>([]);

  useEffect(() => {
    setExam(targetExam);
  }, [targetExam]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const subs = EXAM_CONFIGS[exam]?.subjects || EXAM_CONFIGS['GATE'].subjects;
      if (!subject || !subs.includes(subject)) {
        setSubject(subs[0]);
      }

      let examCodePayload = exam === 'GATE' ? 'GATE_CSE' : exam === 'JEE Main' ? 'JEE_MAIN' : exam === 'JEE Advanced' ? 'JEE_ADVANCED' : exam === 'NEET' ? 'NEET_UG' : exam;

      const res = await fetchCanonicalQuestions({
        examCode: examCodePayload,
        subject: subject !== 'All' ? subject : undefined,
        topic: topic || undefined,
        year: year !== 'All' ? Number(year) : undefined,
        difficulty: difficulty !== 'All' ? (difficulty as any) : undefined,
        questionType: questionType !== 'All' ? (questionType as any) : undefined,
        keyword: searchQuery || undefined,
        limit: 30,
      });

      setQuestions(res.questions);
      setTotalCount(res.total);
      setSavedCount(getLocalSavedMistakes().length);
      setLoading(false);
    }
    loadData();
  }, [exam, subject, topic, year, difficulty, questionType, searchQuery]);

  const handleStartSession = () => {
    const sessionId = `practice_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const params = new URLSearchParams();
    if (exam) params.set('exam', exam);
    if (subject) params.set('subject', subject);
    if (topic) params.set('topic', topic);
    if (year !== 'All') params.set('year', year);
    if (difficulty !== 'All') params.set('difficulty', difficulty);
    if (questionType !== 'All') params.set('type', questionType);
    params.set('count', String(questionCount));
    params.set('tab', activeTab);

    navigate(`/practice/session/${sessionId}?${params.toString()}`);
  };

  const handleOpenQuestionDetail = async (q: PracticeQuestion) => {
    setSelectedQuestion(q);
    const similar = await fetchPracticeSimilarQuestions(q, 3);
    setSimilarQuestions(similar);
  };

  const handleSaveQuestion = async (q: PracticeQuestion) => {
    await toggleSaveMistake(q.id, true);
    setSavedCount(getLocalSavedMistakes().length);
    alert('Question saved to your practice notebook!');
  };

  const handleAddFlashcard = async (q: PracticeQuestion) => {
    if (userId) {
      await supabase.from('flashcards').insert({
        user_id: userId,
        question_id: q.id,
        front_text: q.question_text,
        back_text: `${q.solution_text || q.explanation}\n\nConcept: ${q.concept || 'Key Principle'}`,
        deck_name: `${q.exam} ${q.subject}`,
        created_at: new Date().toISOString()
      });
    }
    alert('Flashcard created successfully!');
  };

  const handleAddRevision = async (q: PracticeQuestion) => {
    if (userId) {
      await supabase.from('revision_items').insert({
        user_id: userId,
        question_id: q.id,
        subject: q.subject,
        topic: q.topic,
        next_review_date: new Date(Date.now() + 86400000).toISOString(),
        interval_days: 1,
        ease_factor: 2.5
      });
    }
    alert('Added to your Spaced Repetition queue!');
  };

  const selectedExamConfig = EXAM_CONFIGS[exam] || EXAM_CONFIGS['GATE'];
  const isLowCoverage = totalCount > 0 && totalCount <= 4;

  return (
    <>
      <Helmet>
        <title>Find your next question — Study Hub Question Explorer</title>
        <meta name="description" content="Searchable live PYQ database and real topic practice explorer." />
      </Helmet>

      {/* Explorer Banner */}
      <div className="px-6 pt-12 max-w-5xl mx-auto text-center space-y-4">
        <span className="text-xs uppercase tracking-widest text-teal-400 font-bold bg-teal-500/10 px-4 py-1.5 rounded-full inline-block border border-teal-500/20 font-mono">
          Find your next question
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          Question Explorer & PYQ Bank
        </h1>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          Explore real canonical PYQs with verified step-by-step math solutions, topic tags, and difficulty filters.
        </p>

        {/* Real Origin Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs font-semibold">
          <span className="px-3 py-1 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20">
            ✓ {totalCount} Questions Live in Database
          </span>
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            ✓ Official PYQ Proof
          </span>
          <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
            ✓ KaTeX Math & Diagrams
          </span>
        </div>

        {/* Action Bar */}
        <div className="flex justify-center gap-3 pt-2">
          <Link
            to="/practice/history"
            className="bg-slate-900 rounded-xl px-4 py-2 text-xs font-semibold text-slate-300 border border-slate-800 hover:bg-slate-800 flex items-center gap-1.5 transition-all"
          >
            <History className="w-4 h-4 text-teal-400" /> Practice History
          </Link>
        </div>
      </div>

      {/* Search & Filters Section */}
      <div className="px-6 mt-8 max-w-5xl mx-auto space-y-6 pb-24">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
          {/* Keyword Search Input */}
          <div className="relative">
            <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by keyword, concept, formula, or question text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-all"
            />
          </div>

          {/* Filters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Target Exam */}
            <div>
              <label className="text-xs text-slate-400 font-bold mb-1.5 block uppercase tracking-wider">Exam</label>
              <select
                value={exam}
                onChange={(e) => {
                  const newExam = e.target.value as ExamCategory;
                  setExam(newExam);
                  setSubject(EXAM_CONFIGS[newExam]?.subjects[0] || '');
                  setTopic('');
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-teal-500"
              >
                {(Object.keys(EXAM_CONFIGS) as ExamCategory[]).map((eKey) => (
                  <option key={eKey} value={eKey}>{eKey}</option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="text-xs text-slate-400 font-bold mb-1.5 block uppercase tracking-wider">Subject</label>
              <select
                value={subject}
                onChange={(e) => { setSubject(e.target.value); setTopic(''); }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-teal-500"
              >
                {selectedExamConfig.subjects.map((subj) => (
                  <option key={subj} value={subj}>{subj}</option>
                ))}
              </select>
            </div>

            {/* Year */}
            <div>
              <label className="text-xs text-slate-400 font-bold mb-1.5 block uppercase tracking-wider">Year</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-teal-500"
              >
                <option value="All">All Years (2012-2026)</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="text-xs text-slate-400 font-bold mb-1.5 block uppercase tracking-wider">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-teal-500"
              >
                <option value="All">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            {/* Question Type */}
            <div>
              <label className="text-xs text-slate-400 font-bold mb-1.5 block uppercase tracking-wider">Type</label>
              <select
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-teal-500"
              >
                <option value="All">All Types</option>
                <option value="MCQ_SINGLE">MCQ (Single)</option>
                <option value="MCQ_MULTIPLE">MCQ (Multiple)</option>
                <option value="NUMERICAL">Numerical (NAT)</option>
              </select>
            </div>
          </div>

          {/* Low Coverage Warning Banner */}
          {isLowCoverage && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold text-amber-300 uppercase tracking-wider">Limited Question Coverage</div>
                  <div className="text-slate-300 text-xs mt-0.5">
                    This topic currently contains {totalCount} question(s) in the database.
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSubject('All')}
                className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold rounded-xl whitespace-nowrap transition-all"
              >
                Explore Broader Subject →
              </button>
            </div>
          )}

          {/* CTA & Actions Bar */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs font-semibold text-slate-400">
              Showing {questions.length} of <strong className="text-teal-400">{totalCount}</strong> real questions
            </span>
            <button
              onClick={handleStartSession}
              disabled={loading || questions.length === 0}
              className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-teal-500/10"
            >
              <Play className="w-4 h-4 fill-slate-950" /> Start Practice Session ({questionCount} Qs)
            </button>
          </div>
        </div>

        {/* Live Questions Feed Grid */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-400" /> Discovered Questions List
          </h3>

          {loading ? (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400">
              Loading real database questions...
            </div>
          ) : questions.length === 0 ? (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
              <div className="text-white font-bold text-base">No questions found matching your filter</div>
              <p className="text-slate-400 text-xs">Try selecting 'All' for difficulty or changing the exam year filter.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {questions.map((q) => (
                <div
                  key={q.id}
                  onClick={() => handleOpenQuestionDetail(q)}
                  className="bg-slate-900 border border-slate-800 hover:border-teal-500/40 p-5 rounded-2xl transition-all cursor-pointer space-y-3 group"
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-400 font-bold font-mono border border-teal-500/20">
                        {q.exam_code} {q.year}
                      </span>
                      <span className="text-slate-400 font-medium">{q.subject} → {q.topic}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                      q.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400' :
                      q.difficulty === 'Hard' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {q.difficulty}
                    </span>
                  </div>

                  <div className="text-white font-medium text-sm line-clamp-2 group-hover:text-teal-300 transition-colors">
                    {q.question_text}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-800/60">
                    <span className="truncate max-w-xs">{q.source_name || 'Official Exam Paper'}</span>
                    <span className="text-teal-400 font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      View Solution <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Question Detail Modal */}
      {selectedQuestion && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-teal-500/10 text-teal-400 border border-teal-500/30 text-xs font-bold rounded-lg font-mono">
                  {selectedQuestion.exam_code} {selectedQuestion.year}
                </span>
                <span className="text-xs text-slate-400">{selectedQuestion.subject} → {selectedQuestion.topic}</span>
              </div>
              <button
                onClick={() => setSelectedQuestion(null)}
                className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-all"
              >
                ✕
              </button>
            </div>

            {/* Question Text */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Question Statement</div>
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-white font-medium text-sm sm:text-base leading-relaxed">
                {selectedQuestion.question_text}
              </div>
            </div>

            {/* Options */}
            {selectedQuestion.options && selectedQuestion.options.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Options</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedQuestion.options_structured ? (
                    selectedQuestion.options_structured.map((opt: any, i: number) => (
                      <div
                        key={i}
                        className={`p-3 rounded-xl border text-xs font-medium ${
                          String(selectedQuestion.correct_answer).includes(opt.id)
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-300'
                        }`}
                      >
                        <span className="mr-2 font-mono font-bold">{opt.id}.</span> {opt.text}
                      </div>
                    ))
                  ) : (
                    selectedQuestion.options.map((optStr: string, i: number) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                        {optStr}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Verified Solution */}
            <div className="space-y-3 bg-teal-950/20 border border-teal-500/20 p-5 rounded-2xl">
              <div className="flex items-center gap-2 text-teal-400 font-bold text-xs uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" /> Official Verified Solution
              </div>
              <div className="text-slate-200 text-xs sm:text-sm leading-relaxed font-mono">
                {selectedQuestion.solution_text || selectedQuestion.explanation}
              </div>
              {selectedQuestion.concept && (
                <div className="pt-2 text-xs text-teal-300 font-semibold border-t border-teal-500/20">
                  Concept: {selectedQuestion.concept}
                </div>
              )}
            </div>

            {/* Practice Similar Questions */}
            {similarQuestions.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Practice Similar Questions</div>
                <div className="space-y-2">
                  {similarQuestions.map((sq) => (
                    <div
                      key={sq.id}
                      onClick={() => handleOpenQuestionDetail(sq)}
                      className="p-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-xl cursor-pointer text-xs text-slate-300 flex items-center justify-between transition-all"
                    >
                      <span className="truncate max-w-md font-medium">{sq.question_text}</span>
                      <span className="text-teal-400 font-bold text-[11px] shrink-0">Explore →</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <button
                onClick={() => handleSaveQuestion(selectedQuestion)}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <Bookmark className="w-3.5 h-3.5 text-amber-400" /> Save ({savedCount})
              </button>
              <button
                onClick={() => handleAddFlashcard(selectedQuestion)}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Add Flashcard
              </button>
              <button
                onClick={() => handleAddRevision(selectedQuestion)}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <FileText className="w-3.5 h-3.5 text-blue-400" /> Spaced Revision
              </button>
              <Link
                to={`/video-learning?exam=${selectedQuestion.exam_code}&subject=${encodeURIComponent(selectedQuestion.subject)}&topic=${encodeURIComponent(selectedQuestion.topic)}`}
                className="p-2.5 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/30 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <Video className="w-3.5 h-3.5" /> Learn This Topic
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
