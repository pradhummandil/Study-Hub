import { useRef, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { ArticleCard } from './ArticleCard';
import type { Article } from '../../content/journal/articles';

interface JournalShelfProps {
  title: string;
  subtitle?: string;
  badgeText?: string;
  badgeIcon?: ReactNode;
  articles: Article[];
  onViewAll?: () => void;
  viewAllText?: string;
}

export function JournalShelf({
  title,
  subtitle,
  badgeText,
  badgeIcon,
  articles,
  onViewAll,
  viewAllText = 'View all stories',
}: JournalShelfProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [checkScroll]);

  const scrollByAmount = (amount: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: amount, behavior: 'smooth' });
  };

  if (!articles || articles.length === 0) return null;

  return (
    <section className="space-y-4 font-sans select-none">
      {/* Header Row */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          {badgeText && (
            <span className="text-xs uppercase tracking-widest font-semibold text-cyan-400 mb-1 flex items-center gap-1.5">
              {badgeIcon}
              <span>{badgeText}</span>
            </span>
          )}
          <h2
            className="text-3xl sm:text-4xl font-normal text-foreground tracking-[-1px]"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Arrow Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollByAmount(-320)}
              disabled={!canScrollLeft}
              aria-label={`Scroll ${title} left`}
              aria-disabled={!canScrollLeft}
              className={`w-9 h-9 rounded-full liquid-glass border border-white/20 flex items-center justify-center transition-all cursor-pointer ${
                canScrollLeft
                  ? 'opacity-100 hover:bg-cyan-500/20 hover:border-cyan-400/50 text-foreground hover:scale-105'
                  : 'opacity-30 cursor-not-allowed text-muted-foreground'
              }`}
            >
              <ChevronLeft className="w-4 h-4 text-cyan-300" />
            </button>
            <button
              type="button"
              onClick={() => scrollByAmount(320)}
              disabled={!canScrollRight}
              aria-label={`Scroll ${title} right`}
              aria-disabled={!canScrollRight}
              className={`w-9 h-9 rounded-full liquid-glass border border-white/20 flex items-center justify-center transition-all cursor-pointer ${
                canScrollRight
                  ? 'opacity-100 hover:bg-cyan-500/20 hover:border-cyan-400/50 text-foreground hover:scale-105'
                  : 'opacity-30 cursor-not-allowed text-muted-foreground'
              }`}
            >
              <ChevronRight className="w-4 h-4 text-cyan-300" />
            </button>
          </div>

          {/* View All Action */}
          {onViewAll && (
            <button
              type="button"
              onClick={onViewAll}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>{viewAllText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Horizontal Shelf Track (Hidden Native Scrollbar) */}
      <div className="relative group">
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-6 overflow-x-auto pb-4 pt-2 scrollbar-none snap-x snap-mandatory"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {articles.map((article) => (
            <div
              key={article.slug}
              className="snap-start shrink-0 w-[290px] sm:w-[340px]"
            >
              <ArticleCard article={article} />
            </div>
          ))}
        </div>

        {/* Right Edge Soft Gradient Overlay */}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#062B3D]/90 via-[#062B3D]/50 to-transparent pointer-events-none z-10" />
        )}
      </div>
    </section>
  );
}
