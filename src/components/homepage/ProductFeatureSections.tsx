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
    { title: 'StudyMate AI', desc: 'Syllabus-aware AI for instant explanations, step-by-step math breakdowns and custom question generation.', icon: Cpu, path: '/study-ai' },
    { title: 'Interactive Roadmaps', desc: 'Visual step-by-step learning paths broken down by subject, topic weightage, and high-yield concepts.', icon: MapPin, path: '/roadmap' },
    { title: 'Official PYQs & Practice', desc: 'Chapterwise previous year question banks with difficulty filters, detailed explanations, and tagging.', icon: Zap, path: '/practice' },
    { title: 'Mock Test Simulator', desc: 'Real exam pressure interface with countdown timers, scientific calculators, marking scheme and analytics.', icon: Trophy, path: '/mock-tests' },
    { title: 'Spaced Revision Engine', desc: 'Smart review queues designed around memory retention intervals so you remember concepts long-term.', icon: RotateCcw, path: '/revision' },
    { title: 'Flashcards Decks', desc: 'Quick digital flashcard decks with instant flip view for rapid formula and definition retention.', icon: Layers, path: '/flashcards' },
    { title: 'Distraction-Free Focus Room', desc: 'Minimalist Pomodoro study timer with quiet ambient backgrounds and daily study streak tracking.', icon: Clock, path: '/focus-room' },
    { title: 'Accountability Circles', desc: 'Quiet study groups with fellow exam aspirants focused on daily progress, not social distraction.', icon: Users, path: '/community' },
  ];

  return (
    <div className="space-y-0">
      
      {/* ── SECTION: MIST BACKGROUND — ALL-IN-ONE ECOSYSTEM (8 Core Cards) ── */}
      <section className="py-20 md:py-28 bg-[#EAF2F7] border-b border-[#10233F]/08">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#1F5F8B] bg-[#FCFBF8] border border-[#10233F]/08 px-3.5 py-1.5 rounded-full inline-block mb-3 shadow-sm">
              All-In-One Ecosystem
            </span>
            <h2
              className="text-4xl sm:text-5xl font-normal text-[#10233F] tracking-tight"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              One place for your entire study life.
            </h2>
            <p className="text-base text-[#3D4A5A] mt-3 leading-relaxed">
              No more switching between 10 different apps. Everything you need to learn, test, revise, and stay consistent is built right here.
            </p>

            {/* Feature Video Frame */}
            <div className="mt-6 mx-auto max-w-sm rounded-2xl overflow-hidden border border-[#10233F]/10 shadow-xl bg-[#10233F] aspect-video flex items-center justify-center">
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
                  className="bg-[#FCFBF8] rounded-3xl p-6 border border-[#10233F]/08 hover:border-[#1F5F8B]/30 hover:shadow-[0_14px_40px_rgba(16,35,63,0.08)] transition-all duration-300 cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-[#EAF2F7] flex items-center justify-center mb-5 border border-[#10233F]/06 group-hover:scale-105 transition-transform">
                      <Icon className="w-6 h-6 text-[#1F5F8B]" />
                    </div>
                    <h3 className="text-lg font-bold text-[#172033] mb-2 group-hover:text-[#1F5F8B] transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs text-[#627083] leading-relaxed">
                      {card.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#10233F]/06 flex items-center justify-between text-xs font-semibold text-[#10233F] group-hover:text-[#1F5F8B] transition-colors">
                    <span>Explore module</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── SECTION: LIGHT BACKGROUND — THREE PILLARS ── */}
      <section className="py-20 md:py-28 bg-[#FCFBF8] border-b border-[#10233F]/08">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#1F5F8B] bg-[#EAF2F7] px-3.5 py-1.5 rounded-full inline-block mb-3">
              Core Philosophy
            </span>
            <h2
              className="text-4xl sm:text-5xl font-normal text-[#10233F] tracking-tight"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Study less scattered. Learn more intentionally.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Pillar 01 */}
            <div className="bg-[#FCFBF8] rounded-3xl p-8 border border-[#10233F]/08 shadow-sm relative overflow-hidden flex flex-col justify-between">
              <span
                className="text-6xl font-normal text-[#1F5F8B]/30 leading-none mb-6 block"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                01
              </span>
              <div>
                <h3 className="text-2xl font-bold text-[#172033] mb-2">Understand</h3>
                <p className="text-sm text-[#3D4A5A] leading-relaxed">
                  StudyMate explains complex technical concepts clearly with analogies, visual breakdowns, and interactive examples tailored to your syllabus.
                </p>
              </div>
            </div>

            {/* Pillar 02 */}
            <div className="bg-[#FCFBF8] rounded-3xl p-8 border border-[#10233F]/08 shadow-sm relative overflow-hidden flex flex-col justify-between">
              <span
                className="text-6xl font-normal text-[#4E88B7]/40 leading-none mb-6 block"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                02
              </span>
              <div>
                <h3 className="text-2xl font-bold text-[#172033] mb-2">Practice</h3>
                <p className="text-sm text-[#3D4A5A] leading-relaxed">
                  Work through official previous year questions, timed chapter tests, and adaptive difficulty sessions to test real problem-solving ability.
                </p>
              </div>
            </div>

            {/* Pillar 03 */}
            <div className="bg-[#FCFBF8] rounded-3xl p-8 border border-[#10233F]/08 shadow-sm relative overflow-hidden flex flex-col justify-between">
              <span
                className="text-6xl font-normal text-[#FCDAB7] leading-none mb-6 block"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                03
              </span>
              <div>
                <h3 className="text-2xl font-bold text-[#172033] mb-2">Improve</h3>
                <p className="text-sm text-[#3D4A5A] leading-relaxed">
                  Track mistake patterns, review weak areas with spaced repetition flashcards, and follow personalized analytics to elevate your scores.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── SECTION: DARK CONTAINER — MATERIAL INTEGRITY ── */}
      <section className="py-20 md:py-24 bg-[#FCFBF8] border-b border-[#10233F]/08">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          
          <div className="bg-[#10233F] text-[#FCFBF8] rounded-3xl p-8 md:p-12 shadow-[0_24px_70px_rgba(16,35,63,0.14)] border border-white/12 relative overflow-hidden">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FCDAB7]/20 text-[#FCDAB7] text-xs font-semibold uppercase tracking-wider mb-4 border border-[#FCDAB7]/30">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Material Integrity</span>
              </div>
              <h2
                className="text-3xl sm:text-4xl md:text-5xl font-normal text-[#FCFBF8] mb-4 leading-tight"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                Built around real study material.
              </h2>
              <p className="text-sm sm:text-base text-white/75 leading-relaxed mb-8">
                We believe in complete transparency. Study Hub content is clearly tagged with origin badges so you always know what you're practicing with.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-white/06 p-4 rounded-2xl border border-white/12 backdrop-blur-md">
                  <span className="px-2.5 py-1 rounded bg-[#2E8B72]/30 text-[#2E8B72] font-semibold uppercase tracking-wider text-[10px] inline-block mb-2 border border-[#2E8B72]/40">
                    Official Badge
                  </span>
                  <p className="font-semibold text-[#FCFBF8] text-sm">Official PYQs</p>
                  <p className="text-white/65 mt-1">Exact question papers from conducting bodies like IITs, NTA, UPSC.</p>
                </div>

                <div className="bg-white/06 p-4 rounded-2xl border border-white/12 backdrop-blur-md">
                  <span className="px-2.5 py-1 rounded bg-[#1F5F8B]/40 text-[#4E88B7] font-semibold uppercase tracking-wider text-[10px] inline-block mb-2 border border-[#1F5F8B]/50">
                    Verified Badge
                  </span>
                  <p className="font-semibold text-[#FCFBF8] text-sm">Verified Sources</p>
                  <p className="text-white/65 mt-1">Curated academic materials verified by top mentors and rankers.</p>
                </div>

                <div className="bg-white/06 p-4 rounded-2xl border border-white/12 backdrop-blur-md">
                  <span className="px-2.5 py-1 rounded bg-[#F7E7D0]/30 text-[#FCDAB7] font-semibold uppercase tracking-wider text-[10px] inline-block mb-2 border border-[#F7E7D0]/40">
                    AI-Generated Badge
                  </span>
                  <p className="font-semibold text-[#FCFBF8] text-sm">AI Guidance</p>
                  <p className="text-white/65 mt-1">Adaptive practice questions & explanations generated live by StudyMate.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── SECTION: WARM TINTED BACKGROUND — FOCUS ROOM ── */}
      <section className="py-20 md:py-24 bg-[#F7E7D0]/20 border-b border-[#10233F]/08">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="bg-[#FCFBF8] rounded-3xl p-8 md:p-12 border border-[#10233F]/08 shadow-[0_14px_40px_rgba(16,35,63,0.08)] flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <span className="text-xs uppercase font-semibold tracking-wider text-[#1F5F8B] bg-[#EAF2F7] px-3.5 py-1.5 rounded-full inline-block mb-3">
                Built-In Focus Tool
              </span>
              <h2
                className="text-3xl sm:text-4xl font-normal text-[#10233F] tracking-tight mb-3"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                When it's time to focus, disappear into the work.
              </h2>
              <p className="text-sm sm:text-base text-[#3D4A5A] leading-relaxed">
                Step into a distraction-free environment. Set your timer, select your active subject, and build daily study streaks.
              </p>
            </div>

            <div className="bg-[#10233F] text-[#FCFBF8] p-6 rounded-3xl border border-white/12 shadow-2xl flex flex-col items-center justify-center min-w-[260px] text-center shrink-0">
              <span className="text-[10px] uppercase tracking-widest text-[#FCDAB7] font-semibold mb-1">Active Focus Session</span>
              <p className="text-5xl font-mono font-normal text-white my-2" style={{ fontFamily: "'Instrument Serif', serif" }}>
                50:00
              </p>
              <p className="text-xs text-white/70 font-medium mb-4">Computer Networks • Deep Work</p>

              <button
                type="button"
                onClick={() => navigate('/focus-room')}
                className="w-full py-3 rounded-full bg-gradient-to-r from-[#1F5F8B] to-[#4E88B7] text-white font-semibold text-xs shadow-md hover:scale-105 transition-transform flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Enter Focus Room →</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION: LIGHT BACKGROUND — JOURNAL HIGHLIGHTS ── */}
      <section className="py-20 md:py-24 bg-[#FCFBF8] border-b border-[#10233F]/08">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          
          <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
            <div>
              <span className="text-xs uppercase font-semibold tracking-wider text-[#1F5F8B] bg-[#EAF2F7] px-3.5 py-1.5 rounded-full inline-block mb-3">
                Study Hub Journal
              </span>
              <h2
                className="text-4xl sm:text-5xl font-normal text-[#10233F] tracking-tight"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                Insights for serious learners.
              </h2>
            </div>

            <Link
              to="/journal"
              className="text-xs font-semibold text-[#1F5F8B] hover:underline flex items-center gap-1"
            >
              View all articles →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ARTICLES.slice(0, 3).map((art: Article) => (
              <Link
                key={art.slug}
                to={`/journal/${art.slug}`}
                className="bg-[#FCFBF8] rounded-3xl overflow-hidden border border-[#10233F]/08 shadow-sm hover:shadow-[0_14px_40px_rgba(16,35,63,0.08)] hover:border-[#1F5F8B]/30 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="h-44 overflow-hidden relative bg-[#EAF2F7]">
                    <img
                      src={art.image}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 bg-[#10233F]/85 backdrop-blur-md text-[#FCFBF8] text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {art.category}
                    </span>
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-bold text-[#172033] group-hover:text-[#1F5F8B] transition-colors leading-snug mb-2">
                      {art.title}
                    </h3>
                    <p className="text-xs text-[#627083] line-clamp-2 leading-relaxed">
                      {art.excerpt}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-2 flex items-center justify-between text-xs text-[#627083] font-medium">
                  <span>{art.readTime}</span>
                  <span className="text-[#1F5F8B] font-semibold group-hover:underline flex items-center gap-1">
                    Read article <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* ── SECTION: FOUNDER TEASER ── */}
      <section className="py-20 md:py-24 bg-[#EAF2F7] border-b border-[#10233F]/08">
        <div className="max-w-4xl mx-auto px-6 md:px-8">
          <div className="bg-[#FCFBF8] rounded-3xl p-8 sm:p-10 border border-[#10233F]/08 shadow-[0_14px_40px_rgba(16,35,63,0.08)] flex flex-col sm:flex-row items-center gap-8 text-center sm:text-left">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full p-1 bg-[#F7E7D0] shadow-md shrink-0">
              <img
                src="/images/pradhum-mandil.jpg"
                alt="Pradhum Mandil — Founder of Study Hub"
                className="w-full h-full rounded-full object-cover"
              />
            </div>

            <div>
              <span className="text-xs uppercase font-semibold tracking-wider text-[#1F5F8B] bg-[#EAF2F7] px-3 py-1 rounded-full inline-block mb-3">
                Built For Students, By A Student
              </span>
              <h3
                className="text-2xl sm:text-3xl font-normal text-[#10233F] tracking-tight mb-2"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                Built by someone who knows what student life actually feels like.
              </h3>
              <p className="text-xs sm:text-sm text-[#3D4A5A] leading-relaxed mb-4">
                Study Hub started out of a personal need: too many scattered PDFs, noisy social platforms, and zero structured AI clarity for exams.
              </p>

              <Link
                to="/about"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1F5F8B] hover:underline"
              >
                <span>Meet the founder & read our story</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION: FINAL CTA (DEEP NAVY) ── */}
      <section className="py-24 px-6 md:px-8 bg-[#10233F] text-[#FCFBF8] relative overflow-hidden">
        <div className="absolute inset-0 bg-radial from-[#1F5F8B]/20 via-[#F7E7D0]/05 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10 py-12">
          <h2
            className="text-4xl sm:text-5xl md:text-6xl font-normal text-white leading-tight mb-4 tracking-tight"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Your study journey starts with one decision.
          </h2>

          <p className="text-base sm:text-lg text-white/75 max-w-xl mx-auto leading-relaxed mb-10">
            Put your resources, practice, revision, mock tests and AI guidance in one calm, intelligent place.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="px-10 py-4 rounded-full gradient-cta text-white font-semibold text-base shadow-xl shadow-[#1F5F8B]/30 hover:scale-105 transition-transform flex items-center gap-2 cursor-pointer"
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

