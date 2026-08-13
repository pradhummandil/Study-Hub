import { useState } from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: 'h-7 sm:h-8',
    md: 'h-9 sm:h-10 md:h-11',
    lg: 'h-12 sm:h-14',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
  };

  return (
    <Link
      to="/"
      aria-label="Study Hub home"
      className="transition-opacity hover:opacity-90 flex items-center gap-2.5 shrink-0 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 rounded-lg py-1"
    >
      {/* Brand Icon / Image */}
      {!imgError ? (
        <img
          src="/images/logo-transparent.png"
          alt="Study Hub"
          onError={() => setImgError(true)}
          className={`${sizeClasses[size]} w-auto object-contain brightness-0 invert drop-shadow-[0_0_10px_rgba(92,225,230,0.4)]`}
        />
      ) : (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 to-indigo-500 flex items-center justify-center font-bold text-slate-950 text-sm shadow-md">
          SH
        </div>
      )}

      {/* Brand Text Header */}
      {showText && (
        <span
          className={`${textSizes[size]} font-normal tracking-tight text-white flex items-center leading-none`}
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Study<span className="text-cyan-400 font-sans font-bold text-sm sm:text-base ml-1 tracking-wider uppercase">Hub</span>
        </span>
      )}
    </Link>
  );
}
