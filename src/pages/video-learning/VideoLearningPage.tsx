import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Search, Sparkles, BookOpen, Layers, Film, History, Bookmark,
  ShieldCheck, Play, CheckCircle2, ChevronLeft, ChevronRight, X,
  Filter, ArrowUpDown, RefreshCw, AlertTriangle
} from 'lucide-react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useStudentContext } from '../../context/StudentContext';
import { useAuth } from '../../context/AuthContext';
import type { YouTubeVideo, YouTubePlaylist, YouTubeChannel, VideoContentType } from '../../types/video-learning';
import {
  fetchVideosPaginated,
  fetchPlaylists,
  fetchChannels,
  fetchShorts,
} from '../../lib/videoLearningApi';
import { VideoCard } from '../../components/video-learning/VideoCard';
import { PlaylistCard } from '../../components/video-learning/PlaylistCard';
import { SpatialHero3D } from '../../components/3d/SpatialHero3D';

const EXAM_OPTIONS = ['All Exams', 'GATE', 'JEE Main', 'JEE Advanced', 'NEET'];

const TYPE_OPTIONS: { label: string; value: VideoContentType | 'ALL' }[] = [
  { label: 'All Lessons', value: 'ALL' },
  { label: 'One Shots', value: 'ONE_SHOT' },
  { label: 'PYQs', value: 'PYQ' },
  { label: 'Lectures', value: 'LECTURE' },
  { label: 'Revision', value: 'REVISION' },
  { label: 'Crash Courses', value: 'CRASH_COURSE' },
  { label: 'Strategy', value: 'STRATEGY' },
];

const SORT_OPTIONS = [
  { label: 'Recommended', value: 'recommended' },
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'Longest Duration', value: 'longest' },
  { label: 'Shortest Duration', value: 'shortest' },
];

