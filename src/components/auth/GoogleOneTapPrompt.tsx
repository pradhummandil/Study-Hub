// src/components/auth/GoogleOneTapPrompt.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GoogleGLogo = () => (
  <svg width="24" height="24" viewBox="0 0 48 48" className="shrink-0">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.6 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.5 6 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-4z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 19 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.5 6 29.6 4 24 4c-7.7 0-14.3 4.4-17.7 10.7z"/>
    <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.3 35.4 26.8 36 24 36c-5.3 0-9.6-3.1-11.3-7.5l-6.5 5C9.6 39.6 16.2 44 24 44z"/>
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.3 5.3C40.9 36.5 44 30.9 44 24c0-1.3-.1-2.7-.4-3.5z"/>
  </svg>
);

export const GoogleOneTapPrompt: React.FC = () => {
  const { user, signInWithGoogle } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if dismissed in this session
    const isDismissed = sessionStorage.getItem('google_one_tap_dismissed') === 'true';
    if (isDismissed) setDismissed(true);
  }, []);

  if (user || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('google_one_tap_dismissed', 'true');
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Google One Tap Sign in failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed top-4 right-4 z-[9999] max-w-sm w-full bg-[#1E1E1E] text-white rounded-2xl shadow-2xl border border-white/10 p-4 overflow-hidden font-sans"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <GoogleGLogo />
            <div>
              <h4 className="text-xs font-semibold text-white leading-tight">
                Sign in to <span className="text-amber-400">Study Hub</span> with Google
              </h4>
              <p className="text-[10px] text-gray-400">1-click instant login & sync</p>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close Google Login Prompt"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Body */}
        <div className="pt-3 space-y-2.5">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-gray-100 text-gray-900 text-xs font-semibold flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-[0.98] disabled:opacity-75"
          >
            {loading ? (
              <div className="w-4 h-4 rounded-full border-2 border-gray-900 border-t-transparent animate-spin" />
            ) : (
              <GoogleGLogo />
            )}
            <span>{loading ? 'Connecting Google Account...' : 'Continue with Google Account'}</span>
          </button>

          <div className="flex items-center justify-between text-[10px] text-gray-400 px-1 pt-1">
            <span className="flex items-center gap-1 text-amber-300/90 font-medium">
              <Sparkles className="w-3 h-3 text-amber-400" /> Fast & secure access
            </span>
            <button onClick={handleDismiss} className="hover:underline text-gray-400">
              Not now
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
