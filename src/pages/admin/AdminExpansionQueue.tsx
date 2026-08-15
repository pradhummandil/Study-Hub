import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Layers, Search } from 'lucide-react';
import expansionQueue from '../../../scripts/questions/content-expansion-queue.json';

interface ExpansionQueueItem {
  exam: string;
  subject: string;
  chapter: string;
  topic: string;
  reason: string;
  current_count: number;
  target_direction: string;
}

export default function AdminExpansionQueue() {
  const [activeTab, setActiveTab] = useState<'ALL' | 'P0' | 'P1' | 'P2' | 'P3'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const items: ExpansionQueueItem[] = (expansionQueue as any).prioritized_queue || [];

  const getPriority = (item: ExpansionQueueItem) => {
    if (item.reason.includes('LOW_COVERAGE')) return 'P0';
    if (item.reason.includes('DIFFICULTY_IMBALANCE')) return 'P1';
    if (item.reason.includes('MISSING_YEAR_CONTENT')) return 'P2';
    return 'P3';
  };

  const filteredItems = items.filter(item => {
    const priority = getPriority(item);
    const matchesTab = activeTab === 'ALL' || priority === activeTab;

    const matchesSearch =
      item.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.chapter.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.exam.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Content Expansion Queue — Admin Study Hub</title>
      </Helmet>

      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Content Expansion Priority Queue</h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
              Targeted ingestion queue prioritizing LOW topics, difficulty imbalances, and missing PYQ years.
            </p>
          </div>
        </div>

        {/* Priority Counts Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
            <div className="text-xl font-bold text-rose-400 font-mono">{(expansionQueue as any).total_low_topics || 48}</div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">P0: LOW Coverage (1-4 Qs)</div>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
            <div className="text-xl font-bold text-amber-400 font-mono">{(expansionQueue as any).total_difficulty_imbalance_topics || 69}</div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">P1: Difficulty Imbalance</div>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
            <div className="text-xl font-bold text-indigo-400 font-mono">{(expansionQueue as any).total_missing_year_topics || 13}</div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">P2: Missing Years</div>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
            <div className="text-xl font-bold text-blue-400 font-mono">{(expansionQueue as any).total_medium_topics || 118}</div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">P3: Medium (5-24 Qs)</div>
          </div>
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-2xl text-xs font-semibold">
          {[
            { id: 'ALL', label: 'All Gaps' },
            { id: 'P0', label: 'P0: LOW (1-4)' },
            { id: 'P1', label: 'P1: Difficulty' },
            { id: 'P2', label: 'P2: Years' },
            { id: 'P3', label: 'P3: Medium' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2 rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search topic or exam..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Exam</th>
                <th className="px-6 py-4">Topic / Taxonomy</th>
                <th className="px-6 py-4 text-center">Current Qs</th>
                <th className="px-6 py-4">Identified Gap Reason</th>
                <th className="px-6 py-4">Target Ingestion Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredItems.map((item, idx) => {
                const p = getPriority(item);
                return (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-all">
                    <td className="px-6 py-4 font-mono font-bold">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] ${
                        p === 'P0' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' :
                        p === 'P1' ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30' :
                        p === 'P2' ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/30' :
                        'bg-blue-500/10 text-blue-300 border border-blue-500/30'
                      }`}>
                        {p}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-teal-400">{item.exam}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-white text-sm">{item.topic}</div>
                      <div className="text-slate-400 text-[11px]">{item.subject} → {item.chapter}</div>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-white font-mono text-sm">{item.current_count}</td>
                    <td className="px-6 py-4 text-slate-300 font-medium">{item.reason}</td>
                    <td className="px-6 py-4 text-amber-300 text-[11px] font-semibold">{item.target_direction}</td>
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
