import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Shield, Clock, Calculator, Play, ChevronRight, BookOpen, AlertCircle, History } from 'lucide-react';
import { useStudentContext } from '../context/StudentContext';
import { fetchExamTests, type ExamTestSummary } from '../lib/exam/examSimulatorApi';

export default function ExamSimulatorPage() {
  const navigate = useNavigate();
  const { targetExam } = useStudentContext();

  const [tests, setTests] = useState<ExamTestSummary[]>([]);
  const [selectedTestId, setSelectedTestId] = useState<string>('');
  const [testMode, setTestMode] = useState<'all' | 'full' | 'section' | 'subject' | 'topic' | 'weak_area'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTests() {
      setLoading(true);
      const data = await fetchExamTests({ exam: targetExam, mode: testMode });
      setTests(data);
      if (data.length > 0) {
        setSelectedTestId(data[0].id);
      }
      setLoading(false);
    }
    loadTests();
  }, [targetExam, testMode]);

  const selectedConfig = tests.find((c) => c.id === selectedTestId) || tests[0];

  const handleStartExam = () => {
    if (!selectedConfig) return;
    navigate(`/exam-simulator/runner/${selectedConfig.id}?mode=${selectedConfig.mode}`);
  };

  return (
    <div className="min-h-screen bg-paper text-ink py-12 px-4 sm:px-6 lg:px-8 selection:bg-terracotta/20">
      <Helmet>
        <title>Adaptive Exam Simulator | Study Hub</title>
        <meta
          name="description"
          content="Experience authentic exam environments for GATE, JEE, NEET, CUET with section timers, negative marking, scientific calculator, and question palettes."
        />
      </Helmet>

      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/20 border border-gold/30 text-forest text-xs font-bold uppercase tracking-wider">
            <Shield className="w-4 h-4 text-scholar" /> {targetExam} Authentic Exam Engine
          </div>
          <h1 className="text-3xl md:text-5xl font-normal font-serif text-ink" style={{ fontFamily: "'Instrument Serif', serif" }}>
            Adaptive Exam Simulator
          </h1>
          <p className="text-muted text-sm leading-relaxed">
            Turn exam pressure into confidence. Practice in authentic exam environments with section timers, official calculators, and real marking schemes.
          </p>

          <div className="flex justify-center pt-2">
            <button
              onClick={() => navigate('/exam-simulator/history')}
              className="px-4 py-2 rounded-xl bg-parchment border border-forest/10 text-scholar text-xs font-bold flex items-center gap-2 hover:bg-parchment/80 transition-colors shadow-sm"
            >
              <History className="w-4 h-4" /> View My Attempt History
            </button>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 p-1.5 rounded-2xl bg-parchment/60 border border-forest/10 text-xs font-bold">
          {[
            { id: 'all', label: 'All Modes' },
            { id: 'full', label: 'Full Exam' },
            { id: 'section', label: 'Section Test' },
            { id: 'subject', label: 'Subject Test' },
            { id: 'topic', label: 'Topic Test' },
            { id: 'weak_area', label: 'Weak-Area' },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setTestMode(m.id as any)}
              className={`py-3 rounded-xl transition-all ${
                testMode === m.id
                  ? 'bg-scholar text-paper shadow-sm font-extrabold'
                  : 'text-muted hover:text-ink'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>


        {/* Exam Test Cards Discovery Grid */}
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 animate-pulse">Loading tests catalog for {targetExam}...</div>
        ) : tests.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/60 rounded-3xl border border-slate-800 text-slate-400 text-xs">
            No tests found for the selected mode. Try selecting "All Modes".
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tests.map((cfg) => {
              const isSelected = cfg.id === selectedTestId;
              const sourceBadge =
                cfg.sourceType === 'official_pyq'
                  ? 'OFFICIAL PYQ'
                  : cfg.sourceType === 'ai_generated'
                  ? 'AI-GENERATED PRACTICE'
                  : 'ADMIN TEST';

              return (
                <div
                  key={cfg.id}
                  onClick={() => setSelectedTestId(cfg.id)}
                  className={`cursor-pointer rounded-3xl p-6 transition-all flex flex-col justify-between space-y-6 border ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-400 shadow-xl shadow-cyan-500/10 ring-1 ring-cyan-400'
                      : 'bg-slate-900/60 border-slate-800 hover:border-cyan-500/40'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold uppercase tracking-wider font-mono">
                        {cfg.exam} • {cfg.examYear}
                      </span>
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-md ${
                        cfg.sourceType === 'official_pyq' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      }`}>
                        {sourceBadge}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white leading-snug">{cfg.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{cfg.description}</p>

                    <div className="space-y-2 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-400" /> {cfg.durationMinutes} Minutes • {cfg.questionCount} Questions
                      </div>
                      <div className="flex items-center gap-2">
                        <Calculator className="w-4 h-4 text-cyan-400" />
                        {cfg.calculatorAllowed ? 'On-screen Calculator Allowed' : 'No Calculator Permitted'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-cyan-400 font-semibold">
                    <span>Select Test Setup</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Selected Test Setup Banner & Launch Button */}
        {selectedConfig && (
          <div className="p-8 rounded-3xl bg-slate-900/90 border border-cyan-500/30 space-y-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#5CE1E6]" /> Exam Setup Overview — {selectedConfig.title}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300">
              <div>
                <h4 className="font-semibold text-[#5CE1E6] mb-2">Sections & Marking Rules</h4>
                <ul className="space-y-2">
                  {selectedConfig.sections.map((sec, idx) => (
                    <li key={idx} className="flex justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono">
                      <span>{sec.name} ({sec.questionCount} Qs)</span>
                      <span className="text-cyan-300 font-bold">+{sec.marksPerQuestion} / -{Math.round(sec.marksPerQuestion * sec.negativeMarkingRatio * 100) / 100}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-[#5CE1E6] mb-2">Official Test Instructions</h4>
                <ul className="space-y-2 text-slate-300 list-disc list-inside">
                  {selectedConfig.instructions.map((inst, i) => (
                    <li key={i}>{inst}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-xs text-amber-300">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>Calm Test Environment: Gamification badges and notifications are suppressed during test execution. Answers autosave automatically.</span>
            </div>

            <button
              onClick={handleStartExam}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 font-bold text-slate-950 flex items-center justify-center gap-2 hover:brightness-110 transition-all text-sm shadow-xl shadow-cyan-500/20"
            >
              <Play className="w-5 h-5 fill-slate-950" /> Launch {selectedConfig.exam} Simulation Test
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
