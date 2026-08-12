import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Flame, Clock, CheckCircle2, Plus, Check, Trash2, Calendar, Bookmark, ArrowRight, Settings, Copy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getFocusData, type FocusData } from '../lib/focusStorage';
import {
  getSavedResources,
  removeResource,
  getRoadmapItems,
  addRoadmapItem,
  toggleRoadmapItem,
  deleteRoadmapItem,
  type SavedResource,
  type RoadmapItem,
} from '../lib/dashboardApi';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [focusData, setFocusData] = useState<FocusData>(() => getFocusData());

  // Database state
  const [roadmapItems, setRoadmapItems] = useState<RoadmapItem[]>([]);
  const [savedResources, setSavedResources] = useState<SavedResource[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Add goal form state
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDesc, setGoalDesc] = useState('');
  const [goalTargetDate, setGoalTargetDate] = useState('');
  const [goalSaving, setGoalSaving] = useState(false);

  // Referral copy state
  const [copiedRef, setCopiedRef] = useState(false);

  // Auth Protection
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true });
    }
  }, [user, loading, navigate]);

  // Load database items on mount
  useEffect(() => {
    if (user) {
      setDataLoading(true);
      Promise.all([getRoadmapItems(), getSavedResources()])
        .then(([roadmapList, savedList]) => {
          setRoadmapItems(roadmapList);
          setSavedResources(savedList);
        })
        .finally(() => setDataLoading(false));
    }
    setFocusData(getFocusData());
  }, [user]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-3 h-3 rounded-full bg-muted-foreground skeleton-pulse" />
      </div>
    );
  }

  const fullName = user.user_metadata?.full_name || user.email || 'Student';
  const firstName = fullName.split(' ')[0].split('@')[0];
  const referralLink = `${window.location.origin}/signup?ref=${user.id.slice(0, 8)}`;

  // Roadmap actions
  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;

    setGoalSaving(true);
    const newItem = await addRoadmapItem(goalTitle, goalDesc, goalTargetDate);
    if (newItem) {
      setRoadmapItems((prev) => [...prev, newItem]);
      setGoalTitle('');
      setGoalDesc('');
      setGoalTargetDate('');
      setIsAddingGoal(false);
    }
    setGoalSaving(false);
  };

  const handleToggleGoal = async (item: RoadmapItem) => {
    setRoadmapItems((prev) =>
      prev.map((r) => (r.id === item.id ? { ...r, is_complete: !r.is_complete } : r))
    );
    await toggleRoadmapItem(item.id, item.is_complete);
  };

  const handleDeleteGoal = async (id: string) => {
    setRoadmapItems((prev) => prev.filter((r) => r.id !== id));
    await deleteRoadmapItem(id);
  };

  // Resource actions
  const handleRemoveSavedResource = async (id: string) => {
    setSavedResources((prev) => prev.filter((r) => r.id !== id));
    await removeResource(id);
  };

  const handleCopyReferral = () => {
    try {
      navigator.clipboard.writeText(referralLink);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <>
      <Helmet>
        <title>Dashboard — Study Hub</title>
        <meta name="description" content="Your personal study dashboard and progress tracker." />
      </Helmet>

      {/* Header */}
      <div className="px-6 pt-12 max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-4xl sm:text-5xl font-normal text-foreground tracking-[-1px]"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Welcome back, <span className="text-gradient-accent">{firstName}</span>.
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Here's your study roadmap, focus progress, and saved resources.
          </p>
        </div>

        <Link
          to="/profile"
          className="liquid-glass rounded-full px-4 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 shrink-0"
        >
          <Settings className="w-3.5 h-3.5" />
          Settings
        </Link>
      </div>

      {/* Quick Stats Row */}
      <div className="px-6 mt-8 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

          <div className="liquid-glass-card rounded-2xl p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Focus Blocks</span>
              <CheckCircle2 className="w-5 h-5 text-muted-foreground/60" />
            </div>
            <p className="text-3xl sm:text-4xl font-normal text-foreground" style={{ fontFamily: "'Instrument Serif', serif" }}>
              {focusData.totalSessions} <span className="text-sm font-sans text-muted-foreground">sessions</span>
            </p>
          </div>

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

      {/* Main Grid: Roadmap, Saved Resources, Referral */}
      <div className="px-6 mt-8 max-w-5xl mx-auto pb-24 flex flex-col gap-8">
        {/* Your Roadmap Section */}
        <div className="liquid-glass-card rounded-2xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-normal text-foreground" style={{ fontFamily: "'Instrument Serif', serif" }}>
                Your Roadmap
              </h2>
              <p className="text-xs text-muted-foreground mt-1">Track goals and milestone targets</p>
            </div>

            {!isAddingGoal && (
              <button
                onClick={() => setIsAddingGoal(true)}
                className="liquid-glass rounded-full px-4 py-2 text-xs text-foreground font-medium hover:scale-105 transition-transform flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add goal
              </button>
            )}
          </div>

          {/* Add Goal Inline Form */}
          {isAddingGoal && (
            <form onSubmit={handleAddGoal} className="liquid-glass rounded-2xl p-6 mb-6 flex flex-col gap-4 border border-white/10 animate-fade-rise">
              <h3 className="text-sm font-medium text-foreground">New Goal</h3>
              
              <input
                type="text"
                required
                placeholder="What is your target milestone?"
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-white/30"
              />

              <textarea
                placeholder="Description / notes (optional)"
                rows={2}
                value={goalDesc}
                onChange={(e) => setGoalDesc(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-white/30 resize-none"
              />

              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                <input
                  type="date"
                  value={goalTargetDate}
                  onChange={(e) => setGoalTargetDate(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-foreground focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingGoal(false)}
                  className="px-4 py-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={goalSaving}
                  className="gradient-cta rounded-full px-6 py-2 text-xs text-black font-medium"
                >
                  {goalSaving ? 'Saving...' : 'Save Goal'}
                </button>
              </div>
            </form>
          )}

          {/* Item List */}
          {dataLoading ? (
            <div className="py-12 text-center text-xs text-muted-foreground skeleton-pulse">Loading roadmap...</div>
          ) : roadmapItems.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-xl border border-dashed border-white/10">
              <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                No roadmap yet — add your first goal, or book a call and we'll build one together.
              </p>
              <Link
                to="/reach-us"
                className="gradient-cta rounded-full px-6 py-2.5 text-xs text-black font-medium inline-flex items-center justify-center mt-4"
              >
                Book a call
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {roadmapItems.map((item) => (
                <div
                  key={item.id}
                  className={`liquid-glass rounded-xl p-4 flex items-center justify-between gap-4 transition-opacity ${
                    item.is_complete ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1">
                    {/* Custom Styled Checkbox */}
                    <button
                      type="button"
                      onClick={() => handleToggleGoal(item)}
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                        item.is_complete
                          ? 'gradient-cta border-transparent text-black'
                          : 'border-white/30 hover:border-white/60'
                      }`}
                      aria-label={item.is_complete ? 'Mark incomplete' : 'Mark complete'}
                    >
                      {item.is_complete && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <div>
                      <p className={`text-sm font-medium text-foreground ${item.is_complete ? 'line-through' : ''}`}>
                        {item.title}
                      </p>
                      {item.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {item.target_date && (
                      <span className="text-xs text-muted-foreground liquid-glass px-3 py-1 rounded-full">
                        {item.target_date}
                      </span>
                    )}
                    <button
                      onClick={() => handleDeleteGoal(item.id)}
                      className="text-muted-foreground hover:text-red-400 transition-colors p-1"
                      aria-label="Delete goal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Saved Resources Section */}
        <div className="liquid-glass-card rounded-2xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-normal text-foreground" style={{ fontFamily: "'Instrument Serif', serif" }}>
                Saved Resources
              </h2>
              <p className="text-xs text-muted-foreground mt-1">Bookmarked from Studio for quick access</p>
            </div>

            <Link
              to="/studio"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
            >
              <span>Studio</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {dataLoading ? (
            <div className="py-12 text-center text-xs text-muted-foreground skeleton-pulse">Loading saved resources...</div>
          ) : savedResources.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-xl border border-dashed border-white/10">
              <Bookmark className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                Bookmark resources from Studio to see them here.
              </p>
              <Link
                to="/studio"
                className="liquid-glass rounded-full px-6 py-2 text-xs text-foreground inline-flex items-center justify-center mt-4"
              >
                Browse Studio
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {savedResources.map((res) => (
                <div key={res.id} className="liquid-glass rounded-xl p-5 flex flex-col justify-between gap-3 relative group">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{res.resource_category}</span>
                    <h3
                      className="text-lg font-normal text-foreground leading-snug mt-1"
                      style={{ fontFamily: "'Instrument Serif', serif" }}
                    >
                      {res.resource_title}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <Link to="/studio" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                      View in Studio
                    </Link>
                    <button
                      onClick={() => handleRemoveSavedResource(res.id)}
                      className="text-muted-foreground hover:text-red-400 transition-colors p-1"
                      aria-label="Remove saved resource"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Refer a Friend Section */}
        <div className="liquid-glass-card rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-normal text-foreground" style={{ fontFamily: "'Instrument Serif', serif" }}>
                Refer a friend
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Know someone who'd benefit? Share your unique link.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="liquid-glass rounded-xl px-4 py-2 text-xs text-foreground font-mono truncate flex-1 sm:w-64 border border-white/10">
                {referralLink}
              </div>
              <button
                onClick={handleCopyReferral}
                className="liquid-glass rounded-xl px-4 py-2 text-xs text-foreground font-medium hover:scale-105 transition-all inline-flex items-center gap-1.5 shrink-0 border border-white/10"
              >
                {copiedRef ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
