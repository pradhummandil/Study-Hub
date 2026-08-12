// src/pages/ExamExplorer.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search, ArrowRight, ShieldCheck } from 'lucide-react';
import { fetchExamCatalog, type ExamCatalogItem } from '../lib/exam/examCatalog';

export default function ExamExplorer() {
  const [catalog, setCatalog] = useState<ExamCatalogItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    async function load() {
      const data = await fetchExamCatalog();
      setCatalog(data);
    }
    load();
  }, []);

  const categories = ['All', ...Array.from(new Set(catalog.map((c) => c.category)))];

  const filtered = catalog.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.organizer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <Helmet>
        <title>Exam Catalog & Official Source Registry — Study Hub</title>
        <meta name="description" content="Explore verified entrance and competitive exams with official previous papers, answer keys, and syllabus archives." />
      </Helmet>

      <div className="px-6 py-12 max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs uppercase tracking-widest text-cyan-400 font-semibold liquid-glass px-4 py-1.5 rounded-full inline-block border border-cyan-500/20">
            Verified Official Sources Only
          </span>
          <h1
            className="text-4xl sm:text-5xl font-normal text-foreground tracking-tight"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Exam Catalog & Public Library
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Browse verified competitive, entrance, and government exams. View official previous papers, verified answer keys, and structural syllabi.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search exam (e.g. GATE, JEE, NEET, UPSC)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 overflow-x-auto max-w-full py-1 custom-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs transition-all ${
                  selectedCategory === cat
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                    : 'liquid-glass text-muted-foreground hover:text-foreground border border-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Exam Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((exam) => (
            <div
              key={exam.id}
              className="liquid-glass-card rounded-3xl p-6 border border-white/10 hover:border-cyan-500/40 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-cyan-300 font-mono font-semibold uppercase">
                    {exam.category}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">Cycle: {exam.currentCycle}</span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-foreground group-hover:text-cyan-400 transition-colors">
                    {exam.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                    {exam.shortDesc}
                  </p>
                </div>

                <div className="text-xs text-slate-300 space-y-1">
                  <p><span className="text-muted-foreground">Organizer:</span> {exam.organizer}</p>
                  <p className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {exam.availabilityBadge}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground font-mono">
                  Verified: {exam.lastVerifiedAt}
                </span>

                <Link
                  to={`/exams/${exam.slug}`}
                  className="gradient-cta rounded-full px-4 py-1.5 text-xs text-slate-950 font-bold flex items-center gap-1 hover:scale-105 transition-transform"
                >
                  <span>Explore Exam</span> <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
