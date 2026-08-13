import React from 'react';
import { Navbar } from '../Navbar';
import { Footer } from './Footer';
import { SocialProofBar } from '../SocialProofBar';
import { ErrorBoundary } from '../ErrorBoundary';

interface AppPageShellProps {
  children: React.ReactNode;
  variant?: 'default' | 'reading' | 'article' | 'full';
  showSocialProof?: boolean;
  className?: string;
}

export const AppPageShell: React.FC<AppPageShellProps> = ({
  children,
  variant = 'default',
  showSocialProof = true,
  className = '',
}) => {
  // Container max-width selection based on page variant
  const getMaxWidthClass = () => {
    switch (variant) {
      case 'article':
        return 'max-w-3xl'; // ~768px article reading width
      case 'reading':
        return 'max-w-6xl'; // ~1152px comfortable reading width
      case 'full':
        return 'max-w-full px-0';
      case 'default':
      default:
        return 'max-w-7xl'; // ~1440px desktop shell
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-paper text-ink flex flex-col justify-between overflow-x-hidden selection:bg-terracotta/20 selection:text-ink">
      <div className="w-full flex-1 flex flex-col">
        <Navbar />
        {showSocialProof && <SocialProofBar />}

        <main className={`w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 flex-1 ${getMaxWidthClass()} ${className}`}>
          <ErrorBoundary name="Page Shell">
            {children}
          </ErrorBoundary>
        </main>
      </div>

      <Footer />
    </div>
  );
};
