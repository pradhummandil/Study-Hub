import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Search, AlertCircle, Play, Layers } from 'lucide-react';
import reportData from '../../scripts/questions/question-coverage-report-v3.json';

interface TopicNode {
  exam_code: string;
  subject: string;
  chapter: string;
  topic: string;
  question_count: number;
  pyq_count: number;
  study_hub_count: number;
  verified_count: number;
  solution_count: number;
  difficulties: { Easy: number; Medium: number; Hard: number };
  flags: string[];
  missing_years?: number[];
  present_years?: number[];
}

export default function QuestionCoveragePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExam, setSelectedExam] = useState<string>('ALL');
  const [selectedHealth, setSelectedHealth] = useState<string>('ALL');

  const topics: TopicNode[] = (reportData as any).topic_coverage || [];

  const filteredTopics = topics.filter(t => {
    const matchesSearch =
      t.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.chapter.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesExam = selectedExam === 'ALL' || t.exam_code === selectedExam;

    let matchesHealth = true;
    if (selectedHealth === 'LOW') matchesHealth = t.question_count <= 4;
    else if (selectedHealth === 'MEDIUM') matchesHealth = t.question_count >= 5 && t.question_count <= 24;
    else if (selectedHealth === 'GOOD') matchesHealth = t.question_count >= 25;
    else if (selectedHealth === 'IMBALANCE') matchesHealth = t.flags.length > 0;

    return matchesSearch && matchesExam && matchesHealth;
  });

  return (
    <div className="px-6 py-12 max-w-6xl mx-auto space-y-8">
      <Helmet>
        <title>Question Availability & Depth Map — Study Hub</title>
        <meta name="description" content="Transparent coverage depth and PYQ availability per topic." />
      </Helmet>

      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-2xl">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Transparent Question Depth & Availability</h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
              Real-time audit of canonical questions, PYQ density, and difficulty distributions per topic.
            </p>
          </div>
        </div>

        {/* Global Health Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center">
            <div className="text-xl font-bold text-white font-mono">{reportData.total_canonical_questions}</div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">Total Questions</div>
          </div>
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center">
            <div className="text-xl font-bold text-teal-400 font-mono">{reportData.official_pyqs}</div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">Official PYQs</div>
          </div>
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center">
            <div className="text-xl font-bold text-amber-400 font-mono">{(reportData as any).health_summary?.LOW_coverage_topics || 48}</div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">Low Topics (1-4 Qs)</div>
          </div>
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center">
            <div className="text-xl font-bold text-blue-400 font-mono">{(reportData as any).health_summary?.MEDIUM_coverage_topics || 118}</div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">Medium Topics (5-24 Qs)</div>
          </div>
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center">
            <div className="text-xl font-bold text-indigo-400 font-mono">{(reportData as any).imbalance_summary?.difficulty_imbalance_topics || 69}</div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">Difficulty Imbalanced</div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search topic, subject, or chapter..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>
        <select
          value={selectedExam}
          onChange={e => setSelectedExam(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
        >
          <option value="ALL">All Exam Codes</option>
          <option value="GATE_CSE">GATE CSE</option>
          <option value="JEE_MAIN">JEE Main</option>
          <option value="JEE_ADVANCED">JEE Advanced</option>
          <option value="NEET_UG">NEET UG</option>
          <option value="GATE_DA">GATE DA</option>
        </select>
        <select
          value={selectedHealth}
          onChange={e => setSelectedHealth(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
        >
          <option value="ALL">All Depth Levels</option>
          <option value="LOW">Low Coverage (1-4 Qs)</option>
          <option value="MEDIUM">Medium Coverage (5-24 Qs)</option>
          <option value="GOOD">Good / Deep Coverage (25+ Qs)</option>
          <option value="IMBALANCE">Has Imbalance Flags</option>
        </select>
      </div>

      {/* Topics Grid Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Topic / Taxonomy</th>
                <th className="px-6 py-4">Exam</th>
                <th className="px-6 py-4 text-center">Questions</th>
                <th className="px-6 py-4 text-center">PYQs</th>
                <th className="px-6 py-4">Difficulty Distribution</th>
                <th className="px-6 py-4">Status & Flags</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredTopics.map((t, idx) => {
                const total = t.question_count;
                const isLow = total <= 4;
                const easyPct = total > 0 ? Math.round(((t.difficulties?.Easy || 0) / total) * 100) : 0;
                const medPct = total > 0 ? Math.round(((t.difficulties?.Medium || 0) / total) * 100) : 0;
                const hardPct = total > 0 ? Math.round(((t.difficulties?.Hard || 0) / total) * 100) : 0;

                return (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-all">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white text-sm">{t.topic}</div>
                      <div className="text-slate-400 text-[11px] mt-0.5">{t.subject} → {t.chapter}</div>
                    </td>
                    <td className="px-6 py-4 font-mono font-semibold text-teal-400">{t.exam_code}</td>
                    <td className="px-6 py-4 text-center font-bold text-white text-sm font-mono">{t.question_count}</td>
                    <td className="px-6 py-4 text-center font-semibold text-teal-300 font-mono">{t.pyq_count}</td>
                    <td className="px-6 py-4 min-w-[160px]">
                      <div className="h-2 rounded-full bg-slate-950 flex overflow-hidden border border-slate-800">
                        <div style={{ width: `${easyPct}%` }} className="bg-emerald-400" title={`Easy: ${t.difficulties?.Easy || 0}`} />
                        <div style={{ width: `${medPct}%` }} className="bg-amber-400" title={`Medium: ${t.difficulties?.Medium || 0}`} />
                        <div style={{ width: `${hardPct}%` }} className="bg-rose-400" title={`Hard: ${t.difficulties?.Hard || 0}`} />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                        <span>E:{t.difficulties?.Easy || 0}</span>
                        <span>M:{t.difficulties?.Medium || 0}</span>
                        <span>H:{t.difficulties?.Hard || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 space-y-1">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          <AlertCircle className="w-3 h-3" /> Limited Coverage
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-300 border border-teal-500/20">
                          Good Depth
                        </span>
                      )}

                      {t.flags.map(f => (
                        <span key={f} className="block text-[10px] text-rose-400 font-mono font-semibold">
                          ⚠️ {f.replace('_', ' ')}
                        </span>
                      ))}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/practice?subject=${encodeURIComponent(t.subject)}&topic=${encodeURIComponent(t.topic)}`}
                        className="px-3 py-1.5 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/30 font-bold rounded-xl text-xs inline-flex items-center gap-1 transition-all"
                      >
                        <Play className="w-3 h-3" /> Practice
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
