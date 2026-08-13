import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, Sparkles, BookOpen, Trophy, GraduationCap, Compass, Users, FileText } from 'lucide-react';
import { ARTICLES } from '../content/journal/articles';
import { ArticleCard } from '../components/journal/ArticleCard';
import { CategoryRail } from '../components/journal/CategoryRail';
import { JournalShelf } from '../components/journal/JournalShelf';
import { subscribeNewsletter } from '../lib/newsletterApi';
import { useStudentContext } from '../context/StudentContext';

export default function Journal() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeMessage, setSubscribeMessage] = useState<string | null>(null);

  // Student Context for Personalization
  let studentTargetExam = 'GATE';
  try {
    const studentCtx = useStudentContext();
    if (studentCtx?.targetExam) {
      studentTargetExam = studentCtx.targetExam;
    }
  } catch {
    // Fallback if rendered outside provider
  }

  // Article count map for CategoryRail
  const articleCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    ARTICLES.forEach((a) => {
      counts[a.category] = (counts[a.category] || 0) + 1;
      if (a.category === 'PYQ Strategy') {
        counts['Exam Strategy'] = (counts['Exam Strategy'] || 0) + 1;
      }
    });
    return counts;
  }, []);

  // Filtered Articles calculation
  const filteredArticles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return ARTICLES.filter((a) => {
      const matchesCat =
        activeCategory === 'All' ||
        a.category === activeCategory ||
        (activeCategory === 'Topper Stories' && a.category === 'Topper Stories') ||
        (activeCategory === 'Study Notes' && a.category === 'Study Notes') ||
        (activeCategory === 'Exam Strategy' && (a.category === 'Exam Strategy' || a.category === 'PYQ Strategy')) ||
        (activeCategory === 'Study Science' && a.category === 'Study Science') ||
        (activeCategory === 'Educator Stories' && a.category === 'Educator Stories') ||
        (activeCategory === 'Career & Research' && a.category === 'Career & Research') ||
        (activeCategory === 'Inspiration' && (a.category === 'Inspiration' || a.category === 'Student Stories')) ||
        (activeCategory === 'Revision' && a.category === 'Revision') ||
        (activeCategory === 'Productivity' && a.category === 'Productivity');

      const matchesQuery =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        (a.exam && a.exam.toLowerCase().includes(q)) ||
        (a.tags && a.tags.some((t) => t.toLowerCase().includes(q))) ||
        (a.topperDetails && a.topperDetails.name.toLowerCase().includes(q)) ||
        a.content.toLowerCase().includes(q);

      return matchesCat && matchesQuery;
    });
  }, [activeCategory, searchQuery]);

  // Featured / Editor's Pick
  const featuredArticle = useMemo(() => {
    return ARTICLES.find((a) => a.featured || a.editorPick) || ARTICLES[0];
  }, []);

  // Section Collections for Shelves
  const topperArticles = useMemo(() => {
    return ARTICLES.filter((a) => a.category === 'Topper Stories');
  }, []);

  const studyNotesArticles = useMemo(() => {
    return ARTICLES.filter((a) => a.category === 'Study Notes');
  }, []);

  const strategyArticles = useMemo(() => {
    return ARTICLES.filter((a) => a.category === 'Exam Strategy' || a.category === 'PYQ Strategy' || a.tags.includes('Not a Perfect Routine'));
  }, []);

  const educatorArticles = useMemo(() => {
    return ARTICLES.filter((a) => a.category === 'Educator Stories');
  }, []);

  const careerArticles = useMemo(() => {
    return ARTICLES.filter((a) => a.category === 'Career & Research');
  }, []);

  const inspirationArticles = useMemo(() => {
    return ARTICLES.filter((a) => a.category === 'Inspiration' || a.category === 'Student Stories');
  }, []);

  // Personalized Articles for Logged-In Exam Context
  const personalizedArticles = useMemo(() => {
    if (!studentTargetExam) return [];
    return ARTICLES.filter(
      (a) => a.exam && a.exam.toLowerCase().includes(studentTargetExam.toLowerCase())
    ).slice(0, 4);
  }, [studentTargetExam]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribeMessage(null);
    if (!email) return;

    setSubscribing(true);
    const res = await subscribeNewsletter(email);
    if (res.success) {
      setSubscribed(true);
      setEmail('');
    } else {
      setSubscribeMessage(res.message || 'Subscription failed.');
    }
    setSubscribing(false);
  };

  const isFiltered = activeCategory !== 'All' || searchQuery.trim().length > 0;

  return (
    <>
      <Helmet>
        <title>The Study Hub Journal — Ideas, Stories & Systems for Serious Learners</title>
        <meta
          name="description"
          content="Ideas, stories and systems for students who want to learn with intention. Real stories, verified topper strategies, study science, and educator journeys."
        />
      </Helmet>

      {/* Hero Header */}
      <div className="relative z-10 px-6 pt-16 pb-8 max-w-4xl mx-auto text-center font-sans">
        <span className="text-xs uppercase tracking-widest text-cyan-400 font-semibold liquid-glass px-4 py-1.5 rounded-full inline-block mb-4 border border-cyan-500/20">
          The Study Hub Journal
        </span>
        <h1
          className="animate-fade-rise text-4xl sm:text-6xl lg:text-7xl font-normal leading-[0.98] tracking-[-1.5px] text-foreground"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Learn smarter. Think deeper.{' '}
          <span className="text-gradient-accent">Keep going.</span>
        </h1>
        <p className="animate-fade-rise-delay text-muted-foreground text-sm sm:text-base max-w-xl mx-auto mt-4 leading-relaxed font-sans">
          Ideas, stories and systems for students who want to learn with intention. Real stories, verified topper strategies, study science, and educator journeys.
        </p>
      </div>

      {/* Search & Configuration Category Rail Bar */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pb-10 space-y-6 font-sans">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Category Rail (Scrollable with Arrow Navigation & Progress Track) */}
          <div className="w-full md:flex-1">
            <CategoryRail
              activeCategory={activeCategory}
              onSelectCategory={(catName) => setActiveCategory(catName)}
              articleCounts={articleCounts}
              totalCount={ARTICLES.length}
            />
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stories, toppers, notes..."
              className="w-full liquid-glass rounded-full pl-10 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 border border-white/10"
            />
          </div>
        </div>
      </div>

      {/* FILTERED VIEW (When user selects a category or types search query) */}
      {isFiltered ? (
        <div className="relative z-10 max-w-6xl mx-auto px-6 pb-20 font-sans">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
            <div>
              <h2 className="text-2xl font-normal text-foreground font-serif">
                {searchQuery ? `Search Results for "${searchQuery}"` : activeCategory}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Found {filteredArticles.length} published story{filteredArticles.length === 1 ? '' : 'ies'}
              </p>
            </div>
            <button
              onClick={() => {
                setActiveCategory('All');
                setSearchQuery('');
              }}
              className="text-xs text-cyan-400 hover:underline cursor-pointer"
            >
              Clear filters
            </button>
          </div>

          {filteredArticles.length === 0 ? (
            <div className="liquid-glass-card rounded-3xl p-12 text-center border border-white/10 max-w-md mx-auto my-8 space-y-3">
              <Sparkles className="w-8 h-8 text-cyan-400 mx-auto" />
              <h3 className="text-xl font-normal text-foreground" style={{ fontFamily: "'Instrument Serif', serif" }}>
                No stories match your search.
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Try searching for toppers like "Saksham Jindal", exams like "GATE", or topics like "Active Recall".
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* EDITORIAL PUBLICATION LAYOUT (Default Unfiltered Home View) */
        <div className="relative z-10 max-w-6xl mx-auto px-6 space-y-20 pb-20 font-sans">
          {/* SECTION 1: Editor's Pick Featured Story */}
          {featuredArticle && (
            <section className="space-y-4">
              <ArticleCard article={featuredArticle} featured />
            </section>
          )}

          {/* SECTION 2: Student Context Personalized Recommendations */}
          {personalizedArticles.length > 0 && (
            <JournalShelf
              title={`Curated for ${studentTargetExam} Aspirants`}
              subtitle="Hand-picked stories and strategy guides based on your target exam profile."
              badgeText="Recommended for Your Prep"
              badgeIcon={<Sparkles className="w-3.5 h-3.5 text-cyan-400" />}
              articles={personalizedArticles}
            />
          )}

          {/* SECTION 3: Stories Behind the Rank (Toppers Horizontal Shelf) */}
          <JournalShelf
            title="Stories Behind the Rank"
            subtitle="Deconstructed preparation strategies, mistakes, and routines from verified rankers."
            badgeText="Signature Editorial Series"
            badgeIcon={<Trophy className="w-3.5 h-3.5 text-amber-400" />}
            articles={topperArticles}
            onViewAll={() => setActiveCategory('Topper Stories')}
            viewAllText="View all rankers"
          />

          {/* SECTION 4: Notes Worth Keeping */}
          <JournalShelf
            title="Notes Worth Keeping"
            subtitle="High-yield revision sheets, formula maps, and mistake vault guides."
            badgeText="Revision Systems"
            badgeIcon={<FileText className="w-3.5 h-3.5 text-emerald-400" />}
            articles={studyNotesArticles}
            onViewAll={() => setActiveCategory('Study Notes')}
            viewAllText="View all notes"
          />

          {/* SECTION 5: Study Systems & Strategy ("Not a Perfect Routine") */}
          <JournalShelf
            title="Not a Perfect Routine"
            subtitle="Evidence-based study systems, active recall, and diagnostic PYQ frameworks."
            badgeText="Exam Strategy"
            badgeIcon={<BookOpen className="w-3.5 h-3.5 text-cyan-400" />}
            articles={strategyArticles}
            onViewAll={() => setActiveCategory('Exam Strategy')}
            viewAllText="View strategy series"
          />

          {/* SECTION 6: Educator Stories */}
          <JournalShelf
            title="Educator Stories"
            subtitle="Teachers who changed how students learn: Alakh Pandey and digital learning movements."
            badgeText="Teachers & Pedagogy"
            badgeIcon={<GraduationCap className="w-3.5 h-3.5 text-rose-400" />}
            articles={educatorArticles}
            onViewAll={() => setActiveCategory('Educator Stories')}
            viewAllText="View educator stories"
          />

          {/* SECTION 7: Beyond the Exam (Career & Research) */}
          <JournalShelf
            title="Beyond the Exam"
            subtitle="M.Tech pathways, research fellowships, B.Tech to PhD, and global engineering careers."
            badgeText="Life After Competition"
            badgeIcon={<Compass className="w-3.5 h-3.5 text-teal-400" />}
            articles={careerArticles}
            onViewAll={() => setActiveCategory('Career & Research')}
            viewAllText="View career guides"
          />

          {/* SECTION 8: Inspiration & Stories Before the Rank */}
          <JournalShelf
            title="Stories That Keep You Going"
            subtitle="Overcoming low mock scores, managing pressure, and rebuilding consistency."
            badgeText="Resilience & Comebacks"
            badgeIcon={<Users className="w-3.5 h-3.5 text-sky-400" />}
            articles={inspirationArticles}
            onViewAll={() => setActiveCategory('Inspiration')}
            viewAllText="View inspiration"
          />

          {/* SECTION 9: From the Study Hub Community (Clean empty state) */}
          <section className="liquid-glass-card rounded-3xl p-10 text-center border border-white/10 space-y-3 shadow-xl">
            <Trophy className="w-8 h-8 text-amber-400 mx-auto" />
            <h3 className="text-2xl font-normal text-foreground" style={{ fontFamily: "'Instrument Serif', serif" }}>
              From the Study Hub Community
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              Student notes submissions are opening soon. Be the first student to share a useful note or formula sheet with serious learners across India.
            </p>
            <div className="pt-2">
              <span className="inline-block px-4 py-1.5 rounded-full liquid-glass border border-cyan-400/30 text-xs font-semibold text-cyan-300">
                Community Notes Submissions Opening Soon
              </span>
            </div>
          </section>
        </div>
      )}

      {/* Newsletter Subscription Strip */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 pb-32 font-sans">
        <div className="liquid-glass-card rounded-3xl py-12 px-8 text-center border border-white/10 shadow-2xl">
          <h2
            className="text-3xl sm:text-4xl font-normal text-foreground tracking-[-1px]"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Get one honest email a week.
          </h2>
          <p className="text-muted-foreground mt-3 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
            No marketing fluff, no spam. Just deep actionable advice on studying, exam prep, and cognitive performance.
          </p>
          {subscribed ? (
            <p className="mt-8 text-cyan-300 text-sm font-semibold animate-fade-rise">
              ✓ You're subscribed — expect one honest email every week.
            </p>
          ) : (
            <form onSubmit={handleSubscribe} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="liquid-glass rounded-full flex-1 px-5 py-3 text-xs text-foreground placeholder:text-muted-foreground bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 border border-white/10"
              />
              <button
                type="submit"
                disabled={subscribing}
                className="gradient-cta rounded-full px-6 py-3 text-xs text-slate-950 font-semibold hover:scale-[1.03] transition-transform shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 disabled:opacity-50"
              >
                {subscribing ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
          )}
          {subscribeMessage && (
            <p className="mt-4 text-xs text-red-300 font-medium animate-fade-rise">{subscribeMessage}</p>
          )}
        </div>
      </div>
    </>
  );
}
