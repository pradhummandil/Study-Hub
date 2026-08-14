import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
  Cpu, MapPin, Zap, Trophy, RotateCcw, Layers, Clock, Users,
  ArrowRight
} from 'lucide-react';
import { ARTICLES } from '../../content/journal/articles';

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
    <div className="space-y-0 bg-[#F8F6F0] text-[#1C201D]">
      
      {/* ── SECTION: ALL-IN-ONE ECOSYSTEM (8 Core Cards) ── */}
      <section className="py-20 md:py-28 bg-[#F8F6F0] border-b border-[#1C201D]/10">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-[#2D5A3F] bg-[#2D5A3F]/10 border border-[#2D5A3F]/20 px-3.5 py-1.5 rounded-full inline-block mb-3 shadow-sm">
              All-In-One Ecosystem
            </span>
            <h2 className="text-4xl sm:text-5xl font-serif font-bold text-[#1C201D] tracking-tight">
              One place for your entire study life.
            </h2>
            <p className="text-base text-[#6C706D] mt-3 leading-relaxed">
              No more switching between 10 different apps. Everything you need to learn, test, revise, and stay consistent is built right here.
            </p>

            {/* Feature Video Frame */}
            <div className="mt-6 mx-auto max-w-sm rounded-2xl overflow-hidden border border-[#1C201D]/10 shadow-xl bg-[#1C201D] aspect-video flex items-center justify-center">
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
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {productCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  onClick={() => navigate(card.path)}
                  className="bg-[#FFFFFF] border border-[#1C201D]/10 hover:border-[#2D5A3F]/40 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#2D5A3F]/10 border border-[#2D5A3F]/20 flex items-center justify-center text-[#2D5A3F] group-hover:bg-[#2D5A3F] group-hover:text-[#FFFFFF] transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-serif font-bold text-[#1C201D] group-hover:text-[#2D5A3F] transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs text-[#6C706D] leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#1C201D]/10 flex items-center text-xs font-bold text-[#2D5A3F] group-hover:translate-x-1 transition-transform">
                    <span>Explore</span> <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SECTION: JOURNAL & GUIDES PREVIEW ── */}
      <section className="py-20 bg-[#EDE8DB]/40 border-b border-[#1C201D]/10">
        <div className="max-w-6xl mx-auto px-6 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#C86D51] block mb-1">Academic Journal</span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1C201D]">Verified Prep Guides & Strategies</h2>
            </div>
            <Link to="/journal" className="text-xs font-bold text-[#2D5A3F] hover:underline flex items-center gap-1">
              View All Journal Articles <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ARTICLES.slice(0, 3).map((art) => (
              <Link
                key={art.slug}
                to={`/journal/${art.slug}`}
                className="bg-[#FFFFFF] rounded-2xl p-5 border border-[#1C201D]/10 hover:border-[#2D5A3F]/30 shadow-sm transition-all flex flex-col justify-between group"
              >
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase text-[#2D5A3F] px-2 py-0.5 rounded bg-[#2D5A3F]/10 border border-[#2D5A3F]/20">
                    {art.category}
                  </span>
                  <h3 className="text-base font-serif font-bold text-[#1C201D] group-hover:text-[#2D5A3F] transition-colors">
                    {art.title}
                  </h3>
                  <p className="text-xs text-[#6C706D] line-clamp-2 leading-relaxed">{art.excerpt}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#1C201D]/10 flex items-center justify-between text-[11px] text-[#6C706D]">
                  <span>{art.readTime}</span>
                  <span className="font-bold text-[#2D5A3F]">Read Guide →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
