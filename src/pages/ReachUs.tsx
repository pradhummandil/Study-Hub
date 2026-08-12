import { useState, useEffect } from 'react';
import Cal, { getCalApi } from '@calcom/embed-react';
import { Compass, Map, MessageCircle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const CAL_COM_LINK = "pradhum-mandil-pbjkfk/20-min-guidance-call";

const whatWeCovers = [
  {
    icon: Compass,
    title: 'Diagnose',
    desc: 'We figure out exactly where your prep is breaking down — not the symptoms, the actual root.',
  },
  {
    icon: Map,
    title: 'Plan',
    desc: 'A realistic weekly roadmap you can actually stick to, built around your real schedule.',
  },
  {
    icon: MessageCircle,
    title: 'Follow-up',
    desc: 'You leave with concrete next steps, not just a hit of motivation that fades by Tuesday.',
  },
];

const faqItems = [
  {
    q: 'Is the first call really free?',
    a: "Yes, completely. No card, no catch. I'd rather earn your trust with a useful conversation than ask for money upfront. If it helps, great. If not, you've lost 20 minutes — not money.",
  },
  {
    q: 'What should I prepare before the call?',
    a: "Nothing formal. Knowing roughly which exam or goal you're working toward is enough. If you have a sense of where you're stuck, even better — but we can figure that out together on the call.",
  },
  {
    q: 'Can I book more than one session?',
    a: 'Absolutely. The first call is free; follow-up sessions are paid. Many students check in every few weeks to adjust their plan. We keep it flexible — no packages you have to commit to upfront.',
  },
  {
    q: 'What if I need to reschedule?',
    a: 'Use the Cal.com link — you can reschedule directly up to a few hours before the call. If something urgent comes up last-minute, just message me and we\'ll sort it out.',
  },
];

const FAQItem = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-none">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-start py-5 text-left gap-4 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded"
        aria-expanded={open}
      >
        <span className="text-foreground text-base leading-snug group-hover:text-foreground/80 transition-colors">{q}</span>
        <span
          className="text-muted-foreground mt-0.5 shrink-0 transition-transform duration-300"
          style={{ transform: open ? 'rotate(45deg)' : 'rotate(0)' }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
          </svg>
        </span>
      </button>
      {open && (
        <p className="text-muted-foreground text-sm leading-relaxed pb-5">{a}</p>
      )}
    </div>
  );
};

export default function ReachUs() {
  const [calLoaded, setCalLoaded] = useState(false);

  useEffect(() => {
    (async function () {
      const cal = await getCalApi();
      cal("ui", {
        theme: "dark",
        styles: { branding: { brandColor: "#ffffff" } },
        hideEventTypeDetails: false,
        layout: "month_view",
      });
    })();
  }, []);

  return (
    <>
      <Helmet>
        <title>Reach Us — Study Hub</title>
        <meta name="description" content="Book a free 20-minute 1-on-1 guidance call. No sales pitch — just a real conversation about where you're stuck and what to do next." />
      </Helmet>

      {/* Hero Strip */}
      <div className="relative z-10 px-6 pt-24 pb-16 text-center max-w-4xl mx-auto">
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

        {/* Primary booking CTA — gradient-cta, the highest-intent button on this page */}
        <button
          onClick={() => document.getElementById('booking-embed')?.scrollIntoView({ behavior: 'smooth' })}
          className="animate-fade-rise-delay-2 gradient-cta rounded-full px-10 py-4 text-base mt-8 inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        >
          Book a free call ↓
        </button>
      </div>

      {/* Booking embed */}
      <div id="booking-embed" className="animate-fade-rise-delay-2 relative z-10 max-w-3xl mx-auto px-6 pb-8">
        <div className="liquid-glass rounded-2xl p-2 md:p-4 max-w-3xl mx-auto min-h-[600px] relative">
          {!calLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full liquid-glass animate-pulse" />
            </div>
          )}
          <Cal
            calLink={CAL_COM_LINK}
            style={{ width: "100%", height: "600px", overflow: "scroll" }}
            config={{ layout: "month_view", theme: "dark" }}
            onLoad={() => setCalLoaded(true)}
          />
        </div>
      </div>

      {/* What we'll cover */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-16">
        <p className="text-xs uppercase tracking-widest text-muted-foreground text-center mb-12">What we'll cover</p>
        <div className="grid md:grid-cols-3 gap-6">
          {whatWeCovers.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="liquid-glass-card rounded-xl p-6 flex flex-col gap-4">
              <div className="w-10 h-10 rounded-lg liquid-glass flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-foreground" strokeWidth={1.5} />
              </div>
              <h3
                className="text-xl text-foreground font-normal"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                {title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="relative z-10 max-w-2xl mx-auto px-6 pb-32 mt-4">
        <h2
          className="text-3xl font-normal text-foreground mb-10 tracking-[-1px]"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Questions I actually get asked.
        </h2>
        {faqItems.map((item) => (
          <FAQItem key={item.q} {...item} />
        ))}
      </div>
    </>
  );
}
