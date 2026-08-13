import { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { JOURNAL_CATEGORIES } from '../../content/journal/categories';

interface CategoryRailProps {
  activeCategory: string;
  onSelectCategory: (categoryName: string) => void;
  articleCounts: Record<string, number>;
  totalCount: number;
}

export function CategoryRail({
  activeCategory,
  onSelectCategory,
  articleCounts,
  totalCount,
}: CategoryRailProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);

    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll > 0) {
      setScrollProgress(Math.min(100, Math.max(0, (scrollLeft / maxScroll) * 100)));
    } else {
      setScrollProgress(100);
    }
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

  const handleKeyDown = (e: React.KeyboardEvent, catName: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelectCategory(catName);
    }
  };

  return (
    <div className="relative w-full space-y-2 font-sans select-none">
      {/* Category Container + Navigation Bar */}
      <div className="relative flex items-center group">
        {/* Left Arrow Button */}
        <button
          type="button"
          onClick={() => scrollByAmount(-300)}
          disabled={!canScrollLeft}
          aria-label="Scroll categories left"
          aria-disabled={!canScrollLeft}
          className={`absolute left-0 z-20 w-11 h-11 rounded-full liquid-glass border border-white/20 flex items-center justify-center text-foreground transition-all duration-300 shadow-xl cursor-pointer ${
            canScrollLeft
              ? 'opacity-100 hover:bg-cyan-500/20 hover:border-cyan-400/50 hover:text-white hover:scale-105'
              : 'opacity-0 pointer-events-none'
          }`}
        >
          <ChevronLeft className="w-5 h-5 text-cyan-300" />
        </button>

        {/* Scrollable Chips Track (No Native Scrollbar) */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex items-center gap-2.5 overflow-x-auto w-full py-2 px-1 scrollbar-none snap-x transition-all"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {/* All Button */}
          <button
            type="button"
            onClick={() => onSelectCategory('All')}
            onKeyDown={(e) => handleKeyDown(e, 'All')}
            aria-selected={activeCategory === 'All'}
            className={`rounded-full px-5 py-2 text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer snap-start ${
              activeCategory === 'All'
                ? 'gradient-cta text-slate-950 shadow-lg scale-[1.02]'
                : 'liquid-glass text-muted-foreground hover:text-foreground border border-white/16 hover:border-cyan-400/40 hover:scale-[1.01]'
            }`}
          >
            All Stories ({totalCount})
          </button>

          {/* Category Chips */}
          {JOURNAL_CATEGORIES.map((cat) => {
            const count = articleCounts[cat.name] || 0;
            if (count === 0) return null;

            const isSelected = activeCategory === cat.name;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.name)}
                onKeyDown={(e) => handleKeyDown(e, cat.name)}
                aria-selected={isSelected}
                className={`rounded-full px-5 py-2 text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer snap-start ${
                  isSelected
                    ? 'gradient-cta text-slate-950 shadow-lg scale-[1.02]'
                    : 'liquid-glass text-muted-foreground hover:text-foreground border border-white/16 hover:border-cyan-400/40 hover:scale-[1.01]'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Right Arrow Button */}
        <button
          type="button"
          onClick={() => scrollByAmount(300)}
          disabled={!canScrollRight}
          aria-label="Scroll categories right"
          aria-disabled={!canScrollRight}
          className={`absolute right-0 z-20 w-11 h-11 rounded-full liquid-glass border border-white/20 flex items-center justify-center text-foreground transition-all duration-300 shadow-xl cursor-pointer ${
            canScrollRight
              ? 'opacity-100 hover:bg-cyan-500/20 hover:border-cyan-400/50 hover:text-white hover:scale-105'
              : 'opacity-0 pointer-events-none'
          }`}
        >
          <ChevronRight className="w-5 h-5 text-cyan-300" />
        </button>

        {/* Right Edge Soft Gradient Fade */}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#062B3D]/90 via-[#062B3D]/50 to-transparent pointer-events-none z-10 rounded-r-2xl" />
        )}
      </div>

      {/* 2px Premium Bottom Progress Track */}
      <div className="h-0.5 w-full bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 via-indigo-400 to-amber-400 transition-all duration-200"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
    </div>
  );
}
