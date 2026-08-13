import type { ReactNode, RefObject } from 'react';
import { useState, useEffect, useRef } from 'react';
import { useInView } from '../hooks/useInView';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Flame, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { getFocusData } from '../lib/focusStorage';
import { TESTIMONIALS } from '../data/testimonials';

function ScrollSection({ children, className = '', delay = '' }: { children: ReactNode; className?: string; delay?: string }) {
  const { ref, inView } = useInView();
  return (
    <section
      ref={ref as RefObject<HTMLElement>}
      className={`scroll-fade-rise${delay ? `-${delay}` : ''} ${inView ? 'in-view' : ''} ${className}`}
    >
      {children}
    </section>
  );
}

const howItWorks = [
  {
    num: "01",
    title: "Book a call",
    desc: "Pick a 20-minute slot that fits your schedule. No forms, no wait lists."
  },
  {
    num: "02",
    title: "Unpack where you're stuck",
    desc: "We go through your current routine, gaps, and targets — line by line."
  },
  {
    num: "03",
    title: "Get a clear roadmap",
    desc: "Walk away with a specific plan for the next 4–6 weeks. Follow up whenever you need."
  }
];

const stats = [
  { number: "500+", label: "Students Guided" },
  { number: "4.9/5", label: "Avg Rating" },
  { number: "20+", label: "Resources Shared" },
  { number: "24h", label: "Avg Response Time" },
];

