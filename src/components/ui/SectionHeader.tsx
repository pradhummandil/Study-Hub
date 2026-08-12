import type { ReactNode } from 'react';

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  gradientText?: string;
  description?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
  actions?: ReactNode;
}

export function SectionHeader({
  eyebrow,
  title,
  gradientText,
  description,
  align = 'left',
  className = '',
  actions,
}: SectionHeaderProps) {
  const alignmentClass =
    align === 'center'
      ? 'text-center items-center mx-auto'
      : align === 'right'
      ? 'text-right items-end ml-auto'
      : 'text-left items-start';

  return (
    <div className={`mb-8 flex flex-col ${alignmentClass} ${className}`}>
      {eyebrow && (
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3 font-semibold">
          {eyebrow}
        </p>
      )}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between w-full gap-4">
        <div className="max-w-2xl">
          <h2
            className="text-3xl sm:text-4xl font-normal leading-[1.02] tracking-[-1.2px] text-foreground"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            {title}{' '}
            {gradientText && (
              <span className="text-gradient-accent">{gradientText}</span>
            )}
          </h2>
          {description && (
            <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed font-sans">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
