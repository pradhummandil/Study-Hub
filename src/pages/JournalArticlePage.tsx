import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Clock, Share2, Check, Sparkles, ShieldCheck, Trophy, Info } from 'lucide-react';
import { ARTICLES, type Article } from '../content/journal/articles';
import { ArticleCard } from '../components/journal/ArticleCard';
import { SourceBadge } from '../components/journal/SourceBadge';
import { TryThisBox } from '../components/journal/TryThisBox';

export default function JournalArticlePage() {
  const { id, slug } = useParams<{ id?: string; slug?: string }>();
  const activeSlug = slug || id;

  const [article, setArticle] = useState<Article | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!activeSlug) return;

    // Match by slug or fallback to first article
    const found = ARTICLES.find(
      (a) => a.slug === activeSlug || a.id === activeSlug || ARTICLES.indexOf(a) + 1 === Number(activeSlug)
    );

    if (found) {
      setArticle(found);
    } else {
      setArticle(ARTICLES[0]);
    }
  }, [activeSlug]);

  // Scroll reading progress listener
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const current = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, current)));
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleShare = async () => {
    const shareData = {
      title: article?.title || 'Study Hub Journal Article',
      text: article?.excerpt || '',
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (!article) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mb-3" />
        <p className="text-xs text-muted-foreground font-sans">Loading story...</p>
      </div>
    );
  }

  // Related Articles matching category, exam, or tags
  const relatedArticles = ARTICLES.filter(
    (a) =>
      a.slug !== article.slug &&
      (a.category === article.category ||
        (a.exam && article.exam && a.exam === article.exam) ||
        a.tags.some((t) => article.tags.includes(t)))
  ).slice(0, 3);

  const isResearchedStory = Boolean(
    article.sourceNames && article.sourceNames.length > 0
  );

  return (
    <>
      <Helmet>
        <title>{`${article.title} | Study Hub Journal`}</title>
        <meta name="description" content={article.excerpt} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.excerpt} />
        <meta property="og:image" content={article.image} />
      </Helmet>

      {/* Top Fixed Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-white/5 z-50 pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 via-indigo-400 to-amber-400 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <article className="min-h-screen pb-24 pt-8 px-4 sm:px-6 lg:px-8">
        {/* Top Navigation Bar */}
        <div className="max-w-4xl mx-auto mb-8 font-sans">
          <Link
            to="/journal"
            className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors liquid-glass px-4 py-2 rounded-full border border-white/10"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Journal
          </Link>
        </div>

        {/* Article Header */}
        <header className="max-w-3xl mx-auto text-center space-y-6">
          <div className="flex flex-wrap items-center justify-center gap-2 font-sans">
            <span className="liquid-glass rounded-full px-3 py-1 text-xs font-semibold text-cyan-300 border border-cyan-500/30 uppercase tracking-widest">
              {article.category}
            </span>
            {article.exam && (
              <span className="liquid-glass rounded-full px-3 py-1 text-xs font-semibold text-amber-300 border border-amber-500/30 uppercase tracking-widest flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5" /> {article.exam} {article.examYear || ''}
              </span>
            )}
            {article.verified && (
              <span className="liquid-glass rounded-full px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/30 uppercase tracking-widest flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Story
              </span>
            )}
          </div>

          <h1
            className="text-3xl sm:text-5xl lg:text-6xl font-normal leading-[1.05] tracking-[-1.5px] text-foreground"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            {article.title}
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto font-sans">
            {article.excerpt}
          </p>

          {/* Author & Read Meta Strip */}
          <div className="flex items-center justify-between border-y border-white/10 py-4 max-w-xl mx-auto text-xs text-muted-foreground font-sans">
            <div className="flex items-center gap-3">
              {article.author.avatar ? (
                <img
                  src={article.author.avatar}
                  alt={article.author.name}
                  className="w-10 h-10 rounded-full object-cover border border-white/20"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold">
                  {article.author.name[0]}
                </div>
              )}
              <div className="text-left">
                <p className="text-foreground font-medium">{article.author.name}</p>
                <p className="text-[11px] text-muted-foreground">{article.author.role}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-cyan-400 font-medium">
                <Clock className="w-3.5 h-3.5" /> {article.readTime}
              </span>
              <span>•</span>
              <span>{article.publishedAt}</span>
            </div>
          </div>
        </header>

        {/* Hero Image */}
        {(() => {
          const heroConfig = article.heroImageConfig;
          const imgSrc = heroConfig?.src || article.image;
          const objPos = heroConfig?.objectPosition || 'center 25%';
          const photoCredit = heroConfig?.credit || (heroConfig?.sourceName ? `Photo: ${heroConfig.sourceName}` : null);

          return (
            <div className="max-w-4xl mx-auto my-10 space-y-2">
              <div className="rounded-3xl overflow-hidden liquid-glass border border-white/10 shadow-2xl relative">
                <img
                  src={imgSrc}
                  alt={article.title}
                  style={{ objectPosition: objPos }}
                  className="w-full max-h-[480px] object-cover"
                />
              </div>
              {photoCredit && (
                <p className="text-[11px] text-muted-foreground text-right px-2 font-sans">
                  {photoCredit}
                </p>
              )}
            </div>
          );
        })()}

        {/* Key Takeaways Summary Box */}
        {article.keyTakeaways && article.keyTakeaways.length > 0 && (
          <div className="max-w-[760px] mx-auto my-8 p-6 rounded-3xl liquid-glass border border-cyan-500/30 space-y-3 font-sans shadow-xl">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-cyan-400 font-semibold">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Key Takeaways</span>
            </div>
            <ul className="space-y-2 text-sm text-slate-200">
              {article.keyTakeaways.map((takeaway, idx) => (
                <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                  <span className="text-cyan-400 shrink-0 font-bold">•</span>
                  <span>{takeaway}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Article Body Content */}
        <div className="max-w-[760px] mx-auto prose prose-invert prose-cyan text-slate-200 leading-relaxed font-sans space-y-6 text-base sm:text-lg">
          {article.content.split('\n\n').map((paragraph, idx) => {
            const trimmed = paragraph.trim();
            if (trimmed.startsWith('# ')) {
              return (
                <h1
                  key={idx}
                  className="text-3xl sm:text-4xl font-normal text-foreground mt-10 mb-4"
                  style={{ fontFamily: "'Instrument Serif', serif" }}
                >
                  {trimmed.replace('# ', '')}
                </h1>
              );
            }
            if (trimmed.startsWith('## ')) {
              return (
                <h2
                  key={idx}
                  className="text-2xl sm:text-3xl font-normal text-foreground mt-8 mb-3"
                  style={{ fontFamily: "'Instrument Serif', serif" }}
                >
                  {trimmed.replace('## ', '')}
                </h2>
              );
            }
            if (trimmed.startsWith('### ')) {
              return (
                <h3 key={idx} className="text-xl font-semibold text-foreground mt-6 mb-2">
                  {trimmed.replace('### ', '')}
                </h3>
              );
            }
            if (trimmed.startsWith('> ')) {
              return (
                <blockquote
                  key={idx}
                  className="italic text-xl sm:text-2xl text-foreground my-8 p-6 rounded-2xl liquid-glass border-l-4 border-cyan-400 leading-relaxed font-serif"
                >
                  {trimmed.replace('> ', '').replace(/"/g, '')}
                </blockquote>
              );
            }

            return (
              <p key={idx} className="leading-relaxed text-slate-300">
                {trimmed}
              </p>
            );
          })}
        </div>

        {/* Interactive "Try This Today" Box */}
        <div className="max-w-[760px] mx-auto">
          <TryThisBox cta={article.cta} category={article.category} />
        </div>

        {/* Sources & Researched Badge */}
        <div className="max-w-[760px] mx-auto">
          <SourceBadge
            sourceNames={article.sourceNames}
            sourceUrls={article.sourceUrls}
            sourceCheckedAt={article.sourceCheckedAt}
            isResearched={isResearchedStory}
          />
        </div>

        {/* Educator/Topper Story Non-Endorsement Disclaimer */}
        {(article.category === 'Educator Stories' || article.category === 'Topper Stories') && (
          <div className="max-w-[760px] mx-auto my-6 p-4 rounded-2xl liquid-glass border border-white/10 text-xs text-muted-foreground flex items-start gap-3 font-sans">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Editorial Disclaimer:</strong> This story is written based on publicly available interviews, official gazette records, and published educational archives. It does not imply official endorsement by the named individuals or institutions.
            </p>
          </div>
        )}

        {/* Tags & Share Strip */}
        <div className="max-w-[760px] mx-auto mt-10 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-sans">
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span key={tag} className="liquid-glass rounded-full px-3 py-1 text-xs text-muted-foreground">
                #{tag}
              </span>
            ))}
          </div>

          <button
            onClick={handleShare}
            className="liquid-glass rounded-full px-5 py-2 text-xs text-foreground font-medium flex items-center gap-2 hover:scale-105 transition-transform cursor-pointer shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" /> Link Copied!
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-cyan-400" /> Share Article
              </>
            )}
          </button>
        </div>

        {/* Related Articles ("Continue Reading") */}
        {relatedArticles.length > 0 && (
          <section className="max-w-5xl mx-auto mt-20 pt-12 border-t border-white/10 font-sans">
            <div className="text-center mb-10">
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2">Continue Reading</p>
              <h2 className="text-3xl sm:text-4xl font-normal text-foreground" style={{ fontFamily: "'Instrument Serif', serif" }}>
                Related Stories & Systems
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((rel) => (
                <ArticleCard key={rel.slug} article={rel} />
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  );
}
