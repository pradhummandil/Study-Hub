import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const SESSION_KEY = 'studyhub_exit_prompt_shown';

export const ExitIntentModal = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Do NOT show on /reach-us or /dashboard routes
    if (location.pathname === '/reach-us' || location.pathname === '/dashboard') {
      return;
    }

    // Check if already shown this session
    try {
      if (sessionStorage.getItem(SESSION_KEY) === '1') {
        return;
      }
    } catch {
      // Ignore storage errors
    }

    const handleMouseLeave = (e: MouseEvent) => {
      // Trigger when mouse moves out past the top edge of the window
      if (e.clientY <= 0) {
        setIsOpen(true);
        try {
          sessionStorage.setItem(SESSION_KEY, '1');
        } catch {}
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [location.pathname]);

  if (!isOpen) return null;

  const handleDismiss = () => {
    setIsOpen(false);
  };

  const handleBookCall = () => {
    setIsOpen(false);
    navigate('/reach-us');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-rise select-none">
      <div className="liquid-glass-card rounded-2xl max-w-md w-full p-8 text-center border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Subtle ambient glow */}
        <div className="ambient-glow" style={{ top: '-80px', left: '10%', opacity: 0.6 }} />

        <h2
          className="text-3xl font-normal leading-snug text-foreground mb-3"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Before you go —
        </h2>

        <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-sm mx-auto">
          If you're still figuring out where to start, a free 20-minute call might save you weeks of guessing.
        </p>

        <button
          onClick={handleBookCall}
          className="gradient-cta rounded-full px-8 py-3.5 text-sm text-black font-medium inline-flex items-center justify-center w-full mb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        >
          Book a free call
        </button>

        <button
          onClick={handleDismiss}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none"
        >
          No thanks
        </button>
      </div>
    </div>
  );
};
