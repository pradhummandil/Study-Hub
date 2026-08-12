import type { ReactNode } from 'react';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  gradientText?: string;
  description?: string;
  actions?: ReactNode;
  badge?: ReactNode;
  className?: string;
}

export function PageHeader({
  eyebrow,
  title,
  gradientText,
  description,
  actions,
  badge,
  className = '',
}: PageHeaderProps) {
  return (
    <div className={`mb-8 sm:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 ${className}`}>
      <div className="max-w-3xl">
        {eyebrow && (
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3 font-semibold">
            {eyebrow}
          </p>
        )}
        {badge && <div className="mb-3">{badge}</div>}
        <h1
          className="text-4xl sm:text-5xl lg:text-6xl font-normal leading-[0.98] tracking-[-1.5px] text-foreground"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          {title}{' '}
          {gradientText && (
            <span className="text-gradient-accent">{gradientText}</span>
          )}
        </h1>
        {description && (
          <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed font-sans">
            {description}
          </p>
        )}
      </div>

      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </div>
  );
}
