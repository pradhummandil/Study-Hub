import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { RevealText } from '../components/ui/motion/RevealText';
import { MagneticButton } from '../components/ui/motion/MagneticButton';
import { HoverCard } from '../components/ui/motion/HoverCard';
import { AIOrb, type AIOrbState } from '../components/ui/motion/AIOrb';
import { LottiePlayer } from '../components/ui/motion/LottiePlayer';
import { ScrollShelf } from '../components/ui/motion/ScrollShelf';
import { RoadmapPath } from '../components/ui/motion/RoadmapPath';
import { SpatialCard } from '../components/3d/SpatialCard';
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
    <div className="min-h-screen bg-paper text-ink py-12 px-6 md:px-12 selection:bg-terracotta/20">
      <Helmet>
        <title>Study Hub — Dev Motion Catalog Phase 3</title>
      </Helmet>

      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header with Global Play/Pause/Restart Controls */}
        <div className="border-b border-forest/10 pb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-terracotta/10 text-terracotta text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Phase 3 Motion & 3D Catalog
            </span>
            <h1 className="text-4xl font-normal font-serif" style={{ fontFamily: "'Instrument Serif', serif" }}>
              Study Hub Interactive Motion Catalog
            </h1>
            <p className="text-sm text-muted mt-1">
              Verify Framer Motion, GSAP 3D Spatial Scroll, Lottie, Cursor, and typographic animations.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-paper p-2 rounded-2xl border border-forest/10 shadow-sm">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-3.5 py-1.5 rounded-xl bg-scholar text-paper text-xs font-semibold flex items-center gap-1.5 hover:bg-forest transition-colors"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>
            <button
              onClick={handleRestart}
              className="px-3 py-1.5 rounded-xl bg-parchment text-ink text-xs font-semibold flex items-center gap-1.5 hover:bg-forest/10 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart</span>
            </button>
          </div>
        </div>

        {/* 1. Typography Line Reveals */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted">
            01. Split Line & Word Typography Reveals
          </h2>
          <div className="p-8 rounded-2xl bg-paper border border-forest/10 shadow-card">
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

        {/* 2. 3D Spatial Cards */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted">
            02. 3D Spatial Card Depth & Parallax
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <SpatialCard depth={80} rotate={-3} className="bg-paper text-ink p-6">
              <span className="text-[10px] font-bold uppercase text-terracotta">Depth 80px</span>
              <h3 className="font-serif text-xl font-bold mt-1">Spatial Card</h3>
              <p className="text-xs text-muted mt-1">Hover lift and 3D Z translation.</p>
            </SpatialCard>

            <SpatialCard depth={120} rotate={2} className="bg-parchment text-ink p-6">
              <span className="text-[10px] font-bold uppercase text-scholar">Depth 120px</span>
              <h3 className="font-serif text-xl font-bold mt-1">Parchment Depth</h3>
              <p className="text-xs text-muted mt-1">Smooth rotational physics.</p>
            </SpatialCard>

            <SpatialCard depth={160} rotate={-2} className="bg-forest text-paper p-6">
              <span className="text-[10px] font-bold uppercase text-gold">Depth 160px</span>
              <h3 className="font-serif text-xl font-bold mt-1">Deep Forest Depth</h3>
              <p className="text-xs text-sage mt-1">Scholarly dark card variant.</p>
            </SpatialCard>
          </div>
        </section>

        {/* 3. StudyMate AI Orb States */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted">
              03. StudyMate AI Orb Visual States
            </h2>
            <div className="flex flex-wrap gap-2">
              {(['idle', 'thinking', 'generating', 'complete'] as AIOrbState[]).map((st) => (
                <button
                  key={st}
                  onClick={() => setOrbState(st)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                    orbState === st
                      ? 'bg-scholar text-paper shadow-md'
                      : 'bg-paper text-ink border border-forest/10 hover:bg-parchment'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="p-12 rounded-3xl bg-forest text-paper flex flex-col items-center justify-center gap-4 border border-forest/20 shadow-deep">
            <AIOrb state={orbState} size={150} />
            <p className="text-xs font-mono text-gold uppercase tracking-wider">
              Active State: {orbState}
            </p>
          </div>
        </section>

        {/* 4. Magnetic Buttons & Hover Cards */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted">
            04. Magnetic Buttons & Hover Cards
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-paper border border-forest/10 shadow-card flex flex-col items-start gap-4">
              <p className="text-xs font-bold text-muted">Magnetic Primary CTA</p>
              <MagneticButton
                className="px-6 py-3 rounded-xl text-paper text-xs font-bold flex items-center gap-2 bg-scholar hover:bg-forest"
              >
                <span>Start My Journey</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </MagneticButton>
            </div>

            <HoverCard dataCursor="DRAG" className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-scholar" />
                <span className="text-xs font-bold text-ink">Hover Card Scale</span>
              </div>
              <p className="text-xs text-muted">
                Smooth spring lift, shadow expansion, and border accent.
              </p>
            </HoverCard>

            <HoverCard dataCursor="OPEN" className="p-6 border-l-4 border-l-terracotta">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-terracotta" />
                <span className="text-xs font-bold text-ink">Custom Cursor Context</span>
              </div>
              <p className="text-xs text-muted">
                Hover to trigger custom context badge (&quot;OPEN&quot;) on desktop cursor.
              </p>
            </HoverCard>
          </div>
        </section>

        {/* 5. Horizontal Card Shelf */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted">
            05. Viewport Staggered Horizontal Shelf
          </h2>

          <ScrollShelf className="p-2">
            {[1, 2, 3, 4, 5].map((item) => (
              <HoverCard key={item} className="p-5 min-w-[240px] bg-paper">
                <span className="text-[10px] font-bold uppercase tracking-wider text-terracotta bg-terracotta/10 px-2 py-0.5 rounded">
                  Shelf Card 0{item}
                </span>
                <h4 className="text-sm font-bold text-ink mt-2">Computer Networks</h4>
                <p className="text-xs text-muted mt-1">14 PYQs solved today</p>
              </HoverCard>
            ))}
          </ScrollShelf>
        </section>

        {/* 6. Interactive SVG Roadmap Path */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted">
              06. Interactive Roadmap Progress Path
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-muted">Progress: {progress}%</span>
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

          <div className="p-8 rounded-3xl bg-paper border border-forest/10 shadow-card">
            <RoadmapPath nodes={sampleNodes} progressPercent={progress} />
          </div>
        </section>

        {/* 7. Lottie Asset Registry Showcase */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted">
            07. Phase 3 Lottie Asset Registry
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.values(LOTTIE_ASSET_REGISTRY).map((asset) => (
              <div
                key={asset.id}
                className="p-4 rounded-2xl bg-paper border border-forest/10 shadow-card flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 mb-3 flex items-center justify-center">
                  <LottiePlayer src={asset.localPath} autoplay={isPlaying} className="w-full h-full" />
                </div>
                <p className="text-xs font-bold text-ink truncate w-full">{asset.title}</p>
                <span className="text-[10px] text-muted uppercase font-mono mt-1">
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
