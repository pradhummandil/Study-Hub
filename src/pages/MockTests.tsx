// src/pages/MockTests.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FileText, Clock, Award, Play } from 'lucide-react';
import { fetchMockTests } from '../lib/mockApi';
import { getStudentProfile } from '../lib/studentCoreApi';
import type { MockTest, ExamCategory } from '../types/student-core';

export default function MockTests() {
  const navigate = useNavigate();
  const [exam, setExam] = useState<ExamCategory>('GATE');
  const [mocks, setMocks] = useState<MockTest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMocks() {
      setLoading(true);
      const profile = await getStudentProfile();
      const currentExam = profile?.target_exam || 'GATE';
      setExam(currentExam);
      const list = await fetchMockTests(currentExam);
      setMocks(list);
      setLoading(false);
    }
    loadMocks();
  }, []);

  const handleStartMock = (mockId: string) => {
    navigate(`/mock-tests/${mockId}`);
  };

  return (
    <>
      <Helmet>
        <title>Mock Tests — Study Hub</title>
        <meta name="description" content="Exam-level full syllabus and sectional mock tests." />
      </Helmet>

      {/* Header */}
      <div className="px-6 pt-12 max-w-5xl mx-auto text-center">
        <span className="text-xs uppercase tracking-widest text-indigo-400 font-semibold liquid-glass px-4 py-1.5 rounded-full inline-block mb-3 border border-indigo-500/20">
          {exam} Mock Test Engine
        </span>
        <h1
          className="text-4xl sm:text-5xl font-normal text-foreground tracking-tight"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Mock Tests
        </h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
          Simulate real exam conditions with full syllabus and sectional mock tests.
        </p>
      </div>

      {/* Mocks Grid */}
      <div className="px-6 mt-10 max-w-5xl mx-auto pb-24 space-y-6">
        {loading ? (
          <div className="py-20 text-center text-xs text-muted-foreground skeleton-pulse">Loading mock tests...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mocks.map((mock) => (
              <div
                key={mock.id}
                className="liquid-glass-card rounded-3xl p-6 border border-white/10 flex flex-col justify-between hover:border-indigo-500/30 transition-all space-y-6 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 liquid-glass px-2.5 py-1 rounded-full border border-indigo-500/20">
                      {mock.subject || 'Full Syllabus'}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {mock.difficulty} Difficulty
                    </span>
                  </div>

                  <h2 className="text-xl font-semibold text-foreground group-hover:text-indigo-300 transition-colors">
                    {mock.title}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    {mock.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" /> {mock.duration_minutes} min
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-emerald-400" /> {mock.total_questions} Questions
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-amber-400" /> {mock.total_marks} Marks
                    </span>
                  </div>

                  <button
                    onClick={() => handleStartMock(mock.id)}
                    className="gradient-cta rounded-full px-5 py-2 text-xs text-black font-semibold hover:scale-105 transition-transform flex items-center gap-1.5 shrink-0"
                  >
                    <Play className="w-3 h-3 fill-black" />
                    <span>Start Test</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
