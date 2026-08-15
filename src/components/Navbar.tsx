import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useStudentContext } from '../context/StudentContext';
import { EXAM_CONFIGS, type ExamCategory } from '../types/student-core';
import {
  LogOut,
  Settings,
  ChevronDown,
  LayoutDashboard,
  Users,
  BookOpen,
  Layers,
  Flame,
  RotateCcw,
  Zap,
  Trophy,
  Shield,
  TrendingUp,
  FileText,
  Info,
  PhoneCall,
  Award,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { NotificationBellDropdown } from './notifications/NotificationBellDropdown';
import { Logo } from './ui/Logo';
import { fetchProfileGamification } from '../lib/profile/profileApi';
import type { StudentGamification } from '../types/ecosystem';

const loggedInPrimaryNavItems = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Studio', path: '/studio' },
  { label: 'Video Learning', path: '/video-learning' },
  { label: 'Study Materials', path: '/study-materials' },
  { label: 'Study AI', path: '/study-ai' },
  { label: 'Roadmap', path: '/roadmap' },
  { label: 'Practice', path: '/practice' },
  { label: 'Mock Tests', path: '/mock-tests' },
  { label: 'Community', path: '/community' },
];

const publicNavItems = [
  { label: 'Home', path: '/' },
  { label: 'Video Learning', path: '/video-learning' },
  { label: 'Study Materials', path: '/study-materials' },
  { label: 'Studio', path: '/studio' },
  { label: 'Study AI', path: '/study-ai' },
  { label: 'Exams', path: '/exams' },
  { label: 'Journal', path: '/journal' },
  { label: 'Community', path: '/community' },
];

