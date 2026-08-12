import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Flame, Clock, CheckCircle2, LogOut, Edit3, Lock, Check, X, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getFocusData, type FocusData } from '../lib/focusStorage';
import { supabase } from '../lib/supabase';

export default function Profile() {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const [focusData, setFocusData] = useState<FocusData>(() => getFocusData());

  // Name editing state
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [nameSaving, setNameSaving] = useState(false);
  const [nameMessage, setNameMessage] = useState<string | null>(null);

  // Password editing state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Account deletion modal state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Only redirect once loading is complete AND user is confirmed to be null
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true });
    }
  }, [user, loading, navigate]);

  // Load fresh focus data
  useEffect(() => {
    setFocusData(getFocusData());
  }, []);

  // Show loading skeleton while AuthContext initializes
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-3 h-3 rounded-full bg-muted-foreground skeleton-pulse" />
      </div>
    );
  }

  // Prevent flash of content if user is null before redirect effect fires
  if (!user) {
    return null;
  }

  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;
  const fullName = user.user_metadata?.full_name || 'Student';
  const initialLetter = (fullName[0] || user.email?.[0] || 'U').toUpperCase();

  const handleStartEditName = () => {
    setNameInput(fullName);
    setIsEditingName(true);
    setNameMessage(null);
  };

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    setNameSaving(true);
    setNameMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: nameInput.trim() },
      });
      if (error) {
        setNameMessage(error.message);
      } else {
        setIsEditingName(false);
      }
    } catch (err: any) {
      setNameMessage(err.message || 'Failed to update name');
    } finally {
      setNameSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setPasswordSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setPasswordMessage({ type: 'error', text: error.message });
      } else {
        setPasswordMessage({ type: 'success', text: 'Password updated successfully!' });
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setShowPasswordForm(false), 2000);
      }
    } catch (err: any) {
      setPasswordMessage({ type: 'error', text: err.message || 'Failed to update password.' });
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <>
      <Helmet>
        <title>Profile — Study Hub</title>
        <meta name="description" content="Manage your Study Hub profile and account settings." />
      </Helmet>

      {/* Hero Strip */}
      <div className="px-6 pt-12">
        <div className="liquid-glass-card rounded-2xl p-8 max-w-3xl mx-auto relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={fullName}
              className="w-20 h-20 rounded-full object-cover border-2 border-white/10 shrink-0 shadow-lg"
            />
          ) : (
            <div className="w-20 h-20 rounded-full gradient-cta flex items-center justify-center text-3xl font-semibold text-black select-none shrink-0 border-2 border-white/10 shadow-lg">
              {initialLetter}
            </div>
          )}

          {/* User Info */}
          <div className="flex-1 text-center sm:text-left">
            {isEditingName ? (
              <div className="flex flex-col gap-2 max-w-sm">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="bg-white/5 border border-white/20 rounded-xl px-3 py-1.5 text-base text-foreground focus:outline-none focus:border-white/40 w-full"
                    placeholder="Enter your name"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={nameSaving}
                    className="liquid-glass p-2 rounded-xl text-green-400 hover:text-green-300 transition-colors"
                    aria-label="Save name"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsEditingName(false)}
                    className="liquid-glass p-2 rounded-xl text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Cancel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {nameMessage && <p className="text-xs text-red-400">{nameMessage}</p>}
              </div>
            ) : (
              <div>
                <h1
                  className="text-3xl font-normal text-foreground tracking-[-0.5px]"
                  style={{ fontFamily: "'Instrument Serif', serif" }}
                >
                  {fullName}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
              </div>
            )}
          </div>

          {/* Edit Profile Button */}
          {!isEditingName && (
            <button
              onClick={handleStartEditName}
              className="liquid-glass rounded-full px-4 py-2 text-xs text-foreground hover:scale-105 transition-transform flex items-center gap-1.5 sm:absolute sm:top-8 sm:right-8"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit profile
            </button>
          )}
        </div>
      </div>

      {/* Stats Row — Pulled from localStorage Focus Data */}
      <div className="px-6 mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {/* Streak Stat */}
          <div className="liquid-glass-card rounded-2xl p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Current Streak</span>
              <Flame
                className={`w-5 h-5 ${
                  focusData.currentStreak >= 3 ? 'text-[hsl(38,92%,68%)] fill-[hsl(38,92%,68%)]/20' : 'text-muted-foreground/60'
                }`}
              />
            </div>
            <p className="text-3xl sm:text-4xl font-normal text-foreground" style={{ fontFamily: "'Instrument Serif', serif" }}>
              {focusData.currentStreak} <span className="text-sm font-sans text-muted-foreground">days</span>
            </p>
          </div>

          {/* Total Sessions */}
          <div className="liquid-glass-card rounded-2xl p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Focus Blocks</span>
              <CheckCircle2 className="w-5 h-5 text-muted-foreground/60" />
            </div>
            <p className="text-3xl sm:text-4xl font-normal text-foreground" style={{ fontFamily: "'Instrument Serif', serif" }}>
              {focusData.totalSessions} <span className="text-sm font-sans text-muted-foreground">sessions</span>
            </p>
          </div>

          {/* Hours Focused */}
          <div className="liquid-glass-card rounded-2xl p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Time Focused</span>
              <Clock className="w-5 h-5 text-muted-foreground/60" />
            </div>
            <p className="text-3xl sm:text-4xl font-normal text-foreground" style={{ fontFamily: "'Instrument Serif', serif" }}>
              {(focusData.totalMinutes / 60).toFixed(1)} <span className="text-sm font-sans text-muted-foreground">hrs</span>
            </p>
          </div>
        </div>
      </div>

      {/* Account Settings Section */}
      <div className="px-6 mt-8 mb-24">
        <div className="liquid-glass-card rounded-2xl p-6 sm:p-8 max-w-3xl mx-auto">
          <h2 className="text-xl font-normal text-foreground mb-6" style={{ fontFamily: "'Instrument Serif', serif" }}>
            Account Settings
          </h2>

          {/* Password Change Option */}
          <div className="mb-6">
            {!showPasswordForm ? (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="liquid-glass rounded-full px-5 py-2.5 text-xs text-foreground font-medium hover:bg-white/10 transition-colors inline-flex items-center gap-2"
              >
                <Lock className="w-3.5 h-3.5" />
                Change password
              </button>
            ) : (
              <form onSubmit={handleUpdatePassword} className="liquid-glass rounded-2xl p-6 flex flex-col gap-4 max-w-md">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground">Update Password</h3>
                  <button
                    type="button"
                    onClick={() => setShowPasswordForm(false)}
                    className="text-muted-foreground hover:text-foreground p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {passwordMessage && (
                  <p className={`text-xs ${passwordMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                    {passwordMessage.text}
                  </p>
                )}

                <input
                  type="password"
                  required
                  placeholder="New password (min 6 chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-white/30"
                />

                <input
                  type="password"
                  required
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-white/30"
                />

                <div className="flex justify-end gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setShowPasswordForm(false)}
                    className="px-4 py-2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={passwordSaving}
                    className="gradient-cta rounded-full px-5 py-2 text-xs font-medium"
                  >
                    {passwordSaving ? 'Saving...' : 'Save Password'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Log Out */}
          <div className="pt-2">
            <button
              onClick={handleSignOut}
              className="text-red-300 hover:text-red-200 text-sm font-medium inline-flex items-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Log out
            </button>
          </div>

          {/* Divider & Delete Account */}
          <div className="border-t border-white/10 mt-8 pt-6 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Account Status: Active</span>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-xs text-muted-foreground hover:text-red-400 transition-colors"
            >
              Delete account
            </button>
          </div>
        </div>
      </div>

      {/* Account Deletion Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="liquid-glass-card rounded-2xl p-6 sm:p-8 max-w-md w-full text-center border border-white/10 shadow-2xl animate-fade-rise">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-normal text-foreground mb-2" style={{ fontFamily: "'Instrument Serif', serif" }}>
              Delete Account
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-6">
              Account deletion requires manual verification. Please contact us directly to process your request and permanently remove your data.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="liquid-glass rounded-full px-5 py-2.5 text-xs text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <Link
                to="/reach-us"
                className="gradient-cta rounded-full px-5 py-2.5 text-xs text-black font-medium inline-flex items-center justify-center"
              >
                Contact us
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
