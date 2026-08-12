import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Trophy, ArrowRight, ShieldCheck, FileText } from 'lucide-react';
import { getStoredAttempts, type ExamAttemptRecord } from '../lib/exam/examSimulatorApi';

export default function ExamSimulatorHistory() {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState<ExamAttemptRecord[]>([]);

  useEffect(() => {
    const list = getStoredAttempts();
    setAttempts(list);
  }, []);

  return (
    <div className="min-h-screen bg-[#062B3D] text-white py-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Exam Simulator History | Study Hub</title>
      </Helmet>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-cyan-400 font-mono mb-1">
              <ShieldCheck className="w-4 h-4 text-cyan-400" /> Historical Performance
            </div>
            <h1 className="text-3xl font-black text-white">Simulation Attempt History</h1>
          </div>

          <Link
            to="/exam-simulator"
            className="px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-colors"
          >
            Launch New Test
          </Link>
        </div>

        {/* Attempts List */}
        {attempts.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <Trophy className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-200">No simulation attempts recorded yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Launch a full simulation test to track realistic score metrics, accuracy, and negative marking analysis.
            </p>
            <Link
              to="/exam-simulator"
              className="inline-block px-6 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
            >
              Go to Exam Simulator
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {attempts.map((att) => {
              const timeMins = Math.floor(att.time_spent_seconds / 60);
              return (
                <div
                  key={att.id}
                  className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold uppercase font-mono">
                        {att.exam}
                      </span>
                      <span className="text-slate-400">{new Date(att.started_at).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-base font-bold text-white">{att.test_title}</h3>
                    <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
                      <span>Score: <strong className="text-cyan-300">{att.score} / {att.max_score}</strong></span>
                      <span>Accuracy: <strong className="text-emerald-400">{att.accuracy_pct}%</strong></span>
                      <span>Duration: {timeMins}m</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => navigate(`/exam-simulator/review/${att.id}`)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700"
                    >
                      <FileText className="w-3.5 h-3.5 text-cyan-400" /> Solutions
                    </button>

                    <button
                      onClick={() => navigate(`/exam-simulator/result/${att.id}`)}
                      className="px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center gap-1.5"
                    >
                      Analytics <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
