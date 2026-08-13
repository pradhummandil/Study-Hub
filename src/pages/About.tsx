import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Sparkles,
  BookOpen,
  Zap,
  RotateCcw,
  Flame,
  Layers,
  Clock,
  Users,
  Trophy,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

const pillars = [
  {
    title: 'Learn',
    subtitle: 'Understand core concepts',
    description:
      'Clear explanations, curated resource studio, and 24/7 StudyMate AI coach to guide you through tough topics.',
    icon: BookOpen,
    accent: 'text-cyan-400',
  },
  {
    title: 'Practice',
    subtitle: 'Solve real exam questions',
    description:
      'Official GATE, JEE & NEET PYQs, topic drills, and full exam simulations under timed conditions.',
    icon: Zap,
    accent: 'text-amber-400',
  },
  {
    title: 'Improve',
    subtitle: 'Target your exact weak spots',
    description:
      'Mistakes notebook, spaced repetition revision, performance analytics, and adaptive practice recommendations.',
    icon: RotateCcw,
    accent: 'text-emerald-400',
  },
];

const ecosystemItems = [
  { title: 'StudyMate AI', path: '/study-ai', icon: Sparkles, desc: 'AI Study Partner' },
  { title: 'Resource Studio', path: '/studio', icon: BookOpen, desc: 'Official PYQs & Notes' },
  { title: 'Personalized Roadmap', path: '/roadmap', icon: CheckCircle2, desc: 'Custom Learning Path' },
  { title: 'Practice & PYQs', path: '/practice', icon: Zap, desc: 'Topic-wise Question Bank' },
  { title: 'Mock Tests', path: '/mock-tests', icon: Trophy, desc: 'Full Syllabus Simulations' },
  { title: 'Spaced Revision', path: '/revision', icon: RotateCcw, desc: 'Memory Decay Protection' },
  { title: 'Mistakes Notebook', path: '/mistakes', icon: Flame, desc: 'Error Analysis & Fixes' },
  { title: 'Flashcards Decks', path: '/flashcards', icon: Layers, desc: 'Active Recall Practice' },
  { title: 'Focus Room', path: '/focus-room', icon: Clock, desc: 'Distraction-Free Timer' },
  { title: 'Study Circles', path: '/community', icon: Users, desc: 'Academic Peer Community' },
];

