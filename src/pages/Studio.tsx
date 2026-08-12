import { useState, useMemo, useEffect } from 'react';
import { Search, FileText, Download, Globe, Bookmark, Archive, FileCode, Sparkles } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import { getSavedResources, saveResource, removeResourceByTitle } from '../lib/dashboardApi';
import { getResources, incrementDownloadCount, type ResourceItem } from '../lib/resourcesApi';

const CATEGORIES = ['All', 'Roadmaps', 'Notes', 'Previous Papers', 'Templates', 'Tools'];
const EXAM_TAGS = ['All exams', 'JEE', 'NEET', 'GATE', 'UPSC', 'General'];

export default function Studio() {
  const { user } = useAuth();
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [activeCategory, setActiveCategory] = useState('All');
  const [activeExamTag, setActiveExamTag] = useState('All exams');
  const [search, setSearch] = useState('');

  const [savedTitles, setSavedTitles] = useState<string[]>([]);
  const [tooltipId, setTooltipId] = useState<string | null>(null);

  // Fetch live resources and user's saved items on mount
  useEffect(() => {
    setDataLoading(true);
    getResources()
      .then((data) => setResources(data))
      .finally(() => setDataLoading(false));

    if (user) {
      getSavedResources().then((list) => {
        setSavedTitles(list.map((item) => item.resource_title));
      });
    } else {
      setSavedTitles([]);
    }
  }, [user]);

  // Combined filtering logic (Category AND Exam Tag AND Search)
  const filtered = useMemo(() => {
    return resources.filter((r) => {
      // Category match
      const matchesCategory =
        activeCategory === 'All' ||
        r.category.toLowerCase().replace(/_/g, ' ') === activeCategory.toLowerCase();

      // Exam tag match
      const matchesExamTag =
        activeExamTag === 'All exams' ||
        (r.exam_tag && r.exam_tag.toLowerCase() === activeExamTag.toLowerCase());

      // Search match
      const matchesSearch =
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        (r.description && r.description.toLowerCase().includes(search.toLowerCase()));

      return matchesCategory && matchesExamTag && matchesSearch;
    });
  }, [resources, activeCategory, activeExamTag, search]);

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

  const handleDownloadClick = (resourceId: string) => {
    incrementDownloadCount(resourceId);
  };

  // Helper for thumbnail fallback icon
  const renderFallbackIcon = (fileType: string | null) => {
    const type = fileType?.toLowerCase() || '';
    if (type === 'zip' || type === 'rar' || type === 'archive') {
      return <Archive className="w-10 h-10 text-muted-foreground/50" strokeWidth={1.5} />;
    }
    if (type === 'link' || type === 'url') {
      return <Globe className="w-10 h-10 text-muted-foreground/50" strokeWidth={1.5} />;
    }
    if (type === 'docx' || type === 'code') {
      return <FileCode className="w-10 h-10 text-muted-foreground/50" strokeWidth={1.5} />;
    }
    return <FileText className="w-10 h-10 text-muted-foreground/50" strokeWidth={1.5} />;
  };

  return (
    <>
      <Helmet>
        <title>Studio — Study Hub</title>
        <meta name="description" content="Free notes, roadmaps, previous papers, and templates for JEE, NEET, GATE, and UPSC. No signup wall." />
      </Helmet>

      {/* Hero */}
      <div className="relative z-10 px-6 pt-24 pb-10 text-center max-w-4xl mx-auto">
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

      {/* Filters & Search */}
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

          {/* Search bar */}
          <div className="relative w-full sm:w-64 shrink-0">
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

        {/* Secondary row: Exam Tag filters */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-white/5">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground/70 mr-2">Exam:</span>
          {EXAM_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveExamTag(tag)}
              className={`rounded-full px-3 py-1 text-xs transition-all duration-200 focus-visible:outline-none ${
                activeExamTag === tag
                  ? 'liquid-glass text-gradient-accent font-medium border border-white/10'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Resource Grid / Skeleton / Empty State */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 pb-32">
        {dataLoading ? (
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
          /* Empty state */
          <div className="liquid-glass-card rounded-2xl py-20 px-8 text-center max-w-lg mx-auto border border-white/10">
            <Sparkles className="w-8 h-8 text-muted-foreground/40 mx-auto mb-4" />
            <h3
              className="text-2xl font-normal text-foreground mb-2"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              More resources coming soon
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
              We're regularly uploading new verified study materials for this category. Check back shortly.
            </p>
          </div>
        ) : (
          /* Live Resource Cards */
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((r) => {
              const isSaved = savedTitles.includes(r.title);
              const tagLabel = r.exam_tag
                ? `${r.category.toUpperCase()} · ${r.exam_tag.toUpperCase()}`
                : r.category.toUpperCase();
              const isLink = r.file_type === 'link' || r.file_type === 'url';

              return (
                <div
                  key={r.id}
                  className="liquid-glass-card rounded-xl overflow-hidden flex flex-col justify-between hover:scale-[1.01] transition-transform duration-300 group relative border border-white/10 shadow-xl"
                >
                  <div>
                    {/* Thumbnail or Fallback Header */}
                    <div className="relative aspect-video w-full overflow-hidden bg-black/40 border-b border-white/5 flex items-center justify-center">
                      {r.thumbnail_url ? (
                        <img
                          src={r.thumbnail_url}
                          alt={r.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center liquid-glass">
                          {renderFallbackIcon(r.file_type)}
                        </div>
                      )}

                      {/* File type badge overlay top-left */}
                      {r.file_type && (
                        <span className="absolute top-3 left-3 liquid-glass rounded-md px-2 py-0.5 text-[10px] uppercase tracking-wider font-mono text-white/80 border border-white/10">
                          {r.file_type}
                        </span>
                      )}

                      {/* Bookmark Button top-right */}
                      <div className="absolute top-3 right-3 z-20">
                        <button
                          onClick={(e) => handleToggleBookmark(e, r)}
                          className="w-8 h-8 rounded-full liquid-glass flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors focus:outline-none border border-white/10"
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

                    {/* Card Content */}
                    <div className="p-6 flex flex-col">
                      <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-2">
                        {tagLabel}
                      </p>

                      <h3
                        className="text-xl text-foreground font-normal mb-2 leading-snug"
                        style={{ fontFamily: "'Instrument Serif', serif" }}
                      >
                        {r.title}
                      </h3>

                      {r.description && (
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                          {r.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card Footer Download / Open Action */}
                  <div className="p-6 pt-0 mt-4">
                    <a
                      href={r.file_url}
                      download={!isLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleDownloadClick(r.id)}
                      className="liquid-glass rounded-full px-5 py-2.5 text-xs text-foreground font-medium flex items-center justify-between hover:scale-[1.02] transition-transform border border-white/10 group-hover:border-white/20"
                    >
                      <span className="flex items-center gap-2">
                        {isLink ? (
                          <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                        ) : (
                          <Download className="w-3.5 h-3.5 text-muted-foreground" />
                        )}
                        <span>{isLink ? 'Open Link' : 'Download File'}</span>
                      </span>
                      {r.file_type && (
                        <span className="text-[10px] uppercase text-muted-foreground font-mono">
                          {r.file_type}
                        </span>
                      )}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
