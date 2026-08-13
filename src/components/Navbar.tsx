import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useStudentContext } from '../context/StudentContext';
import { EXAM_CONFIGS, type ExamCategory } from '../types/student-core';
import { LogOut, Settings, ChevronDown, LayoutDashboard, Users, BookOpen, Layers, Flame, RotateCcw, Zap, Trophy, Shield, TrendingUp, FileText, Info, PhoneCall, Video, Award } from 'lucide-react';
import { NotificationBellDropdown } from './notifications/NotificationBellDropdown';
import { Logo } from './ui/Logo';
import { fetchProfileGamification } from '../lib/profile/profileApi';
import type { StudentGamification } from '../types/ecosystem';

const loggedInPrimaryNavItems = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Studio', path: '/studio' },
  { label: 'Video Learning', path: '/video-learning' },
  { label: 'Study AI', path: '/study-ai' },
  { label: 'Roadmap', path: '/roadmap' },
  { label: 'Practice', path: '/practice' },
  { label: 'Mock Tests', path: '/mock-tests' },
  { label: 'Community', path: '/community' },
];

const publicNavItems = [
  { label: 'Home', path: '/' },
  { label: 'Video Learning', path: '/video-learning' },
  { label: 'Studio', path: '/studio' },
  { label: 'Study AI', path: '/study-ai' },
  { label: 'Exams', path: '/exams' },
  { label: 'Journal', path: '/journal' },
  { label: 'Community', path: '/community' },
];

const secondaryNavItems = [
  { label: 'Video Learning Hub', path: '/video-learning', icon: Video },
  { label: 'Roadmap', path: '/roadmap', icon: BookOpen },
  { label: 'Practice & PYQs', path: '/practice', icon: Zap },
  { label: 'Mock Tests', path: '/mock-tests', icon: Trophy },
  { label: 'Performance', path: '/performance', icon: TrendingUp },
  { label: 'Exam Catalog', path: '/exams', icon: BookOpen },
  { label: 'Exam Simulator', path: '/exam-simulator', icon: Trophy },
  { label: 'Focus Room', path: '/focus-room', icon: RotateCcw },
  { label: 'Spaced Revision', path: '/revision', icon: RotateCcw },
  { label: 'Mistakes Notebook', path: '/mistakes', icon: Flame },
  { label: 'Flashcards Decks', path: '/flashcards', icon: Layers },
  { label: 'Adaptive Practice', path: '/adaptive-practice', icon: Zap },
  { label: 'Pricing & Plans', path: '/pricing', icon: Award },
  { label: 'Referrals & Rewards', path: '/referrals', icon: Users },
  { label: 'Leaderboards', path: '/leaderboards', icon: Award },
  { label: 'Journal', path: '/journal', icon: FileText },
  { label: 'About Us', path: '/about', icon: Info },
  { label: 'Reach Us', path: '/reach-us', icon: PhoneCall },
];

