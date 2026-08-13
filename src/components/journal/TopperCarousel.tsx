import { Link } from 'react-router-dom';
import { Trophy, ArrowRight, ShieldCheck, Clock } from 'lucide-react';
import type { Article } from '../../content/journal/articles';

interface TopperCarouselProps {
  topperArticles: Article[];
}

export function TopperCarousel({ topperArticles }: TopperCarouselProps) {
  if (!topperArticles || topperArticles.length === 0) return null;

  return (
    <div className="space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold mb-1 block">
            Signature Editorial Series
          </span>
          <h2
            className="text-3xl sm:text-4xl font-normal text-foreground tracking-[-1px]"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Stories Behind the Rank
          </h2>
        </div>
        <div className="text-xs text-muted-foreground hidden sm:block">
          Scroll to explore verified rankers →
        </div>
      </div>

      {/* Horizontally Scrollable Cards Container */}
      <div className="flex gap-6 overflow-x-auto pb-6 pt-2 scrollbar-none snap-x snap-mandatory">
        {topperArticles.map((article) => {
          const topper = article.topperDetails;
          return (
            <Link
              key={article.slug}
              to={`/journal/${article.slug}`}
              className="snap-start shrink-0 w-[300px] sm:w-[360px] group"
            >
              <div className="liquid-glass-card rounded-3xl overflow-hidden border border-white/10 hover:border-amber-500/40 hover:scale-[1.01] transition-all duration-300 h-full flex flex-col justify-between p-6 shadow-xl relative">
                <div className="space-y-4">
                  {/* Exam & Rank Header */}
                  <div className="flex items-center justify-between">
                    <span className="liquid-glass rounded-full px-3 py-1 text-[11px] font-semibold text-amber-300 border border-amber-500/30 uppercase tracking-widest flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-amber-400" />
                      {topper?.exam || article.exam} {topper?.year || article.examYear}
                    </span>
                    {article.verified && (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                        <ShieldCheck className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>

                  {/* Topper Name & Rank Banner */}
                  <div>
                    <div className="text-2xl font-normal text-foreground group-hover:text-amber-300 transition-colors font-serif">
                      {topper?.name || 'Top Ranker'}
                    </div>
                    <div className="text-sm font-semibold text-amber-400 mt-0.5">
                      {topper?.rank || 'All India Rank'} {topper?.score ? `• ${topper.score}` : ''}
                    </div>
                  </div>

                  {/* Excerpt Summary */}
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    "{article.excerpt}"
                  </p>
                </div>

                {/* Footer Read Action */}
                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 text-cyan-400 font-medium">
                    <Clock className="w-3.5 h-3.5" /> {article.readTime}
                  </span>
                  <span className="flex items-center gap-1 text-foreground font-semibold group-hover:text-amber-300 transition-colors">
                    Read Story <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
