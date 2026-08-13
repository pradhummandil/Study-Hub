import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Search, Sparkles, BookOpen, Layers, Film, History, Bookmark,
  ShieldCheck, Play, CheckCircle2, ChevronLeft, ChevronRight, X,
  Filter, ArrowUpDown, RefreshCw
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
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

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

  // Load paginated videos and static metadata
  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      setPage(1);

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

      setVideos(res.videos);
      setTotalCount(res.totalCount);
      setHasMore(res.hasMore);
      setPlaylists(pList);
      setChannels(cList);
      setShorts(sList);
      setLoading(false);
    }

    loadInitialData();
  }, [selectedExam, selectedSubject, selectedTopic, selectedType, debouncedSearch, selectedSort]);

  // Handle Load More pagination
  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;

    const res = await fetchVideosPaginated(nextPage, 24, {
      exam: selectedExam,
      subject: selectedSubject,
      topic: selectedTopic,
      type: selectedType,
      searchQuery: debouncedSearch,
      sort: selectedSort as any,
    });

    setVideos((prev) => [...prev, ...res.videos]);
    setPage(nextPage);
    setHasMore(res.hasMore);
    setLoadingMore(false);
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
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20">
      <Helmet>
        <title>Video Learning 2.0 | Study Hub Real Lectures & PYQs</title>
        <meta
          name="description"
          content="Learn from synchronized YouTube lectures, one-shots, PYQs and revision sessions organized around your exact exam."
        />
      </Helmet>

      {/* HERO SECTION WITH HOMEPAGE DESIGN SYSTEM */}
      <section className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white pt-14 pb-10 px-4 sm:px-6 lg:px-8 border-b border-slate-800 overflow-hidden">
        {/* Subtle radial cyan/blue glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 blur-[130px] pointer-events-none" />

        <div className="max-w-7xl mx-auto space-y-6 relative z-10">
          {/* Eyebrow & Headline */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 backdrop-blur-md">
                  <Sparkles className="w-3.5 h-3.5" /> Video Learning 2.0
                </span>
                {user ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Exam Focus: {selectedExam}
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                    All Verified Channels
                  </span>
                )}
              </div>

              {/* Serif Headline matching homepage */}
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-white tracking-tight leading-tight">
                Learn from the lessons <br className="hidden sm:inline" />
                <span className="italic text-cyan-300">that move you forward.</span>
              </h1>
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
                Real lectures, one-shots, PYQs, and revision sessions — synchronized from verified channels and structured for your exam.
              </p>
            </div>

            {/* Quick Action Navigation */}
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                to="/video-learning/shorts"
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
              >
                <Film className="w-4 h-4" /> Shorts Feed
              </Link>
              <Link
                to="/video-learning/history"
                className="px-4 py-2.5 rounded-2xl bg-slate-800/90 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-all"
              >
                <History className="w-4 h-4 text-cyan-400" /> Learning History
              </Link>
              <Link
                to="/video-learning/saved"
                className="px-4 py-2.5 rounded-2xl bg-slate-800/90 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-all"
              >
                <Bookmark className="w-4 h-4 text-rose-400" /> Saved Shelf
              </Link>
            </div>
          </div>

          {/* LARGE SEARCH BAR WITH FOCUS SUGGESTIONS */}
          <div className="relative max-w-4xl pt-2">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search lectures, topics, PYQs, channels... (e.g. TCP congestion control, DBMS, GATE 2027)"
                className="w-full bg-slate-950/90 border border-slate-700 hover:border-cyan-500/50 focus:border-cyan-400 rounded-2xl pl-12 pr-10 py-3.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Suggestions Box */}
            {searchFocused && !searchQuery && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-2xl z-40 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Popular Exam Topics</span>
                <div className="flex flex-wrap gap-2">
                  {['TCP Congestion Control', 'DBMS Normalization', 'JEE Organic Chemistry', 'NEET Genetics NCERT', 'Operating Systems One Shot'].map((term) => (
                    <button
                      key={term}
                      onClick={() => {
                        setSearchQuery(term);
                        setSearchFocused(false);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-colors"
                    >
                      🔍 {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* CONTROLS ROW: EXAM SELECTION & TYPE FILTER */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2 border-t border-slate-800/80">
            {/* Exam Selector Pills */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
              <span className="text-xs font-semibold text-slate-400 shrink-0">Exam:</span>
              {EXAM_OPTIONS.map((exam) => {
                const active = selectedExam === exam;
                return (
                  <button
                    key={exam}
                    onClick={() => setSelectedExam(exam)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      active
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60'
                    }`}
                  >
                    {exam}
                  </button>
                );
              })}
            </div>

            {/* Content Type Filter */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
              <span className="text-xs font-semibold text-slate-400 shrink-0">Type:</span>
              {TYPE_OPTIONS.map((t) => {
                const active = selectedType === t.value;
                return (
                  <button
                    key={t.value}
                    onClick={() => setSelectedType(t.value)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                      active
                        ? 'bg-cyan-400 text-slate-950 font-bold'
                        : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* MAIN FEED AREA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* ACTIVE FILTER CHIPS BAR */}
        {activeChips.length > 0 && (
          <div className="flex items-center justify-between gap-4 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Active Filters:
              </span>
              {activeChips.map((chip) => (
                <span
                  key={chip.key}
                  className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-800/50 text-xs font-medium flex items-center gap-1.5"
                >
                  {chip.label}
                  <button onClick={chip.clear} className="hover:text-rose-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <button
              onClick={clearAllFilters}
              className="text-xs font-bold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 underline"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* VERIFIED CHANNELS HORIZONTAL SHELF */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-cyan-400" /> Verified Channels
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Official lectures imported directly from YouTube channels</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {channels.map((chan) => (
              <div
                key={chan.id}
                onClick={() => navigate(`/video-learning/channel/${chan.id}`)}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/40 rounded-[20px] p-3 text-center cursor-pointer transition-all hover:-translate-y-0.5 shadow-sm group"
              >
                <img
                  src={chan.avatar_url}
                  alt={chan.channel_name}
                  className="w-11 h-11 rounded-full mx-auto mb-2 object-cover border border-blue-500/30 group-hover:scale-105 transition-transform"
                />
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-cyan-400">
                  {chan.channel_name}
                </h3>
                <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">{chan.subscriber_count || 'Verified'}</span>
              </div>
            ))}
          </div>
        </section>

        {/* PLAYLISTS HORIZONTAL SHELF WITH SMOOTH ARROW NAVIGATION */}
        {playlists.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-600 dark:text-cyan-400" /> Structured Course Playlists
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Follow complete multi-lesson paths for {selectedExam}</p>
              </div>

              {/* Scroll Arrows */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => scrollShelf('left')}
                  aria-label="Scroll left"
                  className="p-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => scrollShelf('right')}
                  aria-label="Scroll right"
                  className="p-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div
              ref={playlistShelfRef}
              className="flex items-stretch gap-5 overflow-x-auto scrollbar-none pb-2 scroll-smooth"
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
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600 dark:text-cyan-400" /> Recommended Lectures & PYQs
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {totalCount} total synchronized videos found
              </p>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Sort:</span>
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 font-semibold focus:outline-none focus:border-blue-500"
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
                <div key={n} className="h-64 rounded-[20px] bg-slate-200 dark:bg-slate-800/50 animate-pulse" />
              ))}
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900/60 rounded-[24px] border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
              <BookOpen className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-600" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Nothing matched this search</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  No synchronized videos match your current combination of filters.
                </p>
              </div>
              <button
                onClick={clearAllFilters}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-colors"
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
                className="px-8 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/40 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all shadow-md hover:shadow-lg flex items-center gap-2 mx-auto"
              >
                {loadingMore ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-500" /> Loading more...
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
          <section className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 text-white rounded-[24px] p-6 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Film className="w-5 h-5 text-cyan-400" /> Quick Ideas & Fast Revision Shorts
                </h2>
                <p className="text-xs text-slate-400">High-yield 60-second concepts and shortcuts</p>
              </div>

              <Link
                to="/video-learning/shorts"
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                Open Shorts Viewer <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {shorts.slice(0, 3).map((short) => (
                <div
                  key={short.id}
                  onClick={() => navigate('/video-learning/shorts')}
                  className="bg-slate-950 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-4 cursor-pointer transition-all hover:scale-[1.02] flex items-center gap-3"
                >
                  <div className="w-12 h-16 rounded-xl overflow-hidden bg-slate-900 shrink-0 relative">
                    <img src={short.thumbnail} alt={short.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Play className="w-4 h-4 text-cyan-400 fill-current ml-0.5" />
                    </div>
                  </div>
                  <div className="space-y-1 overflow-hidden">
                    <span className="text-[10px] font-bold uppercase text-cyan-400">{short.subject}</span>
                    <h3 className="text-xs font-semibold text-slate-200 line-clamp-2">{short.title}</h3>
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
