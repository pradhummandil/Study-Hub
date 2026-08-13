import { useEffect, useState } from 'react';
import Cal, { getCalApi } from '@calcom/embed-react';
import { Helmet } from 'react-helmet-async';
import { CAL_COM_EVENT_URL, CAL_COM_LINK, CAL_EVENT_SLUG } from '../config/cal';
import { ShieldCheck, Lock, MailX, RefreshCw, ExternalLink, AlertCircle } from 'lucide-react';

const faqs = [
  {
    q: 'What happens on the call?',
    a: "We talk through where you're at, what exam or goal you're targeting, and what's currently blocking you. You'll leave with 2–3 concrete changes to make right away.",
  },
  {
    q: 'Is it really free?',
    a: 'Yes. The 20-minute initial call is completely free, with no obligation to sign up for ongoing guidance or anything else.',
  },
  {
    q: 'How should I prepare?',
    a: "Just bring your current schedule or study plan (if you have one) and a list of your biggest questions. You don't need to clean anything up — raw is better.",
  },
  {
    q: 'What if I need to reschedule?',
    a: 'You can reschedule or cancel anytime up to 2 hours before the call using the link in your confirmation email.',
  },
];

export default function ReachUs() {
  const [embedStatus, setEmbedStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  useEffect(() => {
    console.log('[Cal.com] Event URL:', CAL_COM_EVENT_URL);
    console.log('[Cal.com] booking embed mounted');

    let isMounted = true;

    (async () => {
      try {
        const cal = await getCalApi({ namespace: CAL_EVENT_SLUG });
        cal('ui', {
          theme: 'dark',
          styles: { branding: { brandColor: '#5CE1E6' } },
          hideEventTypeDetails: false,
          layout: 'month_view',
        });

        cal('on', {
          action: '*',
          callback: (e) => {
            console.log('[Cal.com] Event action:', e?.detail);
            if (isMounted) setEmbedStatus('loaded');
          },
        });

        // Set loaded status after initialization timeout
        setTimeout(() => {
          if (isMounted) setEmbedStatus((prev) => (prev === 'error' ? 'error' : 'loaded'));
        }, 1200);
      } catch (err) {
        console.error('[Cal.com] Embed initialization failed:', err);
        if (isMounted) setEmbedStatus('error');
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>Reach Us — Study Hub</title>
        <meta
          name="description"
          content="Book a free 20-minute guidance call. No sales pitch, no commitment — just real advice for your study plan."
        />
      </Helmet>

      {/* Hero */}
      <div className="relative z-10 px-6 pt-24 pb-12 text-center max-w-4xl mx-auto">
        <span className="text-xs uppercase tracking-widest text-terracotta font-semibold bg-terracotta/10 px-4 py-1.5 rounded-full inline-block mb-4 border border-terracotta/20">
          Book a Guidance Session
        </span>
        <h1
          className="animate-fade-rise text-5xl sm:text-6xl font-normal leading-[0.95] tracking-[-2px] text-ink"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Let's build a <em className="not-italic text-terracotta">better way to study.</em>
        </h1>

        <p className="animate-fade-rise-delay text-muted max-w-xl mx-auto mt-6 leading-relaxed">
          Book a free 20-minute call. No sales pitch — just a real conversation about where you're stuck and what to do next.
        </p>

        {/* Primary booking CTA */}
        <button
          onClick={() => document.getElementById('booking-embed')?.scrollIntoView({ behavior: 'smooth' })}
          className="animate-fade-rise-delay-2 rounded-xl bg-scholar text-paper px-10 py-4 text-sm font-bold mt-8 inline-flex items-center justify-center shadow-card hover:bg-forest transition-colors cursor-pointer"
        >
          Book a free call ↓
        </button>
      </div>


      {/* Trust Badges Strip */}
      <div className="animate-fade-rise-delay-2 relative z-10 max-w-3xl mx-auto px-6 mb-6">
        <div className="flex items-center justify-center gap-6 flex-wrap text-xs text-muted-foreground py-3 px-6 rounded-full liquid-glass border border-white/5 max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-green-400 shrink-0" />
            <span>Verified by Cal.com</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Secure booking</span>
          </div>
          <div className="flex items-center gap-2">
            <MailX className="w-4 h-4 text-muted-foreground shrink-0" />
            <span>No spam, ever</span>
          </div>
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-muted-foreground shrink-0" />
            <span>Cancel anytime</span>
          </div>
        </div>
      </div>

      {/* Booking embed section */}
      <div id="booking-embed" className="animate-fade-rise-delay-2 relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pb-8">
        <div className="liquid-glass rounded-2xl p-2 md:p-4 max-w-3xl mx-auto min-h-[650px] relative overflow-hidden flex flex-col">

          {/* Direct link header bar */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 mb-2 text-xs text-muted-foreground">
            <span className="font-medium text-white/80">📅 20-Min Guidance Call</span>
            <a
              href={CAL_COM_EVENT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-white transition-colors"
              style={{ color: '#5CE1E6' }}
            >
              Open in new tab <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Loading Indicator */}
          {embedStatus === 'loading' && (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] text-center p-8">
              <div className="w-10 h-10 rounded-full border-2 border-cyan-400/30 border-t-cyan-400 animate-spin mb-4" />
              <p className="text-sm text-white/70 font-medium">Opening booking calendar...</p>
              <p className="text-xs text-white/40 mt-1">Connecting to Cal.com</p>
            </div>
          )}

          {/* Controlled Error Fallback */}
          {embedStatus === 'error' && (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] text-center p-8">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Booking calendar unavailable here</h3>
              <p className="text-sm text-muted-foreground max-w-md mb-6 leading-relaxed">
                The embedded booking interface couldn't load right now. You can open the booking page directly on Cal.com to pick a time slot.
              </p>
              <a
                href={CAL_COM_EVENT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="gradient-cta rounded-full px-8 py-3 text-sm font-medium inline-flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-white/40"
              >
                Open booking page <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}

          {/* Official Cal.com React Embed Component */}
          <div className={embedStatus === 'error' ? 'hidden' : 'w-full flex-1 min-h-[650px]'}>
            <Cal
              namespace={CAL_EVENT_SLUG}
              calLink={CAL_COM_LINK}
              style={{ width: '100%', height: '100%', minHeight: '650px', overflow: 'scroll' }}
              config={{
                layout: 'month_view',
                theme: 'dark',
              }}
            />
          </div>
        </div>
      </div>

      {/* FAQs */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-16 pb-32">
        <p className="text-xs uppercase tracking-widest text-muted-foreground text-center mb-12">Frequently asked</p>
        <div className="grid md:grid-cols-2 gap-6">
          {faqs.map(({ q, a }) => (
            <div key={q} className="liquid-glass-card rounded-2xl p-8">
              <h3
                className="text-xl text-foreground font-normal mb-3"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                {q}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
