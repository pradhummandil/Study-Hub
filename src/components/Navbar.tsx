import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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

  // Scroll listener for dynamic green-to-white background transition
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
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
    <motion.header
      className="sticky top-0 z-40 w-full"
      initial={false}
      animate={{
        backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.95)' : '#1B3022',
        boxShadow: isScrolled ? '0 4px 20px -2px rgba(28, 32, 29, 0.08)' : '0 0 0 rgba(0,0,0,0)',
      }}
      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div
        className={`relative z-40 flex flex-row items-center justify-between px-6 md:px-8 max-w-7xl mx-auto w-full transition-all duration-300 ${
          isScrolled
            ? 'h-[68px] border-b border-[#1C201D]/10 backdrop-blur-xl'
            : 'h-[84px] bg-[#1B3022]'
        }`}
      >
        {/* Logo with dynamic dark/light variant */}
        <Logo size="md" variant={isScrolled ? 'light' : 'dark'} />

        {/* Desktop Navigation Rail with Framer Motion Active Pill */}
        <div className="hidden md:flex items-center space-x-1 relative">
          {activeNavItems.map(({ label, path }) => {
            const active = isActive(path);
            return (
              <Link
                key={label}
                to={path}
                className={`relative px-4 py-2 text-xs font-semibold tracking-wide transition-colors rounded-full focus-visible:outline-none ${
                  isScrolled
                    ? active
                      ? 'text-[#FFFFFF]'
                      : 'text-[#6C706D] hover:text-[#1C201D]'
                    : active
                    ? 'text-[#FFFFFF]'
                    : 'text-[#EDE8DB] hover:text-[#FFFFFF]'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="activeNavPill"
                    className={`absolute inset-0 rounded-full ${
                      isScrolled
                        ? 'bg-[#2D5A3F] shadow-sm'
                        : 'bg-[#2D5A3F] border border-[#D4AF37]/30 shadow-sm'
                    }`}
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
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
                className={`text-xs font-semibold transition-colors flex items-center gap-1.5 focus-visible:outline-none py-2 px-3.5 rounded-full cursor-pointer ${
                  isScrolled
                    ? moreMenuOpen || isSecondaryActive
                      ? 'bg-[#2D5A3F] text-[#FFFFFF]'
                      : 'text-[#6C706D] hover:text-[#1C201D]'
                    : moreMenuOpen || isSecondaryActive
                    ? 'bg-[#2D5A3F] text-[#FFFFFF] border border-[#D4AF37]/30'
                    : 'text-[#EDE8DB] hover:text-[#FFFFFF]'
                }`}
                aria-label="More features menu"
                aria-expanded={moreMenuOpen}
              >
                <span>More</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${moreMenuOpen ? 'rotate-180 text-[#D4AF37]' : ''}`} />
              </button>

              <AnimatePresence>
                {moreMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.2 }}
                    className="!absolute left-0 top-full mt-2 w-64 rounded-2xl bg-[#FFFFFF] border border-[#1C201D]/10 p-2 shadow-2xl z-50 max-h-[calc(100vh-110px)] overflow-y-auto no-scrollbar"
                  >
                    {secondaryNavItems.map(({ label, path, icon: Icon }) => (
                      <Link
                        key={label}
                        to={path}
                        onClick={() => setMoreMenuOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium rounded-xl transition-colors ${
                          isActive(path)
                            ? 'bg-[#2D5A3F] text-[#FFFFFF] font-bold'
                            : 'text-[#1C201D] hover:bg-[#EDE8DB]'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-[#C86D51] shrink-0" />
                        <span>{label}</span>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Desktop Auth & Action Controls */}
        <div className="hidden md:flex items-center space-x-3 relative h-10" ref={menuRef}>
          {loading ? (
            <div className="w-28 h-9 rounded-full bg-[#EDE8DB] animate-pulse" />
          ) : user ? (
            <>
              {/* Exam Context Selector Badge */}
              <div className="relative" ref={examRef}>
                <button
                  type="button"
                  onClick={() => setExamMenuOpen(!examMenuOpen)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5 border transition-all ${
                    isScrolled
                      ? 'bg-[#EDE8DB] text-[#1C201D] border-[#1C201D]/10 hover:bg-[#EDE8DB]/80'
                      : 'bg-[#2D5A3F]/50 text-[#EDE8DB] border-[#2D5A3F] hover:bg-[#2D5A3F]'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{studentContext.targetExam} {studentContext.targetExamYear}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${examMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {examMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      className="!absolute left-0 top-full mt-2 w-52 rounded-2xl bg-[#FFFFFF] border border-[#1C201D]/10 p-2 shadow-2xl z-50"
                    >
                      <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-[#6C706D] border-b border-[#1C201D]/10 mb-1">
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
                            className={`w-full text-left px-3 py-2 text-xs font-medium rounded-xl transition-colors flex items-center justify-between ${
                              isSel
                                ? 'bg-[#2D5A3F] text-[#FFFFFF] font-bold'
                                : 'text-[#1C201D] hover:bg-[#EDE8DB]'
                            }`}
                          >
                            <span>{eKey}</span>
                            <span className="text-[10px] font-mono">
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

              {/* Level & Streak Badge */}
              {gamification && (
                <div className={`rounded-full px-3 py-1 text-xs border flex items-center gap-2 font-mono ${
                  isScrolled ? 'bg-[#EDE8DB] text-[#1C201D] border-[#1C201D]/10' : 'bg-[#1C201D]/60 text-[#FFFFFF] border-[#FFFFFF]/10'
                }`}>
                  <span className="text-[#D4AF37] font-bold flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-[#D4AF37]/20 text-[#D4AF37]" /> {gamification.current_streak}d
                  </span>
                  <span className="text-[#6C706D]">|</span>
                  <span className="font-semibold">Lvl {gamification.level}</span>
                </div>
              )}

              {/* Logged In Avatar Badge */}
              <div className="relative flex items-center h-full">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={`rounded-full pl-1.5 pr-3 py-1 flex items-center gap-2 border transition-all cursor-pointer focus-visible:outline-none select-none ${
                    isScrolled
                      ? 'bg-[#EDE8DB] text-[#1C201D] border-[#1C201D]/10 hover:bg-[#EDE8DB]/80'
                      : 'bg-[#2D5A3F]/50 text-[#FFFFFF] border-[#2D5A3F] hover:bg-[#2D5A3F]'
                  }`}
                  aria-label="User menu"
                  aria-expanded={userMenuOpen}
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={fullName}
                      className="w-7 h-7 rounded-full object-cover border border-[#2D5A3F]"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[#2D5A3F] text-[#D4AF37] font-bold text-xs flex items-center justify-center border border-[#D4AF37]/30">
                      {initialLetter}
                    </div>
                  )}
                  <span className="text-xs font-bold tracking-wide">{firstName}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* User Dropdown */}
                {userMenuOpen && (
                  <div
                    className="!absolute right-0 top-full mt-2 w-56 rounded-2xl bg-[#FFFFFF] border border-[#1C201D]/10 p-2 shadow-2xl z-50 animate-fade-rise"
                    role="menu"
                  >
                    <div className="px-3 py-2 border-b border-[#1C201D]/10 mb-1">
                      <p className="text-xs font-bold text-[#1C201D] truncate">{fullName}</p>
                      <p className="text-[10px] text-[#6C706D] truncate">{user.email}</p>
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#1C201D] hover:bg-[#EDE8DB] rounded-xl transition-colors"
                      role="menuitem"
                    >
                      <LayoutDashboard className="w-4 h-4 text-[#2D5A3F]" />
                      Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#1C201D] hover:bg-[#EDE8DB] rounded-xl transition-colors"
                      role="menuitem"
                    >
                      <Settings className="w-4 h-4 text-[#2D5A3F]" />
                      Profile & Settings
                    </Link>
                    <Link
                      to="/community"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#1C201D] hover:bg-[#EDE8DB] rounded-xl transition-colors"
                      role="menuitem"
                    >
                      <Users className="w-4 h-4 text-[#C86D51]" />
                      Study Circles
                    </Link>
                    <div className="my-1 border-t border-[#1C201D]/10" />
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        signOut();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-[#C86D51] hover:bg-[#C86D51]/10 rounded-xl transition-colors cursor-pointer"
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
                className={`text-xs font-bold transition-colors px-3 py-2 focus-visible:outline-none rounded ${
                  isScrolled ? 'text-[#1C201D] hover:text-[#2D5A3F]' : 'text-[#EDE8DB] hover:text-[#FFFFFF]'
                }`}
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="bg-[#2D5A3F] hover:bg-[#2D5A3F]/90 text-[#FFFFFF] text-xs font-bold px-4.5 py-2.5 rounded-full shadow-md transition-all cursor-pointer"
              >
                Start studying
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`md:hidden focus-visible:outline-none rounded p-2 transition-colors ${
            isScrolled ? 'text-[#1C201D]' : 'text-[#FFFFFF]'
          }`}
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

      {/* Mobile Menu Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <div
            className="absolute inset-0 bg-[#1C201D]/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-x-4 top-4 bg-[#FFFFFF] border border-[#1C201D]/10 rounded-2xl p-6 flex flex-col space-y-2 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <div onClick={() => setMobileOpen(false)}>
                <Logo size="sm" variant="light" />
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-[#6C706D] hover:text-[#1C201D] transition-colors p-2"
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
                className={`text-left text-sm py-3 border-b border-[#1C201D]/10 last:border-none transition-colors block font-semibold ${
                  isActive(path)
                    ? 'text-[#2D5A3F] font-bold'
                    : 'text-[#1C201D] hover:text-[#2D5A3F]'
                }`}
              >
                {label}
              </Link>
            ))}

            {/* Mobile Auth Area */}
            <div className="pt-4 border-t border-[#1C201D]/10 flex flex-col gap-3">
              {loading ? (
                <div className="w-full h-12 rounded-full bg-[#EDE8DB] animate-pulse" />
              ) : user ? (
                <>
                  <div className="flex items-center gap-3 py-2 px-3 rounded-xl bg-[#F8F6F0] border border-[#1C201D]/10">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={fullName} className="w-9 h-9 rounded-full object-cover" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-[#2D5A3F] text-[#D4AF37] font-bold flex items-center justify-center">
                        {initialLetter}
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-[#1C201D] truncate">{fullName}</p>
                      <p className="text-xs text-[#6C706D] truncate">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="w-full text-center py-3 rounded-full bg-[#2D5A3F] text-[#FFFFFF] font-bold text-sm shadow-sm"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      signOut();
                    }}
                    className="w-full text-center py-3 rounded-full bg-[#C86D51]/10 text-[#C86D51] font-bold text-sm"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="w-full text-center py-3 rounded-full border border-[#1C201D]/10 text-[#1C201D] font-bold text-sm"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileOpen(false)}
                    className="w-full text-center py-3 rounded-full bg-[#2D5A3F] text-[#FFFFFF] font-bold text-sm shadow-sm"
                  >
                    Start studying
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.header>
  );
};