export default function About() {
  const [imgError, setImgError] = useState(false);

  return (
    <>
      <Helmet>
        <title>About Study Hub — Built for the Way Students Actually Learn</title>
        <meta
          name="description"
          content="Study Hub brings learning, practice, guidance, revision and focused preparation into one connected experience for GATE, JEE, NEET & CUET aspirants."
        />
      </Helmet>

      {/* Hero */}
      <div className="relative z-10 px-6 pt-16 pb-12 max-w-4xl mx-auto text-center space-y-4">
        <span className="text-xs uppercase tracking-widest text-cyan-400 font-semibold liquid-glass px-4 py-1.5 rounded-full inline-block border border-cyan-500/20 font-sans">
          About Study Hub
        </span>
        <h1
          className="animate-fade-rise text-4xl sm:text-6xl font-normal leading-[0.98] tracking-[-1.5px] text-foreground"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Built for the way students <span className="text-gradient-accent">actually learn.</span>
        </h1>
        <p className="animate-fade-rise-delay text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-sans mt-4">
          Study Hub brings learning, practice, guidance, revision and focused preparation into one connected experience for students navigating competitive exams and college coursework.
        </p>
      </div>

      {/* Founder Section */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        <div className="liquid-glass-card rounded-3xl p-8 sm:p-12 border border-white/10 grid md:grid-cols-12 gap-8 items-center shadow-2xl">
          {/* Photo Frame Column */}
          <div className="md:col-span-5 flex flex-col items-center">
            <div className="relative w-full max-w-[280px] aspect-[4/5] rounded-3xl overflow-hidden liquid-glass border border-white/20 p-2 shadow-2xl group">
              {/* Ambient Glow behind image */}
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 via-indigo-500/10 to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />

              {!imgError ? (
                <img
                  src="/images/pradhum-mandil.jpg"
                  alt="Pradhum Mandil — Founder of Study Hub"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover rounded-2xl relative z-10 transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full rounded-2xl bg-slate-950 flex flex-col items-center justify-center p-6 text-center relative z-10">
                  <div className="w-16 h-16 rounded-full gradient-cta text-slate-950 font-bold text-2xl flex items-center justify-center mb-3">
                    PM
                  </div>
                  <p className="text-foreground text-sm font-semibold">Pradhum Mandil</p>
                  <p className="text-xs text-muted-foreground">Founder, Study Hub</p>
                </div>
              )}
            </div>
          </div>

          {/* Founder Narrative Column */}
          <div className="md:col-span-7 space-y-4 text-left">
            <span className="text-xs uppercase tracking-widest text-cyan-400 font-semibold font-sans">
              About the Founder
            </span>
            <h2
              className="text-3xl sm:text-4xl font-normal text-foreground leading-tight"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Pradhum Mandil
            </h2>
            <p className="text-xs text-cyan-300 font-medium font-sans">Founder & Lead Developer, Study Hub</p>

            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed font-sans pt-2 border-t border-white/10">
              <p>
                Building tools that make studying more organized, personalized, and effective for students preparing for GATE, JEE, NEET, and academic coursework.
              </p>
              <p>
                After experiencing the frustration of scattered study materials, unorganized timetables, and passive video watching firsthand, I set out to build Study Hub — bringing structured PYQ practice, spaced revision, and AI coaching into a single, cohesive command center.
              </p>
              <p>
                Every feature in Study Hub is designed around one guiding core principle: <strong className="text-foreground">give students absolute clarity on what to study next.</strong>
              </p>
            </div>

            {/* Supporting Visual — Pin 11 Shavrin Artwork */}
            <div className="mt-6 pt-6 border-t border-white/10 flex items-center gap-4">
              <img
                src="/assets/pinterest/actual-pin-526991593908723703.webp"
                alt="Selected Visual — Pin 526991593908723703 (What are you going to be when you grow up?)"
                className="w-24 h-24 rounded-2xl object-cover border border-cyan-500/30 shadow-lg"
              />
              <div>
                <p className="text-xs font-bold text-foreground">Shaping Student Trajectories</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Inspired by Pin 526991593908723703 — empowering learners from childhood dreams to career mastery.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Study Hub (3 Pillars) */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2">Our Framework</p>
          <h2
            className="text-3xl sm:text-5xl font-normal text-foreground"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Why Study Hub
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-md mx-auto font-sans">
            Three core pillars designed to take you from confusion to exam confidence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map(({ title, subtitle, description, icon: Icon, accent }) => (
            <div key={title} className="liquid-glass-card rounded-3xl p-8 border border-white/10 space-y-4">
              <div className="w-12 h-12 rounded-2xl liquid-glass border border-white/10 flex items-center justify-center">
                <Icon className={`w-6 h-6 ${accent}`} />
              </div>
              <h3
                className="text-2xl font-normal text-foreground"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                {title}
              </h3>
              <p className="text-xs text-cyan-300 font-medium font-sans">{subtitle}</p>
              <p className="text-xs text-muted-foreground leading-relaxed font-sans">{description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Product Ecosystem Grid */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2">Complete Student OS</p>
          <h2
            className="text-3xl sm:text-5xl font-normal text-foreground"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            The Study Hub Ecosystem
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2 max-w-md mx-auto font-sans">
            Every feature connects seamlessly into your daily prep routine.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ecosystemItems.map(({ title, path, icon: Icon, desc }) => (
            <Link
              key={title}
              to={path}
              className="liquid-glass-card rounded-2xl p-5 border border-white/10 hover:border-cyan-500/30 hover:scale-[1.02] transition-all group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl liquid-glass border border-white/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <h4
                    className="text-lg sm:text-xl font-normal text-foreground group-hover:text-cyan-300 transition-colors"
                    style={{ fontFamily: "'Instrument Serif', serif" }}
                  >
                    {title}
                  </h4>
                  <p className="text-xs text-muted-foreground font-sans">{desc}</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      {/* Closing CTA */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 pb-32 text-center">
        <div className="liquid-glass-card rounded-3xl py-14 px-8 border border-white/10 shadow-2xl">
          <h2
            className="text-3xl sm:text-5xl font-normal text-foreground tracking-[-1px]"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Ready to stop studying in circles?
          </h2>
          <p className="text-muted-foreground mt-4 max-w-md mx-auto leading-relaxed text-sm font-sans">
            Book a free 20-minute guidance session or explore the study command center today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Link
              to="/reach-us"
              className="gradient-cta rounded-full px-8 py-3.5 text-sm font-semibold text-slate-950 hover:scale-105 transition-transform"
            >
              Book a Free Call
            </Link>
            <Link
              to="/dashboard"
              className="liquid-glass rounded-full px-8 py-3.5 text-sm font-medium text-foreground hover:bg-white/10 transition-colors border border-white/10"
            >
              Open Command Center
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
