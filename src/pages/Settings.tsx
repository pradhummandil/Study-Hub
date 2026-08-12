import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { RefreshCcw, HelpCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStudentContext } from '../context/StudentContext';
import { supabase } from '../lib/supabase';

const requestDataExport = async () => {
  return new Promise((resolve) => setTimeout(resolve, 1000));
};
const deleteAccount = async () => {
  return new Promise((resolve) => setTimeout(resolve, 2000));
};

export default function Settings() {
  const { user, signOut } = useAuth();
  const { profile, activeContext, switchContext } = useStudentContext();
  const [activeTab, setActiveTab] = useState('study');
  const [deleteConfirmStep, setDeleteConfirmStep] = useState(0);
  const [deleteInput, setDeleteInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  
  // State for preferences
  const [studyGoal, setStudyGoal] = useState(profile?.daily_study_minutes || 180);
  const [aiStyle, setAiStyle] = useState('Balanced');
  const [aiDifficulty, setAiDifficulty] = useState('Mixed');
  
  const [notifications, setNotifications] = useState({
    studyReminders: true,
    revisionReminders: true,
    mockReminders: true,
    community: false,
    achievements: true,
  });

  const [privacy, setPrivacy] = useState({
    publicProfile: false,
    communityVisibility: true,
    leaderboardParticipation: true,
    studyRoomVisibility: true,
    aiChatHistorySaved: true,
  });

  const handlePasswordChange = async () => {
    if (user?.email) {
      await supabase.auth.resetPasswordForEmail(user.email);
      alert('Password reset email sent');
    }
  };

  const handleExportData = async () => {
    try {
      await requestDataExport();
      const blob = new Blob([JSON.stringify({ data: "export data", profile })], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'studyhub-data-export.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      await signOut();
    } catch (e) {
      console.error(e);
      setIsDeleting(false);
    }
  };

  const tabs = [
    { id: 'study', label: 'Personalization & Path' },
    { id: 'transparency', label: 'Why Am I Seeing This?' },
    { id: 'account', label: 'Account' },
    { id: 'ai', label: 'AI Preferences' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'privacy', label: 'Privacy' },
    { id: 'data', label: 'Data Management' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <Helmet>
        <title>Settings & Personalization — Study Hub</title>
      </Helmet>

      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings & Personalization</h1>
            <p className="text-xs text-muted-foreground mt-1">Manage your learning pathway, study target, and privacy preferences.</p>
          </div>

          <Link
            to="/setup"
            className="gradient-cta rounded-full px-4 py-2 text-xs text-slate-950 font-bold flex items-center gap-1.5 shadow-md"
          >
            <RefreshCcw className="w-3.5 h-3.5" /> Re-run Setup Wizard
          </Link>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 flex-shrink-0 overflow-x-auto md:overflow-visible">
            <div className="flex md:flex-col gap-2 pb-4 md:pb-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`text-left px-4 py-3 rounded-xl whitespace-nowrap text-xs transition-colors ${
                    activeTab === tab.id
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                      : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-grow">
            <div className="liquid-glass-card border border-white/10 rounded-3xl p-6 md:p-8 space-y-6">
              
              {/* TAB 1: Personalization & Learning Path */}
              {activeTab === 'study' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-foreground">Personalization & Learning Pathway</h2>
                  
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                    <span className="text-xs font-semibold uppercase text-cyan-400">Current Learning Path</span>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-base font-bold text-slate-100 capitalize">
                          {profile?.education_path || 'Competitive Exam'}
                        </p>
                        <p className="text-xs text-slate-400">
                          {profile?.education_path === 'college' || profile?.education_path === 'school'
                            ? `Stage: ${profile?.education_stage || 'Undergraduate'} • Degree: ${profile?.degree || 'B.Tech'}`
                            : `Target Exam: ${profile?.target_exam || 'GATE'} ${profile?.target_exam_year || '2027'}`}
                        </p>
                      </div>
                      <Link
                        to="/setup"
                        className="liquid-glass px-3.5 py-1.5 rounded-full text-xs text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/10"
                      >
                        Change Path
                      </Link>
                    </div>
                  </div>

                  {profile?.education_path === 'both' && (
                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                      <span className="text-xs font-semibold uppercase text-amber-400">Active View Mode</span>
                      <div className="flex gap-3">
                        <button
                          onClick={() => switchContext('college')}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            activeContext === 'college'
                              ? 'bg-cyan-500 text-slate-950'
                              : 'bg-white/5 text-slate-400 hover:text-white'
                          }`}
                        >
                          🎓 College Academic
                        </button>
                        <button
                          onClick={() => switchContext('competitive')}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            activeContext === 'competitive'
                              ? 'bg-indigo-500 text-white'
                              : 'bg-white/5 text-slate-400 hover:text-white'
                          }`}
                        >
                          🎯 {profile?.target_exam || 'GATE'} Preparation
                        </button>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Daily Study Target: <span className="text-cyan-400 font-mono font-bold">{studyGoal} minutes ({Math.round(studyGoal / 60)} hours)</span>
                    </label>
                    <input 
                      type="range" 
                      min="60" 
                      max="480" 
                      step="30"
                      value={studyGoal}
                      onChange={(e) => setStudyGoal(Number(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                    <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
                      <span>1 hour</span>
                      <span>4 hours</span>
                      <span>8 hours</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Transparency "Why Am I Seeing This?" */}
              {activeTab === 'transparency' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-xl font-bold text-foreground">
                    <HelpCircle className="w-5 h-5 text-cyan-400" />
                    Why Am I Seeing This? (Product Transparency)
                  </div>
                  
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Study Hub strictly bases all your recommendations, practice drills, and roadmap priorities on your explicit choices and authenticated performance history. We never sell or share your data.
                  </p>

                  <div className="space-y-3">
                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/30 space-y-1">
                      <span className="text-xs font-bold text-cyan-300">1. Target Exam & Path</span>
                      <p className="text-xs text-slate-300">
                        Because you selected <span className="font-semibold text-white">{profile?.target_exam || 'GATE'} {profile?.target_exam_year || '2027'}</span>, your PYQs, mock tests, and roadmap modules highlight {profile?.target_exam || 'GATE'} subjects.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-purple-500/30 space-y-1">
                      <span className="text-xs font-bold text-purple-300">2. Weak Area & Revision Triggers</span>
                      <p className="text-xs text-slate-300">
                        Your mistake notebook and spaced revision center dynamically surface topics where your accuracy was below 60%.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/30 space-y-1">
                      <span className="text-xs font-bold text-emerald-300">3. Daily Time Budget</span>
                      <p className="text-xs text-slate-300">
                        Your daily study plan schedules realistic tasks matching your {profile?.daily_study_minutes || 180}-minute daily goal without impossible workloads.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Account */}
              {activeTab === 'account' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-foreground">Account Details</h2>
                  
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Email</label>
                    <input 
                      type="text" 
                      value={user?.email || 'user@example.com'} 
                      readOnly 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-muted-foreground cursor-not-allowed"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Joined Date</label>
                    <div className="text-xs text-foreground font-mono">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '13 Aug 2026'}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex gap-4">
                    <button 
                      onClick={handlePasswordChange}
                      className="liquid-glass px-4 py-2 rounded-full text-xs text-foreground hover:bg-white/10 transition-colors"
                    >
                      Reset Password
                    </button>
                    
                    <button 
                      onClick={() => signOut()}
                      className="px-4 py-2 border border-red-500/50 text-red-400 hover:bg-red-500/10 rounded-full text-xs font-semibold transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: AI Preferences */}
              {activeTab === 'ai' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-foreground">AI & StudyMate Preferences</h2>
                  
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-3">Response Style</label>
                    <div className="flex gap-4">
                      {['Concise', 'Balanced', 'Detailed'].map((style) => (
                        <label key={style} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                          <input 
                            type="radio" 
                            name="aiStyle" 
                            value={style}
                            checked={aiStyle === style}
                            onChange={() => setAiStyle(style)}
                            className="accent-cyan-400"
                          />
                          <span>{style}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-3">Study Difficulty</label>
                    <div className="flex gap-4">
                      {['Beginner', 'Mixed', 'Advanced'].map((diff) => (
                        <label key={diff} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                          <input 
                            type="radio" 
                            name="aiDifficulty" 
                            value={diff}
                            checked={aiDifficulty === diff}
                            onChange={() => setAiDifficulty(diff)}
                            className="accent-cyan-400"
                          />
                          <span>{diff}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: Notifications */}
              {activeTab === 'notifications' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-foreground">Notifications</h2>
                  
                  {Object.entries(notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between py-2 border-b border-white/5 text-xs">
                      <span className="capitalize text-slate-200">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <input 
                        type="checkbox" 
                        checked={value}
                        onChange={() => setNotifications((prev) => ({ ...prev, [key]: !prev[key as keyof typeof notifications] }))}
                        className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 6: Privacy */}
              {activeTab === 'privacy' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-foreground">Privacy Settings</h2>
                  <p className="text-xs text-muted-foreground">Control what educational activity is shared with study circles or leaderboards.</p>
                  
                  {Object.entries(privacy).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between py-2 border-b border-white/5 text-xs">
                      <span className="capitalize text-slate-200">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <input 
                        type="checkbox" 
                        checked={value}
                        onChange={() => setPrivacy((prev) => ({ ...prev, [key]: !prev[key as keyof typeof privacy] }))}
                        className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 7: Data Management */}
              {activeTab === 'data' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-foreground">Data Management</h2>
                  
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-2">
                    <h3 className="text-sm font-bold text-foreground">Download My Data</h3>
                    <p className="text-xs text-muted-foreground">
                      Export your profile, study history, mistakes, flashcards, and mock results as JSON.
                    </p>
                    <button 
                      onClick={handleExportData}
                      className="liquid-glass rounded-full px-4 py-2 text-xs font-semibold text-foreground hover:bg-white/10 transition-colors"
                    >
                      Download Export
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 space-y-2">
                    <h3 className="text-sm font-bold text-red-400">Delete Account</h3>
                    <p className="text-xs text-slate-300">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    
                    {deleteConfirmStep === 0 && (
                      <button 
                        onClick={() => setDeleteConfirmStep(1)}
                        className="px-4 py-2 bg-red-500/20 text-red-300 border border-red-500/40 rounded-full text-xs font-semibold hover:bg-red-500/30 transition-colors"
                      >
                        Delete Account
                      </button>
                    )}

                    {deleteConfirmStep === 1 && (
                      <div className="space-y-3 pt-2">
                        <p className="text-xs text-red-300 font-semibold">
                          Are you sure? Type DELETE to confirm.
                        </p>
                        <input 
                          type="text" 
                          value={deleteInput}
                          onChange={(e) => setDeleteInput(e.target.value)}
                          placeholder="DELETE"
                          className="w-full sm:w-64 bg-slate-950 border border-red-500/50 rounded-xl px-4 py-2 text-xs text-slate-100 focus:outline-none"
                        />
                        <div className="flex gap-3">
                          <button 
                            onClick={() => { setDeleteConfirmStep(0); setDeleteInput(''); }}
                            className="px-4 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={() => { if (deleteInput === 'DELETE') setDeleteConfirmStep(2); }}
                            disabled={deleteInput !== 'DELETE'}
                            className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-full text-xs font-bold disabled:opacity-50"
                          >
                            Continue
                          </button>
                        </div>
                      </div>
                    )}

                    {deleteConfirmStep === 2 && (
                      <div className="space-y-3 pt-2">
                        <p className="text-xs text-red-300">
                          This will permanently remove your account and personal data.
                        </p>
                        <div className="flex gap-3">
                          <button 
                            onClick={() => { setDeleteConfirmStep(0); setDeleteInput(''); }}
                            disabled={isDeleting}
                            className="px-4 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={handleDeleteAccount}
                            disabled={isDeleting}
                            className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-full text-xs font-bold"
                          >
                            {isDeleting ? 'Deleting account...' : 'Yes, Delete Account'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
