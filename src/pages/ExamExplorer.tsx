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
    <div className="min-h-screen bg-[#F8F6F0] text-[#1C201D]">
      <Helmet>
        <title>Exam Catalog & Official Source Registry — Study Hub</title>
        <meta name="description" content="Explore verified entrance and competitive exams with official previous papers, answer keys, and syllabus archives." />
      </Helmet>

      <div className="px-6 py-12 max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs uppercase tracking-widest text-[#2D5A3F] font-bold bg-[#2D5A3F]/10 px-4 py-1.5 rounded-full inline-block border border-[#2D5A3F]/20">
            Verified Official Sources Only
          </span>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-[#1C201D] tracking-tight">
            Exam Catalog & Public Library
          </h1>
          <p className="text-sm text-[#6C706D] leading-relaxed">
            Browse verified competitive, entrance, and government exams. View official previous papers, verified answer keys, and structural syllabi.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-[#6C706D] absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search exam (e.g. GATE, JEE, NEET, UPSC)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-[#1C201D]/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#1C201D] placeholder:text-[#6C706D] focus:outline-none focus:border-[#2D5A3F]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 overflow-x-auto max-w-full py-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#2D5A3F] text-[#FFFFFF] shadow-sm'
                    : 'bg-[#EDE8DB] text-[#6C706D] hover:text-[#1C201D] border border-[#1C201D]/10'
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
              className="bg-[#FFFFFF] rounded-3xl p-6 border border-[#1C201D]/10 hover:border-[#2D5A3F]/40 shadow-sm transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#2D5A3F]/10 border border-[#2D5A3F]/20 text-[#2D5A3F] font-mono font-bold uppercase">
                    {exam.category}
                  </span>
                  <span className="text-[10px] text-[#6C706D] font-mono font-bold">Cycle: {exam.currentCycle}</span>
                </div>

                <div>
                  <h3 className="text-xl font-serif font-bold text-[#1C201D] group-hover:text-[#2D5A3F] transition-colors">
                    {exam.name}
                  </h3>
                  <p className="text-xs text-[#6C706D] mt-1 line-clamp-2 leading-relaxed">
                    {exam.shortDesc}
                  </p>
                </div>

                <div className="text-xs space-y-1">
                  <p className="text-[#1C201D]">
                    <span className="text-[#6C706D] font-medium">Organizer:</span> {exam.organizer}
                  </p>
                  <p className="flex items-center gap-1 text-[11px] text-[#2D5A3F] font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#2D5A3F]" />
                    {exam.availabilityBadge}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#1C201D]/10 flex items-center justify-between">
                <span className="text-[10px] text-[#6C706D] font-mono">
                  Verified: {exam.lastVerifiedAt}
                </span>

                <Link
                  to={`/exams/${exam.slug}`}
                  className="bg-[#2D5A3F] hover:bg-[#2D5A3F]/90 text-[#FFFFFF] rounded-xl px-4 py-2 text-xs font-bold flex items-center gap-1 shadow-sm transition-colors"
                >
                  <span>Explore Exam</span> <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
