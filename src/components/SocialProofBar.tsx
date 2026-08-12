import { useState, useEffect } from 'react';
import { getNewsletterSignupCount } from '../lib/newsletterApi';

const STORAGE_KEY = 'proof_bar_dismissed_v1';

const BASE_MESSAGES = [
  '🟢 3 students booked calls this week',
  'New resource added to Studio',
  'Avg response time: 18 hours',
  '4.9/5 from last 20 sessions',
];

export const SocialProofBar = () => {
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try { return sessionStorage.getItem(STORAGE_KEY) === '1'; }
    catch { return false; }
  });

  const [signupCount, setSignupCount] = useState<number>(0);

  useEffect(() => {
    getNewsletterSignupCount().then((count) => {
      if (count > 0) {
        setSignupCount(count);
      }
    });
  }, []);

  if (dismissed) return null;

  const dynamicMessage = signupCount > 0
    ? `🟢 Join ${signupCount}+ students already subscribed`
    : '🟢 500+ students guided so far';

  const messages = [...BASE_MESSAGES, dynamicMessage];
  const tickerText = messages.join('   ·   ');

  const dismiss = () => {
    setDismissed(true);
    try { sessionStorage.setItem(STORAGE_KEY, '1'); } catch {}
  };

  return (
    <div
      className="relative z-20 w-full flex items-center liquid-glass border-b border-white/5 overflow-hidden"
      role="marquee"
      aria-label="Live social proof"
    >
      {/* Scrolling track — two identical spans so the loop is seamless */}
      <div className="flex-1 overflow-hidden py-2">
        <div className="marquee-track">
          <span className="text-xs text-muted-foreground px-4 select-none">
            {tickerText}&nbsp;&nbsp;&nbsp;·&nbsp;&nbsp;&nbsp;
          </span>
          <span className="text-xs text-muted-foreground px-4 select-none" aria-hidden="true">
            {tickerText}&nbsp;&nbsp;&nbsp;·&nbsp;&nbsp;&nbsp;
          </span>
        </div>
      </div>

      {/* Dismiss button */}
      <button
        onClick={dismiss}
        className="shrink-0 px-3 h-full flex items-center text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded"
        aria-label="Dismiss notification bar"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};
