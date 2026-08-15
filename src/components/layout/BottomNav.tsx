import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Target,
  BookOpen,
  Sparkles,
  User,
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { label: 'Home', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Practice', path: '/practice', icon: Target },
    { label: 'Study', path: '/study-materials', icon: BookOpen },
    { label: 'AI', path: '/study-ai', icon: Sparkles },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-paper/95 backdrop-blur-md border-t border-forest/15 px-3 py-2 shadow-deep">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map(({ label, path, icon: Icon }) => {
          const active = isActive(path);
          return (
            <Link
              key={label}
              to={path}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-colors ${
                active ? 'text-scholar font-bold' : 'text-ink/60 hover:text-ink'
              }`}
            >
              {active && (
                <motion.div
                  layoutId="mobileBottomNavPill"
                  className="absolute inset-0 bg-scholar/10 rounded-2xl border border-scholar/20"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className={`w-5 h-5 relative z-10 transition-transform ${active ? 'scale-110 text-scholar' : ''}`} />
              <span className="text-[10px] font-mono mt-1 relative z-10">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
