import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Search, Sparkles, BookOpen, Layers, Film, History, Bookmark,
  CheckCircle2, ChevronLeft, ChevronRight, X,
  Filter, ArrowUpDown, RefreshCw, AlertTriangle, LayoutDashboard,
  Play
} from 'lucide-react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useStudentContext } from '../../context/StudentContext';
import { useAuth } from '../../context/AuthContext';
import type { YouTubeVideo, YouTubePlaylist, VideoContentType } from '../../types/video-learning';
import {
  fetchVideosPaginated,
  fetchPlaylists,
  fetchShorts,
  fetchVideosByChannel,
  getLocalWatchHistory,
  formatTime,
} from '../../lib/videoLearningApi';
import { motion } from 'framer-motion';
import { VideoCard } from '../../components/video-learning/VideoCard';
import { PlaylistCard } from '../../components/video-learning/PlaylistCard';
import { ChannelShelf } from '../../components/video-learning/ChannelShelf';
import { LottiePlayer } from '../../components/ui/motion/LottiePlayer';
import { VideoLearningErrorBoundary } from '../../components/video-learning/VideoLearningErrorBoundary';

const EXAM_OPTIONS = ['All Exams', 'GATE', 'JEE Main', 'JEE Advanced', 'NEET', 'CUET', 'UPSC', 'Other'];

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
  { label: 'Relevant', value: 'recommended' },
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'Longest Duration', value: 'longest' },
  { label: 'Shortest Duration', value: 'shortest' },
];

