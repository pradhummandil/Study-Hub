import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, Sparkles } from 'lucide-react';
import { ARTICLES } from '../content/journal/articles';
import { ArticleCard } from '../components/journal/ArticleCard';
import { subscribeNewsletter } from '../lib/newsletterApi';

const CATEGORIES = ['All', 'Study Strategy', 'Competitive Exams', 'College', 'Technology', 'Productivity'];

export default function Journal() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeMessage, setSubscribeMessage] = useState<string | null>(null);

  const featuredArticle = useMemo(() => {
    return ARTICLES.find((a) => a.featured) || ARTICLES[0];
  }, []);

  const filteredArticles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return ARTICLES.filter((a) => {
      const matchesCat = activeCategory === 'All' || a.category === activeCategory;
      const matchesQuery =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q);

      return matchesCat && matchesQuery;
    });
  }, [activeCategory, searchQuery]);

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

  return (
    <>
      <Helmet>
        <title>The Study Hub Journal — Ideas & Strategies for Learning Better</title>
        <meta
          name="description"
          content="Ideas, strategies, exam insights and stories to help you learn better, prepare smarter, and maintain deep focus."
        />
      </Helmet>

      {/* Hero Header */}
      <div className="relative z-10 px-6 pt-16 pb-12 max-w-4xl mx-auto text-center">
        <span className="text-xs uppercase tracking-widest text-cyan-400 font-semibold liquid-glass px-4 py-1.5 rounded-full inline-block mb-4 border border-cyan-500/20 font-sans">
          The Study Hub Journal
        </span>
        <h1
          className="animate-fade-rise text-4xl sm:text-6xl font-normal leading-[0.98] tracking-[-1.5px] text-foreground"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Learn smarter. Think deeper.{' '}
          <span className="text-gradient-accent">Prepare better.</span>
        </h1>
        <p className="animate-fade-rise-delay text-muted-foreground text-sm sm:text-base max-w-xl mx-auto mt-4 leading-relaxed font-sans">
          Ideas, strategies, exam insights and stories to help you navigate competitive exams, college coursework, and deep work.
        </p>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 pb-10 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2 flex-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'gradient-cta text-slate-950 font-semibold shadow-md'
                    : 'liquid-glass text-muted-foreground hover:text-foreground border border-white/10'
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles..."
              className="w-full liquid-glass rounded-full pl-10 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 border border-white/10"
            />
          </div>
        </div>
      </div>

      {/* Featured Article (Only shown when filter is 'All' and no active search query) */}
      {activeCategory === 'All' && !searchQuery.trim() && featuredArticle && (
        <div className="relative z-10 max-w-5xl mx-auto px-6 pb-12">
          <ArticleCard article={featuredArticle} featured />
        </div>
      )}

      {/* Articles Grid */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 pb-20">
        {filteredArticles.length === 0 ? (
          <div className="liquid-glass-card rounded-3xl p-12 text-center border border-white/10 max-w-md mx-auto my-8 space-y-3">
            <Sparkles className="w-8 h-8 text-cyan-400 mx-auto" />
            <h3 className="text-xl font-normal text-foreground" style={{ fontFamily: "'Instrument Serif', serif" }}>
              No stories here yet.
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We're preparing new insights for this category. Check back soon or try another topic.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles
              .filter((a) => activeCategory !== 'All' || searchQuery.trim() || a.slug !== featuredArticle.slug)
              .map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
          </div>
        )}
      </div>

      {/* Newsletter Subscription Strip */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 pb-32">
        <div className="liquid-glass-card rounded-3xl py-12 px-8 text-center border border-white/10 shadow-2xl">
          <h2
            className="text-3xl sm:text-4xl font-normal text-foreground tracking-[-1px]"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Get one honest email a week.
          </h2>
          <p className="text-muted-foreground mt-3 text-xs sm:text-sm max-w-md mx-auto leading-relaxed font-sans">
            No marketing fluff, no spam. Just deep actionable advice on studying, exam prep, and cognitive performance.
          </p>
          {subscribed ? (
            <p className="mt-8 text-cyan-300 text-sm font-semibold animate-fade-rise font-sans">
              ✓ You're subscribed — expect one honest email every week.
            </p>
          ) : (
            <form onSubmit={handleSubscribe} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto font-sans">
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
            <p className="mt-4 text-xs text-red-300 font-medium animate-fade-rise font-sans">{subscribeMessage}</p>
          )}
        </div>
      </div>
    </>
  );
}
