import { useState, useMemo } from 'react';
import { Search, FileText, Download, Globe } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

type Resource = {
  id: number;
  title: string;
  category: string;
  desc: string;
  action: 'Download' | 'Open';
  type: 'pdf' | 'link';
};

const RESOURCES: Resource[] = [
  { id: 1, title: 'JEE Advanced 10-Week Roadmap', category: 'Roadmaps', desc: 'A week-by-week prep plan covering Physics, Chemistry, and Maths with revision cycles.', action: 'Download', type: 'pdf' },
  { id: 2, title: 'UPSC Prelims GS Paper I Strategy', category: 'Roadmaps', desc: 'Subject-wise breakdowns, source lists, and a 5-month prep timeline.', action: 'Download', type: 'pdf' },
  { id: 3, title: 'GATE CSE Formulae Quick Sheet', category: 'Notes', desc: 'Compressed formula sheets for Algorithms, OS, DBMS, and Networks.', action: 'Download', type: 'pdf' },
  { id: 4, title: 'Modern History Notes — Spectrum Summary', category: 'Notes', desc: 'Condensed chapter-wise notes from Spectrum, optimised for quick revision.', action: 'Download', type: 'pdf' },
  { id: 5, title: 'JEE 2023–2025 Previous Year Papers', category: 'Previous Papers', desc: 'All three years of JEE Main + Advanced, with answer keys and topic tagging.', action: 'Download', type: 'pdf' },
  { id: 6, title: 'GATE CSE PYQs 2018–2025', category: 'Previous Papers', desc: 'Subject-sorted previous year questions with detailed solutions.', action: 'Download', type: 'pdf' },
  { id: 7, title: 'Weekly Study Planner (Fillable PDF)', category: 'Templates', desc: 'A printable + digital planner template with time-blocking and review columns.', action: 'Download', type: 'pdf' },
  { id: 8, title: 'Subject Mastery Tracker Sheet', category: 'Templates', desc: 'Spreadsheet template to track topic-wise confidence and revision dates.', action: 'Download', type: 'pdf' },
  { id: 9, title: 'Anki Flashcard Deck — Polity Basics', category: 'Tools', desc: 'A ready-to-import Anki deck covering Indian Constitution fundamentals.', action: 'Open', type: 'link' },
];

const CATEGORIES = ['All', 'Roadmaps', 'Notes', 'Previous Papers', 'Templates', 'Tools'];

export default function Studio() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return RESOURCES.filter((r) => {
      const matchesCategory = activeCategory === 'All' || r.category === activeCategory;
      const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search]);

  return (
    <>
      <Helmet>
        <title>Studio — Study Hub</title>
        <meta name="description" content="Free notes, roadmaps, previous papers, and templates. No signup wall." />
      </Helmet>

      {/* Hero */}
      <div className="relative z-10 px-6 pt-24 pb-12 text-center max-w-4xl mx-auto">
        <h1
          className="animate-fade-rise text-5xl sm:text-6xl font-normal leading-[0.95] tracking-[-2px] text-foreground"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Everything I wish someone <span className="text-gradient-accent">gave</span> me.
        </h1>
        <p className="animate-fade-rise-delay text-muted-foreground max-w-xl mx-auto mt-6 leading-relaxed">
          Notes, roadmaps, and templates — free, no signup wall.
        </p>
      </div>

      {/* Filter & Search bar */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 pb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Category pills */}
        <div className="flex flex-wrap gap-2 flex-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${
                activeCategory === cat
                  ? 'liquid-glass text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search resources…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="liquid-glass rounded-full w-full pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          />
        </div>
      </div>

      {/* Resource Grid */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 pb-32">
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-muted-foreground text-base">No resources match — try a different search.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((r) => (
              <div
                key={r.id}
                className="liquid-glass-card rounded-xl p-6 flex flex-col hover:scale-[1.01] transition-transform duration-300 cursor-pointer group"
              >
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">{r.category}</p>
                <h3
                  className="text-xl text-foreground font-normal mb-2 leading-snug"
                  style={{ fontFamily: "'Instrument Serif', serif" }}
                >
                  {r.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">{r.desc}</p>
                <div className="mt-5 flex items-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors">
                  {r.type === 'pdf' ? (
                    <Download className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                  ) : (
                    <Globe className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                  )}
                  <span className="text-sm">{r.action}</span>
                  <FileText className="w-3 h-3 ml-auto opacity-40" strokeWidth={1.5} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
