import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Share2, Copy, Check, Gift, Users, Zap, ShieldAlert, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserReferralStats } from '../lib/referrals/referralApi';

export default function Referrals() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({
    referralCode: 'STUDY-DEMO',
    totalReferred: 0,
    activatedCount: 0,
    bonusAiCredits: 0,
    records: [] as any[],
  });

  useEffect(() => {
    const userId = user?.id || 'demo_user_123';
    getUserReferralStats(userId).then(setStats);
  }, [user]);

  const referralLink = `${window.location.origin}/signup?ref=${stats.referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#062B3D] text-white py-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Student Referrals & Rewards | Study Hub</title>
        <meta
          name="description"
          content="Invite fellow students to Study Hub. Earn extra AI coaching credits and premium study tools while building your academic study circle."
        />
      </Helmet>

      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Gift className="w-4 h-4 text-[#5CE1E6]" /> Academic Growth Program
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white">
            Study Together & Unlock AI Power
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Invite classmates and study partners. When they activate their Study Hub account, both of you get <strong className="text-[#5CE1E6]">50 bonus StudyMate AI requests</strong> every month.
          </p>
        </div>

        {/* Link Share Box */}
        <div className="p-6 md:p-8 rounded-3xl bg-slate-900/90 border border-cyan-500/30 shadow-2xl space-y-6">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Share2 className="w-4 h-4 text-[#5CE1E6]" /> Your Personal Referral Link
          </h3>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              readOnly
              value={referralLink}
              className="w-full rounded-2xl bg-slate-950 border border-cyan-500/40 px-4 py-3.5 text-xs text-cyan-300 font-mono focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 font-bold text-xs text-slate-950 flex items-center justify-center gap-2 hover:brightness-110 transition-all shrink-0"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied Link!' : 'Copy Link'}
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Referral Code: <strong className="text-white font-mono">{stats.referralCode}</strong></span>
            <span className="text-[#5CE1E6] font-medium">50 AI Requests per Activation</span>
          </div>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Students Invited</span>
              <Users className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="text-3xl font-black text-white">{stats.totalReferred}</div>
            <p className="text-[11px] text-slate-500">Signups through your link</p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Active Learners</span>
              <Award className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-emerald-400">{stats.activatedCount}</div>
            <p className="text-[11px] text-slate-500">Completed 1st practice session</p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Bonus AI Requests</span>
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-amber-400">+{stats.bonusAiCredits}</div>
            <p className="text-[11px] text-slate-500">Added to daily allowance</p>
          </div>
        </div>

        {/* Academic Rules Policy */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-3 text-xs text-slate-400">
          <ShieldAlert className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-white mb-1">Academic Integrity Policy</h4>
            <p>
              Rewards are strictly educational (AI coaching requests, exam simulator trial access, resource unlocks). Self-referrals or fake signups are detected automatically and filtered out.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
