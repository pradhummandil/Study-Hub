// src/components/AuthLayout.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './ui/Logo';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-paper bg-paper-grain selection:bg-terracotta/20 selection:text-ink text-ink flex flex-col justify-between overflow-x-hidden relative">
      {/* Top Editorial Nav Strip */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-20">
        <Link to="/" className="flex items-center gap-2 group focus:outline-none">
          <Logo size="md" />
        </Link>

        <Link
          to="/"
          className="text-xs font-bold uppercase tracking-wider text-muted hover:text-ink transition-colors px-4 py-2 rounded-full border border-forest/10 hover:border-forest/20 bg-parchment/60 backdrop-blur-md"
        >
          ← Back to home
        </Link>
      </header>

      {/* Main Auth Container */}
      <div className="w-full flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8 flex items-center">
        {children}
      </div>

      {/* Editorial Footer */}
      <footer className="w-full py-4 text-center text-xs text-muted border-t border-forest/5">
        <span>© {new Date().getFullYear()} Study Hub — Scholarly & Intelligent Learning Space</span>
      </footer>
    </div>
  );
};
