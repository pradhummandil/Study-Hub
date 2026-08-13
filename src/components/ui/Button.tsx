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
    case 'primary':
      variantClass = 'gradient-cta rounded-full font-semibold';
      break;
    case 'secondary':
      variantClass = 'bg-[#FCFBF8] text-[#172033] border border-[#10233F]/12 hover:border-[#1F5F8B]/30 hover:bg-[#EAF2F7] rounded-full transition-all font-medium shadow-sm';
      break;
    case 'ghost':
      variantClass = 'text-[#627083] hover:text-[#172033] transition-colors font-medium';
      break;
    case 'danger':
      variantClass = 'bg-[#C95C5C]/10 text-[#C95C5C] border border-[#C95C5C]/20 hover:bg-[#C95C5C]/20 rounded-full font-medium transition-colors';
      break;
  }

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 cursor-pointer font-sans tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F5F8B]/40 ${sizeClasses} ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

