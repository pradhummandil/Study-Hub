import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowUpRight, ShieldCheck, Trophy, FileText, Target, Brain, Users, GraduationCap, Sparkles } from 'lucide-react';
import type { Article } from '../../content/journal/articles';

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
}

export function ArticleCard({ article, featured = false }: ArticleCardProps) {
  const [imgError, setImgError] = useState(false);

  const heroConfig = article.heroImageConfig;
  const imageSrc = !imgError && heroConfig?.src ? heroConfig.src : article.image;
  const objectPosition = heroConfig?.objectPosition || 'center 25%';
  const photoCredit = heroConfig?.credit || (heroConfig?.sourceName ? `Photo: ${heroConfig.sourceName}` : null);

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'Topper Stories':
        return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
      case 'Study Notes':
        return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
      case 'Exam Strategy':
      case 'PYQ Strategy':
        return 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';
      case 'Study Science':
        return 'text-purple-400 border-purple-500/30 bg-purple-500/10';
      case 'Educator Stories':
        return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
      case 'Inspiration':
      case 'Student Stories':
        return 'text-sky-400 border-sky-500/30 bg-sky-500/10';
      case 'Career & Research':
        return 'text-teal-400 border-teal-500/30 bg-teal-500/10';
      default:
        return 'text-cyan-300 border-cyan-500/30 bg-cyan-500/10';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Topper Stories':
        return Trophy;
      case 'Study Notes':
        return FileText;
      case 'Exam Strategy':
      case 'PYQ Strategy':
        return Target;
      case 'Study Science':
        return Brain;
      case 'Educator Stories':
        return GraduationCap;
      case 'Inspiration':
        return Sparkles;
      default:
        return Users;
    }
  };

  const IconComp = getCategoryIcon(article.category);
  const badgeStyle = getCategoryBadgeClass(article.category);

  if (featured) {
    return (
      <Link to={`/journal/${article.slug}`} className="block group">
        <div className="liquid-glass-card rounded-[24px] overflow-hidden grid md:grid-cols-2 hover:scale-[1.005] transition-all duration-300 border border-white/10 shadow-2xl">
          {/* Featured Image Box */}
          <div className="relative aspect-[16/10] md:aspect-auto overflow-hidden bg-slate-950">
            {!imgError ? (
              <img
                src={imageSrc}
                alt={article.title}
                onError={() => setImgError(true)}
                style={{ objectPosition }}
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#062B3D] via-[#0B3C53] to-[#124B68] p-8 flex flex-col justify-between">
                <IconComp className="w-10 h-10 text-cyan-400 opacity-60" />
                <div>
                  <span className="text-xs uppercase tracking-widest text-cyan-300 font-semibold">{article.category}</span>
                  <h4 className="text-lg font-serif text-white mt-1 line-clamp-2">{article.title}</h4>
                </div>
              </div>
            )}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <span className={`liquid-glass rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider border flex items-center gap-1.5 ${badgeStyle}`}>
                <IconComp className="w-3.5 h-3.5" />
                {article.category}
              </span>
              {article.verified && (
                <span className="liquid-glass rounded-full px-2.5 py-1 text-[10px] font-semibold text-emerald-400 border border-emerald-500/30 uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Verified
                </span>
              )}
            </div>

            {photoCredit && !imgError && (
              <span className="absolute bottom-2 right-3 text-[10px] text-white/70 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded font-sans">
                {photoCredit}
              </span>
            )}
          </div>

          {/* Featured Body */}
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 font-sans">
                <p className="text-xs uppercase tracking-widest text-cyan-400 font-semibold">Editor's Pick</p>
                {article.exam && (
                  <span className="text-[11px] text-muted-foreground px-2.5 py-0.5 rounded-md liquid-glass border border-white/10">
                    {article.exam} {article.examYear || ''}
                  </span>
                )}
              </div>
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
                {article.author.avatar ? (
                  <img
                    src={article.author.avatar}
                    alt={article.author.name}
                    className="w-6 h-6 rounded-full object-cover border border-white/20"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-[10px]">
                    {article.author.name[0]}
                  </div>
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
      <div className="liquid-glass-card rounded-[22px] overflow-hidden hover:scale-[1.01] transition-all duration-300 h-full flex flex-col border border-white/10 shadow-lg">
        {/* Card Image Container (Aspect Ratio 16:10) */}
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
          {!imgError ? (
            <img
              src={imageSrc}
              alt={article.title}
              onError={() => setImgError(true)}
              style={{ objectPosition }}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#062B3D] via-[#0B3C53] to-[#124B68] p-5 flex flex-col justify-between">
              <IconComp className="w-8 h-8 text-cyan-400 opacity-60" />
              <div>
                <span className="text-[10px] uppercase tracking-widest text-cyan-300 font-semibold">{article.category}</span>
                <h4 className="text-sm font-serif text-white mt-0.5 line-clamp-2">{article.title}</h4>
              </div>
            </div>
          )}

          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <span className={`liquid-glass rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider border flex items-center gap-1 ${badgeStyle}`}>
              <IconComp className="w-3 h-3" />
              {article.category}
            </span>
            {article.verified && (
              <span className="liquid-glass rounded-full px-2 py-0.5 text-[9px] font-semibold text-emerald-400 border border-emerald-500/30 uppercase tracking-wider flex items-center gap-0.5">
                <ShieldCheck className="w-2.5 h-2.5" /> Verified
              </span>
            )}
          </div>

          {photoCredit && !imgError && (
            <span className="absolute bottom-2 right-2 text-[9px] text-white/70 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded font-sans">
              {photoCredit}
            </span>
          )}
        </div>

        {/* Card Content */}
        <div className="p-5 flex flex-col flex-1 justify-between">
          <div>
            {article.exam && (
              <p className="text-[10px] text-cyan-400 uppercase tracking-widest font-semibold mb-1.5 font-sans">
                {article.exam} {article.examYear ? `• ${article.examYear}` : ''}
              </p>
            )}
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
