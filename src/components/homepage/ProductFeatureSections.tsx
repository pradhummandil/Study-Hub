import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
  Cpu, MapPin, Zap, Trophy, RotateCcw, Layers, Clock, Users,
  ArrowRight, ShieldCheck, ExternalLink
} from 'lucide-react';
import { ARTICLES, type Article } from '../../content/journal/articles';

export const ProductFeatureSections: React.FC = () => {
  const navigate = useNavigate();

  // Core 8 Product Cards
  const productCards = [
    { title: 'StudyMate AI', desc: 'Syllabus-aware AI for instant explanations, step-by-step math breakdowns and custom question generation.', icon: Cpu, path: '/study-ai', color: 'from-[#5CE1E6]/20 to-[#287BFF]/10' },
    { title: 'Interactive Roadmaps', desc: 'Visual step-by-step learning paths broken down by subject, topic weightage, and high-yield concepts.', icon: MapPin, path: '/roadmap', color: 'from-[#287BFF]/20 to-[#6F7CFF]/10' },
    { title: 'Official PYQs & Practice', desc: 'Chapterwise previous year question banks with difficulty filters, detailed explanations, and tagging.', icon: Zap, path: '/practice', color: 'from-[#6F7CFF]/20 to-[#5CE1E6]/10' },
    { title: 'Mock Test Simulator', desc: 'Real exam pressure interface with countdown timers, scientific calculators, marking scheme and analytics.', icon: Trophy, path: '/mock-tests', color: 'from-amber-500/20 to-orange-500/10' },
    { title: 'Spaced Revision Engine', desc: 'Smart review queues designed around memory retention intervals so you remember concepts long-term.', icon: RotateCcw, path: '/revision', color: 'from-emerald-500/20 to-teal-500/10' },
    { title: 'Flashcards Decks', desc: 'Quick digital flashcard decks with instant flip view for rapid formula and definition retention.', icon: Layers, path: '/flashcards', color: 'from-[#287BFF]/20 to-[#5CE1E6]/10' },
    { title: 'Distraction-Free Focus Room', desc: 'Minimalist Pomodoro study timer with quiet ambient backgrounds and daily study streak tracking.', icon: Clock, path: '/focus-room', color: 'from-violet-500/20 to-indigo-500/10' },
    { title: 'Accountability Circles', desc: 'Quiet study groups with fellow exam aspirants focused on daily progress, not social distraction.', icon: Users, path: '/community', color: 'from-sky-500/20 to-blue-500/10' },
  ];

  return (
    <div className="space-y-0">
      
      {/* ── SECTION 23: ONE PLACE FOR YOUR ENTIRE STUDY LIFE (8 Core Cards) ── */}
      <section className="py-20 md:py-28 bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase font-bold tracking-widest text-[#287BFF] bg-[#287BFF]/10 px-3.5 py-1.5 rounded-full inline-block mb-3">
              All-In-One Ecosystem
            </span>
            <h2
              className="text-4xl sm:text-5xl font-normal text-[#062B3D] tracking-tight"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              One place for your entire study life.
            </h2>
            <p className="text-base text-slate-600 mt-3 leading-relaxed">
              No more switching between 10 different apps. Everything you need to learn, test, revise, and stay consistent is built right here.
            </p>

            {/* Actual Pin 8 Video Feature Frame */}
            <div className="mt-6 mx-auto max-w-sm rounded-2xl overflow-hidden border border-slate-200 shadow-xl bg-slate-900 aspect-video flex items-center justify-center">
              <video
                src="/assets/pinterest/actual-pin-1041387113816400123.mp4"
                poster="/assets/pinterest/actual-pin-1041387113816400123-poster.webp"
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {productCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  onClick={() => navigate(card.path)}
                  className="bg-slate-50 rounded-3xl p-6 border border-slate-200/70 hover:border-[#287BFF]/40 hover:bg-white hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-5 border border-slate-200/50 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-[#062B3D]" />
                    </div>
                    <h3 className="text-lg font-bold text-[#062B3D] mb-2 group-hover:text-[#287BFF] transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-200/50 flex items-center justify-between text-xs font-bold text-[#062B3D] group-hover:text-[#287BFF] transition-colors">
                    <span>Explore module</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── SECTION 25: THREE PILLARS (Understand, Practice, Improve) ── */}
      <section className="py-20 md:py-28 bg-[#F8FCFF] border-b border-slate-200/70">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase font-bold tracking-widest text-[#287BFF] bg-[#287BFF]/10 px-3.5 py-1.5 rounded-full inline-block mb-3">
              Core Philosophy
            </span>
            <h2
              className="text-4xl sm:text-5xl font-normal text-[#062B3D] tracking-tight"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Study less scattered. Learn more intentionally.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Pillar 01 */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-md relative overflow-hidden flex flex-col justify-between">
              <span
                className="text-6xl font-normal text-slate-300 leading-none mb-6 block"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                01
              </span>
              <div>
                <h3 className="text-2xl font-bold text-[#062B3D] mb-2">Understand</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  StudyMate explains complex technical concepts clearly with analogies, visual breakdowns, and interactive examples tailored to your syllabus.
                </p>
              </div>
            </div>

            {/* Pillar 02 */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-md relative overflow-hidden flex flex-col justify-between">
              <span
                className="text-6xl font-normal text-[#287BFF]/40 leading-none mb-6 block"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                02
              </span>
              <div>
                <h3 className="text-2xl font-bold text-[#062B3D] mb-2">Practice</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Work through official previous year questions, timed chapter tests, and adaptive difficulty sessions to test real problem-solving ability.
                </p>
              </div>
            </div>

            {/* Pillar 03 */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-md relative overflow-hidden flex flex-col justify-between">
              <span
                className="text-6xl font-normal text-[#5CE1E6] leading-none mb-6 block"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                03
              </span>
              <div>
                <h3 className="text-2xl font-bold text-[#062B3D] mb-2">Improve</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Track mistake patterns, review weak areas with spaced repetition flashcards, and follow personalized analytics to elevate your scores.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── SECTION 28: REAL DATA TRUST SECTION ── */}
      <section className="py-20 md:py-24 bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          
          <div className="bg-gradient-to-r from-[#062B3D] to-[#0A3D56] text-white rounded-3xl p-8 md:p-12 shadow-xl border border-white/10 relative overflow-hidden">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5CE1E6]/20 text-[#5CE1E6] text-xs font-bold uppercase tracking-wider mb-4 border border-[#5CE1E6]/30">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Material Integrity</span>
              </div>
              <h2
                className="text-3xl sm:text-4xl md:text-5xl font-normal text-white mb-4 leading-tight"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                Built around real study material.
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-8">
                We believe in complete transparency. Study Hub content is clearly tagged with origin badges so you always know what you're practicing with.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-white/10 p-4 rounded-2xl border border-white/15 backdrop-blur-md">
                  <span className="px-2.5 py-1 rounded bg-emerald-500/30 text-emerald-300 font-bold uppercase tracking-wider text-[10px] inline-block mb-2">
                    Official Badge
                  </span>
                  <p className="font-bold text-white text-sm">Official PYQs</p>
                  <p className="text-slate-300 mt-1">Exact question papers from conducting bodies like IITs, NTA, UPSC.</p>
                </div>

                <div className="bg-white/10 p-4 rounded-2xl border border-white/15 backdrop-blur-md">
                  <span className="px-2.5 py-1 rounded bg-[#287BFF]/40 text-cyan-200 font-bold uppercase tracking-wider text-[10px] inline-block mb-2">
                    Verified Badge
                  </span>
                  <p className="font-bold text-white text-sm">Verified Sources</p>
                  <p className="text-slate-300 mt-1">Curated academic materials verified by top mentors and rankers.</p>
                </div>

                <div className="bg-white/10 p-4 rounded-2xl border border-white/15 backdrop-blur-md">
                  <span className="px-2.5 py-1 rounded bg-purple-500/30 text-purple-200 font-bold uppercase tracking-wider text-[10px] inline-block mb-2">
                    AI-Generated Badge
                  </span>
                  <p className="font-bold text-white text-sm">AI Guidance</p>
                  <p className="text-slate-300 mt-1">Adaptive practice questions & explanations generated live by StudyMate.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── SECTION 33: FOCUS ROOM PREVIEW ── */}
      <section className="py-20 md:py-24 bg-[#EDF6FF] border-b border-slate-200/70">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="bg-white rounded-3xl p-8 md:p-12 border border-slate-200/80 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <span className="text-xs uppercase font-bold tracking-widest text-[#287BFF] bg-[#287BFF]/10 px-3.5 py-1.5 rounded-full inline-block mb-3">
                Built-In Focus Tool
              </span>
              <h2
                className="text-3xl sm:text-4xl font-normal text-[#062B3D] tracking-tight mb-3"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                When it's time to focus, disappear into the work.
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Step into a distraction-free environment. Set your timer, select your active subject, and build daily study streaks.
              </p>
            </div>

            <div className="bg-[#062B3D] text-white p-6 rounded-3xl border border-white/10 shadow-2xl flex flex-col items-center justify-center min-w-[260px] text-center shrink-0">
              <span className="text-[10px] uppercase tracking-widest text-[#5CE1E6] font-bold mb-1">Active Focus Session</span>
              <p className="text-5xl font-mono font-normal text-white my-2" style={{ fontFamily: "'Instrument Serif', serif" }}>
                50:00
              </p>
              <p className="text-xs text-slate-300 font-semibold mb-4">Computer Networks • Deep Work</p>

              <button
                type="button"
                onClick={() => navigate('/focus-room')}
                className="w-full py-3 rounded-full bg-gradient-to-r from-[#287BFF] to-[#6F7CFF] text-white font-bold text-xs shadow-md hover:scale-105 transition-transform flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Enter Focus Room →</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 37: JOURNAL HIGHLIGHTS ── */}
      <section className="py-20 md:py-24 bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          
          <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-[#287BFF] bg-[#287BFF]/10 px-3.5 py-1.5 rounded-full inline-block mb-3">
                Study Hub Journal
              </span>
              <h2
                className="text-4xl sm:text-5xl font-normal text-[#062B3D] tracking-tight"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                Insights for serious learners.
              </h2>
            </div>

            <Link
              to="/journal"
              className="text-xs font-bold text-[#287BFF] hover:underline flex items-center gap-1"
            >
              View all articles →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ARTICLES.slice(0, 3).map((art: Article) => (
              <Link
                key={art.slug}
                to={`/journal/${art.slug}`}
                className="bg-slate-50 rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-[#287BFF]/40 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="h-44 overflow-hidden relative bg-slate-200">
                    <img
                      src={art.image}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 bg-[#062B3D]/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {art.category}
                    </span>
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-bold text-[#062B3D] group-hover:text-[#287BFF] transition-colors leading-snug mb-2">
                      {art.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {art.excerpt}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-2 flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>{art.readTime}</span>
                  <span className="text-[#287BFF] font-bold group-hover:underline flex items-center gap-1">
                    Read article <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* ── SECTION 38: FOUNDER TEASER ── */}
      <section className="py-20 md:py-24 bg-[#F8FCFF] border-b border-slate-200/70">
        <div className="max-w-4xl mx-auto px-6 md:px-8">
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xl flex flex-col sm:flex-row items-center gap-8 text-center sm:text-left">
            <img
              src="/images/pradhum-mandil.jpg"
              alt="Pradhum Mandil — Founder of Study Hub"
              className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-[#287BFF]/20 shadow-md shrink-0"
            />

            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-[#287BFF] bg-[#287BFF]/10 px-3 py-1 rounded-full inline-block mb-3">
                Built For Students, By A Student
              </span>
              <h3
                className="text-2xl sm:text-3xl font-normal text-[#062B3D] tracking-tight mb-2"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                Built by someone who knows what student life actually feels like.
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                Study Hub started out of a personal need: too many scattered PDFs, noisy social platforms, and zero structured AI clarity for exams.
              </p>

              <Link
                to="/about"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#287BFF] hover:underline"
              >
                <span>Meet the founder & read our story</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 39: FINAL CTA ── */}
      <section className="py-24 px-6 md:px-8 bg-[#062B3D] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-radial from-[#287BFF]/20 via-[#5CE1E6]/10 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10 py-12">
          <h2
            className="text-4xl sm:text-5xl md:text-6xl font-normal text-white leading-tight mb-4 tracking-tight"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Your study journey starts with one decision.
          </h2>

          <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto leading-relaxed mb-10">
            Put your resources, practice, revision, mock tests and AI guidance in one calm, intelligent place.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="px-10 py-4 rounded-full bg-gradient-to-r from-[#287BFF] via-[#6F7CFF] to-[#5CE1E6] text-white font-bold text-base shadow-xl shadow-[#287BFF]/30 hover:scale-105 transition-transform flex items-center gap-2 cursor-pointer"
            >
              <span>Start my study journey</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => navigate('/exams')}
              className="px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-base transition-colors border border-white/20 cursor-pointer"
            >
              Explore exams →
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
