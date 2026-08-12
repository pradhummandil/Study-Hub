import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Shield, Clock, Calculator, Play, ChevronRight, BookOpen, AlertCircle } from 'lucide-react';
import { SAMPLE_EXAM_CONFIGS } from '../lib/exam/examSimulator';

export default function ExamSimulatorPage() {
  const navigate = useNavigate();
  const [selectedExamId, setSelectedExamId] = useState(SAMPLE_EXAM_CONFIGS[0].id);
  const [testMode, setTestMode] = useState<'full' | 'section' | 'subject' | 'topic' | 'weak_area'>('full');

  const selectedConfig = SAMPLE_EXAM_CONFIGS.find((c) => c.id === selectedExamId) || SAMPLE_EXAM_CONFIGS[0];

  const handleStartExam = () => {
    navigate(`/exam-simulator/runner/${selectedConfig.id}?mode=${testMode}`);
  };

  return (
    <div className="min-h-screen bg-[#062B3D] text-white py-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Adaptive Exam Simulator | Study Hub</title>
        <meta
          name="description"
          content="Experience authentic exam environments for GATE, JEE, NEET, UPSC with section timers, negative marking, and question palettes."
        />
      </Helmet>

      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Shield className="w-4 h-4 text-[#5CE1E6]" /> Authentic Exam Testing Engine
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white">
            Adaptive Exam Simulator
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Recreates exact official test interfaces, negative marking rules, timers, and section navigation for calm, focused preparation.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs font-bold">
          {[
            { id: 'full', label: 'Full Exam' },
            { id: 'section', label: 'Section Test' },
            { id: 'subject', label: 'Subject Test' },
            { id: 'topic', label: 'Topic Test' },
            { id: 'weak_area', label: 'Weak-Area Test' },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setTestMode(m.id as any)}
              className={`py-3 rounded-xl transition-all ${
                testMode === m.id
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Exam Configuration Selector */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SAMPLE_EXAM_CONFIGS.map((cfg) => {
            const isSelected = cfg.id === selectedExamId;
            return (
              <div
                key={cfg.id}
                onClick={() => setSelectedExamId(cfg.id)}
                className={`cursor-pointer rounded-3xl p-6 transition-all flex flex-col justify-between space-y-6 border ${
                  isSelected
                    ? 'bg-slate-900 border-cyan-400 shadow-xl shadow-cyan-500/10 ring-1 ring-cyan-400'
                    : 'bg-slate-900/60 border-slate-800 hover:border-cyan-500/40'
                }`}
              >
                <div className="space-y-4">
                  <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-[11px] font-bold uppercase tracking-wider">
                    {cfg.exam}
                  </span>
                  <h3 className="text-lg font-bold text-white">{cfg.title}</h3>
                  <div className="space-y-2 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-400" /> {cfg.durationMinutes} Minutes
                    </div>
                    <div className="flex items-center gap-2">
                      <Calculator className="w-4 h-4 text-cyan-400" />
                      {cfg.calculatorAllowed ? 'On-screen Calculator Allowed' : 'No Calculator Permitted'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-cyan-400 font-semibold">
                  <span>Select Exam Config</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Exam Setup Details & Start Banner */}
        <div className="p-8 rounded-3xl bg-slate-900/90 border border-cyan-500/30 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#5CE1E6]" /> Exam Setup Overview — {selectedConfig.title}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300">
            <div>
              <h4 className="font-semibold text-[#5CE1E6] mb-2">Sections & Marking Rules</h4>
              <ul className="space-y-2">
                {selectedConfig.sections.map((sec, idx) => (
                  <li key={idx} className="flex justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span>{sec.name} ({sec.questionCount} Qs)</span>
                    <span className="font-mono text-cyan-300">+{sec.marksPerQuestion} / -{Math.round(sec.marksPerQuestion * sec.negativeMarkingRatio * 100) / 100}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-[#5CE1E6] mb-2">Official Instructions</h4>
              <ul className="space-y-1.5 text-slate-400 list-disc list-inside">
                {selectedConfig.instructions.map((inst, i) => (
                  <li key={i}>{inst}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-xs text-amber-300">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>Calm Realistic Interface: Inside the simulation, gamification elements and distractions are suppressed for test focus.</span>
          </div>

          <button
            onClick={handleStartExam}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 font-bold text-slate-950 flex items-center justify-center gap-2 hover:brightness-110 transition-all text-sm shadow-xl shadow-cyan-500/20"
          >
            <Play className="w-5 h-5 fill-slate-950" /> Launch {selectedConfig.exam} Simulation Session
          </button>
        </div>
      </div>
    </div>
  );
}
