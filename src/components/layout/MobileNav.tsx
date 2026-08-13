// src/components/layout/MobileNav.tsx
import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutDashboard, BookOpen, Bot, Video } from 'lucide-react';

export function MobileNav() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navs = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Videos', path: '/video-learning', icon: Video },
    { label: 'AI', path: '/study-ai', icon: Bot },
    { label: 'Study', path: '/practice', icon: BookOpen },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-950/90 backdrop-blur-xl border-t border-white/10 px-4 py-2 flex items-center justify-around shadow-2xl">
      {navs.map(({ label, path, icon: Icon }) => {
        const active = isActive(path);
        return (
          <Link
            key={label}
            to={path}
            className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
              active
                ? 'text-cyan-400 font-bold scale-105'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className={`w-5 h-5 mb-0.5 ${active ? 'text-cyan-400' : 'text-muted-foreground'}`} />
            <span className="text-[10px] tracking-wide">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
