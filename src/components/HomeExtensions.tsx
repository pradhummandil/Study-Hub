import type { ReactNode, RefObject } from 'react';
import { useState, useEffect } from 'react';
import { useInView } from '../hooks/useInView';
import { Link } from 'react-router-dom';
import { Flame } from 'lucide-react';
import { getFocusData } from '../lib/focusStorage';

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

const testimonials = [
  {
    quote: "I was drowning in notes, watching lectures on 2x speed and retaining nothing. One call gave me a 6-week plan. I actually finished a full subject for the first time.",
    name: "Aryan M.",
    subtitle: "JEE Advanced 2026",
  },
  {
    quote: "I'd been 'almost ready' for 8 months. Turns out I was overcomplicating the syllabus. After we talked, I dropped 40% of my prep material and my mock scores jumped.",
    name: "Sneha R.",
    subtitle: "UPSC CSE Aspirant",
  },
  {
    quote: "The roadmap wasn't generic — it was built around my actual schedule, including the part-time job I was embarrassed to mention. That specificity made it stick.",
    name: "Karan D.",
    subtitle: "GATE CSE 2026",
  },
];

const stats = [
  { number: "500+", label: "Students Guided" },
  { number: "4.9/5", label: "Avg Rating" },
  { number: "20+", label: "Resources Shared" },
  { number: "24h", label: "Avg Response Time" },
];

export const HomeExtensions = () => {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    setStreak(getFocusData().currentStreak);
  }, []);

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
          {/* Desktop connecting line */}
          <div className="hidden md:block absolute top-8 left-[16.67%] right-[16.67%] h-px border-t border-border" />

          <div className="grid md:grid-cols-3 gap-12">
            {[
              { num: '01', title: 'Book a free call', desc: 'No forms, no sales funnel — just pick a time. The first 20 minutes are on me.' },
              { num: '02', title: 'Get a real roadmap', desc: 'We build a week-by-week plan around your actual schedule, not someone else\'s.' },
              { num: '03', title: 'Check in and adjust', desc: 'Prep changes. We stay in sync so the plan evolves as you do.' },
            ].map(({ num, title, desc }, i) => (
              <ScrollSection key={num} delay={i === 0 ? '' : i === 1 ? 'delay' : 'delay-2'} className="flex flex-col items-center text-center">
                <span
                  className="text-5xl text-muted-foreground relative z-10 bg-background px-4"
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
          {testimonials.map((t, i) => (
            <ScrollSection
              key={t.name}
              delay={i === 0 ? '' : i === 1 ? 'delay' : 'delay-2'}
              className="liquid-glass-card rounded-2xl p-8 flex flex-col"
            >
              <span
                className="text-5xl text-muted-foreground/40 leading-none mb-4 select-none"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                "
              </span>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">{t.quote}</p>
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-foreground text-sm font-medium">{t.name}</p>
                <p className="text-muted-foreground text-xs mt-0.5">{t.subtitle}</p>
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
            {/* overflow-visible so the badge pokes above the card edge */}
            <div className="rounded-2xl p-8 flex flex-col gap-6 md:scale-105 relative overflow-visible" style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.08), 0 4px 32px rgba(0,0,0,0.3)' }}>
              {/* Most chosen badge — absolute, top-right, pokes above card edge */}
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

      {/* ── Stats Strip — relative wrapper so ambient-glow orb is contained ── */}
      <div className="relative overflow-hidden">
        {/* Decorative ambient glow — top-right, z-0, purely visual */}
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

      {/* ── Final CTA Band ── */}
      <ScrollSection className="py-24 px-6">
        <div className="liquid-glass-card rounded-2xl max-w-4xl mx-auto py-16 px-8 text-center">
          <h2
            className="text-3xl sm:text-4xl font-normal leading-tight tracking-[-1px] text-foreground"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Still figuring out where to start?
          </h2>
          <p className="mt-4 text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Most students know what they need to study. The hard part is knowing where to start and what to cut. Let's figure that out together.
          </p>
          <Link
            to="/reach-us"
            className="gradient-cta rounded-full px-10 py-4 text-base mt-10 inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          >
            Begin Journey
          </Link>
        </div>
      </ScrollSection>

      {/* ── Footer ── */}
      <footer className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between gap-12">
            {/* Left: Logo + tagline */}
            <div className="max-w-xs">
              <Link
                to="/"
                className="text-2xl tracking-tight text-foreground flex items-baseline"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                Study Hub<sup className="text-xs ml-0.5 font-sans">®</sup>
              </Link>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Quiet spaces for inspired work. One mentor, real conversations.
              </p>
            </div>

            {/* Right: link columns */}
            <div className="flex gap-16">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Explore</p>
                <div className="flex flex-col space-y-3">
                  {[['Studio', '/studio'], ['Journal', '/journal'], ['About', '/about']].map(([l, h]) => (
                    <Link key={l} to={h} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{l}</Link>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Connect</p>
                <div className="flex flex-col space-y-3">
                  <Link to="/reach-us" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Reach Us</Link>
                  <div className="flex items-center gap-3 mt-2">
                    {/* Instagram */}
                    <a href="#" aria-label="Instagram" className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </a>
                    {/* GitHub */}
                    <a href="#" aria-label="GitHub" className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                    </a>
                    {/* LinkedIn */}
                    <a href="#" aria-label="LinkedIn" className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom copyright */}
          <div className="mt-12 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground">
              © 2026 Study Hub. Built with intention.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