const secondaryNavItems = [
  { label: 'Exam Catalog', path: '/exams', icon: BookOpen },
  { label: 'Exam Simulator', path: '/exam-simulator', icon: Trophy },
  { label: 'Focus Room', path: '/focus-room', icon: RotateCcw },
  { label: 'Spaced Revision', path: '/revision', icon: RotateCcw },
  { label: 'Mistakes Notebook', path: '/mistakes', icon: Flame },
  { label: 'Flashcards Decks', path: '/flashcards', icon: Layers },
  { label: 'Adaptive Practice', path: '/adaptive-practice', icon: Zap },
  { label: 'Performance Analytics', path: '/performance', icon: TrendingUp },
  { label: 'Pricing & Plans', path: '/pricing', icon: Award },
  { label: 'Referrals & Rewards', path: '/referrals', icon: Users },
  { label: 'Leaderboards', path: '/leaderboards', icon: Award },
  { label: 'Journal Articles', path: '/journal', icon: FileText },
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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
    setMoreMenuOpen(false);
    setExamMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (user) {
      fetchProfileGamification(user.id).then((g) => {
        if (g) setGamification(g);
      });
    }
  }, [user, location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setMoreMenuOpen(false);
      }
      if (examRef.current && !examRef.current.contains(event.target as Node)) {
        setExamMenuOpen(false);
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
  const fullName = user?.user_metadata?.full_name || user?.email || 'Student';
  const firstName = fullName.split(' ')[0].split('@')[0];
  const initialLetter = (fullName[0] || 'S').toUpperCase();

  const activeNavItems = user ? loggedInPrimaryNavItems : publicNavItems;

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-paper/95 backdrop-blur-md border-b border-forest/10 shadow-sm py-0'
          : 'bg-paper border-b border-forest/10 py-1'
      }`}
    >
      <div className="flex flex-row items-center justify-between px-4 sm:px-6 md:px-8 max-w-[1440px] mx-auto w-full h-[64px]">
        {/* Left: Study Hub Logo */}
        <div className="shrink-0 flex items-center gap-3">
          <Logo size="md" variant="light" />
        </div>

        {/* Center: Primary Navigation Rail with Framer Motion Animated Active Pill */}
        <div className="hidden lg:flex items-center space-x-1 relative">
          {activeNavItems.map(({ label, path }) => {
            const active = isActive(path);
            return (
              <Link
                key={label}
                to={path}
                className={`relative px-3 py-1.5 text-xs font-medium tracking-wide transition-colors rounded-full focus-visible:outline-none flex items-center gap-1.5 ${
                  active ? 'text-ink font-semibold' : 'text-ink/70 hover:text-ink'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="activeNavPill"
                    className="absolute inset-0 bg-parchment/80 rounded-full border border-forest/10 shadow-xs"
                    transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5 font-sans">
                  {active && <span className="w-1.5 h-1.5 rounded-full bg-scholar inline-block" />}
                  {label}
                </span>
              </Link>
            );
          })}

          {/* More ▾ Dropdown */}
          {user && (
            <div className="relative inline-block" ref={moreRef}>
              <button
                type="button"
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className={`text-xs font-medium transition-colors flex items-center gap-1 focus-visible:outline-none py-1.5 px-3 rounded-full cursor-pointer ${
                  moreMenuOpen || isSecondaryActive
                    ? 'bg-parchment text-ink border border-forest/10 font-semibold'
                    : 'text-ink/70 hover:text-ink'
                }`}
                aria-label="More features menu"
              >
                <span>More</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    moreMenuOpen ? 'rotate-180 text-scholar' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {moreMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.18 }}
                    className="!absolute left-0 top-full mt-2 w-64 rounded-2xl bg-paper border border-forest/10 p-2 shadow-deep z-50 max-h-[calc(100vh-110px)] overflow-y-auto no-scrollbar"
                  >
                    {secondaryNavItems.map(({ label, path, icon: Icon }) => (
                      <Link
                        key={label}
                        to={path}
                        onClick={() => setMoreMenuOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl transition-colors ${
                          isActive(path)
                            ? 'bg-parchment text-ink font-bold border border-forest/10'
                            : 'text-ink/80 hover:bg-parchment/60'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-scholar shrink-0" />
                        <span>{label}</span>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Right: Target Exam Switcher, Notifications, Profile Dropdown */}
        <div className="hidden md:flex items-center space-x-3 relative" ref={menuRef}>
          {loading ? (
            <div className="w-32 h-9 rounded-full bg-parchment animate-pulse" />
          ) : user ? (
            <>
              {/* Target Exam Context Selector Dropdown */}
              <div className="relative" ref={examRef}>
                <button
                  type="button"
                  onClick={() => setExamMenuOpen(!examMenuOpen)}
                  className="rounded-full px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 border bg-forest/5 text-ink border-forest/15 hover:bg-forest/10 transition-all cursor-pointer font-mono"
                  title="Switch Target Exam Context"
                >
                  <Shield className="w-3.5 h-3.5 text-scholar shrink-0" />
                  <span>
                    {studentContext.targetExam} {studentContext.targetExamYear}
                  </span>
                  <ChevronDown
                    className={`w-3 h-3 text-muted transition-transform ${
                      examMenuOpen ? 'rotate-180 text-scholar' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {examMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.96 }}
                      transition={{ duration: 0.18 }}
                      className="!absolute right-0 top-full mt-2 w-56 rounded-2xl bg-paper border border-forest/15 p-2 shadow-deep z-50 max-h-[70vh] overflow-y-auto"
                    >
                      <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold text-muted border-b border-forest/10 mb-1">
                        Select Target Exam
                      </div>
                      {(Object.keys(EXAM_CONFIGS) as ExamCategory[]).map((eKey) => {
                        const isSelected = studentContext.targetExam === eKey;
                        return (
                          <button
                            key={eKey}
                            onClick={() => {
                              studentContext.switchExam(eKey);
                              setExamMenuOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-xs font-medium rounded-xl transition-colors flex items-center justify-between ${
                              isSelected
                                ? 'bg-scholar text-paper font-bold'
                                : 'text-ink hover:bg-parchment'
                            }`}
                          >
                            <span>{eKey}</span>
                            <span
                              className={`text-[10px] font-mono ${
                                isSelected ? 'text-gold' : 'text-muted'
                              }`}
                            >
                              {EXAM_CONFIGS[eKey].currentCycle}
                            </span>
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Notification Bell */}
              <NotificationBellDropdown />

              {/* Lightweight Streak Badge */}
              {gamification && (
                <Link
                  to="/performance"
                  className="rounded-full px-3 py-1 text-xs border border-forest/15 bg-parchment/60 text-ink flex items-center gap-1.5 font-mono hover:bg-parchment transition-colors"
                >
                  <Flame className="w-3.5 h-3.5 text-gold fill-gold/20" />
                  <span className="font-bold text-ink">{gamification.current_streak}d</span>
                </Link>
              )}

              {/* User Profile Menu Dropdown */}
              <div className="relative flex items-center">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="rounded-full pl-1.5 pr-3 py-1 flex items-center gap-2 border bg-parchment/50 text-ink border-forest/15 hover:bg-parchment transition-all cursor-pointer focus-visible:outline-none select-none"
                  aria-label="User profile menu"
                  aria-expanded={userMenuOpen}
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={fullName}
                      className="w-7 h-7 rounded-full object-cover border border-forest/20"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-forest text-gold font-bold text-xs flex items-center justify-center font-mono">
                      {initialLetter}
                    </div>
                  )}
                  <span className="text-xs font-semibold tracking-wide">{firstName}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-muted transition-transform duration-200 ${
                      userMenuOpen ? 'rotate-180 text-scholar' : ''
                    }`}
                  />
                </button>

                {/* User Dropdown */}
                {userMenuOpen && (
                  <div
                    className="!absolute right-0 top-full mt-2 w-60 rounded-2xl bg-paper border border-forest/15 p-2 shadow-deep z-50 animate-fade-rise"
                    role="menu"
                  >
                    <div className="px-3 py-2 border-b border-forest/10 mb-1">
                      <p className="text-xs font-bold text-ink truncate">{fullName}</p>
                      <p className="text-[10px] text-muted truncate">{user.email}</p>
                      <div className="mt-1 flex items-center gap-1.5 text-[10px] font-mono text-scholar font-semibold">
                        <Sparkles className="w-3 h-3 text-gold" />
                        <span>{studentContext.targetExam} Aspirant</span>
                      </div>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-ink hover:bg-parchment rounded-xl transition-colors"
                      role="menuitem"
                    >
                      <LayoutDashboard className="w-4 h-4 text-scholar" />
                      Dashboard Command Center
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-ink hover:bg-parchment rounded-xl transition-colors"
                      role="menuitem"
                    >
                      <Settings className="w-4 h-4 text-scholar" />
                      Profile & Study Setup
                    </Link>
                    <Link
                      to="/performance"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-ink hover:bg-parchment rounded-xl transition-colors"
                      role="menuitem"
                    >
                      <TrendingUp className="w-4 h-4 text-scholar" />
                      Performance Analytics
                    </Link>
                    <Link
                      to="/community"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-ink hover:bg-parchment rounded-xl transition-colors"
                      role="menuitem"
                    >
                      <Users className="w-4 h-4 text-scholar" />
                      Community & Circles
                    </Link>

                    <div className="my-1 border-t border-forest/10" />

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        signOut();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-terracotta hover:bg-terracotta/10 rounded-xl transition-colors cursor-pointer"
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
                className="text-xs font-semibold text-ink hover:text-scholar transition-colors px-3 py-2 focus-visible:outline-none rounded"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="px-5 py-2.5 rounded-full bg-scholar hover:bg-forest text-paper text-xs font-bold tracking-wide shadow-md transition-all whitespace-nowrap inline-flex items-center gap-1.5 shrink-0"
              >
                <span>Start studying</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Hamburger Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden text-ink focus-visible:outline-none rounded p-2 transition-colors"
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
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-forest/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-x-4 top-4 bg-paper border border-forest/15 rounded-2xl p-5 flex flex-col space-y-3 shadow-deep max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-forest/10">
              <div onClick={() => setMobileOpen(false)}>
                <Logo size="sm" variant="light" />
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-muted hover:text-ink transition-colors p-1"
                aria-label="Close navigation menu"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Exam context selector inside mobile menu */}
            {user && (
              <div className="py-2">
                <div className="text-[10px] uppercase font-bold text-muted mb-1 font-mono">
                  Active Target Exam
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {(Object.keys(EXAM_CONFIGS) as ExamCategory[]).slice(0, 6).map((eKey) => (
                    <button
                      key={eKey}
                      onClick={() => {
                        studentContext.switchExam(eKey);
                        setMobileOpen(false);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold text-left border ${
                        studentContext.targetExam === eKey
                          ? 'bg-scholar text-paper border-scholar'
                          : 'bg-parchment/60 text-ink border-forest/10'
                      }`}
                    >
                      {eKey}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-1">
              {(user ? [...loggedInPrimaryNavItems, ...secondaryNavItems] : publicNavItems).map(
                ({ label, path }) => (
                  <Link
                    key={label}
                    to={path}
                    onClick={() => setMobileOpen(false)}
                    className={`text-left text-sm py-2 px-3 rounded-xl transition-colors block font-medium ${
                      isActive(path)
                        ? 'bg-parchment text-ink font-bold'
                        : 'text-ink/80 hover:bg-parchment/50'
                    }`}
                  >
                    {label}
                  </Link>
                )
              )}
            </div>

            {/* Mobile Auth Section */}
            <div className="pt-3 border-t border-forest/10 flex flex-col gap-2">
              {loading ? (
                <div className="w-full h-10 rounded-full bg-parchment animate-pulse" />
              ) : user ? (
                <>
                  <div className="flex items-center gap-3 py-2 px-3 rounded-xl bg-parchment/60 border border-forest/10">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={fullName} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-forest text-gold font-bold text-xs flex items-center justify-center font-mono">
                        {initialLetter}
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-ink truncate">{fullName}</p>
                      <p className="text-[10px] text-muted truncate">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      signOut();
                    }}
                    className="w-full text-center py-2.5 rounded-xl bg-terracotta/10 text-terracotta font-bold text-xs"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl border border-forest/15 text-ink font-bold text-xs"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl bg-scholar text-paper font-bold text-xs"
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
