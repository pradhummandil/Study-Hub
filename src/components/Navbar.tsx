import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SITE_NAME } from '../config';

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Studio', path: '/studio' },
  { label: 'Focus Room', path: '/focus-room' },
  { label: 'About', path: '/about' },
  { label: 'Journal', path: '/journal' },
  { label: 'Reach Us', path: '/reach-us' },
];

export const Navbar = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <>
      <nav className="relative z-30 flex flex-row items-center justify-between px-6 md:px-8 py-6 max-w-7xl mx-auto w-full">
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

        {/* Desktop CTA */}
        <div className="hidden md:block">
          <Link
            to="/reach-us"
            className="liquid-glass rounded-full px-6 py-2.5 text-sm text-foreground hover:scale-[1.03] transition-transform duration-300 inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          >
            Begin Journey
          </Link>
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

            <Link
              to="/reach-us"
              className="liquid-glass rounded-full px-6 py-4 text-sm text-foreground hover:scale-[1.03] transition-transform w-full text-center mt-4 block focus-visible:outline-none"
            >
              Begin Journey
            </Link>
          </div>
        </div>
      )}
    </>
  );
};
