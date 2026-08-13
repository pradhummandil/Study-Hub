import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { RevealText } from '../components/ui/motion/RevealText';
import { MagneticButton } from '../components/ui/motion/MagneticButton';
import { HoverCard } from '../components/ui/motion/HoverCard';
import { AIOrb, type AIOrbState } from '../components/ui/motion/AIOrb';
import { LottiePlayer } from '../components/ui/motion/LottiePlayer';
import { ScrollShelf } from '../components/ui/motion/ScrollShelf';
import { RoadmapPath } from '../components/ui/motion/RoadmapPath';
import { LOTTIE_ASSET_REGISTRY } from '../config/lottie-assets';
import { Sparkles, ArrowRight, Target, Zap, Play, Pause, RotateCcw } from 'lucide-react';

export default function DevMotionCatalog() {
  const [orbState, setOrbState] = useState<AIOrbState>('thinking');
  const [isPlaying, setIsPlaying] = useState(true);
  const [animKey, setAnimKey] = useState(0);
  const [progress, setProgress] = useState(65);

  const sampleNodes = [
    { id: '1', title: 'Foundation', subtitle: 'Basic Discrete Math', completed: true, active: false },
    { id: '2', title: 'Core Concepts', subtitle: 'Data Structures', completed: true, active: false },
    { id: '3', title: 'PYQ Practice', subtitle: 'Computer Networks', completed: false, active: true },
    { id: '4', title: 'Revision', subtitle: 'Spaced Flashcards', completed: false, active: false },
    { id: '5', title: 'Mock Test', subtitle: 'Full 3-Hour Exam', completed: false, active: false },
    { id: '6', title: 'Mastery', subtitle: 'GATE Top Rank', completed: false, active: false },
  ];

  const handleRestart = () => {
    setAnimKey((prev) => prev + 1);
    setIsPlaying(true);
  };

  return (
    <div className="min-h-screen bg-[#FCFBF8] text-[#10233F] py-12 px-6 md:px-12">
      <Helmet>
        <title>Study Hub — Dev Motion Catalog</title>
      </Helmet>

      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header with Global Play/Pause/Restart Controls */}
        <div className="border-b border-[#10233F]/10 pb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1F5F8B]/10 text-[#1F5F8B] text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Phase 2 Motion Catalog
            </span>
            <h1 className="text-4xl font-bold font-serif" style={{ fontFamily: "'Instrument Serif', serif" }}>
              Study Hub Interactive Motion Catalog
            </h1>
            <p className="text-sm text-[#627083] mt-1">
              Verify Framer Motion, GSAP, Lottie, Cursor, and typographic animations across all categories.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-[#10233F]/10 shadow-sm">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-3.5 py-1.5 rounded-xl bg-[#1F5F8B] text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-[#1F5F8B]/90 transition-colors"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>
            <button
              onClick={handleRestart}
              className="px-3 py-1.5 rounded-xl bg-[#EAF2F7] text-[#1F5F8B] text-xs font-semibold flex items-center gap-1.5 hover:bg-[#1F5F8B]/10 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart</span>
            </button>
          </div>
        </div>

        {/* 1. Typography Line Reveals */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#627083]">
            01. Split Line & Word Typography Reveals
          </h2>
          <div className="p-8 rounded-2xl bg-white border border-[#10233F]/10 shadow-sm">
            <RevealText
              key={`reveal-${animKey}`}
              text={"Your whole study journey,\nin one place."}
              as="h2"
              gradientText="in one place."
              className="text-4xl sm:text-5xl font-normal leading-[1.05]"
              fontFamily="'Instrument Serif', serif"
            />
          </div>
        </section>

        {/* 2. StudyMate AI Orb States */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#627083]">
              02. StudyMate AI Orb 4 Visual States (IDLE, THINKING, GENERATING, COMPLETE)
            </h2>
            <div className="flex flex-wrap gap-2">
              {(['idle', 'thinking', 'generating', 'complete'] as AIOrbState[]).map((st) => (
                <button
                  key={st}
                  onClick={() => setOrbState(st)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                    orbState === st
                      ? 'bg-[#1F5F8B] text-white shadow-md'
                      : 'bg-white text-[#3D4A5A] border border-[#10233F]/10 hover:bg-slate-50'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="p-12 rounded-2xl bg-[#10233F] text-white flex flex-col items-center justify-center gap-4">
            <AIOrb state={orbState} size={150} />
            <p className="text-xs font-mono text-[#4E88B7] uppercase tracking-wider">
              Active State: {orbState}
            </p>
          </div>
        </section>

        {/* 3. Magnetic Buttons & Hover Cards */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#627083]">
            03. Magnetic Buttons & Hover Cards
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-[#10233F]/10 flex flex-col items-start gap-4">
              <p className="text-xs font-bold text-[#627083]">Magnetic Primary CTA (Max 5px)</p>
              <MagneticButton
                className="px-6 py-3 rounded-full text-white text-xs font-semibold flex items-center gap-2"
                style={{ background: 'linear-gradient(135deg, #1F5F8B 0%, #4E88B7 100%)' }}
              >
                <span>Start My Journey</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </MagneticButton>
            </div>

            <HoverCard dataCursor="DRAG" className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-[#1F5F8B]" />
                <span className="text-xs font-bold text-[#10233F]">Hover Card Scale 1.025</span>
              </div>
              <p className="text-xs text-[#627083]">
                Smooth spring lift (-3px), shadow expansion, and border blue accent.
              </p>
            </HoverCard>

            <HoverCard dataCursor="OPEN" className="p-6 border-l-4 border-l-[#4E88B7]">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-[#4E88B7]" />
                <span className="text-xs font-bold text-[#10233F]">Custom Cursor Context Pill</span>
              </div>
              <p className="text-xs text-[#627083]">
                Hover to trigger custom context badge (&quot;OPEN&quot;) on desktop cursor.
              </p>
            </HoverCard>
          </div>
        </section>

        {/* 4. Horizontal Card Shelf */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#627083]">
            04. Viewport Staggered Horizontal Shelf
          </h2>

          <ScrollShelf className="p-2">
            {[1, 2, 3, 4, 5].map((item) => (
              <HoverCard key={item} className="p-5 min-w-[240px]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#1F5F8B] bg-[#EAF2F7] px-2 py-0.5 rounded">
                  Shelf Card 0{item}
                </span>
                <h4 className="text-sm font-bold text-[#10233F] mt-2">Computer Networks</h4>
                <p className="text-xs text-[#627083] mt-1">14 PYQs solved today</p>
              </HoverCard>
            ))}
          </ScrollShelf>
        </section>

        {/* 5. Interactive SVG Roadmap Path */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#627083]">
              05. Interactive Roadmap SVG Progress Path
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-[#627083]">Progress: {progress}%</span>
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="w-32 cursor-pointer"
              />
            </div>
          </div>

          <div className="p-8 rounded-2xl bg-white border border-[#10233F]/10 shadow-sm">
            <RoadmapPath nodes={sampleNodes} progressPercent={progress} />
          </div>
        </section>

        {/* 6. Lottie Asset Registry Showcase */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#627083]">
            06. Phase 2 Lottie Asset Registry (12 Assets)
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.values(LOTTIE_ASSET_REGISTRY).map((asset) => (
              <div
                key={asset.id}
                className="p-4 rounded-2xl bg-white border border-[#10233F]/10 shadow-sm flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 mb-3 flex items-center justify-center">
                  <LottiePlayer src={asset.localPath} autoplay={isPlaying} className="w-full h-full" />
                </div>
                <p className="text-xs font-bold text-[#10233F] truncate w-full">{asset.title}</p>
                <span className="text-[10px] text-[#627083] uppercase font-mono mt-1">
                  {asset.category}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
