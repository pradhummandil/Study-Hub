import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { LogOut, Edit3, Lock, Check, X, Users, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getFocusData, type FocusData } from '../lib/focusStorage';
import { supabase } from '../lib/supabase';
import {
  fetchProfileGamification,
  updatePrivacyAndAccountability,
  fetchStudyPartners,
  sendPartnerRequest
} from '../lib/profile/profileApi';
import type { StudentGamification, StudyPartner } from '../types/ecosystem';

export default function Profile() {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const [focusData, setFocusData] = useState<FocusData>(() => getFocusData());
  const [gamification, setGamification] = useState<StudentGamification | null>(null);
  const [partners, setPartners] = useState<StudyPartner[]>([]);

  // Editing state
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [nameSaving, setNameSaving] = useState(false);

  // Settings state
  const [privacyLevel, setPrivacyLevel] = useState<'Public' | 'Circle' | 'Private'>('Circle');
  const [accountabilityMode, setAccountabilityMode] = useState<'Self' | 'Friend' | 'Study Circle'>('Self');
  const [settingsSavedMsg, setSettingsSavedMsg] = useState<string | null>(null);

  // Invite modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMsg, setInviteMsg] = useState<string | null>(null);

  // Password editing state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    let isMounted = true;
    if (user) {
      setFocusData(getFocusData());
      fetchProfileGamification(user.id).then((g) => {
        if (isMounted && g) {
          setGamification(g);
          setPrivacyLevel(g.privacy_level || 'Circle');
          setAccountabilityMode(g.accountability_mode || 'Self');
        }
      });
      fetchStudyPartners(user.id).then((p) => {
        if (isMounted) setPartners(p);
      });
    }
    return () => { isMounted = false; };
  }, [user]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-3 h-3 rounded-full bg-muted-foreground skeleton-pulse" />
      </div>
    );
  }

  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;
  const fullName = user.user_metadata?.full_name || 'Student';
  const initialLetter = (fullName[0] || user.email?.[0] || 'U').toUpperCase();

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    setNameSaving(true);
    try {
      await supabase.auth.updateUser({ data: { full_name: nameInput.trim() } });
      setIsEditingName(false);
    } catch (err) {
      console.warn('Failed to update name:', err);
    } finally {
      setNameSaving(false);
    }
  };

  const handleUpdateSettings = async (
    newPrivacy?: 'Public' | 'Circle' | 'Private',
    newAcc?: 'Self' | 'Friend' | 'Study Circle'
  ) => {
    const nextP = newPrivacy || privacyLevel;
    const nextA = newAcc || accountabilityMode;
    setPrivacyLevel(nextP);
    setAccountabilityMode(nextA);

    await updatePrivacyAndAccountability(user.id, {
      privacyLevel: nextP,
      accountabilityMode: nextA,
    });

    setSettingsSavedMsg('Preferences saved');
    setTimeout(() => setSettingsSavedMsg(null), 3000);
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    const res = await sendPartnerRequest(user.id, inviteEmail);
    setInviteMsg(res.message);
    if (res.success) {
      setTimeout(() => {
        setShowInviteModal(false);
        setInviteEmail('');
        setInviteMsg(null);
      }, 2000);
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
      if (error) setPasswordMessage({ type: 'error', text: error.message });
      else {
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

  return (
    <>
      <Helmet>
        <title>Student Profile & Accountability — Study Hub</title>
        <meta name="description" content="View your academic stats, manage profile privacy, study partners, and accountability settings." />
      </Helmet>

      {/* Header Profile Card */}
      <div className="px-6 pt-12">
        <div className="liquid-glass-card rounded-3xl p-8 max-w-4xl mx-auto relative flex flex-col sm:flex-row items-center sm:items-start gap-6 border border-white/10 shadow-2xl">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={fullName}
              className="w-20 h-20 rounded-full object-cover border-2 border-white/10 shrink-0 shadow-lg"
            />
          ) : (
            <div className="w-20 h-20 rounded-full gradient-cta flex items-center justify-center text-3xl font-semibold text-slate-950 select-none shrink-0 border-2 border-white/10 shadow-lg">
              {initialLetter}
            </div>
          )}

          <div className="flex-1 text-center sm:text-left">
            {isEditingName ? (
              <div className="flex items-center gap-2 max-w-sm">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="bg-white/5 border border-white/20 rounded-xl px-3 py-1.5 text-base text-foreground focus:outline-none w-full"
                />
                <button
                  onClick={handleSaveName}
                  disabled={nameSaving}
                  className="liquid-glass p-2 rounded-xl text-green-400"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                    {gamification?.level_title || 'Consistent Learner'}
                  </span>
                  <span className="text-xs text-muted-foreground">• Level {gamification?.level || 1}</span>
                </div>
                <h1
                  className="text-3xl font-normal text-foreground tracking-tight"
                  style={{ fontFamily: "'Instrument Serif', serif" }}
                >
                  {fullName}
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
              </div>
            )}
          </div>

          {!isEditingName && (
            <button
              onClick={() => {
                setNameInput(fullName);
                setIsEditingName(true);
              }}
              className="liquid-glass rounded-full px-4 py-2 text-xs text-foreground hover:scale-105 transition-transform flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit Name
            </button>
          )}
        </div>
      </div>

      {/* Academic Stats Grid */}
      <div className="px-6 mt-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="liquid-glass-card rounded-2xl p-5 text-center border border-white/10">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Study Streak</span>
            <div className="text-2xl sm:text-3xl font-bold text-amber-400 font-mono mt-1">
              🔥 {gamification?.current_streak || focusData.currentStreak}d
            </div>
            <span className="text-[10px] text-slate-500">Record: {gamification?.longest_streak || focusData.longestStreak}d</span>
          </div>

          <div className="liquid-glass-card rounded-2xl p-5 text-center border border-white/10">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Study XP</span>
            <div className="text-2xl sm:text-3xl font-bold text-cyan-300 font-mono mt-1">
              ⚡ {gamification?.xp || 1840}
            </div>
            <span className="text-[10px] text-slate-500">Level {gamification?.level || 8}</span>
          </div>

          <div className="liquid-glass-card rounded-2xl p-5 text-center border border-white/10">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Focus Hours</span>
            <div className="text-2xl sm:text-3xl font-bold text-indigo-300 font-mono mt-1">
              {(focusData.totalMinutes / 60).toFixed(1)}h
            </div>
            <span className="text-[10px] text-slate-500">{focusData.totalSessions} sessions</span>
          </div>

          <div className="liquid-glass-card rounded-2xl p-5 text-center border border-white/10">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Helpful Answers</span>
            <div className="text-2xl sm:text-3xl font-bold text-purple-300 font-mono mt-1">
              ✨ {gamification?.helpful_contributions || 27}
            </div>
            <span className="text-[10px] text-slate-500">Community Reputation</span>
          </div>
        </div>
      </div>

      {/* Privacy & Accountability Settings */}
      <div className="px-6 mt-8">
        <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 max-w-4xl mx-auto border border-white/10 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">Privacy & Accountability</h2>
              <p className="text-xs text-muted-foreground">Control who sees your academic streak and accountability mode.</p>
            </div>
            {settingsSavedMsg && <span className="text-xs text-emerald-400 font-bold">{settingsSavedMsg}</span>}
          </div>

          {/* Privacy Level Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">Profile Privacy Level</label>
            <div className="grid grid-cols-3 gap-3 text-xs">
              {[
                { id: 'Circle', label: 'Circle Members Only (Default)', desc: 'Only joined circle learners see streak' },
                { id: 'Public', label: 'Public Profile', desc: 'Visible on educational leaderboard' },
                { id: 'Private', label: 'Private (Hidden)', desc: 'Hidden from leaderboards and search' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleUpdateSettings(opt.id as any, undefined)}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    privacyLevel === opt.id
                      ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 font-bold'
                      : 'liquid-glass border-white/5 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span className="block font-bold text-foreground">{opt.label}</span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Accountability Mode Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">Study Accountability Mode</label>
            <div className="grid grid-cols-3 gap-3 text-xs">
              {[
                { id: 'Self', label: 'Self Accountability', desc: 'Track habits privately' },
                { id: 'Friend', label: 'Study Partner (Friend)', desc: 'Share streak with opt-in partner' },
                { id: 'Circle', label: 'Circle Accountability', desc: 'Group check-ins in circle' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleUpdateSettings(undefined, opt.id as any)}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    accountabilityMode === opt.id
                      ? 'bg-purple-500/20 border-purple-500/40 text-purple-300 font-bold'
                      : 'liquid-glass border-white/5 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span className="block font-bold text-foreground">{opt.label}</span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Study Partners List & Invite CTA */}
          {accountabilityMode === 'Friend' && (
            <div className="pt-4 border-t border-white/10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-300">Study Partners</h3>
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="gradient-cta rounded-full px-3 py-1.5 text-xs text-slate-950 font-bold flex items-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Invite Partner
                </button>
              </div>

              {partners.length === 0 ? (
                <p className="text-xs text-slate-500">No study partners connected yet. Invite a friend to track daily habits together!</p>
              ) : (
                <div className="space-y-2">
                  {partners.map((p) => (
                    <div key={p.id} className="liquid-glass rounded-2xl p-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <Users className="w-4 h-4 text-cyan-400" />
                        <div>
                          <span className="font-bold text-foreground">{p.partner_name}</span>
                          <span className="text-[10px] text-slate-400 block">{p.partner_exam} • 🔥 {p.partner_streak}d streak</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase">{p.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Account Settings & Delete Option */}
      <div className="px-6 mt-8 pb-28">
        <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 max-w-4xl mx-auto border border-white/10 space-y-4">
          <h2 className="text-lg font-bold text-foreground">Account Security</h2>

          <div className="flex flex-wrap items-center justify-between gap-4">
            {!showPasswordForm ? (
              <button
                onClick={() => setShowPasswordForm(true)}
                className="liquid-glass rounded-full px-5 py-2.5 text-xs text-foreground font-medium hover:bg-white/10 transition-colors inline-flex items-center gap-2"
              >
                <Lock className="w-3.5 h-3.5" /> Change password
              </button>
            ) : (
              <form onSubmit={handleUpdatePassword} className="liquid-glass rounded-2xl p-6 flex flex-col gap-3 max-w-md w-full">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground">Update Password</h3>
                  <button type="button" onClick={() => setShowPasswordForm(false)} className="text-slate-400">
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
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                />
                <input
                  type="password"
                  required
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                />
                <button type="submit" disabled={passwordSaving} className="gradient-cta rounded-full py-2 text-xs font-bold text-slate-950">
                  {passwordSaving ? 'Saving...' : 'Save Password'}
                </button>
              </form>
            )}

            <button
              onClick={() => signOut().then(() => navigate('/'))}
              className="text-red-400 text-xs font-semibold hover:underline flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-3xl p-6 bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl">
            <button onClick={() => setShowInviteModal(false)} className="absolute top-4 right-4 text-slate-400">
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-bold mb-2">Invite Study Partner</h3>
            <p className="text-xs text-slate-400 mb-4">Connect with a friend to hold each other accountable for daily study habits.</p>

            {inviteMsg && <p className="text-xs text-emerald-400 mb-3">{inviteMsg}</p>}

            <form onSubmit={handleSendInvite} className="space-y-4">
              <input
                type="email"
                required
                placeholder="Partner's email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
              />
              <button type="submit" className="w-full gradient-cta rounded-full py-2.5 text-xs text-slate-950 font-bold">
                Send Invitation
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