export const Navbar = () => {
  const location = useLocation();
  const { user, loading, signOut } = useAuth();
  const studentContext = useStudentContext();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [examMenuOpen, setExamMenuOpen] = useState(false);
  const [gamification, setGamification] = useState<StudentGamification | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const examRef = useRef<HTMLDivElement>(null);

  // Scroll listener for compact glass morphing
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 25) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
    setMoreMenuOpen(false);
    setExamMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  useEffect(() => {
    if (user) {
      fetchProfileGamification(user.id).then((g) => {
        if (g) setGamification(g);
      });
    }
  }, [user, location.pathname]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const isSecondaryActive = secondaryNavItems.some((item) => isActive(item.path));

  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const fullName = user?.user_metadata?.full_name || user?.email || 'User';
  const firstName = fullName.split(' ')[0].split('@')[0];
  const initialLetter = (fullName[0] || 'U').toUpperCase();

  const activeNavItems = user ? loggedInPrimaryNavItems : publicNavItems;

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300">
      <nav
        className={`relative z-40 flex flex-row items-center justify-between px-6 md:px-8 max-w-7xl mx-auto w-full transition-all duration-300 ${
          isScrolled
            ? 'h-[68px] bg-white/80 backdrop-blur-xl shadow-sm border-b border-slate-200/60 rounded-b-2xl'
            : 'h-[88px] bg-transparent'
        }`}
      >
        {/* Logo */}
        <Logo size="md" />

        {/* Desktop Nav with Animated layoutId Active Pill */}
        <div className="hidden md:flex items-center space-x-2 relative">
          {activeNavItems.map(({ label, path }) => {
            const active = isActive(path);
            return (
              <Link
                key={label}
                to={path}
                className={`relative px-3 py-1.5 text-sm transition-colors rounded-full focus-visible:outline-none ${
                  active
                    ? 'text-[#062B3D] font-bold'
                    : 'text-slate-600 hover:text-[#062B3D] font-medium'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="navbar-active-pill"
                    className="absolute inset-0 bg-[#287BFF]/10 rounded-full border border-[#287BFF]/20 pointer-events-none"
                    transition={{ type: 'spring', stiffness: 280, damping: 26 }}
                  />
                )}
                <span className="relative z-10">{label}</span>
              </Link>
            );
          })}

          {/* More ▾ Dropdown — Only shown when logged in */}
          {user && (
            <div className="relative inline-block" ref={moreRef}>
              <button
                type="button"
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className={`text-sm transition-colors flex items-center gap-1.5 focus-visible:outline-none py-1.5 px-3 rounded-full cursor-pointer ${
                  moreMenuOpen || isSecondaryActive
                    ? 'text-[#062B3D] font-bold bg-[#287BFF]/10'
                    : 'text-slate-600 hover:text-[#062B3D] font-medium'
                }`}
                aria-label="More features menu"
                aria-expanded={moreMenuOpen}
              >
                <span>More</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${moreMenuOpen ? 'rotate-180 text-foreground' : ''}`} />
              </button>

              {moreMenuOpen && (
                <div className="!absolute left-0 top-full mt-2 w-64 rounded-2xl bg-[#062B3D]/95 backdrop-blur-xl border border-white/20 p-2 shadow-2xl z-50 animate-fade-rise max-h-[calc(100vh-110px)] overflow-y-auto custom-scrollbar">
                  {secondaryNavItems.map(({ label, path, icon: Icon }) => (
                    <Link
                      key={label}
                      to={path}
                      onClick={() => setMoreMenuOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2.5 text-xs rounded-xl transition-colors ${
                        isActive(path)
                          ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                          : 'text-foreground hover:bg-white/10'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>{label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Desktop Auth / Action Area */}
        <div className="hidden md:flex items-center space-x-3 relative h-10" ref={menuRef}>
          {loading ? (
            <div className="w-28 h-9 rounded-full skeleton-pulse liquid-glass" />
          ) : user ? (
            <>
              {/* Exam Context Selector Badge */}
              <div className="relative" ref={examRef}>
                <button
                  type="button"
                  onClick={() => setExamMenuOpen(!examMenuOpen)}
                  className="liquid-glass rounded-full px-3 py-1 text-xs border border-cyan-500/30 text-cyan-300 font-bold flex items-center gap-1.5 hover:bg-cyan-500/10 transition-colors"
                >
                  <Shield className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{studentContext.targetExam} {studentContext.targetExamYear}</span>
                  <ChevronDown className={`w-3 h-3 text-cyan-400 transition-transform ${examMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {examMenuOpen && (
                  <div className="!absolute left-0 top-full mt-2 w-52 rounded-2xl bg-[#062B3D]/95 backdrop-blur-xl border border-cyan-500/30 p-2 shadow-2xl z-50 animate-fade-rise">
                    <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 border-b border-white/10 mb-1">
                      Switch Exam Context
                    </div>
                    {(Object.keys(EXAM_CONFIGS) as ExamCategory[]).map((eKey) => {
                      const isSel = studentContext.targetExam === eKey;
                      return (
                        <button
                          key={eKey}
                          onClick={() => {
                            studentContext.switchExam(eKey);
                            setExamMenuOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs rounded-xl transition-colors flex items-center justify-between ${
                            isSel
                              ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                              : 'text-slate-200 hover:bg-white/10'
                          }`}
                        >
                          <span>{eKey}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {EXAM_CONFIGS[eKey].currentCycle}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Notification Bell */}
              <NotificationBellDropdown />

              {/* Level & Streak Badge */}
              {gamification && (
                <div className="liquid-glass rounded-full px-3 py-1 text-xs border border-white/10 flex items-center gap-2 font-mono">
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-amber-400/20" /> {gamification.current_streak}d
                  </span>
                  <span className="text-slate-500">|</span>
                  <span className="text-cyan-300 font-semibold">Lvl {gamification.level}</span>
                </div>
              )}

              {/* Logged In Short Name + Avatar Badge */}
              <div className="relative flex items-center h-full">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="liquid-glass rounded-full pl-1.5 pr-3 py-1 flex items-center gap-2 border border-white/10 hover:scale-[1.02] transition-transform cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 select-none"
                  aria-label="User menu"
                  aria-expanded={userMenuOpen}
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={fullName}
                      className="w-7 h-7 rounded-full object-cover border border-white/20"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-500 text-white font-semibold text-xs flex items-center justify-center border border-white/20">
                      {initialLetter}
                    </div>
                  )}
                  <span className="text-xs font-medium text-foreground tracking-wide">{firstName}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* User Dropdown */}
                {userMenuOpen && (
                  <div
                    className="!absolute right-0 top-full mt-2 w-56 rounded-2xl bg-[#062B3D]/95 backdrop-blur-xl border border-white/20 p-2 shadow-2xl z-50 animate-fade-rise"
                    role="menu"
                  >
                    <div className="px-3 py-2 border-b border-white/10 mb-1">
                      <p className="text-xs font-semibold text-foreground truncate">{fullName}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs text-foreground hover:bg-white/10 rounded-xl transition-colors"
                      role="menuitem"
                    >
                      <LayoutDashboard className="w-4 h-4 text-cyan-400" />
                      Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs text-foreground hover:bg-white/10 rounded-xl transition-colors"
                      role="menuitem"
                    >
                      <Settings className="w-4 h-4 text-indigo-400" />
                      Profile & Settings
                    </Link>
                    <Link
                      to="/community"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs text-foreground hover:bg-white/10 rounded-xl transition-colors"
                      role="menuitem"
                    >
                      <Users className="w-4 h-4 text-purple-400" />
                      Study Circles
                    </Link>
                    <div className="my-1 border-t border-white/10" />
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        signOut();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
                      role="menuitem"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-xs font-medium text-slate-600 hover:text-[#062B3D] transition-colors px-3 py-2 focus-visible:outline-none rounded"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="gradient-cta text-xs font-semibold px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-shadow"
              >
                Start studying
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded p-2"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile Menu Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <div className="absolute inset-x-4 top-4 bg-[#062B3D]/95 backdrop-blur-xl border border-white/20 rounded-2xl p-6 flex flex-col space-y-2 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <div onClick={() => setMobileOpen(false)}>
                <Logo size="sm" />
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded"
                aria-label="Close navigation menu"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {(user ? [...loggedInPrimaryNavItems, ...secondaryNavItems] : publicNavItems).map(({ label, path }) => (
              <Link
                key={label}
                to={path}
                onClick={() => setMobileOpen(false)}
                className={`text-left text-base py-3 border-b border-white/5 last:border-none transition-colors block focus-visible:outline-none rounded ${
                  isActive(path)
                    ? 'text-cyan-300 font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {label}
              </Link>
            ))}

            {/* Mobile Auth Area */}
            <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
              {loading ? (
                <div className="w-full h-12 rounded-full skeleton-pulse liquid-glass" />
              ) : user ? (
                <>
                  <div className="flex items-center gap-3 py-2 px-3 rounded-xl bg-white/5">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={fullName} className="w-9 h-9 rounded-full object-cover" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-cyan-500 text-white font-bold flex items-center justify-center">
                        {initialLetter}
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <p className="text-sm font-semibold text-foreground truncate">{fullName}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="w-full text-center py-3 rounded-full bg-cyan-500/20 text-cyan-300 font-medium text-sm hover:bg-cyan-500/30 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      signOut();
                    }}
                    className="w-full text-center py-3 rounded-full bg-red-500/10 text-red-400 font-medium text-sm hover:bg-red-500/20 transition-colors"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="w-full text-center py-3 rounded-full border border-white/20 text-foreground font-medium text-sm hover:bg-white/10 transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileOpen(false)}
                    className="w-full text-center py-3 rounded-full gradient-cta text-white font-semibold text-sm"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
