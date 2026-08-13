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
      if (window.scrollY > 20) {
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
            ? 'h-[68px] bg-forest/95 backdrop-blur-xl shadow-card border-b border-forest/20 text-paper rounded-b-2xl'
            : 'h-[88px] bg-forest text-paper'
        }`}
      >
        {/* Logo */}
        <Logo size="md" />

        {/* Desktop Nav with Animated Active Pill */}
        <div className="hidden md:flex items-center space-x-1.5 relative">
          {activeNavItems.map(({ label, path }) => {
            const active = isActive(path);
            return (
              <Link
                key={label}
                to={path}
                className={`relative px-3.5 py-1.5 text-sm transition-colors rounded-full focus-visible:outline-none ${
                  active
                    ? 'text-gold font-semibold'
                    : 'text-sage hover:text-paper font-medium'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="navbar-active-pill"
                    className="absolute inset-0 bg-scholar/40 rounded-full border border-sage/30 pointer-events-none"
                    transition={{ type: 'spring', stiffness: 280, damping: 26 }}
                  />
                )}
                <span className="relative z-10">{label}</span>
              </Link>
            );
          })}

          {/* More ▾ Dropdown */}
          {user && (
            <div className="relative inline-block" ref={moreRef}>
              <button
                type="button"
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className={`text-sm transition-colors flex items-center gap-1.5 focus-visible:outline-none py-1.5 px-3 rounded-full cursor-pointer ${
                  moreMenuOpen || isSecondaryActive
                    ? 'text-gold font-semibold bg-scholar/40'
                    : 'text-sage hover:text-paper font-medium'
                }`}
                aria-label="More features menu"
                aria-expanded={moreMenuOpen}
              >
                <span>More</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${moreMenuOpen ? 'rotate-180 text-gold' : ''}`} />
              </button>

              {moreMenuOpen && (
                <div className="!absolute left-0 top-full mt-2 w-64 rounded-2xl bg-forest backdrop-blur-xl border border-sage/20 p-2 shadow-deep z-50 animate-fade-rise max-h-[calc(100vh-110px)] overflow-y-auto custom-scrollbar">
                  {secondaryNavItems.map(({ label, path, icon: Icon }) => (
                    <Link
                      key={label}
                      to={path}
                      onClick={() => setMoreMenuOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2.5 text-xs rounded-xl transition-colors ${
                        isActive(path)
                          ? 'bg-scholar text-gold font-semibold border border-sage/30'
                          : 'text-sage hover:bg-scholar/30 hover:text-paper'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-gold shrink-0" />
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
                  className="bg-[#EAF2F7] rounded-full px-3 py-1 text-xs border border-[#1F5F8B]/20 text-[#1F5F8B] font-semibold flex items-center gap-1.5 hover:bg-[#1F5F8B]/10 transition-colors"
                >
                  <Shield className="w-3.5 h-3.5 text-[#1F5F8B]" />
                  <span>{studentContext.targetExam} {studentContext.targetExamYear}</span>
                  <ChevronDown className={`w-3 h-3 text-[#1F5F8B] transition-transform ${examMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {examMenuOpen && (
                  <div className="!absolute left-0 top-full mt-2 w-52 rounded-2xl bg-[#10233F] backdrop-blur-xl border border-white/12 p-2 shadow-2xl z-50 animate-fade-rise">
                    <div className="px-3 py-1.5 text-[10px] uppercase font-semibold text-[#627083] border-b border-white/10 mb-1">
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
                              ? 'bg-[#1F5F8B]/30 text-[#4E88B7] font-semibold border border-[#4E88B7]/30'
                              : 'text-[#FCFBF8]/80 hover:bg-white/10'
                          }`}
                        >
                          <span>{eKey}</span>
                          <span className="text-[10px] text-[#627083] font-mono">
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
                <div className="bg-[#EAF2F7] rounded-full px-3 py-1 text-xs border border-[#10233F]/08 flex items-center gap-2 font-mono text-[#172033]">
                  <span className="text-[#D99A3D] font-bold flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-[#D99A3D]/20 text-[#D99A3D]" /> {gamification.current_streak}d
                  </span>
                  <span className="text-[#627083]">|</span>
                  <span className="text-[#1F5F8B] font-semibold">Lvl {gamification.level}</span>
                </div>
              )}

              {/* Logged In Avatar Badge */}
              <div className="relative flex items-center h-full">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="bg-[#FCFBF8] rounded-full pl-1.5 pr-3 py-1 flex items-center gap-2 border border-[#10233F]/12 hover:shadow-sm transition-all cursor-pointer focus-visible:outline-none select-none"
                  aria-label="User menu"
                  aria-expanded={userMenuOpen}
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={fullName}
                      className="w-7 h-7 rounded-full object-cover border border-[#10233F]/10"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#1F5F8B] to-[#4E88B7] text-white font-semibold text-xs flex items-center justify-center">
                      {initialLetter}
                    </div>
                  )}
                  <span className="text-xs font-medium text-[#172033] tracking-wide">{firstName}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-[#627083] transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* User Dropdown */}
                {userMenuOpen && (
                  <div
                    className="!absolute right-0 top-full mt-2 w-56 rounded-2xl bg-[#10233F] backdrop-blur-xl border border-white/12 p-2 shadow-2xl z-50 animate-fade-rise"
                    role="menu"
                  >
                    <div className="px-3 py-2 border-b border-white/10 mb-1">
                      <p className="text-xs font-semibold text-[#FCFBF8] truncate">{fullName}</p>
                      <p className="text-[10px] text-white/60 truncate">{user.email}</p>
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs text-[#FCFBF8] hover:bg-white/10 rounded-xl transition-colors"
                      role="menuitem"
                    >
                      <LayoutDashboard className="w-4 h-4 text-[#4E88B7]" />
                      Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs text-[#FCFBF8] hover:bg-white/10 rounded-xl transition-colors"
                      role="menuitem"
                    >
                      <Settings className="w-4 h-4 text-[#4E88B7]" />
                      Profile & Settings
                    </Link>
                    <Link
                      to="/community"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs text-[#FCFBF8] hover:bg-white/10 rounded-xl transition-colors"
                      role="menuitem"
                    >
                      <Users className="w-4 h-4 text-[#FCDAB7]" />
                      Study Circles
                    </Link>
                    <div className="my-1 border-t border-white/10" />
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        signOut();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#C95C5C] hover:bg-[#C95C5C]/10 rounded-xl transition-colors cursor-pointer"
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
                className="text-xs font-medium text-[#3D4A5A] hover:text-[#10233F] transition-colors px-3 py-2 focus-visible:outline-none rounded"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="gradient-cta text-xs font-semibold px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all"
              >
                Start studying
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-[#172033] focus-visible:outline-none rounded p-2"
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
            className="absolute inset-0 bg-[#10233F]/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <div className="absolute inset-x-4 top-4 bg-[#10233F] backdrop-blur-xl border border-white/12 rounded-2xl p-6 flex flex-col space-y-2 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <div onClick={() => setMobileOpen(false)}>
                <Logo size="sm" />
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-white/60 hover:text-white transition-colors p-2 focus-visible:outline-none rounded"
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
                    ? 'text-[#4E88B7] font-semibold'
                    : 'text-[#FCFBF8]/75 hover:text-white'
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
                      <div className="w-9 h-9 rounded-full bg-[#1F5F8B] text-white font-bold flex items-center justify-center">
                        {initialLetter}
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <p className="text-sm font-semibold text-[#FCFBF8] truncate">{fullName}</p>
                      <p className="text-xs text-white/60 truncate">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="w-full text-center py-3 rounded-full bg-[#1F5F8B] text-white font-semibold text-sm hover:bg-[#1F5F8B]/80 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      signOut();
                    }}
                    className="w-full text-center py-3 rounded-full bg-[#C95C5C]/20 text-[#C95C5C] font-semibold text-sm hover:bg-[#C95C5C]/30 transition-colors"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="w-full text-center py-3 rounded-full border border-white/20 text-[#FCFBF8] font-medium text-sm hover:bg-white/10 transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileOpen(false)}
                    className="w-full text-center py-3 rounded-full gradient-cta text-white font-semibold text-sm"
                  >
                    Start studying
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
