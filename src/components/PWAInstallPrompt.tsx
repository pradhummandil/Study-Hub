import { useState, useEffect } from 'react';

// Extend window interface to handle beforeinstallprompt
declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if installed or dismissed recently
    const isInstalled = localStorage.getItem('pwa_installed');
    if (isInstalled) return;

    const dismissedAt = localStorage.getItem('pwa_dismissed_at');
    if (dismissedAt) {
      const dismissedDate = new Date(dismissedAt);
      const daysSinceDismiss = (Date.now() - dismissedDate.getTime()) / (1000 * 3600 * 24);
      if (daysSinceDismiss < 14) return;
    }

    // iOS check
    const ua = window.navigator.userAgent;
    const webkit = !!ua.match(/WebKit/i);
    const isMacOs = !!ua.match(/Macintosh/i);
    const isSafari = webkit && !ua.match(/Chrome/i);
    const iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
    
    const isIOSDevice = iOS || (isMacOs && isSafari && 'ontouchend' in document);
    setIsIOS(isIOSDevice);

    // Activity tracking logic (3+ visits or 5+ mins)
    const visits = parseInt(localStorage.getItem('pwa_visits') || '0') + 1;
    localStorage.setItem('pwa_visits', visits.toString());
    
    const firstVisitTime = parseInt(localStorage.getItem('pwa_first_visit') || Date.now().toString());
    if (!localStorage.getItem('pwa_first_visit')) {
      localStorage.setItem('pwa_first_visit', firstVisitTime.toString());
    }

    const checkShouldShow = () => {
      const timeSpent = Date.now() - firstVisitTime;
      const fiveMins = 5 * 60 * 1000;
      
      // Never show on first visit (unless time spent > 5m)
      if (visits > 1 && (visits >= 3 || timeSpent > fiveMins)) {
        if (isIOSDevice) {
          setShowPrompt(true);
        } else if (deferredPrompt) {
          setShowPrompt(true);
        }
      }
    };

    // Event listener for standard PWA prompt
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      checkShouldShow();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Fallback check after delay if no event fires (e.g. iOS)
    const timeout = setTimeout(checkShouldShow, 5000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(timeout);
    };
  }, [deferredPrompt]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        localStorage.setItem('pwa_installed', 'true');
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa_dismissed_at', new Date().toISOString());
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-0 md:right-6 left-0 md:left-auto p-4 z-50 flex justify-center">
      <div className="bg-[#062B3D]/90 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-xl shadow-black/50 w-full max-w-sm">
        <div className="flex items-start gap-4">
          <div className="bg-[#5CE1E6]/20 p-3 rounded-xl flex-shrink-0">
            {/* Install Icon SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5CE1E6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </div>
          
          <div className="flex-1">
            <h4 className="text-white font-medium mb-1">Install Study Hub</h4>
            <p className="text-sm text-gray-300 mb-3">
              {isIOS 
                ? 'Add to Home Screen: tap Share → Add to Home Screen'
                : 'Install Study Hub for faster access. Works offline.'}
            </p>
            
            <div className="flex gap-2">
              {!isIOS && (
                <button 
                  onClick={handleInstall}
                  className="flex-1 bg-[#5CE1E6] text-[#062B3D] py-1.5 px-3 rounded-lg text-sm font-semibold hover:bg-opacity-90 transition-colors"
                >
                  Install
                </button>
              )}
              <button 
                onClick={handleDismiss}
                className="flex-1 bg-white/10 text-white py-1.5 px-3 rounded-lg text-sm font-medium hover:bg-white/20 transition-colors"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
