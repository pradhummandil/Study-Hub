import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Clock, Settings, ChevronDown, LayoutDashboard } from 'lucide-react';

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Studio', path: '/studio' },
  { label: 'Focus Room', path: '/focus-room' },
  { label: 'Study AI', path: '/study-ai' },
  { label: 'About', path: '/about' },
  { label: 'Journal', path: '/journal' },
  { label: 'Community', path: '/community' },
  { label: 'Reach Us', path: '/reach-us' },
];

export const Navbar = () => {
  const location = useLocation();
  const { user, loading, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  // Close user dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const fullName = user?.user_metadata?.full_name || user?.email || 'User';
  const firstName = fullName.split(' ')[0].split('@')[0];
  const initialLetter = (fullName[0] || 'U').toUpperCase();

  return (
    <>
      {/* Nav container has fixed height h-[88px] to ensure zero layout shift when dropdown opens */}
      <nav className="relative z-40 flex flex-row items-center justify-between px-6 md:px-8 h-[88px] max-w-7xl mx-auto w-full shrink-0">
        {/* Logo */}
        <Link
          to="/"
          aria-label="Study Hub home"
          className="transition-opacity hover:opacity-90 flex items-center shrink-0 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 rounded-lg py-1"
        >
          <img
            src="/images/logo-transparent.png"
            alt="Study Hub"
            className="h-9 sm:h-10 md:h-11 w-auto object-contain"
          />
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center space-x-8">
          {navItems.map(({ label, path }) => (
            <Link
              key={label}
              to={path}
              className={`text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded ${
                isActive(path)
                  ? 'text-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Desktop Auth / Action Area */}
        <div className="hidden md:flex items-center space-x-4 relative h-10" ref={menuRef}>
          {loading ? (
            <div className="w-28 h-9 rounded-full skeleton-pulse liquid-glass" />
          ) : user ? (
            /* Logged In Short Name + Avatar Badge */
            <div className="relative flex items-center h-full">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="liquid-glass rounded-full pl-1.5 pr-4 py-1 flex items-center gap-2 border border-white/10 hover:scale-[1.02] transition-transform cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 select-none"
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
                  className="absolute right-0 top-full mt-2 w-56 rounded-2xl liquid-glass border border-white/15 p-2 shadow-2xl z-50 animate-fade-rise"
                  role="menu"
                >
                  <div className="px-3 py-2 border-b border-white/10 mb-1">
                    <p className="text-xs font-semibold text-foreground truncate">{fullName}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2.5 px-3 py-2 text-xs text-foreground hover:bg-white/10 rounded-xl transition-colors"
                    role="menuitem"
                  >
                    <LayoutDashboard className="w-4 h-4 text-cyan-400" />
                    Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2.5 px-3 py-2 text-xs text-foreground hover:bg-white/10 rounded-xl transition-colors"
                    role="menuitem"
                  >
                    <Settings className="w-4 h-4 text-indigo-400" />
                    Profile & Settings
                  </Link>
                  <Link
                    to="/focus-room"
                    className="flex items-center gap-2.5 px-3 py-2 text-xs text-foreground hover:bg-white/10 rounded-xl transition-colors"
                    role="menuitem"
                  >
                    <Clock className="w-4 h-4 text-violet-400" />
                    Focus Timer
                  </Link>
                  <div className="my-1 border-t border-white/10" />
                  <button
                    onClick={() => signOut()}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
                    role="menuitem"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="gradient-cta text-xs font-semibold px-4 py-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                Get Started
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
          <div className="absolute inset-x-4 top-4 liquid-glass rounded-2xl p-8 flex flex-col space-y-2 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <Link
                to="/"
                aria-label="Study Hub home"
                className="flex items-center shrink-0"
              >
                <img
                  src="/images/logo-transparent.png"
                  alt="Study Hub"
                  className="h-8 w-auto object-contain"
                />
              </Link>
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

            {navItems.map(({ label, path }) => (
              <Link
                key={label}
                to={path}
                className={`text-left text-xl py-4 border-b border-white/5 last:border-none transition-colors block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded ${
                  isActive(path)
                    ? 'text-foreground font-medium'
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
                    className="w-full text-center py-3 rounded-full bg-cyan-500/20 text-cyan-300 font-medium text-sm hover:bg-cyan-500/30 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="w-full text-center py-3 rounded-full bg-red-500/10 text-red-400 font-medium text-sm hover:bg-red-500/20 transition-colors"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    to="/login"
                    className="w-full text-center py-3 rounded-full border border-white/20 text-foreground font-medium text-sm hover:bg-white/10 transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/signup"
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
    </>
  );
};
