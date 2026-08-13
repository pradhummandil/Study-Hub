// src/components/auth/RequireAuth.tsx
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Sparkles, UserPlus, LogIn, ArrowRight } from 'lucide-react';

interface RequireAuthProps {
  children: React.ReactNode;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Auth Loading State — Premium Lightweight Loader
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-scholar/10 border border-scholar/30 flex items-center justify-center mb-4">
          <Sparkles className="w-6 h-6 text-scholar animate-spin" />
        </div>
        <h2 className="text-xl font-bold text-ink tracking-tight">Study Hub</h2>
        <p className="text-xs text-ink/70 mt-1">Preparing your study space...</p>
        <div className="w-32 h-1 bg-parchment rounded-full mt-4 overflow-hidden">
          <div className="w-full h-full bg-scholar animate-pulse" />
        </div>
      </div>
    );
  }

  // If user is authenticated, render protected content directly
  if (user) {
    return <>{children}</>;
  }

  // Logged-out Auth Gate Screen
  return (
    <div className="min-h-[80vh] py-16 px-6 max-w-2xl mx-auto flex flex-col items-center justify-center text-center">
      <div className="rounded-3xl p-8 sm:p-12 border border-forest/10 bg-paper shadow-card relative overflow-hidden w-full">
        {/* Glow backdrop */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-scholar/10 blur-3xl rounded-full pointer-events-none" />

        <div className="w-16 h-16 rounded-2xl bg-scholar/10 border border-scholar/20 flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8 text-scholar" />
        </div>

        <span className="text-xs uppercase tracking-widest text-scholar font-semibold bg-scholar/10 px-4 py-1.5 rounded-full inline-block mb-3 border border-scholar/20">
          Personalized Education Platform
        </span>

        <h1
          className="text-3xl sm:text-4xl font-normal text-ink tracking-tight mb-3"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Your personal study dashboard is waiting.
        </h1>

        <p className="text-sm text-ink/70 max-w-md mx-auto leading-relaxed mb-8">
          Sign in to save your progress, build your roadmap, practice official PYQs, and get personalized study recommendations tailored to your goals.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/login"
            state={{ from: location }}
            className="w-full sm:w-auto bg-scholar hover:bg-forest px-8 py-3 rounded-full text-xs text-paper font-bold transition-all flex items-center justify-center gap-2 shadow-card"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </Link>

          <Link
            to="/signup"
            state={{ from: location }}
            className="w-full sm:w-auto bg-paper px-8 py-3 rounded-full text-xs text-ink font-semibold border border-forest/20 hover:bg-parchment transition-all flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4 text-scholar" />
            <span>Create Free Account</span>
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-forest/10 flex items-center justify-center gap-6 text-xs text-ink/70">
          <Link to="/exams" className="hover:text-scholar transition-colors flex items-center gap-1">
            Explore Exams <ArrowRight className="w-3 h-3" />
          </Link>
          <span>•</span>
          <Link to="/studio" className="hover:text-scholar transition-colors">
            Learning Library
          </Link>
        </div>
      </div>
    </div>
  );
};

