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
      ? 'bg-[#FCFBF8] border border-[#10233F]/08 shadow-[0_14px_40px_rgba(16,35,63,0.08)] rounded-2xl p-6 sm:p-8 hover:-translate-y-1 transition-all duration-300 cursor-pointer'
      : variant === 'subtle'
      ? 'bg-[#EAF2F7] border border-[#10233F]/06 rounded-2xl p-6 sm:p-8'
      : 'bg-[#FCFBF8] border border-[#10233F]/08 shadow-[0_14px_40px_rgba(16,35,63,0.08)] rounded-2xl p-6 sm:p-8';

  return (
    <div className={`${baseClass} ${className}`} {...props}>
      {children}
    </div>
  );
}