export default function VideoLearningPage() {
  const { user } = useAuth();
  const studentContext = useStudentContext();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active student context default exam
  const defaultExam = user && studentContext.targetExam ? studentContext.targetExam : 'GATE';

  // Read URL search params
  const paramExam = searchParams.get('exam') || (user ? defaultExam : 'All Exams');
  const paramSubject = searchParams.get('subject') || 'All Subjects';
  const paramTopic = searchParams.get('topic') || 'All Topics';
  const paramType = (searchParams.get('type') as VideoContentType | 'ALL') || 'ALL';
  const paramSearch = searchParams.get('q') || '';
  const paramSort = (searchParams.get('sort') as any) || 'recommended';

  // Filter States
  const [selectedExam, setSelectedExam] = useState<string>(paramExam);
  const [selectedSubject, setSelectedSubject] = useState<string>(paramSubject);
  const [selectedTopic, setSelectedTopic] = useState<string>(paramTopic);
  const [selectedType, setSelectedType] = useState<VideoContentType | 'ALL'>(paramType);
  const [searchQuery, setSearchQuery] = useState<string>(paramSearch);
  const [debouncedSearch, setDebouncedSearch] = useState<string>(paramSearch);
  const [selectedSort, setSelectedSort] = useState<string>(paramSort);

  // Search input focus & suggestions dropdown
  const [searchFocused, setSearchFocused] = useState(false);

  // Pagination states
  const [page, setPage] = useState(1);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // Catalog data
  const [playlists, setPlaylists] = useState<YouTubePlaylist[]>([]);
  const [channels, setChannels] = useState<YouTubeChannel[]>([]);
  const [shorts, setShorts] = useState<YouTubeVideo[]>([]);
  
  // Loading & error safety states
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);

  // Playlist shelf scroll refs
  const playlistShelfRef = useRef<HTMLDivElement>(null);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Sync state to URL search parameters
  useEffect(() => {
    const params: Record<string, string> = {};
    if (selectedExam !== 'All Exams') params.exam = selectedExam;
    if (selectedSubject !== 'All Subjects') params.subject = selectedSubject;
    if (selectedTopic !== 'All Topics') params.topic = selectedTopic;
    if (selectedType !== 'ALL') params.type = selectedType;
    if (debouncedSearch) params.q = debouncedSearch;
    if (selectedSort !== 'recommended') params.sort = selectedSort;

    setSearchParams(params, { replace: true });
  }, [selectedExam, selectedSubject, selectedTopic, selectedType, debouncedSearch, selectedSort, setSearchParams]);

  // BOUNDED LOAD DATA ENGINE (FINALLY CLAUSE PREVENTS INFINITE SPINNER)
  const loadInitialData = async () => {
    setLoading(true);
    setErrorState(null);
    setPage(1);

    // Timeout safety fallback of 4500ms
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('Video learning initial load timed out — switching to safe view state.');
        setLoading(false);
      }
    }, 4500);

    try {
      const [res, pList, cList, sList] = await Promise.all([
        fetchVideosPaginated(1, 24, {
          exam: selectedExam,
          subject: selectedSubject,
          topic: selectedTopic,
          type: selectedType,
          searchQuery: debouncedSearch,
          sort: selectedSort as any,
        }),
        fetchPlaylists(selectedExam),
        fetchChannels(),
        fetchShorts(selectedExam),
      ]);

      setVideos(res.videos || []);
      setTotalCount(res.totalCount || (res.videos ? res.videos.length : 0));
      setHasMore(res.hasMore || false);
      setPlaylists(pList || []);
      setChannels(cList || []);
      setShorts(sList || []);
    } catch (err: any) {
      console.error('Error loading video learning data:', err);
      setErrorState('Videos are taking longer than usual to load. Please try again.');
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [selectedExam, selectedSubject, selectedTopic, selectedType, debouncedSearch, selectedSort]);

  // Handle Load More pagination
  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;

    try {
      const res = await fetchVideosPaginated(nextPage, 24, {
        exam: selectedExam,
        subject: selectedSubject,
        topic: selectedTopic,
        type: selectedType,
        searchQuery: debouncedSearch,
        sort: selectedSort as any,
      });

      setVideos((prev) => [...prev, ...(res.videos || [])]);
      setPage(nextPage);
      setHasMore(res.hasMore);
    } catch (err) {
      console.error('Failed to load more videos:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Scroll horizontal shelf
  const scrollShelf = (direction: 'left' | 'right') => {
    if (playlistShelfRef.current) {
      const scrollAmount = playlistShelfRef.current.clientWidth * 0.8;
      playlistShelfRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Active filter chips list
  const activeChips = [];
  if (selectedExam !== 'All Exams') activeChips.push({ key: 'exam', label: selectedExam, clear: () => setSelectedExam('All Exams') });
  if (selectedSubject !== 'All Subjects') activeChips.push({ key: 'subject', label: selectedSubject, clear: () => setSelectedSubject('All Subjects') });
  if (selectedTopic !== 'All Topics') activeChips.push({ key: 'topic', label: selectedTopic, clear: () => setSelectedTopic('All Topics') });
  if (selectedType !== 'ALL') activeChips.push({ key: 'type', label: selectedType.replace('_', ' '), clear: () => setSelectedType('ALL') });
  if (debouncedSearch) activeChips.push({ key: 'q', label: `"${debouncedSearch}"`, clear: () => setSearchQuery('') });

  const clearAllFilters = () => {
    setSelectedExam('All Exams');
    setSelectedSubject('All Subjects');
    setSelectedTopic('All Topics');
    setSelectedType('ALL');
    setSearchQuery('');
    setSelectedSort('recommended');
  };

  return (
    <div className="min-h-screen bg-paper text-ink pb-20 selection:bg-terracotta/20 selection:text-ink">
      <Helmet>
        <title>Video Learning 3.0 | Study Hub Real Lectures & PYQs</title>
        <meta
          name="description"
          content="Learn from synchronized YouTube lectures, one-shots, PYQs and revision sessions in your 3D spatial study space."
        />
      </Helmet>

      {/* HERO SECTION WITH 3D SPATIAL CANVAS & FOREST IDENTITY */}
      <section className="relative bg-forest text-paper pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-forest/20 overflow-hidden">
        {/* Subtle radial background glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-terracotta/15 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-scholar/30 blur-[130px] pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left Column: Headline & Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gold/20 text-gold border border-gold/30 flex items-center gap-1.5 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5" /> Video Learning 3.0
              </span>
              {user ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-scholar/40 text-paper border border-sage/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-gold" /> Exam Focus: {selectedExam}
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-scholar/30 text-sage border border-sage/20">
                  Verified Academic Sources
                </span>
              )}
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-paper tracking-tight leading-tight">
              Learn from the lessons <br className="hidden sm:inline" />
              <span className="italic text-gold">that move you forward.</span>
            </h1>

            <p className="text-base sm:text-lg text-sage leading-relaxed max-w-xl">
              Real lectures, one-shots, PYQs, and revision sessions — synchronized from verified channels and structured for your target exam.
            </p>

            {/* Quick Action Navigation */}
            <div className="flex items-center gap-3 flex-wrap pt-2">
              <Link
                to="/video-learning/shorts"
                className="px-5 py-3 rounded-xl bg-terracotta hover:bg-terracotta/90 text-paper font-bold text-xs flex items-center gap-2 shadow-card transition-all"
              >
                <Film className="w-4 h-4" /> Shorts Feed
              </Link>
              <Link
                to="/video-learning/history"
                className="px-4 py-3 rounded-xl bg-scholar/40 hover:bg-scholar/60 text-paper border border-sage/30 text-xs font-semibold flex items-center gap-2 transition-all"
              >
                <History className="w-4 h-4 text-gold" /> Learning History
              </Link>
              <Link
                to="/video-learning/saved"
                className="px-4 py-3 rounded-xl bg-scholar/40 hover:bg-scholar/60 text-paper border border-sage/30 text-xs font-semibold flex items-center gap-2 transition-all"
              >
                <Bookmark className="w-4 h-4 text-terracotta" /> Saved Shelf
              </Link>
            </div>

            {/* SEARCH BAR */}
            <div className="relative max-w-2xl pt-2">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sage" />
                <input
                  type="text"
                  value={searchQuery}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search lectures, topics, PYQs, channels... (e.g. DBMS, GATE 2027)"
                  className="w-full bg-forest/80 border border-sage/30 hover:border-gold/50 focus:border-gold rounded-xl pl-12 pr-10 py-3.5 text-sm text-paper placeholder-sage focus:outline-none focus:ring-4 focus:ring-gold/10 transition-all shadow-inner"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-sage hover:text-paper"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Quick Suggestions Box */}
              {searchFocused && !searchQuery && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-forest border border-sage/30 rounded-xl p-4 shadow-2xl z-40 space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gold block">Popular Exam Topics</span>
                  <div className="flex flex-wrap gap-2">
                    {['TCP Congestion Control', 'DBMS Normalization', 'JEE Organic Chemistry', 'NEET Genetics NCERT', 'Operating Systems One Shot'].map((term) => (
                      <button
                        key={term}
                        onClick={() => {
                          setSearchQuery(term);
                          setSearchFocused(false);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-scholar/50 hover:bg-scholar text-xs text-paper transition-colors"
                      >
                        🔍 {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: 3D Spatial Canvas (5 cols) */}
          <div className="lg:col-span-5 hidden lg:block">
            <SpatialHero3D />
          </div>
        </div>

        {/* CONTROLS ROW: EXAM SELECTION & TYPE FILTER */}
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-6 mt-6 border-t border-sage/20 relative z-10">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <span className="text-xs font-semibold text-sage shrink-0">Exam:</span>
            {EXAM_OPTIONS.map((exam) => {
              const active = selectedExam === exam;
              return (
                <button
                  key={exam}
                  onClick={() => setSelectedExam(exam)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    active
                      ? 'bg-scholar text-paper shadow-md border border-sage/40'
                      : 'bg-forest/60 text-sage hover:text-paper border border-sage/20'
                  }`}
                >
                  {exam}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-xs font-semibold text-sage shrink-0">Type:</span>
            {TYPE_OPTIONS.map((t) => {
              const active = selectedType === t.value;
              return (
                <button
                  key={t.value}
                  onClick={() => setSelectedType(t.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    active
                      ? 'bg-gold text-forest font-bold'
                      : 'bg-forest/60 text-sage hover:text-paper'
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* MAIN FEED AREA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* ERROR STATE BANNER WITH RETRY BUTTON */}
        {errorState && (
          <div className="p-6 rounded-2xl bg-error/10 border border-error/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-error">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <div>
                <h3 className="text-sm font-bold">Network Connection Notice</h3>
                <p className="text-xs">{errorState}</p>
              </div>
            </div>
            <button
              onClick={loadInitialData}
              className="px-5 py-2.5 rounded-xl bg-error text-paper text-xs font-bold shadow-sm hover:opacity-90 transition-opacity flex items-center gap-2 shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry Request
            </button>
          </div>
        )}

        {/* ACTIVE FILTER CHIPS BAR */}
        {activeChips.length > 0 && (
          <div className="flex items-center justify-between gap-4 bg-parchment/60 p-3.5 rounded-xl border border-forest/10 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-muted uppercase tracking-wider flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Active Filters:
              </span>
              {activeChips.map((chip) => (
                <span
                  key={chip.key}
                  className="px-3 py-1 rounded-full bg-paper text-scholar border border-forest/10 text-xs font-medium flex items-center gap-1.5 shadow-sm"
                >
                  {chip.label}
                  <button onClick={chip.clear} className="hover:text-terracotta">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <button
              onClick={clearAllFilters}
              className="text-xs font-bold text-terracotta hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* VERIFIED CHANNELS HORIZONTAL SHELF */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-serif font-bold text-ink flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-scholar" /> Verified Channels
              </h2>
              <p className="text-xs text-muted">Official lectures imported directly from verified academic channels</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {channels.map((chan) => (
              <div
                key={chan.id}
                onClick={() => navigate(`/video-learning/channel/${chan.id}`)}
                className="bg-parchment/40 border border-forest/10 hover:border-scholar/40 rounded-2xl p-3 text-center cursor-pointer transition-all hover:-translate-y-0.5 shadow-sm group"
              >
                <img
                  src={chan.avatar_url}
                  alt={chan.channel_name}
                  className="w-11 h-11 rounded-full mx-auto mb-2 object-cover border border-scholar/30 group-hover:scale-105 transition-transform"
                />
                <h3 className="text-xs font-bold text-ink truncate group-hover:text-scholar">
                  {chan.channel_name}
                </h3>
                <span className="text-[10px] text-muted block mt-0.5 font-medium">{chan.subscriber_count || 'Verified'}</span>
              </div>
            ))}
          </div>
        </section>

        {/* PLAYLISTS HORIZONTAL SHELF */}
        {playlists.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-serif font-bold text-ink flex items-center gap-2">
                  <Layers className="w-5 h-5 text-scholar" /> Structured Course Playlists
                </h2>
                <p className="text-xs text-muted">Follow complete multi-lesson paths for {selectedExam}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => scrollShelf('left')}
                  aria-label="Scroll left"
                  className="p-2 rounded-full bg-paper border border-forest/10 text-ink hover:bg-parchment transition-colors shadow-sm"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => scrollShelf('right')}
                  aria-label="Scroll right"
                  className="p-2 rounded-full bg-paper border border-forest/10 text-ink hover:bg-parchment transition-colors shadow-sm"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div
              ref={playlistShelfRef}
              className="flex items-stretch gap-5 overflow-x-auto no-scrollbar pb-2 scroll-smooth"
            >
              {playlists.map((pl) => (
                <div key={pl.id} className="min-w-[280px] sm:min-w-[320px] max-w-[340px]">
                  <PlaylistCard
                    playlist={pl}
                    onOpen={(p) => navigate(`/video-learning/playlist/${p.id}`)}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* MAIN PAGINATED VIDEOS GRID */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-serif font-bold text-ink flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-scholar" /> Recommended Lectures & PYQs
              </h2>
              <p className="text-xs text-muted">
                {totalCount} total synchronized videos found
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-muted" />
              <span className="text-xs font-semibold text-muted">Sort:</span>
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="bg-paper border border-forest/10 rounded-xl px-3 py-1.5 text-xs text-ink font-semibold focus:outline-none focus:border-scholar"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-8">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div key={n} className="h-64 rounded-2xl bg-parchment/60 animate-pulse border border-forest/5" />
              ))}
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-16 bg-parchment/40 rounded-3xl border border-forest/10 space-y-4 shadow-sm">
              <BookOpen className="w-12 h-12 mx-auto text-muted" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-ink">Nothing matched this search</h3>
                <p className="text-xs text-muted max-w-md mx-auto">
                  No synchronized videos match your current combination of filters.
                </p>
              </div>
              <button
                onClick={clearAllFilters}
                className="px-5 py-2.5 rounded-xl bg-scholar text-paper font-bold text-xs shadow-card transition-colors"
              >
                Explore All Videos
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {videos.map((vid) => (
                <VideoCard
                  key={vid.id}
                  video={vid}
                  onSelect={(v) => navigate(`/video-learning/video/${v.youtube_video_id}`)}
                />
              ))}
            </div>
          )}

          {/* LOAD MORE BUTTON */}
          {hasMore && !loading && (
            <div className="text-center pt-6">
              <button
                disabled={loadingMore}
                onClick={handleLoadMore}
                className="px-8 py-3 rounded-xl bg-paper border border-forest/15 hover:border-scholar/40 text-ink font-bold text-xs transition-all shadow-card hover:shadow-float flex items-center gap-2 mx-auto"
              >
                {loadingMore ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-scholar" /> Loading more...
                  </>
                ) : (
                  <>Load More Videos ({videos.length} of {totalCount})</>
                )}
              </button>
            </div>
          )}
        </section>

        {/* SHORTS HIGHLIGHT RAIL */}
        {shorts.length > 0 && (
          <section className="bg-forest text-paper rounded-3xl p-6 lg:p-8 border border-forest/20 space-y-4 shadow-deep">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-serif font-bold text-paper flex items-center gap-2">
                  <Film className="w-5 h-5 text-gold" /> Quick Concepts & High-Yield Shorts
                </h2>
                <p className="text-xs text-sage">Fast 60-second formulas and shortcuts</p>
              </div>

              <Link
                to="/video-learning/shorts"
                className="text-xs font-bold text-gold hover:underline flex items-center gap-1"
              >
                Open Shorts Feed <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {shorts.slice(0, 3).map((short) => (
                <div
                  key={short.id}
                  onClick={() => navigate('/video-learning/shorts')}
                  className="bg-scholar/30 border border-sage/20 hover:border-gold/40 rounded-2xl p-4 cursor-pointer transition-all hover:scale-[1.02] flex items-center gap-3 backdrop-blur-md"
                >
                  <div className="w-12 h-16 rounded-xl overflow-hidden bg-forest shrink-0 relative">
                    <img src={short.thumbnail} alt={short.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Play className="w-4 h-4 text-gold fill-current ml-0.5" />
                    </div>
                  </div>
                  <div className="space-y-1 overflow-hidden">
                    <span className="text-[10px] font-bold uppercase text-gold">{short.subject}</span>
                    <h3 className="text-xs font-semibold text-paper line-clamp-2">{short.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
