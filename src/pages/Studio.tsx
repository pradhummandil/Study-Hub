import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Download, ExternalLink, Bookmark, Sparkles, RefreshCw, CheckCircle2, Zap } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import { getSavedResources, saveResource, removeResourceByTitle } from '../lib/dashboardApi';
import { getResources, incrementDownloadCount, type ResourceItem } from '../lib/resourcesApi';

const CATEGORIES = ['All', 'Roadmaps', 'Notes', 'Previous Papers', 'Templates', 'Tools'];
const EXAM_TAGS = ['All exams', 'GATE', 'JEE Advanced', 'JEE Advanced AAT', 'JEE Main', 'NEET', 'UPSC', 'General'];
const PAGE_SIZE = 24;

export default function Studio() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [activeCategory, setActiveCategory] = useState('All');
  const [activeExamTag, setActiveExamTag] = useState('All exams');
  const [search, setSearch] = useState('');
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);

  const [savedTitles, setSavedTitles] = useState<string[]>([]);
  const [tooltipId, setTooltipId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch live resources from Supabase
  const loadStudioData = () => {
    setDataLoading(true);
    setFetchError(null);
    getResources()
      .then((data) => {
        setResources(data);
      })
      .catch((err) => {
        console.error('Studio fetch error:', err);
        setFetchError('Failed to load resources from database. Please try again.');
      })
      .finally(() => setDataLoading(false));
  };

  useEffect(() => {
    loadStudioData();

    if (user) {
      getSavedResources().then((list) => {
        setSavedTitles(list.map((item) => item.resource_title));
      });
    } else {
      setSavedTitles([]);
    }
  }, [user]);

  // Reset pagination when filters change
  useEffect(() => {
    setDisplayCount(PAGE_SIZE);
  }, [activeCategory, activeExamTag, search]);

  // Derived exam counts from actual fetched dataset
  const examCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    resources.forEach((r) => {
      const tag = r.exam_tag || 'General';
      counts[tag] = (counts[tag] || 0) + 1;
    });
    return counts;
  }, [resources]);

  // Combined filtering logic (Category AND Exam Tag AND Multi-field Search)
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return resources.filter((r) => {
      // 1. Category filter
      const catNormalized = r.category.toLowerCase().replace(/_/g, ' ');
      const activeCatNormalized = activeCategory.toLowerCase();
      const matchesCategory =
        activeCategory === 'All' ||
        catNormalized === activeCatNormalized ||
        (activeCategory === 'Previous Papers' && (catNormalized === 'previous_papers' || catNormalized === 'previous papers' || catNormalized === 'answer_keys' || catNormalized === 'answer keys'));

      // 2. Exam tag filter
      const matchesExamTag =
        activeExamTag === 'All exams' ||
        (r.exam_tag && r.exam_tag.toLowerCase() === activeExamTag.toLowerCase());

      // 3. Multi-field Search
      let matchesSearch = true;
      if (query) {
        const titleMatch = r.title.toLowerCase().includes(query);
        const descMatch = r.description ? r.description.toLowerCase().includes(query) : false;
        const examMatch = r.exam_tag ? r.exam_tag.toLowerCase().includes(query) : false;
        const subjMatch = r.subject ? r.subject.toLowerCase().includes(query) : false;
        const yearMatch = r.year ? r.year.toString().includes(query) : false;
        const catMatch = r.category ? r.category.toLowerCase().includes(query) : false;

        matchesSearch = titleMatch || descMatch || examMatch || subjMatch || yearMatch || catMatch;
      }

      return matchesCategory && matchesExamTag && matchesSearch;
    });
  }, [resources, activeCategory, activeExamTag, search]);

  // Visible page slice
  const visibleResources = useMemo(() => {
    return filtered.slice(0, displayCount);
  }, [filtered, displayCount]);

  const handleToggleBookmark = async (e: React.MouseEvent, resource: ResourceItem) => {
    e.stopPropagation();

    if (!user) {
      setTooltipId(resource.id);
      setTimeout(() => setTooltipId(null), 3000);
      return;
    }

    const isSaved = savedTitles.includes(resource.title);
    if (isSaved) {
      setSavedTitles((prev) => prev.filter((t) => t !== resource.title));
      await removeResourceByTitle(resource.title);
    } else {
      setSavedTitles((prev) => [...prev, resource.title]);
      await saveResource(resource.title, resource.category);
    }
  };

  const handleViewClick = (e: React.MouseEvent, resource: ResourceItem) => {
    e.stopPropagation();
    incrementDownloadCount(resource.id);
    window.open(resource.file_url, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadClick = (e: React.MouseEvent, resource: ResourceItem) => {
    e.stopPropagation();
    incrementDownloadCount(resource.id);
    
    // Attempt download or fallback smoothly
    try {
      const a = document.createElement('a');
      a.href = resource.file_url;
      a.download = `${resource.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      window.open(resource.file_url, '_blank', 'noopener,noreferrer');
      setToastMessage('Opened official PDF in new tab — use browser download button.');
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  // Helper for generating visual CSS fallback thumbnails
  const renderThumbnail = (r: ResourceItem) => {
    if (r.thumbnail_url) {
      return (
        <img
          src={r.thumbnail_url}
          alt={r.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      );
    }

    const exam = (r.exam_tag || '').toUpperCase();
    const isGate = exam.includes('GATE');
    const isJeeAdv = exam.includes('JEE ADVANCED');
    const isAat = exam.includes('AAT');
    const isNeet = exam.includes('NEET');
    const isUpsc = exam.includes('UPSC');

    let bgGradient = 'from-slate-900 via-zinc-900 to-slate-950';
    let badgeAccent = 'border-white/20 text-white/90 bg-white/5';
    let tagColor = 'text-cyan-400';

    if (isAat) {
      bgGradient = 'from-purple-950 via-slate-900 to-indigo-950';
      badgeAccent = 'border-amber-400/40 text-amber-300 bg-amber-500/10';
      tagColor = 'text-amber-400';
    } else if (isJeeAdv) {
      bgGradient = 'from-blue-950 via-slate-900 to-amber-950';
      badgeAccent = 'border-amber-400/40 text-amber-300 bg-amber-500/10';
      tagColor = 'text-amber-400';
    } else if (isGate) {
      bgGradient = 'from-slate-950 via-indigo-950 to-blue-950';
      badgeAccent = 'border-indigo-400/40 text-indigo-300 bg-indigo-500/10';
      tagColor = 'text-indigo-400';
    } else if (isNeet) {
      bgGradient = 'from-slate-950 via-teal-950 to-emerald-950';
      badgeAccent = 'border-emerald-400/40 text-emerald-300 bg-emerald-500/10';
      tagColor = 'text-emerald-400';
    } else if (isUpsc) {
      bgGradient = 'from-slate-950 via-slate-900 to-amber-950';
      badgeAccent = 'border-amber-400/40 text-amber-300 bg-amber-500/10';
      tagColor = 'text-amber-400';
    }

    const yearDisplay = r.year ? r.year.toString() : '';
    const paperLabel = r.category === 'answer_keys' ? 'ANSWER KEY' : 'QUESTION PAPER';

    return (
      <div className={`w-full h-full bg-gradient-to-br ${bgGradient} p-5 flex flex-col justify-between relative overflow-hidden select-none border-b border-white/5`}>
        {/* Subtle background glow circle */}
        <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-white/5 blur-xl pointer-events-none" />

        <div className="flex items-center justify-between z-10">
          <span className={`text-[10px] font-mono tracking-widest uppercase font-semibold px-2.5 py-1 rounded-md border ${badgeAccent}`}>
            {r.exam_tag || 'OFFICIAL'}
          </span>
          {yearDisplay && (
            <span className="text-xs font-mono text-white/70 font-semibold px-2 py-0.5 rounded bg-white/10 border border-white/10">
              {yearDisplay}
            </span>
          )}
        </div>

        <div className="z-10 my-auto py-2">
          <p className="text-xs font-sans text-white/60 truncate font-medium">{r.subject || r.category.replace(/_/g, ' ').toUpperCase()}</p>
          <p className={`text-base font-normal tracking-wide text-foreground mt-0.5 font-serif line-clamp-1`}>
            {paperLabel}
          </p>
        </div>

        <div className="flex items-center justify-between z-10 text-[10px] text-white/40 uppercase tracking-widest font-mono">
          <span className={tagColor}>verified PDF</span>
          <FileText className="w-3.5 h-3.5 opacity-50" />
        </div>
      </div>
    );
  };

  // Helper for source label
  const getSourceLabel = (url: string) => {
    if (url.includes('gate2027.iitm.ac.in')) return 'Official GATE 2027 Archive';
    if (url.includes('jeeadv.ac.in')) return 'Official JEE Advanced Archive';
    if (url.includes('nta.ac.in')) return 'Official NTA Portal';
    if (url.includes('upsc.gov.in')) return 'Official UPSC Archive';
    return 'Official Exam Source';
  };

  return (
    <>
      <Helmet>
        <title>Studio — Study Hub</title>
        <meta name="description" content="Free official question papers, roadmaps, notes, and templates for GATE, JEE Advanced, NEET, and UPSC." />
      </Helmet>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 liquid-glass rounded-xl px-5 py-3 text-xs text-foreground shadow-2xl border border-white/20 flex items-center gap-2 animate-fade-rise">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero */}
      <div className="relative z-10 px-6 pt-24 pb-8 text-center max-w-4xl mx-auto">
        <h1
          className="animate-fade-rise text-5xl sm:text-6xl font-normal leading-[0.95] tracking-[-2px] text-foreground"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Everything I wish someone <span className="text-gradient-accent">gave</span> me.
        </h1>
        <p className="animate-fade-rise-delay text-muted-foreground max-w-xl mx-auto mt-6 leading-relaxed">
          Official question papers, roadmaps, and templates — free, direct PDF links.
        </p>

        {/* Live Dataset Counts Bar */}
        {!dataLoading && resources.length > 0 && (
          <div className="animate-fade-rise-delay-2 flex items-center justify-center gap-4 mt-6 flex-wrap text-xs text-muted-foreground">
            <span className="liquid-glass rounded-full px-3.5 py-1 text-foreground font-medium border border-white/10">
              {resources.length} total resources
            </span>
            {examCounts['GATE'] && (
              <span className="liquid-glass rounded-full px-3 py-1 border border-white/5">
                {examCounts['GATE']} GATE papers
              </span>
            )}
            {examCounts['JEE Advanced'] && (
              <span className="liquid-glass rounded-full px-3 py-1 border border-white/5">
                {examCounts['JEE Advanced']} JEE Advanced
              </span>
            )}
            {examCounts['JEE Advanced AAT'] && (
              <span className="liquid-glass rounded-full px-3 py-1 border border-white/5">
                {examCounts['JEE Advanced AAT']} AAT papers
              </span>
            )}
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 pb-8 flex flex-col gap-4">
        {/* Top row: Category Pills & Search */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Category pills */}
          <div className="flex flex-wrap gap-2 flex-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${
                  activeCategory === cat
                    ? 'liquid-glass text-foreground border border-white/20'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search papers, GATE CS, JEE 2024…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="liquid-glass rounded-full w-full pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            />
          </div>
        </div>

        {/* Secondary row: Exam Tag filters */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-white/5">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground/70 mr-2">Exam:</span>
          {EXAM_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveExamTag(tag)}
              className={`rounded-full px-3.5 py-1 text-xs transition-all duration-200 focus-visible:outline-none ${
                activeExamTag === tag
                  ? 'liquid-glass text-gradient-accent font-medium border border-white/10'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tag} {examCounts[tag] ? `(${examCounts[tag]})` : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Resource Grid / Skeleton / Error / Empty States */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 pb-32">
        {/* Error State */}
        {fetchError ? (
          <div className="liquid-glass-card rounded-2xl py-16 px-8 text-center max-w-lg mx-auto border border-red-500/20">
            <p className="text-red-400 text-sm mb-4">{fetchError}</p>
            <button
              onClick={loadStudioData}
              className="liquid-glass rounded-full px-6 py-2.5 text-xs text-foreground inline-flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Connection</span>
            </button>
          </div>
        ) : dataLoading ? (
          /* Skeleton Loader (6 cards) */
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="liquid-glass-card rounded-xl p-4 flex flex-col gap-4 animate-pulse">
                <div className="w-full aspect-video rounded-lg bg-white/5 skeleton-pulse" />
                <div className="w-1/3 h-4 rounded bg-white/5 skeleton-pulse" />
                <div className="w-3/4 h-6 rounded bg-white/5 skeleton-pulse" />
                <div className="w-full h-12 rounded bg-white/5 skeleton-pulse" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          /* Genuine Empty state (shown ONLY when query legitimately returns 0) */
          <div className="liquid-glass-card rounded-2xl py-20 px-8 text-center max-w-lg mx-auto border border-white/10">
            <Sparkles className="w-8 h-8 text-muted-foreground/40 mx-auto mb-4" />
            <h3
              className="text-2xl font-normal text-foreground mb-2"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              No matching resources found
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto mb-6">
              No study materials match your current category and exam filter combination. Try clearing your search or switching filters.
            </p>
            <button
              onClick={() => {
                setActiveCategory('All');
                setActiveExamTag('All exams');
                setSearch('');
              }}
              className="liquid-glass rounded-full px-6 py-2.5 text-xs text-foreground font-medium hover:scale-105 transition-transform"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Live Resource Grid */
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleResources.map((r) => {
                const isSaved = savedTitles.includes(r.title);
                const tagLabel = `${(r.exam_tag || 'General').toUpperCase()}${r.year ? ` · ${r.year}` : ''}`;
                const sourceLabel = getSourceLabel(r.file_url);

                return (
                  <div
                    key={r.id}
                    className="liquid-glass-card rounded-xl overflow-hidden flex flex-col justify-between hover:scale-[1.01] transition-transform duration-300 group relative border border-white/10 shadow-xl"
                  >
                    <div>
                      {/* Thumbnail Header */}
                      <div className="relative aspect-video w-full overflow-hidden bg-black/40 border-b border-white/5">
                        {renderThumbnail(r)}

                        {/* Bookmark Button top-right */}
                        <div className="absolute top-3 right-3 z-20">
                          <button
                            onClick={(e) => handleToggleBookmark(e, r)}
                            className="w-8 h-8 rounded-full liquid-glass flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors focus:outline-none border border-white/10 shadow-md"
                            aria-label={isSaved ? 'Remove bookmark' : 'Bookmark resource'}
                          >
                            <Bookmark
                              className={`w-4 h-4 transition-colors ${
                                isSaved
                                  ? 'text-[hsl(38,92%,68%)] fill-[hsl(38,92%,68%)]'
                                  : 'text-muted-foreground hover:text-foreground'
                              }`}
                            />
                          </button>

                          {/* Tooltip for unauthenticated users */}
                          {tooltipId === r.id && (
                            <div className="absolute right-0 top-10 z-30 liquid-glass rounded-lg px-3 py-1.5 text-xs text-foreground whitespace-nowrap border border-white/10 shadow-xl animate-fade-rise">
                              Log in to save resources
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-6 flex flex-col">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-mono">
                            {tagLabel}
                          </span>
                          <span className="text-[10px] text-muted-foreground/70 tracking-wide font-mono">
                            {r.file_type ? r.file_type.toUpperCase() : 'PDF'}
                          </span>
                        </div>

                        <h3
                          className="text-xl text-foreground font-normal mb-2 leading-snug"
                          style={{ fontFamily: "'Instrument Serif', serif" }}
                        >
                          {r.title}
                        </h3>

                        {r.description && (
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mb-3">
                            {r.description}
                          </p>
                        )}

                        <div className="mt-2 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-muted-foreground">
                          <span>{sourceLabel}</span>
                        </div>
                      </div>
                    </div>

                    {/* Resource Intelligence Action Strip */}
                    <div className="px-6 py-2 border-t border-white/5 flex items-center justify-between text-[11px] gap-2">
                      <button
                        onClick={() => navigate('/study-ai', { state: { prompt: `Analyze and explain core concepts in ${r.title} for ${r.exam_tag || 'GATE'}`, mode: 'Explain' } })}
                        className="text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold"
                      >
                        <Sparkles className="w-3 h-3" /> Ask StudyMate
                      </button>
                      <button
                        onClick={() => navigate('/study-ai', { state: { prompt: `Create a 5 question quiz on ${r.title}`, mode: 'Quiz' } })}
                        className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
                      >
                        <Zap className="w-3 h-3" /> Create Quiz
                      </button>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="p-6 pt-2 flex items-center gap-3">
                      {/* View Button (Opens PDF in new tab) */}
                      <button
                        onClick={(e) => handleViewClick(e, r)}
                        className="liquid-glass rounded-full px-4 py-2 text-xs text-foreground font-medium flex-1 inline-flex items-center justify-center gap-1.5 hover:scale-[1.02] transition-transform border border-white/10"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3 h-3 text-muted-foreground" />
                      </button>

                      {/* Download Button */}
                      <button
                        onClick={(e) => handleDownloadClick(e, r)}
                        className="gradient-cta rounded-full px-4 py-2 text-xs text-black font-medium flex-1 inline-flex items-center justify-center gap-1.5 hover:scale-[1.02] transition-transform"
                      >
                        <Download className="w-3 h-3 text-black" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Load More Button */}
            {filtered.length > displayCount && (
              <div className="mt-12 text-center">
                <button
                  onClick={() => setDisplayCount((prev) => prev + PAGE_SIZE)}
                  className="liquid-glass rounded-full px-8 py-3 text-xs text-foreground font-medium hover:scale-105 transition-transform border border-white/20 shadow-xl"
                >
                  Load More Resources ({filtered.length - displayCount} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
