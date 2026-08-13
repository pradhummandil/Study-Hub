// src/components/ExitIntentModal.tsx
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { StudyHubCallModal } from './modals/StudyHubCallModal';

const DISMISSED_KEY = 'studyhub_exit_call_dismissed_time';
const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours cooldown

export const ExitIntentModal = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Exclude /reach-us or /dashboard routes
    if (location.pathname === '/reach-us' || location.pathname === '/dashboard') {
      return;
    }

    // Check 24-hour cooldown
    try {
      const lastDismissed = localStorage.getItem(DISMISSED_KEY);
      if (lastDismissed) {
        const timeDiff = Date.now() - parseInt(lastDismissed, 10);
        if (timeDiff < COOLDOWN_MS) {
          return;
        }
      }
    } catch {
      // Storage unavailable fallback
    }

    // 1. Desktop Exit Intent (Mouse moves towards browser top edge)
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 10) {
        setIsOpen(true);
      }
    };

    // 2. Mobile engagement timer (45 seconds of active interaction)
    const mobileTimer = setTimeout(() => {
      if (window.innerWidth <= 768) {
        setIsOpen(true);
      }
    }, 45000);

    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      clearTimeout(mobileTimer);
    };
  }, [location.pathname]);

  const handleClose = () => {
    setIsOpen(false);
    try {
      localStorage.setItem(DISMISSED_KEY, Date.now().toString());
    } catch {
      // Storage write fallback
    }
  };

  return <StudyHubCallModal isOpen={isOpen} onClose={handleClose} />;
};
