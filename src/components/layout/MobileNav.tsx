import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Video, Bot, User, X, Layers, RotateCcw, Map } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function MobileNav() {
  const location = useLocation();
  const { user } = useAuth();
  const [showStudySheet, setShowStudySheet] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navs = [
    { label: 'Home', path: user ? '/dashboard' : '/', icon: Home },
    { label: 'Practice', path: '/practice', icon: BookOpen },
    { label: 'Study', isSheetTrigger: true, icon: Video },
    { label: 'AI', path: '/study-ai', icon: Bot },
    { label: 'Profile', path: user ? '/profile' : '/login', icon: User },
  ];

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-paper/95 backdrop-blur-md border-t border-forest/10 px-3 py-2 flex items-center justify-around shadow-deep">
        {navs.map(({ label, path, isSheetTrigger, icon: Icon }) => {
          const active = path ? isActive(path) : false;

          if (isSheetTrigger) {
            return (
              <button
                key={label}
                onClick={() => setShowStudySheet(true)}
                className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
                  showStudySheet ? 'text-scholar font-bold scale-105' : 'text-ink/60 hover:text-ink'
                }`}
              >
                <Icon className={`w-5 h-5 mb-0.5 ${showStudySheet ? 'text-scholar' : 'text-ink/60'}`} />
                <span className="text-[10px] font-sans tracking-wide">{label}</span>
              </button>
            );
          }

          return (
            <Link
              key={label}
              to={path!}
              className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
                active ? 'text-scholar font-bold scale-105' : 'text-ink/60 hover:text-ink'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${active ? 'text-scholar' : 'text-ink/60'}`} />
              <span className="text-[10px] font-sans tracking-wide">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Mobile "Study" Bottom Sheet */}
      {showStudySheet && (
        <div className="lg:hidden fixed inset-0 z-50 bg-ink/60 backdrop-blur-xs flex flex-col justify-end">
          <div className="bg-paper border-t border-forest/15 rounded-t-3xl p-6 shadow-2xl space-y-4 animate-slide-up">
            <div className="flex items-center justify-between pb-3 border-b border-forest/10">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-muted font-bold">
                  STUDY HUB RESOURCES
                </span>
                <h3 className="text-xl font-normal text-ink" style={{ fontFamily: "'Instrument Serif', serif" }}>
                  Study Tools & Materials
                </h3>
              </div>
              <button
                onClick={() => setShowStudySheet(false)}
                className="p-2 text-muted hover:text-ink rounded-full hover:bg-parchment"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <Link
                to="/video-learning"
                onClick={() => setShowStudySheet(false)}
                className="p-4 bg-parchment/60 hover:bg-parchment rounded-2xl border border-forest/10 flex items-center gap-3 transition-colors"
              >
                <div className="p-2 rounded-xl bg-scholar/10 text-scholar">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-ink">Videos</h4>
                  <p className="text-[10px] text-muted">Lectures & Shorts</p>
                </div>
              </Link>

              <Link
                to="/notes"
                onClick={() => setShowStudySheet(false)}
                className="p-4 bg-parchment/60 hover:bg-parchment rounded-2xl border border-forest/10 flex items-center gap-3 transition-colors"
              >
                <div className="p-2 rounded-xl bg-terracotta/10 text-terracotta">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-ink">Notes</h4>
                  <p className="text-[10px] text-muted">Concept PDFs</p>
                </div>
              </Link>

              <Link
                to="/revision"
                onClick={() => setShowStudySheet(false)}
                className="p-4 bg-parchment/60 hover:bg-parchment rounded-2xl border border-forest/10 flex items-center gap-3 transition-colors"
              >
                <div className="p-2 rounded-xl bg-gold/10 text-gold">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-ink">Revision</h4>
                  <p className="text-[10px] text-muted">Spaced Review</p>
                </div>
              </Link>

              <Link
                to="/flashcards"
                onClick={() => setShowStudySheet(false)}
                className="p-4 bg-parchment/60 hover:bg-parchment rounded-2xl border border-forest/10 flex items-center gap-3 transition-colors"
              >
                <div className="p-2 rounded-xl bg-scholar/10 text-scholar">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-ink">Flashcards</h4>
                  <p className="text-[10px] text-muted">Active Recall</p>
                </div>
              </Link>

              <Link
                to="/roadmap"
                onClick={() => setShowStudySheet(false)}
                className="col-span-2 p-4 bg-parchment/60 hover:bg-parchment rounded-2xl border border-forest/10 flex items-center gap-3 transition-colors"
              >
                <div className="p-2 rounded-xl bg-emerald-600/10 text-emerald-700">
                  <Map className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-ink">Roadmap</h4>
                  <p className="text-[10px] text-muted">Syllabus Completion Map</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
