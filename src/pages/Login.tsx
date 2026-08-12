import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import { AuthLayout } from '../components/AuthLayout';
import { useAuth } from '../context/AuthContext';

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
  const { signIn, signInWithGoogle } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        navigate('/dashboard');
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
        <meta name="description" content="Log in to your Study Hub account." />
      </Helmet>

      <div className="text-center mb-8 max-w-lg mx-auto">
        <h1
          className="text-5xl md:text-6xl text-white mb-4 tracking-tight font-normal leading-tight"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Welcome back.
        </h1>
        <p className="text-white/70 text-sm">
          Pick up right where you left off.
        </p>
      </div>

      <div className="liquid-glass rounded-3xl p-8 max-w-md w-full shadow-2xl">
        {error && (
          <div className="liquid-glass rounded-xl px-4 py-3 text-red-300 text-sm mb-6 border border-red-500/20 text-center animate-fade-rise">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email Field */}
          <div className="liquid-glass rounded-full pl-6 pr-4 py-3 flex items-center gap-3 focus-within:ring-2 focus-within:ring-white/40 transition-all">
            <Mail className="w-5 h-5 text-white/40 shrink-0" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="bg-transparent text-white placeholder:text-white/40 text-base focus:outline-none w-full"
            />
          </div>

          {/* Password Field */}
          <div className="liquid-glass rounded-full pl-6 pr-4 py-3 flex items-center gap-3 focus-within:ring-2 focus-within:ring-white/40 transition-all">
            <Lock className="w-5 h-5 text-white/40 shrink-0" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="bg-transparent text-white placeholder:text-white/40 text-base focus:outline-none w-full"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-white/40 hover:text-white transition-colors focus:outline-none p-1 shrink-0"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Forgot Password Link */}
          <div className="text-right -mt-1">
            <Link
              to="/reset-password"
              className="text-white/60 hover:text-white text-xs transition-colors focus:outline-none"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="bg-white text-black rounded-full py-3.5 font-medium w-full hover:bg-white/90 transition-colors focus:outline-none focus:ring-2 focus:ring-white/40 disabled:opacity-75 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log in'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-white/10" />
          <span className="px-4 text-xs text-white/40 uppercase tracking-widest">or</span>
          <div className="flex-1 border-t border-white/10" />
        </div>

        {/* Google Sign In */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="liquid-glass rounded-full py-3 w-full flex items-center justify-center gap-3 text-white text-sm font-medium hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-white/40 disabled:opacity-75"
        >
          {googleLoading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <GoogleIcon />}
          <span>Continue with Google</span>
        </button>

        {/* Footer Link */}
        <p className="text-white/60 text-sm text-center mt-6">
          New here?{' '}
          <Link to="/signup" className="text-white underline hover:text-white/90 transition-colors font-medium">
            Create an account
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
