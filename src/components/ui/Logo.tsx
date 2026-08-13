import { useState } from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark' | 'auto';
  showText?: boolean;
}

export function Logo({ size = 'md', variant = 'auto', className = '' }: LogoProps) {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: 'h-8 sm:h-9',
    md: 'h-10 sm:h-11 md:h-12',
    lg: 'h-12 sm:h-14 md:h-16',
  };

  const logoSrc = variant === 'dark' ? '/images/logo-light.png' : '/images/logo-trimmed.png';

  return (
    <Link
      to="/"
      aria-label="Study Hub home"
      className={`transition-opacity hover:opacity-90 inline-flex items-center shrink-0 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-scholar/40 rounded-lg py-1 ${className}`}
    >
      {!imgError ? (
        <img
          src={logoSrc}
          alt="Study Hub"
          onError={() => setImgError(true)}
          className={`${sizeClasses[size]} w-auto object-contain transition-transform duration-200 hover:scale-[1.02]`}
        />
      ) : (
        <div className="flex items-center gap-2 font-serif text-xl text-forest font-bold tracking-tight">
          <span className="w-8 h-8 rounded-lg bg-scholar text-paper flex items-center justify-center font-bold text-sm shadow-sm">
            SH
          </span>
          <span>Study Hub</span>
        </div>
      )}
    </Link>
  );
}

