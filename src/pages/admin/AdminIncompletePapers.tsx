import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { FileText, CheckCircle2, AlertTriangle, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface OfficialPaperSummary {
  exam_code: string;
  year: number;
  paper_name: string;
  expected_count: number;
  imported_count: number;
  missing_count: number;
  missing_question_numbers: number[];
  status: 'COMPLETE' | 'INCOMPLETE' | 'UNVERIFIED';
}

const EXPECTED_PAPER_BENCHMARKS: Record<string, number> = {
  'GATE_CSE': 65,
  'JEE_MAIN': 75,
  'JEE_ADVANCED': 54,
  'NEET_UG': 180,
  'GATE_DA': 65,
};

export default function AdminIncompletePapers() {
  const [loading, setLoading] = useState(true);
  const [papers, setPapers] = useState<OfficialPaperSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadPaperStatus() {
      setLoading(true);

      const { data, error } = await supabase
        .from('questions')
        .select('exam_code, year, source_name, source_type')
        .eq('source_type', 'OFFICIAL_PYQ');

      if (error || !data) {
        setLoading(false);
        return;
      }

      const paperGroupMap = new Map<string, { exam: string; year: number; name: string; count: number }>();

      data.forEach(q => {
        const exam = q.exam_code || 'GATE_CSE';
        const year = q.year || 2026;
        const name = q.source_name || `${exam} ${year} Official Paper`;
        const key = `${exam}|||${year}|||${name}`;

        if (!paperGroupMap.has(key)) {
          paperGroupMap.set(key, { exam, year, name, count: 0 });
        }
        paperGroupMap.get(key)!.count++;
      });

      const paperSummaries: OfficialPaperSummary[] = [];

      for (const [_, entry] of paperGroupMap.entries()) {
        const expected = EXPECTED_PAPER_BENCHMARKS[entry.exam] || 65;
        const missing = Math.max(0, expected - entry.count);
        const status = missing === 0 ? 'COMPLETE' : missing <= 10 ? 'INCOMPLETE' : 'UNVERIFIED';

        paperSummaries.push({
          exam_code: entry.exam,
          year: entry.year,
          paper_name: entry.name,
          expected_count: expected,
          imported_count: entry.count,
          missing_count: missing,
          missing_question_numbers: [],
          status
        });
      }

      paperSummaries.sort((a, b) => b.year - a.year);
      setPapers(paperSummaries);
      setLoading(false);
    }
    loadPaperStatus();
  }, []);

  const filteredPapers = papers.filter(p =>
    p.paper_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.exam_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Official Paper Completeness — Admin Study Hub</title>
      </Helmet>

      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-2xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Official Exam Paper Completeness Audit</h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
              Source-to-question verification tracking expected vs imported canonical question counts.
            </p>
          </div>
        </div>

        {/* Paper Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
            <div className="text-xl font-bold text-teal-400 font-mono">{papers.filter(p => p.status === 'COMPLETE').length}</div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">100% Complete Papers</div>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
            <div className="text-xl font-bold text-amber-400 font-mono">{papers.filter(p => p.status === 'INCOMPLETE').length}</div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">Incomplete Papers</div>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
            <div className="text-xl font-bold text-white font-mono">{papers.length}</div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">Official Papers Tracked</div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search paper or exam code..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>
      </div>

      {/* Papers Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Exam Code</th>
                <th className="px-6 py-4">Exam Year</th>
                <th className="px-6 py-4">Official Paper Name</th>
                <th className="px-6 py-4 text-center">Expected Qs</th>
                <th className="px-6 py-4 text-center">Imported Qs</th>
                <th className="px-6 py-4 text-center">Missing Qs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">Loading paper status audit...</td>
                </tr>
              ) : filteredPapers.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-all">
                  <td className="px-6 py-4 font-mono font-bold">
                    {p.status === 'COMPLETE' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" /> COMPLETE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/30">
                        <AlertTriangle className="w-3 h-3" /> INCOMPLETE
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-teal-400">{p.exam_code}</td>
                  <td className="px-6 py-4 font-mono font-bold text-white">{p.year}</td>
                  <td className="px-6 py-4 font-medium text-white">{p.paper_name}</td>
                  <td className="px-6 py-4 text-center font-mono font-semibold text-slate-400">{p.expected_count}</td>
                  <td className="px-6 py-4 text-center font-mono font-bold text-emerald-400">{p.imported_count}</td>
                  <td className="px-6 py-4 text-center font-mono font-bold text-amber-400">{p.missing_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
