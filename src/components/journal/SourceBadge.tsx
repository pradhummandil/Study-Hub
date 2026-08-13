import { ExternalLink, ShieldCheck, HelpCircle } from 'lucide-react';

interface SourceBadgeProps {
  sourceNames?: string[];
  sourceUrls?: string[];
  sourceCheckedAt?: string;
  isResearched?: boolean;
}

export function SourceBadge({
  sourceNames = [],
  sourceUrls = [],
  sourceCheckedAt,
  isResearched = true,
}: SourceBadgeProps) {
  if ((!sourceNames || sourceNames.length === 0) && !isResearched) {
    return null;
  }

  return (
    <div className="my-8 p-6 rounded-2xl liquid-glass border border-white/10 space-y-4 font-sans">
      {/* Researched Badge Tooltip Row */}
      {isResearched && (
        <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold tracking-wider uppercase">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>RESEARCHED</span>
          </div>
          <div className="group relative flex items-center gap-1.5 text-xs text-muted-foreground cursor-help">
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span className="underline decoration-dashed decoration-cyan-500/40">Built from publicly available sources</span>
            {/* Tooltip Content */}
            <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block w-64 p-3 rounded-xl liquid-glass border border-white/20 text-[11px] text-slate-200 shadow-xl z-30 leading-relaxed font-sans">
              Every research-backed article is written as original Study Hub editorial content built strictly from verified public interviews, official exam gazettes, and recognized educational publications.
            </div>
          </div>
        </div>
      )}

      {/* Sources List */}
      {sourceNames && sourceNames.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
              Verified Sources & Reference Materials
            </p>
            {sourceCheckedAt && (
              <span className="text-[11px] text-muted-foreground">
                Verified {sourceCheckedAt}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {sourceNames.map((name, idx) => {
              const url = sourceUrls[idx] || '#';
              return (
                <a
                  key={name + idx}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg liquid-glass border border-white/10 text-xs text-cyan-300 hover:text-white hover:border-cyan-400/50 transition-all group"
                >
                  <span>{name}</span>
                  <ExternalLink className="w-3 h-3 text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