function VideoLearningPageContent() {
  const { user } = useAuth();
  const studentContext = useStudentContext();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Active student context target exam & subject
  const targetExam = user && studentContext?.targetExam ? studentContext.targetExam : null;
  const targetSubject = user && studentContext?.subjects && studentContext.subjects.length > 0 ? studentContext.subjects[0] : null;

  // Read URL search params
  const paramExam = searchParams.get('exam') || (targetExam || 'All Exams');
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
  const [shorts, setShorts] = useState<YouTubeVideo[]>([]);
  const [channelVideosMap, setChannelVideosMap] = useState<Record<string, YouTubeVideo[]>>({});
  const [watchHistory, setWatchHistory] = useState<any[]>([]);

  // Horizontal shelf scroll refs
  const playlistShelfRef = useRef<HTMLDivElement>(null);
  const continueShelfRef = useRef<HTMLDivElement>(null);
  const [canScrollPlLeft, setCanScrollPlLeft] = useState(false);
  const [canScrollPlRight, setCanScrollPlRight] = useState(true);

  // Loading & error safety states
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [errorState, setErrorState] = useState<boolean>(false);

  // Keyboard shortcut '/' to auto focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Sync state to URL search parameters (Section 10)
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

  // Playlist shelf scroll checker
  const checkPlaylistScroll = () => {
    if (playlistShelfRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = playlistShelfRef.current;
      setCanScrollPlLeft(scrollLeft > 5);
      setCanScrollPlRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    checkPlaylistScroll();
    const currentRef = playlistShelfRef.current;
    if (currentRef) {
      currentRef.addEventListener('scroll', checkPlaylistScroll, { passive: true });
      window.addEventListener('resize', checkPlaylistScroll);
    }
    return () => {
      if (currentRef) currentRef.removeEventListener('scroll', checkPlaylistScroll);
      window.removeEventListener('resize', checkPlaylistScroll);
    };
  }, [playlists]);

  // LOAD INITIAL DATA ENGINE (Bounded 4.5s max timeout)
  const loadInitialData = async () => {
    setLoading(true);
    setErrorState(false);
    setPage(1);

    // Load watch history
    const historyList = getLocalWatchHistory();
    setWatchHistory(historyList);

    let isTimedOut = false;
    const timeoutId = setTimeout(() => {
      isTimedOut = true;
      console.warn('Video learning initial load timed out after 4.5s');
      setErrorState(true);
      setLoading(false);
    }, 4500);

    try {
      const [res, pList, sList] = await Promise.all([
        fetchVideosPaginated(1, 24, {
          exam: selectedExam,
          subject: selectedSubject,
          topic: selectedTopic,
          type: selectedType,
          searchQuery: debouncedSearch,
          sort: selectedSort as any,
        }),
        fetchPlaylists(selectedExam).catch(() => []),
        fetchShorts(selectedExam).catch(() => []),
      ]);

      if (!isTimedOut) {
        setVideos(res.videos || []);
        setTotalCount(res.totalCount || (res.videos ? res.videos.length : 0));
        setHasMore(res.hasMore || false);
        setPlaylists(pList || []);
        setShorts(sList || []);

        // Load channel-specific shelves for each of the 6 verified channels
        const channelsToFetch = [
          'JEE Wallah',
          'PW NEET',
          'Physics Wallah - Alakh Pandey',
          'GATE Wallah CSE & DA',
          'GATE Wallah ECE, EE, IN',
          'GATE Wallah - ME, CE, XE, CH, PI & ES',
        ];

        const mapResults: Record<string, YouTubeVideo[]> = {};
        await Promise.all(
          channelsToFetch.map(async (name) => {
            const chanVids = await fetchVideosByChannel(name, 10);
            if (chanVids.length > 0) {
              mapResults[name] = chanVids;
            }
          })
        );
        setChannelVideosMap(mapResults);
        setErrorState(false);
      }
    } catch (err: any) {
      console.error('Error loading video learning data:', err);
      if (!isTimedOut) {
        setErrorState(true);
      }
    } finally {
      clearTimeout(timeoutId);
      if (!isTimedOut) {
        setLoading(false);
      }
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

  // Scroll horizontal shelf helper
  const scrollPlaylistShelf = (direction: 'left' | 'right') => {
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
    <div className="min-h-screen bg-[#F8F6F0] text-[#1C201D] pb-20 selection:bg-[#C86D51]/20 selection:text-[#1C201D]">
      <Helmet>
        <title>Video Learning 2.0 | Study Hub Real Lectures & PYQs</title>
        <meta
          name="description"
          content="Learn from synchronized YouTube lectures, one-shots, PYQs and revision sessions in your 3D spatial study space."
        />
      </Helmet>

      {/* SECTION 3: PERSONALIZED HERO SECTION */}
      <section className="relative bg-[#F8F6F0] text-[#1C201D] pt-10 pb-12 px-4 sm:px-6 lg:px-8 border-b border-[#1C201D]/10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#C86D51]/10 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#2D5A3F]/10 blur-[130px] pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left Column: Headline & Contextual Badge (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#2D5A3F]/10 text-[#2D5A3F] border border-[#2D5A3F]/20 flex items-center gap-1.5 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-[#C86D51]" /> Video Learning 2.0
              </span>
              {user && targetExam ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-[#EDE8DB] text-[#1C201D] border border-[#1C201D]/10 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2D5A3F]" /> Recommended for {targetExam}
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-[#EDE8DB] text-[#6C706D] border border-[#1C201D]/10">
                  Explore lessons for your next exam
                </span>
              )}
            </div>

            {/* MANDATED PERSONALIZED HERO HEADLINE */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-[#1C201D] tracking-tight leading-tight">
              Learn from the lessons <br className="hidden sm:inline" />
              <span className="italic text-[#C86D51]">that move you forward.</span>
            </h1>

            {/* MANDATED CONTEXTUAL LINE */}
            <p className="text-base sm:text-lg text-[#6C706D] leading-relaxed max-w-xl">
              {user && targetExam ? (
                <>
                  Recommended for <strong className="text-[#1C201D]">{targetExam}</strong>
                  {targetSubject && (
                    <> · Focused on <strong className="text-[#2D5A3F]">{targetSubject}</strong></>
                  )}. Verified lectures, PYQs, and revision paths structured for your target score.
                </>
              ) : (
                'Real lectures, one-shots, PYQs, and revision sessions — synchronized from verified academic channels.'
              )}
            </p>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-3 flex-wrap pt-2">
              <Link
                to="/video-learning/shorts"
                className="px-5 py-3 rounded-xl bg-[#C86D51] hover:bg-[#C86D51]/90 text-[#FFFFFF] font-bold text-xs flex items-center gap-2 shadow-md transition-all"
              >
                <Film className="w-4 h-4" /> Shorts Feed
              </Link>
              <Link
                to="/video-learning/history"
                className="px-4 py-3 rounded-xl bg-[#EDE8DB] hover:bg-[#EDE8DB]/80 text-[#1C201D] border border-[#1C201D]/10 text-xs font-semibold flex items-center gap-2 transition-all"
              >
                <History className="w-4 h-4 text-[#2D5A3F]" /> Learning History
              </Link>
              <Link
                to="/video-learning/saved"
                className="px-4 py-3 rounded-xl bg-[#EDE8DB] hover:bg-[#EDE8DB]/80 text-[#1C201D] border border-[#1C201D]/10 text-xs font-semibold flex items-center gap-2 transition-all"
              >
                <Bookmark className="w-4 h-4 text-[#C86D51]" /> Saved Shelf
              </Link>
            </div>
          </div>

          {/* Right Column: Premium Lottie Vector Animation (5 cols) */}
          <div className="lg:col-span-5 hidden lg:flex items-center justify-center relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#2D5A3F]/15 via-[#D4AF37]/10 to-[#C86D51]/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative w-full max-w-[440px] h-[360px] sm:h-[400px] flex items-center justify-center">
              <LottiePlayer
                src="/assets/lottie-v2/study/analytics.svg"
                className="w-full h-full object-contain relative z-10 drop-shadow-[0_12px_28px_rgba(200,109,81,0.15)]"
                loop={true}
                autoplay={true}
              />

              {/* Contextual Floating Badge 1 */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-2 right-2 z-20 px-3.5 py-1.5 rounded-full bg-[#FFFFFF]/90 backdrop-blur-md border border-[#1C201D]/10 text-xs font-mono font-bold text-[#2D5A3F] shadow-sm flex items-center gap-1.5"
              >
                <span className="w-2 h-2 rounded-full bg-[#2D5A3F] animate-pulse" />
                <span>500+ Verified Lessons</span>
              </motion.div>

              {/* Contextual Floating Badge 2 */}
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute bottom-2 left-2 z-20 px-3.5 py-1.5 rounded-full bg-[#FFFFFF]/90 backdrop-blur-md border border-[#1C201D]/10 text-xs font-mono font-bold text-[#C86D51] shadow-sm flex items-center gap-1.5"
              >
                <Film className="w-3.5 h-3.5 text-[#C86D51]" />
                <span>Live PYQ Drills & One-Shots</span>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* SEARCH BAR & FILTERS SECTION */}
      <section className="bg-[#EDE8DB]/50 border-b border-[#1C201D]/10 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* SEARCH INPUT BAR WITH KEYBOARD SHORTCUT '/' & RESULT COUNT */}
          <div className="relative max-w-3xl">
            <div className="relative flex items-center">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6C706D]" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search lectures, topics, PYQs... (Press '/' to search)"
                className="w-full bg-[#FFFFFF] border border-[#1C201D]/14 hover:border-[#2D5A3F]/50 focus:border-[#2D5A3F] rounded-xl pl-12 pr-24 py-3.5 text-sm text-[#1C201D] placeholder-[#6C706D] focus:outline-none focus:ring-4 focus:ring-[#2D5A3F]/15 transition-all shadow-sm"
              />

              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1 text-[#6C706D] hover:text-[#1C201D]"
                    title="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <kbd className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-mono text-[#6C706D] bg-[#EDE8DB] border border-[#1C201D]/10 rounded shadow-inner">
                    /
                  </kbd>
                )}
                {!loading && (
                  <span className="text-xs font-bold text-[#2D5A3F] bg-[#2D5A3F]/10 px-2.5 py-1 rounded-md">
                    {totalCount} results
                  </span>
                )}
              </div>
            </div>

            {/* Suggestions Dropdown */}
            {searchFocused && !searchQuery && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-[#FFFFFF] border border-[#1C201D]/10 rounded-xl p-4 shadow-xl z-40 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#C86D51] block">Popular Exam Topics</span>
                <div className="flex flex-wrap gap-2">
                  {['TCP Congestion Control', 'DBMS Normalization', 'JEE Organic Chemistry', 'NEET Genetics NCERT', 'Operating Systems One Shot'].map((term) => (
                    <button
                      key={term}
                      onClick={() => {
                        setSearchQuery(term);
                        setSearchFocused(false);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#EDE8DB] hover:bg-[#2D5A3F] hover:text-[#FFFFFF] text-xs text-[#1C201D] transition-colors"
                    >
                      🔍 {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* COMPOSABLE FILTER BUTTONS */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2">
            {/* Exam Filter Options */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              <span className="text-xs font-bold text-[#6C706D] shrink-0 uppercase tracking-wider">Exam:</span>
              {EXAM_OPTIONS.map((exam) => {
                const active = selectedExam === exam;
                return (
                  <button
                    key={exam}
                    onClick={() => setSelectedExam(exam)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      active
                        ? 'bg-[#2D5A3F] text-[#FFFFFF] shadow-sm'
                        : 'bg-[#EDE8DB] text-[#6C706D] hover:text-[#1C201D] border border-[#1C201D]/10'
                    }`}
                  >
                    {exam}
                  </button>
                );
              })}
            </div>

            {/* Type Options */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-xs font-bold text-[#6C706D] shrink-0 uppercase tracking-wider">Type:</span>
              {TYPE_OPTIONS.map((t) => {
                const active = selectedType === t.value;
                return (
                  <button
                    key={t.value}
                    onClick={() => setSelectedType(t.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                      active
                        ? 'bg-[#2D5A3F] text-[#FFFFFF] font-bold shadow-sm'
                        : 'bg-[#EDE8DB] text-[#6C706D] hover:text-[#1C201D] border border-[#1C201D]/10'
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

      {/* MAIN FEED AREA (STRICT VISUAL HIERARCHY) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* BRANDED ERROR STATE CARD */}
        {errorState && (
          <div className="p-8 rounded-3xl bg-[#FFFFFF] border border-[#1C201D]/10 shadow-md text-center max-w-lg mx-auto space-y-5">
            <div className="w-14 h-14 rounded-full bg-[#C86D51]/10 text-[#C86D51] flex items-center justify-center mx-auto border border-[#C86D51]/20">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h3 className="font-serif text-2xl font-bold text-[#1C201D]">
                We couldn't load Video Learning.
              </h3>
              <p className="text-sm text-[#6C706D] leading-relaxed">
                Your saved lesson library is temporarily unavailable.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={loadInitialData}
                className="px-6 py-2.5 rounded-xl bg-[#2D5A3F] text-[#FFFFFF] text-xs font-bold shadow-sm hover:bg-[#2D5A3F]/90 transition-opacity flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Try again
              </button>
              <a
                href="/studio"
                className="px-6 py-2.5 rounded-xl bg-[#EDE8DB] text-[#1C201D] text-xs font-bold border border-[#1C201D]/10 hover:bg-[#EDE8DB]/80 transition-colors flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4 text-[#2D5A3F]" /> Go to Studio
              </a>
            </div>
          </div>
        )}

        {/* ACTIVE FILTER CHIPS BAR */}
        {activeChips.length > 0 && (
          <div className="flex items-center justify-between gap-4 bg-[#EDE8DB]/60 p-3.5 rounded-xl border border-[#1C201D]/10 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-[#6C706D] uppercase tracking-wider flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Active Filters:
              </span>
              {activeChips.map((chip) => (
                <span
                  key={chip.key}
                  className="px-3 py-1 rounded-full bg-[#FFFFFF] text-[#2D5A3F] border border-[#1C201D]/10 text-xs font-medium flex items-center gap-1.5 shadow-sm"
                >
                  {chip.label}
                  <button onClick={chip.clear} className="hover:text-[#C86D51]">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <button
              onClick={clearAllFilters}
              className="text-xs font-bold text-[#C86D51] hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* SECTION 4: CONTINUE LEARNING (OR START WITH THESE LESSONS) */}
        {!errorState && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-serif font-bold text-[#1C201D] flex items-center gap-2">
                  <History className="w-5 h-5 text-[#2D5A3F]" />
                  {watchHistory.length > 0 ? 'Continue Learning' : 'Start With These Lessons'}
                </h2>
                <p className="text-xs text-[#6C706D]">
                  {watchHistory.length > 0
                    ? 'Resume your active study sessions'
                    : 'Hand-picked top lectures for your exam target'}
                </p>
              </div>
            </div>

            {watchHistory.length > 0 ? (
              <div
                ref={continueShelfRef}
                className="flex items-stretch gap-5 overflow-x-auto no-scrollbar pb-2"
              >
                {watchHistory.slice(0, 6).map((item) => (
                  <div key={item.youtube_video_id} className="min-w-[280px] sm:min-w-[320px] max-w-[340px]">
                    <div
                      onClick={() => navigate(`/video-learning/video/${item.youtube_video_id}`)}
                      className="bg-[#FFFFFF] border border-[#1C201D]/10 hover:border-[#2D5A3F]/40 rounded-2xl p-3.5 cursor-pointer transition-all shadow-sm hover:shadow-md space-y-3"
                    >
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-[#EDE8DB]">
                        <img
                          src={`https://i.ytimg.com/vi/${item.youtube_video_id}/hqdefault.jpg`}
                          alt="Watch progress"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-[#1C201D]/30 flex items-center justify-center">
                          <div className="w-10 h-10 rounded-full bg-[#2D5A3F] text-[#FFFFFF] flex items-center justify-center shadow-md">
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          </div>
                        </div>
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-[#1C201D]/90 text-[#FFFFFF] text-[11px] font-mono font-medium">
                          Resume {formatTime(item.last_position)}
                        </div>
                        <div className="absolute bottom-0 inset-x-0 h-1 bg-[#1C201D]">
                          <div
                            className="h-full bg-[#2D5A3F]"
                            style={{ width: `${item.progress_percent}%` }}
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase text-[#2D5A3F]">Continue from {formatTime(item.last_position)}</span>
                        <h4 className="text-xs font-bold text-[#1C201D] line-clamp-1">Lesson Session</h4>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {videos.slice(0, 4).map((v) => (
                  <VideoCard key={v.id} video={v} onSelect={(vid) => navigate(`/video-learning/video/${vid.youtube_video_id || vid.id}`)} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* SECTION 6: COMPLETE PLAYLISTS ("Follow a complete path.") */}
        {playlists.length > 0 && !errorState && (
          <section className="space-y-4 pt-4 border-t border-[#1C201D]/10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-serif font-bold text-[#1C201D] flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#2D5A3F]" /> Follow a Complete Path
                </h2>
                <p className="text-xs text-[#6C706D]">Structured course playlists organized lesson by lesson</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={!canScrollPlLeft}
                  onClick={() => scrollPlaylistShelf('left')}
                  aria-label="Scroll left"
                  className={`p-2 rounded-full border transition-all ${
                    canScrollPlLeft
                      ? 'bg-[#FFFFFF] text-[#1C201D] border-[#1C201D]/15 hover:bg-[#EDE8DB] shadow-sm'
                      : 'bg-[#EDE8DB]/40 text-[#6C706D]/40 border-[#1C201D]/5 cursor-not-allowed'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  disabled={!canScrollPlRight}
                  onClick={() => scrollPlaylistShelf('right')}
                  aria-label="Scroll right"
                  className={`p-2 rounded-full border transition-all ${
                    canScrollPlRight
                      ? 'bg-[#FFFFFF] text-[#1C201D] border-[#1C201D]/15 hover:bg-[#EDE8DB] shadow-sm'
                      : 'bg-[#EDE8DB]/40 text-[#6C706D]/40 border-[#1C201D]/5 cursor-not-allowed'
                  }`}
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

        {/* SECTION 7: SEPARATE DEDICATED CHANNEL SHELVES */}
        {!errorState && (
          <section className="space-y-6">
            <h2 className="text-2xl font-serif font-bold text-[#1C201D]">Verified Channels Catalog</h2>
            {Object.entries(channelVideosMap).map(([name, channelVideos]) => (
              <ChannelShelf
                key={name}
                channelName={name}
                videos={channelVideos}
                onSelectVideo={(v) => navigate(`/video-learning/video/${v.youtube_video_id || v.id}`)}
              />
            ))}
          </section>
        )}

        {/* HIGH-YIELD SHORTS HIGHLIGHT RAIL */}
        {shorts.length > 0 && !errorState && (
          <section className="bg-[#FFFFFF] text-[#1C201D] rounded-3xl p-6 lg:p-8 border border-[#1C201D]/10 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-serif font-bold text-[#1C201D] flex items-center gap-2">
                  <Film className="w-5 h-5 text-[#C86D51]" /> Quick Concepts & High-Yield Shorts
                </h2>
                <p className="text-xs text-[#6C706D]">Fast 60-second formulas and shortcuts</p>
              </div>

              <Link
                to="/video-learning/shorts"
                className="text-xs font-bold text-[#2D5A3F] hover:underline flex items-center gap-1"
              >
                Open Shorts Feed <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {shorts.slice(0, 3).map((short) => (
                <div
                  key={short.id}
                  onClick={() => navigate('/video-learning/shorts')}
                  className="bg-[#EDE8DB]/50 border border-[#1C201D]/10 hover:border-[#2D5A3F]/40 rounded-2xl p-4 cursor-pointer transition-all hover:scale-[1.02] flex items-center gap-3"
                >
                  <div className="w-12 h-16 rounded-xl overflow-hidden bg-[#1C201D] shrink-0 relative">
                    <img src={short.thumbnail || short.thumbnail_url} alt={short.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-[#1C201D]/40 flex items-center justify-center">
                      <Play className="w-4 h-4 text-[#D4AF37] fill-current ml-0.5" />
                    </div>
                  </div>
                  <div className="space-y-1 overflow-hidden">
                    <span className="text-[10px] font-bold uppercase text-[#C86D51]">{short.subject}</span>
                    <h3 className="text-xs font-semibold text-[#1C201D] line-clamp-2">{short.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* MAIN PAGINATED VIDEOS GRID */}
        {!errorState && (
          <section className="space-y-6 pt-4 border-t border-[#1C201D]/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-serif font-bold text-[#1C201D] flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#2D5A3F]" /> Recommended Lectures & PYQs
                </h2>
                <p className="text-xs text-[#6C706D]">
                  {totalCount} total synchronized videos found
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <ArrowUpDown className="w-3.5 h-3.5 text-[#6C706D]" />
                <span className="text-xs font-semibold text-[#6C706D]">Sort:</span>
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  className="bg-[#FFFFFF] border border-[#1C201D]/14 rounded-xl px-3 py-1.5 text-xs text-[#1C201D] font-semibold focus:outline-none focus:border-[#2D5A3F]"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <div key={n} className="h-64 rounded-2xl bg-[#EDE8DB]/60 animate-pulse border border-[#1C201D]/5" />
                ))}
              </div>
            ) : videos.length === 0 ? (
              <div className="text-center py-16 bg-[#FFFFFF] rounded-3xl border border-[#1C201D]/10 space-y-4 shadow-sm">
                <BookOpen className="w-12 h-12 mx-auto text-[#6C706D]" />
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#1C201D]">Nothing matched this search.</h3>
                  <p className="text-xs text-[#6C706D] max-w-md mx-auto">
                    Try another search term or filter combination.
                  </p>
                </div>
                <button
                  onClick={clearAllFilters}
                  className="px-5 py-2.5 rounded-xl bg-[#2D5A3F] text-[#FFFFFF] font-bold text-xs shadow-md transition-colors"
                >
                  Explore all videos
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {videos.map((vid) => (
                  <VideoCard
                    key={vid.id}
                    video={vid}
                    onSelect={(v) => navigate(`/video-learning/video/${v.youtube_video_id || v.id}`)}
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
                  className="px-8 py-3 rounded-xl bg-[#FFFFFF] border border-[#1C201D]/15 hover:border-[#2D5A3F]/40 text-[#1C201D] font-bold text-xs transition-all shadow-sm hover:shadow-md flex items-center gap-2 mx-auto"
                >
                  {loadingMore ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-[#2D5A3F]" /> Loading more...
                    </>
                  ) : (
                    <>Load More Videos ({videos.length} of {totalCount})</>
                  )}
                </button>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default function VideoLearningPage() {
  return (
    <VideoLearningErrorBoundary>
      <VideoLearningPageContent />
    </VideoLearningErrorBoundary>
  );
}
