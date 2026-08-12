import { Link } from 'react-router-dom';
import { Clock, ArrowUpRight } from 'lucide-react';
import type { Article } from '../../content/journal/articles';

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
}

export function ArticleCard({ article, featured = false }: ArticleCardProps) {
  if (featured) {
    return (
      <Link to={`/journal/${article.slug}`} className="block group">
        <div className="liquid-glass-card rounded-3xl overflow-hidden grid md:grid-cols-2 hover:scale-[1.005] transition-all duration-300 border border-white/10 shadow-2xl">
          {/* Image */}
          <div className="relative aspect-video md:aspect-auto overflow-hidden bg-slate-950">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <span className="absolute top-4 left-4 liquid-glass rounded-full px-3 py-1 text-[11px] font-semibold text-cyan-300 border border-cyan-500/30 uppercase tracking-wider">
              {article.category}
            </span>
          </div>

          {/* Body */}
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3">Editor's Pick</p>
              <h2
                className="text-2xl sm:text-3xl font-normal text-foreground leading-snug mb-3 group-hover:text-cyan-300 transition-colors"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                {article.title}
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 font-sans">
                {article.excerpt}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-muted-foreground font-sans">
              <div className="flex items-center gap-2">
                {article.author.avatar && (
                  <img
                    src={article.author.avatar}
                    alt={article.author.name}
                    className="w-6 h-6 rounded-full object-cover border border-white/20"
                  />
                )}
                <span>{article.author.name}</span>
                <span>•</span>
                <span>{article.publishedAt}</span>
              </div>
              <span className="flex items-center gap-1 text-cyan-400 font-medium">
                <Clock className="w-3.5 h-3.5" /> {article.readTime}
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/journal/${article.slug}`} className="block group h-full">
      <div className="liquid-glass-card rounded-2xl overflow-hidden hover:scale-[1.01] transition-all duration-300 h-full flex flex-col border border-white/10">
        {/* Image */}
        <div className="relative aspect-[16/9] overflow-hidden bg-slate-950">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <span className="absolute top-3 left-3 liquid-glass rounded-full px-2.5 py-0.5 text-[10px] font-semibold text-cyan-300 border border-cyan-500/30 uppercase tracking-wider">
            {article.category}
          </span>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1 justify-between">
          <div>
            <h3
              className="text-xl text-foreground font-normal leading-snug mb-2 group-hover:text-cyan-300 transition-colors"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              {article.title}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed font-sans mb-4">
              {article.excerpt}
            </p>
          </div>

          <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-muted-foreground font-sans">
            <span>{article.publishedAt}</span>
            <span className="flex items-center gap-1 text-cyan-400 font-medium">
              {article.readTime} <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
