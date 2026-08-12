import { Helmet } from 'react-helmet-async';
import { MessageCircle, MessageSquare, Users, Compass, ExternalLink } from 'lucide-react';

/* REPLACE_WITH_REAL_INVITE_LINK — Swap these placeholders when community links go live */
const WHATSAPP_INVITE_URL = 'https://chat.whatsapp.com/CjmJnyoEOTl2tTNrGYQs7r?s=sh&p=a&ilr=4';
const DISCORD_INVITE_URL = 'https://discord.gg/2v6g7k8';

export default function Community() {
  return (
    <>
      <Helmet>
        <title>Community — Study Hub</title>
        <meta name="description" content="Join 500+ students working through the same exams, habits, and doubts. Quiet study rooms and WhatsApp check-ins." />
      </Helmet>

      {/* Hero */}
      <div className="relative z-10 px-6 pt-24 pb-12 text-center max-w-4xl mx-auto">
        <h1
          className="animate-fade-rise text-5xl sm:text-6xl font-normal leading-[0.95] tracking-[-2px] text-foreground"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          You're not doing this <span className="text-gradient-accent">alone.</span>
        </h1>

        <p className="animate-fade-rise-delay text-muted-foreground max-w-xl mx-auto mt-6 leading-relaxed">
          Join students working through the same stuff — same anxiety, same 2am doubts, same wins.
        </p>
      </div>

      {/* Primary Community CTA Card (WhatsApp) */}
      <div className="relative z-10 max-w-xl mx-auto px-6 mb-6">
        <div className="liquid-glass-card rounded-2xl p-8 sm:p-10 text-center border border-white/10 relative overflow-hidden shadow-2xl">
          {/* Subtle ambient glow behind primary card */}
          <div className="ambient-glow" style={{ top: '-100px', left: '20%', opacity: 0.5 }} />

          <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-5 border border-emerald-500/20">
            <MessageCircle className="w-6 h-6" />
          </div>

          <h2
            className="text-3xl sm:text-4xl font-normal leading-snug text-foreground mb-3"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Join the WhatsApp community
          </h2>

          <p className="text-muted-foreground text-sm leading-relaxed max-w-md mx-auto">
            Weekly study check-ins, instant Q&A, and a quiet space where everyone is building the same habit.
          </p>

          <a
            href={WHATSAPP_INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="gradient-cta rounded-full px-8 py-3.5 text-base font-medium inline-flex items-center justify-center gap-2 mt-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          >
            <span>Join WhatsApp Group</span>
            <ExternalLink className="w-4 h-4 opacity-80" />
          </a>
        </div>
      </div>

      {/* Secondary Community Option (Discord) */}
      <div className="relative z-10 max-w-xl mx-auto px-6 mb-20">
        <div className="liquid-glass rounded-xl p-5 text-center border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left sm:text-left">
            <p className="text-sm font-medium text-foreground">Prefer Discord?</p>
            <p className="text-xs text-muted-foreground mt-0.5">Quiet study streams and voice channels.</p>
          </div>

          <a
            href={DISCORD_INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="liquid-glass rounded-full px-5 py-2 text-xs text-foreground font-medium hover:scale-105 transition-transform flex items-center gap-1.5 shrink-0"
          >
            <span>Discord Server</span>
            <ExternalLink className="w-3 h-3 text-muted-foreground" />
          </a>
        </div>
      </div>

      {/* What Happens in There Section */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 pb-32">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Community values</p>
          <h2
            className="text-3xl sm:text-4xl font-normal leading-tight text-foreground"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            What happens in there
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="liquid-glass-card rounded-2xl p-8 flex flex-col justify-between border border-white/5">
            <div className="w-10 h-10 rounded-xl liquid-glass flex items-center justify-center mb-6">
              <MessageSquare className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">Ask anything, anytime</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Get answers from students who cleared the exact exam you're taking. No judgment, no dumb questions.
              </p>
            </div>
          </div>

          <div className="liquid-glass-card rounded-2xl p-8 flex flex-col justify-between border border-white/5">
            <div className="w-10 h-10 rounded-xl liquid-glass flex items-center justify-center mb-6">
              <Users className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">Weekly study-together sessions</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Silent focus sessions on Google Meet and Discord so you never have to study completely alone.
              </p>
            </div>
          </div>

          <div className="liquid-glass-card rounded-2xl p-8 flex flex-col justify-between border border-white/5">
            <div className="w-10 h-10 rounded-xl liquid-glass flex items-center justify-center mb-6">
              <Compass className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">See what others are working through</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Share notes, roadmaps, and daily streak check-ins to stay accountable when motivation drops.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
