import type { ReactNode, HTMLAttributes } from 'react';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'card' | 'interactive' | 'subtle';
  className?: string;
}

export function GlassCard({
  children,
  variant = 'card',
  className = '',
  ...props
}: GlassCardProps) {
  const baseClass =
    variant === 'interactive'
      ? 'liquid-glass-card rounded-2xl p-6 sm:p-8 hover:scale-[1.01] transition-transform duration-300 cursor-pointer'
      : variant === 'subtle'
      ? 'liquid-glass rounded-2xl p-6 sm:p-8'
      : 'liquid-glass-card rounded-2xl p-6 sm:p-8';

  return (
    <div className={`${baseClass} ${className}`} {...props}>
      {children}
    </div>
  );
}
