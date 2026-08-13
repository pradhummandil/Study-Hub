import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Eye, EyeOff, User as UserIcon, Mail, Lock, Loader2, ArrowRight, Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { AuthLayout } from '../components/AuthLayout';
import { useAuth } from '../context/AuthContext';
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

export default function SignUp() {
  const navigate = useNavigate();
  const { signUp, signInWithGoogle } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const refParam = urlParams.get('ref');
      if (refParam) {
        localStorage.setItem('studyhub_ref_code', refParam);
      }
    } catch {}
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const { error: apiError } = await signUp({ email, password, fullName });
      if (apiError) {
        setError(mapAuthError(apiError.message));
      } else {
        try {
          const refCode = localStorage.getItem('studyhub_ref_code');
          if (refCode) {
            console.log('New user signed up via referral code:', refCode);
          }
        } catch {}

        navigate('/setup', { replace: true });
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
        <title>Sign Up — Study Hub</title>
        <meta name="description" content="Create a free Study Hub account to access personalized study roadmaps and AI tutoring." />
      </Helmet>

      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* LEFT COLUMN: 48% (6 cols on lg) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-6 flex flex-col justify-center space-y-6 max-w-lg mx-auto lg:mx-0 w-full"
        >
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-terracotta/10 text-terracotta border border-terracotta/20 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Start Free Today
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-ink font-normal tracking-tight leading-tight">
              Built for the ambitious.
            </h1>
            <p className="text-base text-muted">
              Create your intelligent workspace in seconds. Free forever.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-error/10 border border-error/20 text-error text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted block">
                Full Name
              </label>
              <div className="relative flex items-center rounded-xl bg-parchment/60 border border-forest/10 focus-within:border-scholar focus-within:ring-2 focus-within:ring-scholar/15 transition-all">
                <UserIcon className="w-4 h-4 text-muted absolute left-4 pointer-events-none" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Aarav Sharma"
                  className="w-full bg-transparent pl-11 pr-4 py-3 text-sm text-forest placeholder:text-muted/60 focus:outline-none font-medium"
                />
              </div>
            </div>

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

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted block">
                Password
              </label>
              <div className="relative flex items-center rounded-xl bg-parchment/60 border border-forest/10 focus-within:border-scholar focus-within:ring-2 focus-within:ring-scholar/15 transition-all">
                <Lock className="w-4 h-4 text-muted absolute left-4 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl bg-forest hover:bg-scholar text-paper font-bold text-sm transition-all shadow-card hover:shadow-float flex items-center justify-center gap-2 group disabled:opacity-75"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-paper" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-forest/10" />
            <span className="px-4 text-[10px] font-bold text-muted uppercase tracking-widest">or</span>
            <div className="flex-1 border-t border-forest/10" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full py-3 px-6 rounded-xl bg-paper hover:bg-parchment/80 border border-forest/15 text-ink font-semibold text-xs flex items-center justify-center gap-3 transition-colors disabled:opacity-75 shadow-sm"
          >
            {googleLoading ? <Loader2 className="w-4 h-4 animate-spin text-ink" /> : <GoogleIcon />}
            <span>Continue with Google</span>
          </button>

          <p className="text-xs text-muted text-center pt-2">
            Already have an account?{' '}
            <Link to="/login" className="text-terracotta font-bold hover:underline">
              Log in instead
            </Link>
          </p>
        </motion.div>

        {/* RIGHT COLUMN: 52% (6 cols on lg) IMMERSIVE ARTWORK */}
        <motion.div
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-6 relative hidden lg:block rounded-3xl overflow-hidden bg-forest text-paper p-8 lg:p-12 border border-forest/20 shadow-deep min-h-[580px] flex flex-col justify-between"
        >
          <div className="relative z-10 space-y-4">
            <span className="px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-gold/20 text-gold border border-gold/30 inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Free Student Platform
            </span>
            <h2 className="font-serif text-3xl xl:text-4xl text-paper font-normal leading-tight">
              Join thousands of students mastering GATE, JEE & NEET.
            </h2>
          </div>

          <div className="relative z-10 py-6 my-auto space-y-4">
            <div className="p-4 rounded-2xl bg-scholar/30 border border-sage/20 space-y-2 backdrop-blur-md">
              <div className="flex items-center gap-2 text-gold font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" /> Comprehensive PYQ Database
              </div>
              <p className="text-xs text-sage">Over 10,000+ detailed past exam questions with instant step-by-step solutions.</p>
            </div>

            <div className="p-4 rounded-2xl bg-scholar/30 border border-sage/20 space-y-2 backdrop-blur-md">
              <div className="flex items-center gap-2 text-gold font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" /> AI Tutor & Custom Roadmaps
              </div>
              <p className="text-xs text-sage">Dynamic study guidance tailored to your target exam date and weak areas.</p>
            </div>
          </div>

          <div className="relative z-10 pt-4 border-t border-sage/20 flex items-center justify-between text-xs text-sage">
            <span>Scholar Green & Forest Identity</span>
            <span className="text-gold font-semibold">Study Hub 3.0</span>
          </div>
        </motion.div>
      </div>
    </AuthLayout>
  );
}
