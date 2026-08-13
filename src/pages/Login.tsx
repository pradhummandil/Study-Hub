import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Eye, EyeOff, Mail, Lock, Loader2, ArrowRight, Sparkles, BookOpen, CheckCircle2 } from 'lucide-react';
import { AuthLayout } from '../components/AuthLayout';
import { useAuth } from '../context/AuthContext';
import { getStudentProfile } from '../lib/studentCoreApi';
import { motion } from 'framer-motion';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.6 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.5 6 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-4z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 19 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.5 6 29.6 4 24 4c-7.7 0-14.3 4.4-17.7 10.7z"/>
    <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.3 35.4 26.8 36 24 36c-5.3 0-9.6-3.1-11.3-7.5l-6.5 5C9.6 39.6 16.2 44 24 44z"/>
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.3 5.3C40.9 36.5 44 30.9 44 24c0-1.3-.1-2.7-.4-3.5z"/>
  </svg>
);

function mapAuthError(msg: string): string {
  const lower = msg.toLowerCase();
  if (lower.includes('user already registered') || lower.includes('email already in use') || lower.includes('already exists')) {
    return 'An account with this email already exists — try logging in instead.';
  }
  if (lower.includes('invalid login credentials') || lower.includes('invalid credentials')) {
    return 'Incorrect email or password. Please check your details and try again.';
  }
  if (lower.includes('password should be at least')) {
    return 'Password must be at least 6 characters long.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Please check your inbox to confirm your email before logging in.';
  }
  return msg;
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signInWithGoogle } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fromPath = (location.state as any)?.from?.pathname;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const { error: apiError } = await signIn({ email, password });
      if (apiError) {
        setError(mapAuthError(apiError.message));
      } else {
        const profile = await getStudentProfile();
        if (!profile || !profile.onboarding_completed) {
          navigate('/setup', { replace: true });
        } else if (fromPath) {
          navigate(fromPath, { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      }
    } catch (err: any) {
      setError(mapAuthError(err.message || 'An unexpected error occurred.'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      const { error: apiError } = await signInWithGoogle();
      if (apiError) {
        setError(mapAuthError(apiError.message));
      }
    } catch (err: any) {
      setError(mapAuthError(err.message || 'Failed to initiate Google sign in.'));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Helmet>
        <title>Log In — Study Hub</title>
        <meta name="description" content="Log in to your Study Hub intelligent study workspace." />
      </Helmet>

      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* LEFT COLUMN: 48% (5 cols on lg, or 6 of 12) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-6 flex flex-col justify-center space-y-6 max-w-lg mx-auto lg:mx-0 w-full"
        >
          {/* Eyebrow badge */}
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-terracotta/10 text-terracotta border border-terracotta/20 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Scholarly Workspace
            </span>
          </div>

          {/* Heading Mask Reveal */}
          <div className="space-y-2">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="font-serif text-4xl sm:text-5xl lg:text-6xl text-ink font-normal tracking-tight leading-tight"
            >
              Welcome back.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-base text-muted"
            >
              Pick up right where you left off in your study journey.
            </motion.p>
          </div>

          {/* Error Banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-xl bg-error/10 border border-error/20 text-error text-xs font-semibold"
            >
              {error}
            </motion.div>
          )}

          {/* FORM CONTAINER */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted block">
                Email Address
              </label>
              <div className="relative flex items-center rounded-xl bg-parchment/60 border border-forest/10 focus-within:border-scholar focus-within:ring-2 focus-within:ring-scholar/15 transition-all">
                <Mail className="w-4 h-4 text-muted absolute left-4 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@studyhub.edu"
                  className="w-full bg-transparent pl-11 pr-4 py-3 text-sm text-forest placeholder:text-muted/60 focus:outline-none font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-muted block">
                  Password
                </label>
                <Link
                  to="/reset-password"
                  className="text-xs font-semibold text-terracotta hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative flex items-center rounded-xl bg-parchment/60 border border-forest/10 focus-within:border-scholar focus-within:ring-2 focus-within:ring-scholar/15 transition-all">
                <Lock className="w-4 h-4 text-muted absolute left-4 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-transparent pl-11 pr-11 py-3 text-sm text-forest placeholder:text-muted/60 focus:outline-none font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 p-1.5 text-muted hover:text-ink transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Primary Submit Button: Deep Forest */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl bg-forest hover:bg-scholar text-paper font-bold text-sm transition-all shadow-card hover:shadow-float flex items-center justify-center gap-2 group disabled:opacity-75"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-paper" />
              ) : (
                <>
                  <span>Log into Study Hub</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </motion.form>

          {/* Divider */}
          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-forest/10" />
            <span className="px-4 text-[10px] font-bold text-muted uppercase tracking-widest">or</span>
            <div className="flex-1 border-t border-forest/10" />
          </div>

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full py-3 px-6 rounded-xl bg-paper hover:bg-parchment/80 border border-forest/15 text-ink font-semibold text-xs flex items-center justify-center gap-3 transition-colors disabled:opacity-75 shadow-sm"
          >
            {googleLoading ? <Loader2 className="w-4 h-4 animate-spin text-ink" /> : <GoogleIcon />}
            <span>Continue with Google</span>
          </button>

          {/* Footer link */}
          <p className="text-xs text-muted text-center pt-2">
            New to Study Hub?{' '}
            <Link to="/signup" className="text-terracotta font-bold hover:underline">
              Create a student account
            </Link>
          </p>
        </motion.div>

        {/* RIGHT COLUMN: 52% (6 cols on lg) IMMERSIVE EDUCATIONAL VISUAL */}
        <motion.div
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-6 relative hidden lg:block rounded-3xl overflow-hidden bg-forest text-paper p-8 lg:p-12 border border-forest/20 shadow-deep min-h-[580px] flex flex-col justify-between"
        >
          {/* Subtle moving background radial glow */}
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-20 -right-20 w-96 h-96 bg-terracotta/20 rounded-full blur-[100px] pointer-events-none"
          />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute -bottom-20 -left-20 w-96 h-96 bg-scholar/40 rounded-full blur-[100px] pointer-events-none"
          />

          {/* Header metadata inside right card */}
          <div className="relative z-10 space-y-4">
            <span className="px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-gold/20 text-gold border border-gold/30 inline-flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> Intelligent Learning Ecosystem
            </span>
            <h2 className="font-serif text-3xl xl:text-4xl text-paper font-normal leading-tight">
              "Focus is not about doing more. It is about removing distraction."
            </h2>
          </div>

          {/* Educational Visual Artwork Illustration */}
          <div className="relative z-10 py-6 my-auto flex justify-center">
            <div className="relative w-full max-w-sm aspect-square rounded-2xl bg-scholar/30 border border-sage/20 p-6 flex flex-col justify-center items-center gap-4 text-center backdrop-blur-md shadow-float">
              {/* Floating Orbit Nodes */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-4 rounded-full border border-dashed border-sage/40 pointer-events-none"
              />

              <div className="w-16 h-16 rounded-2xl bg-terracotta/20 text-terracotta border border-terracotta/30 flex items-center justify-center text-2xl font-serif font-bold shadow-lg">
                SH
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-serif text-paper font-normal">Personalized GATE / JEE / NEET Hub</h3>
                <p className="text-xs text-sage">Lectures • PYQs • Flashcards • Study AI</p>
              </div>

              {/* Status Chips */}
              <div className="flex flex-wrap gap-2 justify-center pt-2">
                <span className="px-3 py-1 rounded-full bg-forest/80 border border-sage/30 text-[10px] font-semibold text-paper flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-gold" /> Adaptive Revision
                </span>
                <span className="px-3 py-1 rounded-full bg-forest/80 border border-sage/30 text-[10px] font-semibold text-paper flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-gold" /> Real Time AI Tutor
                </span>
              </div>
            </div>
          </div>

          {/* Footer inside right column */}
          <div className="relative z-10 pt-4 border-t border-sage/20 flex items-center justify-between text-xs text-sage">
            <span>Synchronized Learning Space</span>
            <span className="text-gold font-semibold">Study Hub 3.0</span>
          </div>
        </motion.div>
      </div>
    </AuthLayout>
  );
}
