import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'gradient' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  className?: string;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}: ButtonProps) {
  const sizeClasses =
    size === 'sm'
      ? 'px-4 py-2 text-xs'
      : size === 'lg'
      ? 'px-8 py-4 text-base'
      : 'px-6 py-3 text-sm';

  let variantClass = '';

  switch (variant) {
    case 'gradient':
      variantClass = 'gradient-cta rounded-full font-medium';
      break;
    case 'secondary':
      variantClass = 'liquid-glass rounded-full text-foreground hover:scale-[1.02] transition-transform font-medium';
      break;
    case 'ghost':
      variantClass = 'text-muted-foreground hover:text-foreground transition-colors font-medium';
      break;
    case 'danger':
      variantClass = 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 rounded-full font-medium transition-colors';
      break;
    case 'primary':
    default:
      variantClass = 'liquid-glass rounded-full text-foreground hover:scale-[1.02] transition-transform font-medium border border-white/20';
      break;
  }

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 cursor-pointer font-sans tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${sizeClasses} ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
