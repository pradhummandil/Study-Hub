import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SITE_NAME } from '../config';
import { useAuth } from '../context/AuthContext';
import { LogOut, Clock, Settings, ChevronDown, LayoutDashboard } from 'lucide-react';

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Studio', path: '/studio' },
  { label: 'Focus Room', path: '/focus-room' },
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
          className="text-3xl tracking-tight text-foreground transition-opacity hover:opacity-90 flex items-baseline select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          {SITE_NAME}<sup className="text-xs ml-0.5 font-sans">®</sup>
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
                  <img src={avatarUrl} alt={firstName} className="w-7 h-7 rounded-full object-cover shrink-0" />
                ) : (
                  <span className="w-7 h-7 rounded-full bg-white/10 text-white font-semibold text-xs flex items-center justify-center shrink-0 border border-white/10">
                    {initialLetter}
                  </span>
                )}
                <span className="text-white text-sm font-medium truncate max-w-[110px]">{firstName}</span>
                <ChevronDown className="w-4 h-4 text-white/60 shrink-0" />
              </button>

              {/* Floating Dropdown Menu — Absolutely positioned, zero layout shift */}
              {userMenuOpen && (
                <div className="liquid-glass-card rounded-2xl p-3 shadow-2xl absolute right-0 top-full mt-2 w-56 flex flex-col gap-1 border border-white/10 z-50 animate-fade-rise text-left">
                  <div className="px-3 py-2 border-b border-white/10 mb-1">
                    <p className="text-xs font-medium text-foreground truncate">
                      {user.user_metadata?.full_name || 'User'}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                  </div>

                  <Link
                    to="/dashboard"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-xl transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
                    Dashboard
                  </Link>

                  <Link
                    to="/focus-room"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-xl transition-colors"
                  >
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    Focus Room
                  </Link>

                  <Link
                    to="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-xl transition-colors"
                  >
                    <Settings className="w-4 h-4 text-muted-foreground" />
                    Settings
                  </Link>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      signOut();
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-white/5 rounded-xl transition-colors text-left w-full mt-1 border-t border-white/5 pt-2"
                  >
                    <LogOut className="w-4 h-4 text-red-400" />
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Logged Out Controls */
            <>
              <Link
                to="/login"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="liquid-glass rounded-full px-6 py-2.5 text-sm text-foreground hover:scale-[1.03] transition-transform duration-300 inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 font-medium"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden text-foreground p-2 rounded-lg hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          aria-label="Open navigation menu"
          aria-expanded={mobileOpen}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </nav>

      {/* Mobile fullscreen overlay */}
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
              <span
                className="text-2xl tracking-tight text-foreground"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                {SITE_NAME}<sup className="text-xs ml-0.5 font-sans">®</sup>
              </span>
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
                  <div className="px-2 py-1 flex items-center gap-3">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={firstName} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-white/10 text-white font-semibold flex items-center justify-center border border-white/10">
                        {initialLetter}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {user.user_metadata?.full_name || 'Logged in'}
                      </p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    to="/dashboard"
                    className="liquid-glass rounded-full px-6 py-3 text-sm text-foreground text-center block"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    className="liquid-glass rounded-full px-6 py-3 text-sm text-muted-foreground text-center block"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      signOut();
                    }}
                    className="text-red-400 text-sm text-center py-2 hover:text-red-300 transition-colors"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/signup"
                    className="liquid-glass rounded-full px-6 py-3.5 text-sm text-foreground text-center block font-medium"
                  >
                    Sign Up
                  </Link>
                  <Link
                    to="/login"
                    className="text-center text-sm text-muted-foreground hover:text-foreground py-2 block"
                  >
                    Log in
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