export const HomeExtensions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [streak, setStreak] = useState(0);
  const scrollRowRef = useRef<HTMLDivElement>(null);

  const handleBeginJourney = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  useEffect(() => {
    setStreak(getFocusData().currentStreak);
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRowRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      scrollRowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative z-10 bg-background">
      {/* ── How It Works ── */}
      <div className="py-24 px-6 max-w-5xl mx-auto">
        <ScrollSection className="text-center mb-16">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">The process</p>
          <h2
            className="text-4xl sm:text-5xl font-normal leading-[0.95] tracking-[-1.5px] text-foreground"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Simple. Honest. Repeatable.
          </h2>
        </ScrollSection>

        <div className="relative">
          <div className="hidden md:block absolute top-[4.5rem] left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-border to-transparent" />
          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map(({ num, title, desc }, i) => (
              <ScrollSection
                key={num}
                delay={i === 0 ? '' : i === 1 ? 'delay' : 'delay-2'}
                className="liquid-glass-card rounded-2xl p-8 flex flex-col items-center text-center relative"
              >
                <span
                  className="text-5xl text-muted-foreground font-normal"
                  style={{ fontFamily: "'Instrument Serif', serif" }}
                >
                  {num}
                </span>
                <h3
                  className="mt-6 text-xl text-foreground font-normal"
                  style={{ fontFamily: "'Instrument Serif', serif" }}
                >
                  {title}
                </h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </ScrollSection>
            ))}
          </div>
        </div>
      </div>

      {/* ── Focus Room Teaser ── */}
      <ScrollSection className="py-12 px-6 max-w-5xl mx-auto">
        <div className="liquid-glass-card rounded-2xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass text-xs text-muted-foreground mb-4">
              <Flame className="w-3.5 h-3.5 text-[hsl(38,92%,68%)]" />
              <span>Built-in Study Tools</span>
            </div>
            <h3
              className="text-3xl sm:text-4xl font-normal text-foreground leading-tight tracking-[-1px]"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Meet the <span className="text-gradient-accent">Focus Room</span>.
            </h3>
            <p className="mt-3 text-sm text-muted-foreground max-w-lg leading-relaxed">
              A private, distraction-free timer and daily streak tracker built right into your browser. No signups, no noise.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 shrink-0">
            {/* Live streak preview */}
            <div className="liquid-glass rounded-xl p-4 text-center min-w-[120px]">
              <div className="flex items-center justify-center gap-1 text-[hsl(38,92%,68%)]">
                <Flame className="w-4 h-4 fill-current" />
                <span className="text-2xl font-normal text-foreground" style={{ fontFamily: "'Instrument Serif', serif" }}>
                  {streak}
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">Day Streak</p>
            </div>

            <Link
              to="/focus-room"
              className="liquid-glass rounded-full px-8 py-3.5 text-sm text-foreground text-center hover:scale-[1.03] transition-transform duration-300 inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              Start focusing →
            </Link>
          </div>
        </div>
      </ScrollSection>

      {/* ── Testimonials ── */}
      <div className="py-24 px-6 max-w-6xl mx-auto">
        <ScrollSection className="text-center mb-16">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Student voices</p>
          <h2
            className="text-4xl sm:text-5xl font-normal leading-[0.95] tracking-[-1.5px] text-foreground"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Why students stay.
          </h2>
        </ScrollSection>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.slice(0, 3).map((t, i) => (
            <ScrollSection
              key={t.id}
              delay={i === 0 ? '' : i === 1 ? 'delay' : 'delay-2'}
              className="liquid-glass-card rounded-2xl p-8 flex flex-col justify-between"
            >
              <div>
                <span
                  className="text-5xl text-muted-foreground/40 leading-none mb-4 block select-none"
                  style={{ fontFamily: "'Instrument Serif', serif" }}
                >
                  "
                </span>
                <p className="text-muted-foreground text-sm leading-relaxed italic">{t.quote}</p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/5">
                <p className="text-foreground text-sm font-medium">{t.name}</p>
                <p className="text-muted-foreground text-xs mt-0.5">{t.role}</p>
              </div>
            </ScrollSection>
          ))}
        </div>
      </div>

      {/* ── Ways to Work Together ── */}
      <ScrollSection className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Ways to work together</p>
            <h2
              className="text-4xl sm:text-5xl font-normal leading-[0.95] tracking-[-1.5px] text-foreground"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Pick what fits right now.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-start">
            {/* Tier 1 — Free */}
            <div className="liquid-glass-card rounded-2xl p-8 flex flex-col gap-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Free Resources</p>
                <p className="text-4xl font-normal text-foreground" style={{ fontFamily: "'Instrument Serif', serif" }}>₹0</p>
                <p className="text-sm text-muted-foreground mt-1">Access, always</p>
              </div>
              <ul className="flex flex-col gap-3 flex-1">
                {['Full Studio library', 'All journal articles', 'Free resource downloads', 'No booking needed'].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <svg className="w-4 h-4 shrink-0 text-muted-foreground/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/studio"
                className="liquid-glass rounded-full px-6 py-3 text-sm text-foreground text-center hover:scale-[1.02] transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                Browse Studio
              </Link>
            </div>

            {/* Tier 2 — 1-on-1 Call (featured, scale-105) */}
            <div className="rounded-2xl p-8 flex flex-col gap-6 md:scale-105 relative overflow-visible" style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.08), 0 4px 32px rgba(0,0,0,0.3)' }}>
              <span className="absolute -top-3 right-6 liquid-glass rounded-full px-3 py-1 text-xs font-medium text-gradient-accent">
                Most chosen
              </span>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">1-on-1 Call</p>
                <p className="text-4xl font-normal text-foreground" style={{ fontFamily: "'Instrument Serif', serif" }}>₹ 199</p>
                <p className="text-sm text-muted-foreground mt-1">Single session</p>
              </div>
              <ul className="flex flex-col gap-3 flex-1">
                {['20-min guidance call', 'Personalised roadmap', 'Post-call summary notes', 'Book any time'].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <svg className="w-4 h-4 shrink-0 text-muted-foreground/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/reach-us"
                className="gradient-cta rounded-full px-6 py-3 text-sm text-center inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                Book a call
              </Link>
            </div>

            {/* Tier 3 — Ongoing Mentorship */}
            <div className="liquid-glass-card rounded-2xl p-8 flex flex-col gap-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Ongoing Mentorship</p>
                <p className="text-4xl font-normal text-foreground" style={{ fontFamily: "'Instrument Serif', serif" }}>₹ 499<span className="text-lg text-muted-foreground">/mo</span></p>
                <p className="text-sm text-muted-foreground mt-1">Weekly check-ins</p>
              </div>
              <ul className="flex flex-col gap-3 flex-1">
                {['Weekly 1-on-1 sessions', 'Priority WhatsApp support', 'Adaptive roadmap', 'First session free'].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <svg className="w-4 h-4 shrink-0 text-muted-foreground/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/reach-us"
                className="liquid-glass rounded-full px-6 py-3 text-sm text-foreground text-center hover:scale-[1.02] transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                Let's talk
              </Link>
            </div>
          </div>
        </div>
      </ScrollSection>

      {/* ── Compact Community Teaser Banner ── */}
      <ScrollSection className="px-6 max-w-5xl mx-auto my-6">
        <div className="liquid-glass rounded-full py-3.5 px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left border border-white/5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <p className="text-sm font-medium text-foreground">
              Join <span className="text-gradient-accent">500+ students</span> in our quiet study community
            </p>
          </div>
          <Link
            to="/community"
            className="liquid-glass rounded-full px-5 py-1.5 text-xs text-foreground font-medium hover:scale-105 transition-transform shrink-0"
          >
            Join Community →
          </Link>
        </div>
      </ScrollSection>

      {/* ── Stats Strip — relative wrapper so ambient-glow orb is contained ── */}
      <div className="relative overflow-hidden">
        <div className="ambient-glow" style={{ top: '-80px', right: '-60px', opacity: 0.7 }} />
        <ScrollSection className="mx-6 md:mx-8 rounded-2xl liquid-glass-card my-8">
          <div className="relative z-10 py-16 px-8 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <p
                  className="text-4xl sm:text-5xl text-foreground font-normal"
                  style={{ fontFamily: "'Instrument Serif', serif" }}
                >
                  {s.number}
                </p>
                <p className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </ScrollSection>
      </div>

      {/* ── Results / Student Outcomes Section — Horizontal Scroll Snap ── */}
      <ScrollSection className="py-24 px-6 max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Proven outcomes</p>
            <h2
              className="text-4xl sm:text-5xl font-normal leading-[0.95] tracking-[-1.5px] text-foreground"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Real results from real guidance.
            </h2>
          </div>

          {/* Left / Right Scroll Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleScroll('left')}
              className="w-10 h-10 rounded-full liquid-glass flex items-center justify-center text-muted-foreground hover:text-foreground hover:scale-105 transition-all focus-visible:outline-none"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleScroll('right')}
              className="w-10 h-10 rounded-full liquid-glass flex items-center justify-center text-muted-foreground hover:text-foreground hover:scale-105 transition-all focus-visible:outline-none"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Horizontal Scroll Snap Track */}
        <div
          ref={scrollRowRef}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-6 scrollbar-none scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="liquid-glass-card rounded-2xl p-8 min-w-[300px] sm:min-w-[360px] max-w-[380px] shrink-0 snap-start flex flex-col justify-between border border-white/10"
            >
              <div>
                {/* Header: Name + Rating */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-foreground text-base font-medium">{t.name}</p>
                    <p className="text-muted-foreground text-xs">{t.role}</p>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: t.rating }).map((_, idx) => (
                      <Star key={idx} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                </div>

                {/* Outcome result line */}
                {t.result && (
                  <p className="text-gradient-accent text-base font-medium mb-3 leading-snug">
                    {t.result}
                  </p>
                )}

                {/* Quote */}
                <p className="text-muted-foreground text-sm leading-relaxed">
                  "{t.quote}"
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollSection>

      {/* ── Final CTA Band ── */}
      <ScrollSection className="py-24 px-6">
        <div className="liquid-glass-card rounded-2xl max-w-4xl mx-auto py-16 px-8 text-center">
          <h2
            className="text-3xl sm:text-4xl font-normal leading-tight tracking-[-1px] text-foreground"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Ready to stop studying in circles?
          </h2>
          <p className="text-muted-foreground mt-4 max-w-md mx-auto leading-relaxed">
            Book your 20-minute call. We'll map out your next steps together.
          </p>
          <button
            type="button"
            onClick={handleBeginJourney}
            className="gradient-cta rounded-full px-10 py-4 text-base mt-10 inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 cursor-pointer font-sans"
          >
            Begin Journey
          </button>
        </div>
      </ScrollSection>
    </div>
  );
};
