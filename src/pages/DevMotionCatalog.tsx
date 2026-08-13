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
import { Sparkles, ArrowRight, Target, Zap } from 'lucide-react';

export default function DevMotionCatalog() {
  const [orbState, setOrbState] = useState<AIOrbState>('idle');
  const [progress, setProgress] = useState(65);

  const sampleNodes = [
    { id: '1', title: 'Foundation', subtitle: 'Basic Discrete Math', completed: true, active: false },
    { id: '2', title: 'Core Concepts', subtitle: 'Data Structures', completed: true, active: false },
    { id: '3', title: 'PYQ Practice', subtitle: 'Computer Networks', completed: false, active: true },
    { id: '4', title: 'Revision', subtitle: 'Spaced Flashcards', completed: false, active: false },
    { id: '5', title: 'Mock Test', subtitle: 'Full 3-Hour Exam', completed: false, active: false },
    { id: '6', title: 'Mastery', subtitle: 'GATE Top Rank', completed: false, active: false },
  ];

  return (
    <div className="min-h-screen bg-[#F7FBFF] text-[#062B3D] py-12 px-6 md:px-12">
      <Helmet>
        <title>Study Hub — Dev Motion Catalog</title>
      </Helmet>

      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <div className="border-b border-slate-200 pb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#287BFF]/10 text-[#287BFF] text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Engineering Motion Catalog
            </span>
            <h1 className="text-4xl font-bold font-serif" style={{ fontFamily: "'Instrument Serif', serif" }}>
              Study Hub Interactive Motion System
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Test and verify Framer Motion, GSAP, Lottie, Cursor, and typography primitives independently.
            </p>
          </div>
          <span className="px-3 py-1.5 rounded-full bg-[#062B3D] text-white text-xs font-mono">
            /dev/motion
          </span>
        </div>

        {/* 1. Typography Line Reveals */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            01. Split Line & Word Typography Reveals
          </h2>
          <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <RevealText
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
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              02. StudyMate AI Orb Dynamic States
            </h2>
            <div className="flex gap-2">
              {(['idle', 'hover', 'listening', 'thinking'] as AIOrbState[]).map((st) => (
                <button
                  key={st}
                  onClick={() => setOrbState(st)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                    orbState === st
                      ? 'bg-[#287BFF] text-white shadow-md'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="p-12 rounded-2xl bg-[#062B3D] text-white flex flex-col items-center justify-center gap-4">
            <AIOrb state={orbState} size={150} />
            <p className="text-xs font-mono text-[#5CE1E6] uppercase tracking-wider">
              Active State: {orbState}
            </p>
          </div>
        </section>

        {/* 3. Magnetic Buttons & Hover Cards */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            03. Magnetic Buttons & Hover Cards
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 flex flex-col items-start gap-4">
              <p className="text-xs font-bold text-slate-400">Magnetic Button</p>
              <MagneticButton
                className="px-6 py-3 rounded-full text-white text-xs font-semibold flex items-center gap-2"
                style={{ background: 'linear-gradient(135deg, #287BFF 0%, #6F7CFF 100%)' }}
              >
                <span>Start My Journey</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </MagneticButton>
            </div>

            <HoverCard dataCursor="DRAG" className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-[#287BFF]" />
                <span className="text-xs font-bold text-[#062B3D]">Hover Card Scale 1.03</span>
              </div>
              <p className="text-xs text-slate-500">
                Smooth spring lift (-4px), shadow expansion, and border blue glow.
              </p>
            </HoverCard>

            <HoverCard dataCursor="VIEW" className="p-6 border-l-4 border-l-[#5CE1E6]">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-[#5CE1E6]" />
                <span className="text-xs font-bold text-[#062B3D]">Context Cursor Badge</span>
              </div>
              <p className="text-xs text-slate-500">
                Hover to trigger custom context badge (&quot;VIEW&quot;) on cursor.
              </p>
            </HoverCard>
          </div>
        </section>

        {/* 4. Horizontal Card Shelf */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            04. Viewport Staggered Horizontal Shelf
          </h2>

          <ScrollShelf className="p-2">
            {[1, 2, 3, 4, 5].map((item) => (
              <HoverCard key={item} className="p-5 min-w-[240px]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#287BFF] bg-[#287BFF]/10 px-2 py-0.5 rounded">
                  Shelf Card 0{item}
                </span>
                <h4 className="text-sm font-bold text-[#062B3D] mt-2">Computer Networks</h4>
                <p className="text-xs text-slate-500 mt-1">14 PYQs solved today</p>
              </HoverCard>
            ))}
          </ScrollShelf>
        </section>

        {/* 5. Interactive SVG Roadmap Path */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              05. Interactive Roadmap SVG Progress Path
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-500">Progress: {progress}%</span>
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

          <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <RoadmapPath nodes={sampleNodes} progressPercent={progress} />
          </div>
        </section>

        {/* 6. Lottie Asset Registry Showcase */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            06. Local & Vector Lottie Asset Registry
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.values(LOTTIE_ASSET_REGISTRY).map((asset) => (
              <div
                key={asset.id}
                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col items-center text-center"
              >
                <div className="w-16 h-16 mb-3 flex items-center justify-center">
                  <LottiePlayer src={asset.path} className="w-full h-full" />
                </div>
                <p className="text-xs font-bold text-[#062B3D] truncate w-full">{asset.name}</p>
                <span className="text-[10px] text-slate-400 uppercase font-mono mt-1">
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
