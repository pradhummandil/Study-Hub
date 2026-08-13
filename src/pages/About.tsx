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

import { motion } from 'framer-motion';

const pillars = [
  {
    title: 'Learn',
    subtitle: 'Understand core concepts',
    description:
      'Clear explanations, curated resource studio, and 24/7 StudyMate AI coach to guide you through tough topics.',
    icon: BookOpen,
    accent: 'text-scholar',
  },
  {
    title: 'Practice',
    subtitle: 'Solve real exam questions',
    description:
      'Official GATE, JEE & NEET PYQs, topic drills, and full exam simulations under timed conditions.',
    icon: Zap,
    accent: 'text-terracotta',
  },
  {
    title: 'Improve',
    subtitle: 'Target your exact weak spots',
    description:
      'Mistakes notebook, spaced repetition revision, performance analytics, and adaptive practice recommendations.',
    icon: RotateCcw,
    accent: 'text-gold',
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
    <div className="bg-paper text-ink selection:bg-terracotta/20 selection:text-ink min-h-screen">
      <Helmet>
        <title>About Study Hub — Built for the Way Students Actually Learn</title>
        <meta
          name="description"
          content="Study Hub brings learning, practice, guidance, revision and focused preparation into one connected experience for GATE, JEE, NEET & CUET aspirants."
        />
      </Helmet>

      {/* Hero */}
      <div className="relative z-10 px-6 pt-16 pb-12 max-w-4xl mx-auto text-center space-y-4">
        <span className="text-xs uppercase tracking-widest text-terracotta font-semibold bg-terracotta/10 border border-terracotta/20 px-4 py-1.5 rounded-full inline-block">
          About Study Hub
        </span>
        <h1
          className="text-4xl sm:text-6xl font-normal leading-[0.98] tracking-[-1.5px] text-ink"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Built for the way students <span className="italic text-terracotta">actually learn.</span>
        </h1>
        <p className="text-muted text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mt-4">
          Study Hub brings learning, practice, guidance, revision and focused preparation into one connected experience for students navigating competitive exams and college coursework.
        </p>
      </div>

      {/* LAYERED FOUNDER SECTION WITH SPATIAL CARD DEPTH */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        <div className="relative rounded-3xl bg-forest text-paper p-8 sm:p-12 border border-forest/20 shadow-deep grid md:grid-cols-12 gap-8 items-center overflow-hidden">
          {/* Subtle Ambient Radial Glows */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-terracotta/15 rounded-full blur-[90px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-scholar/40 rounded-full blur-[90px] pointer-events-none" />

          {/* Photo Column with Layered Paper Cards Background */}
          <div className="md:col-span-5 flex flex-col items-center relative">
            <motion.div
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-[280px] aspect-[4/5] rounded-3xl overflow-hidden border border-sage/30 p-2 shadow-float bg-scholar/40 backdrop-blur-md group"
            >
              {/* Background Card Offset */}
              <div className="absolute inset-0 bg-parchment rounded-3xl -z-10 translate-x-3 translate-y-3 opacity-20 pointer-events-none" />

              {!imgError ? (
                <img
                  src="/images/pradhum-mandil.jpg"
                  alt="Pradhum Mandil — Founder of Study Hub"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover rounded-2xl relative z-10 transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full rounded-2xl bg-forest flex flex-col items-center justify-center p-6 text-center relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-terracotta text-paper font-serif font-bold text-2xl flex items-center justify-center mb-3">
                    PM
                  </div>
                  <p className="text-paper text-sm font-semibold">Pradhum Mandil</p>
                  <p className="text-xs text-sage">Founder, Study Hub</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Founder Narrative Column */}
          <div className="md:col-span-7 space-y-4 text-left relative z-10">
            <span className="text-xs uppercase tracking-widest text-gold font-semibold">
              About the Founder
            </span>
            <h2
              className="text-3xl sm:text-4xl font-normal text-paper leading-tight"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Pradhum Mandil
            </h2>
            <p className="text-xs text-gold font-semibold">Founder & Lead Architect, Study Hub</p>

            <div className="space-y-3 text-sm text-sage leading-relaxed pt-2 border-t border-sage/20">
              <p>
                Building tools that make studying more organized, personalized, and effective for students preparing for GATE, JEE, NEET, and academic coursework.
              </p>
              <p>
                After experiencing the frustration of scattered study materials, unorganized timetables, and passive video watching firsthand, I set out to build Study Hub — bringing structured PYQ practice, spaced revision, and AI coaching into a single command center.
              </p>
              <p>
                Every feature in Study Hub is designed around one guiding core principle: <strong className="text-paper">give students absolute clarity on what to study next.</strong>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Why Study Hub (3 Pillars) */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-widest text-muted font-semibold mb-2">Our Framework</p>
          <h2
            className="text-3xl sm:text-5xl font-normal text-ink"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Why Study Hub
          </h2>
          <p className="text-xs sm:text-sm text-muted mt-2 max-w-md mx-auto">
            Three core pillars designed to take you from confusion to exam confidence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map(({ title, subtitle, description, icon: Icon, accent }) => (
            <div key={title} className="bg-parchment/60 rounded-3xl p-8 border border-forest/10 space-y-4 shadow-card">
              <div className="w-12 h-12 rounded-2xl bg-paper border border-forest/10 flex items-center justify-center shadow-sm">
                <Icon className={`w-6 h-6 ${accent}`} />
              </div>
              <h3
                className="text-2xl font-normal text-ink"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                {title}
              </h3>
              <p className="text-xs text-terracotta font-semibold">{subtitle}</p>
              <p className="text-xs text-muted leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Product Ecosystem Grid */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-widest text-muted font-semibold mb-2">Complete Student OS</p>
          <h2
            className="text-3xl sm:text-5xl font-normal text-ink"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            The Study Hub Ecosystem
          </h2>
          <p className="text-xs sm:text-sm text-muted mt-2 max-w-md mx-auto">
            Every feature connects seamlessly into your daily prep routine.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ecosystemItems.map(({ title, path, icon: Icon, desc }) => (
            <Link
              key={title}
              to={path}
              className="bg-paper rounded-2xl p-5 border border-forest/10 hover:border-scholar/40 hover:scale-[1.02] transition-all shadow-card hover:shadow-float group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-parchment border border-forest/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-scholar group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <h4
                    className="text-lg sm:text-xl font-normal text-ink group-hover:text-scholar transition-colors"
                    style={{ fontFamily: "'Instrument Serif', serif" }}
                  >
                    {title}
                  </h4>
                  <p className="text-xs text-muted">{desc}</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted group-hover:text-ink group-hover:translate-x-1 transition-all shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      {/* Closing CTA */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 pb-32 text-center">
        <div className="bg-forest text-paper rounded-3xl py-14 px-8 border border-forest/20 shadow-deep">
          <h2
            className="text-3xl sm:text-5xl font-normal text-paper tracking-[-1px]"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Ready to stop studying in circles?
          </h2>
          <p className="text-sage mt-4 max-w-md mx-auto leading-relaxed text-sm">
            Book a free guidance session or explore the study command center today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Link
              to="/reach-us"
              className="rounded-xl px-8 py-3.5 text-sm font-bold text-paper bg-terracotta hover:bg-terracotta/90 transition-transform shadow-card"
            >
              Book a Free Call
            </Link>
            <Link
              to="/dashboard"
              className="rounded-xl px-8 py-3.5 text-sm font-semibold text-paper bg-scholar/40 hover:bg-scholar border border-sage/30 transition-colors"
            >
              Open Command Center
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
