import type { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  maxWidth?: '5xl' | '6xl' | '7xl' | 'full';
  className?: string;
}

export function PageContainer({
  children,
  maxWidth = '6xl',
  className = '',
}: PageContainerProps) {
  const maxWidthClass =
    maxWidth === '5xl'
      ? 'max-w-5xl'
      : maxWidth === '6xl'
      ? 'max-w-6xl'
      : maxWidth === '7xl'
      ? 'max-w-7xl'
      : 'w-full';

  return (
    <main className={`px-4 sm:px-6 lg:px-8 py-8 sm:py-12 ${maxWidthClass} mx-auto ${className}`}>
      {children}
    </main>
  );
}
