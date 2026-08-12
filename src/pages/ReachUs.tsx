import { useEffect, useState } from 'react';
import { getCalApi } from '@calcom/embed-react';
import { Helmet } from 'react-helmet-async';
import { CAL_COM_LINK } from '../config';
import { ShieldCheck, Lock, MailX, RefreshCw } from 'lucide-react';

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
  const [calLoaded, setCalLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const cal = await getCalApi();
        cal('ui', {
          theme: 'dark',
          hideEventTypeDetails: false,
          layout: 'month_view',
        });
        cal('on', {
          action: 'eventTypeSelected',
          callback: () => setCalLoaded(true),
        });
        // Set loaded after initialization delay
        setTimeout(() => setCalLoaded(true), 1500);
      } catch (err) {
        console.error('Cal.com embed initialization failed:', err);
        setCalLoaded(true);
      }
    })();
  }, []);

  return (
    <>
      <Helmet>
        <title>Reach Us — Study Hub</title>
        <meta name="description" content="Book a free 20-minute guidance call. No sales pitch, no commitment — just real advice for your study plan." />
      </Helmet>

      {/* Hero */}
      <div className="relative z-10 px-6 pt-24 pb-12 text-center max-w-4xl mx-auto">
        <h1
          className="animate-fade-rise text-5xl sm:text-6xl font-normal leading-[0.95] tracking-[-2px] text-foreground"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Talk to someone who's{' '}
          <em className="not-italic"><span className="text-gradient-accent">actually done it.</span></em>
        </h1>

        <p className="animate-fade-rise-delay text-muted-foreground max-w-xl mx-auto mt-6 leading-relaxed">
          Book a free 20-minute call. No sales pitch — just a real conversation about where you're stuck and what to do next.
        </p>

        {/* Trust strip */}
        <div className="animate-fade-rise-delay-2 flex items-center justify-center gap-0 mt-8 flex-wrap">
          {[
            '500+ students guided',
            '4.9/5 average rating',
            'Replies within 24h',
          ].map((stat, i) => (
            <span key={stat} className="flex items-center">
              {i > 0 && <span className="border-l border-border h-4 mx-4" />}
              <span className="text-xs text-muted-foreground tracking-wide uppercase">{stat}</span>
            </span>
          ))}
        </div>

        {/* Primary booking CTA */}
        <button
          onClick={() => document.getElementById('booking-embed')?.scrollIntoView({ behavior: 'smooth' })}
          className="animate-fade-rise-delay-2 gradient-cta rounded-full px-10 py-4 text-base mt-8 inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
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

      {/* Booking embed */}
      <div id="booking-embed" className="animate-fade-rise-delay-2 relative z-10 max-w-3xl mx-auto px-6 pb-8">
        <div className="liquid-glass rounded-2xl p-2 md:p-4 max-w-3xl mx-auto min-h-[600px] relative">
          {!calLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full liquid-glass animate-pulse" />
            </div>
          )}
          <iframe
            src={`https://cal.com/${CAL_COM_LINK}?embed=true&theme=dark`}
            className="w-full h-[600px] rounded-xl border-0"
            title="Book a call"
            onLoad={() => setCalLoaded(true)}
          />
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
