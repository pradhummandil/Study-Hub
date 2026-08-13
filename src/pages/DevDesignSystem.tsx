import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { BRAND_COLORS, SEMANTIC_ROLES } from '../lib/design-system/colors';
import { Button } from '../components/ui/Button';
import { GlassCard } from '../components/ui/GlassCard';
import { ModalShell, ModalHeader, ModalBody, ModalFooter } from '../components/modals/ModalShell';
import { AIOrb } from '../components/ui/motion/AIOrb';
import { Shield, ArrowRight, CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export default function DevDesignSystem() {
  const [activeTab, setActiveTab] = useState<'palette' | 'typography' | 'buttons' | 'cards' | 'feedback' | 'ai'>('palette');
  const [modalOpen, setModalOpen] = useState(false);
  const [orbState, setOrbState] = useState<'idle' | 'hover' | 'listening' | 'thinking' | 'success'>('idle');

  return (
    <>
      <Helmet>
        <title>Visual Design System 2.0 Catalog — Study Hub</title>
      </Helmet>

      <div className="bg-[#FCFBF8] text-[#172033] min-h-screen pb-24">
        
        {/* Header Hero Banner (Deep Navy #10233F) */}
        <header className="bg-[#10233F] text-[#FCFBF8] py-14 px-6 border-b border-white/10 shadow-lg">
          <div className="max-w-6xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F7E7D0]/20 text-[#FCDAB7] text-xs font-semibold uppercase tracking-wider mb-4 border border-[#F7E7D0]/30">
              <Shield className="w-3.5 h-3.5" />
              <span>Design System 2.0 Verification Suite</span>
            </div>
            
            <h1
              className="text-4xl sm:text-6xl font-normal text-white tracking-tight"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Study Hub Visual Identity 2.0
            </h1>
            <p className="text-base text-white/75 mt-2 max-w-2xl leading-relaxed">
              Complete semantic design token catalog. Warm Paper White (55%), Deep Navy (25%), Deep Blue (12%), Warm Cream/Peach (5%), and Semantic Alerts (3%).
            </p>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-2 mt-8 border-b border-white/10 pb-4">
              {[
                { key: 'palette', label: 'Color System' },
                { key: 'typography', label: 'Typography Scale' },
                { key: 'buttons', label: 'Buttons & CTAs' },
                { key: 'cards', label: 'Cards & Surfaces' },
                { key: 'feedback', label: 'Toasts & Modals' },
                { key: 'ai', label: 'AI Orb & Motion' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                    activeTab === tab.key
                      ? 'bg-[#1F5F8B] text-white shadow-md'
                      : 'bg-white/10 text-white/80 hover:bg-white/20'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Content Container */}
        <main className="max-w-6xl mx-auto px-6 pt-10">
          
          {/* TAB 1: PALETTE */}
          {activeTab === 'palette' && (
            <div className="space-y-12">
              <section>
                <h2 className="text-2xl font-normal text-[#10233F] mb-2" style={{ fontFamily: "'Instrument Serif', serif" }}>
                  Primary Brand Palette
                </h2>
                <p className="text-xs text-[#627083] mb-6">Exact curated hex codes for background surfaces, contrast headings, and identity accents.</p>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {Object.entries(BRAND_COLORS).map(([name, hex]) => (
                    <div key={name} className="bg-[#FCFBF8] rounded-2xl p-4 border border-[#10233F]/08 shadow-sm flex flex-col justify-between h-36">
                      <div className="w-full h-14 rounded-xl border border-black/10 shadow-inner" style={{ backgroundColor: hex }} />
                      <div className="mt-2">
                        <p className="text-xs font-bold text-[#172033] capitalize">{name.replace('_', ' ')}</p>
                        <p className="text-[11px] font-mono text-[#627083] uppercase">{hex}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="pt-8 border-t border-[#10233F]/08">
                <h2 className="text-2xl font-normal text-[#10233F] mb-2" style={{ fontFamily: "'Instrument Serif', serif" }}>
                  Semantic Roles
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {Object.entries(SEMANTIC_ROLES).map(([role, hex]) => (
                    <div key={role} className="bg-[#FCFBF8] rounded-2xl p-4 border border-[#10233F]/08 shadow-sm flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl shrink-0 border border-black/10" style={{ backgroundColor: hex }} />
                      <div>
                        <p className="text-xs font-bold text-[#172033] capitalize">{role}</p>
                        <p className="text-[11px] font-mono text-[#627083] uppercase">{hex}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* TAB 2: TYPOGRAPHY */}
          {activeTab === 'typography' && (
            <div className="space-y-10">
              <section className="bg-[#FCFBF8] rounded-3xl p-8 border border-[#10233F]/08 shadow-sm space-y-6">
                <div>
                  <span className="text-xs text-[#1F5F8B] font-mono">Instrument Serif (Serif Display Headings)</span>
                  <h1 className="text-5xl sm:text-6xl font-normal text-[#10233F] mt-1" style={{ fontFamily: "'Instrument Serif', serif" }}>
                    Know what to study next.
                  </h1>
                </div>

                <div>
                  <span className="text-xs text-[#1F5F8B] font-mono">Instrument Serif Subheading</span>
                  <h2 className="text-3xl sm:text-4xl font-normal text-[#10233F] mt-1" style={{ fontFamily: "'Instrument Serif', serif" }}>
                    Your preparation, in motion.
                  </h2>
                </div>

                <div>
                  <span className="text-xs text-[#1F5F8B] font-mono">Inter Body Regular (16px / 1.6)</span>
                  <p className="text-base text-[#3D4A5A] mt-1 leading-relaxed max-w-2xl">
                    Study Hub replaces scattered PDFs, noisy social feeds, and disconnected apps with one art-directed, calm study environment.
                  </p>
                </div>

                <div>
                  <span className="text-xs text-[#1F5F8B] font-mono">Inter Muted Metadata (12px)</span>
                  <p className="text-xs text-[#627083] mt-1">
                    Updated 2 minutes ago • 14 PYQ Questions Remaining • GATE Computer Science
                  </p>
                </div>
              </section>
            </div>
          )}

          {/* TAB 3: BUTTONS */}
          {activeTab === 'buttons' && (
            <div className="space-y-10">
              <section className="bg-[#FCFBF8] rounded-3xl p-8 border border-[#10233F]/08 shadow-sm space-y-6">
                <h2 className="text-2xl font-normal text-[#10233F]" style={{ fontFamily: "'Instrument Serif', serif" }}>
                  Button System 2.0
                </h2>

                <div className="flex flex-wrap items-center gap-4">
                  <Button variant="primary">Primary Deep Blue CTA</Button>
                  <Button variant="gradient">Gradient Deep Blue → Soft Blue</Button>
                  <Button variant="secondary">Secondary Paper White Card</Button>
                  <Button variant="ghost">Ghost Button</Button>
                  <Button variant="danger">Danger Action</Button>
                </div>

                <div className="pt-6 border-t border-[#10233F]/08 flex flex-wrap items-center gap-4">
                  <button className="gradient-cta px-8 py-3.5 rounded-full text-white font-semibold text-sm shadow-md hover:scale-105 transition-transform flex items-center gap-2">
                    <span>Start studying</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  
                  <button className="px-6 py-3 rounded-full bg-[#EAF2F7] text-[#10233F] font-semibold text-xs border border-[#10233F]/08 hover:bg-[#1F5F8B]/10 transition-colors">
                    Explore Syllabus
                  </button>
                </div>
              </section>
            </div>
          )}

          {/* TAB 4: CARDS */}
          {activeTab === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <GlassCard variant="interactive" className="p-8">
                <span className="text-xs uppercase font-semibold text-[#1F5F8B] bg-[#EAF2F7] px-3 py-1 rounded-full inline-block mb-3">
                  Interactive Card
                </span>
                <h3 className="text-2xl font-normal text-[#172033] mb-2" style={{ fontFamily: "'Instrument Serif', serif" }}>
                  Paper White Card Surface
                </h3>
                <p className="text-xs text-[#627083] leading-relaxed">
                  Clean border `rgba(16, 35, 63, 0.08)` with restrained floating hover shadow. Zero neon borders.
                </p>
              </GlassCard>

              <div className="bg-[#10233F] text-[#FCFBF8] rounded-3xl p-8 border border-white/12 shadow-xl">
                <span className="text-xs uppercase font-semibold text-[#FCDAB7] bg-white/10 px-3 py-1 rounded-full inline-block mb-3 border border-white/15">
                  Dark Navy Container
                </span>
                <h3 className="text-2xl font-normal text-white mb-2" style={{ fontFamily: "'Instrument Serif', serif" }}>
                  Deep Navy Card Surface
                </h3>
                <p className="text-xs text-white/75 leading-relaxed">
                  Deep Navy background `#10233F` with white typography `#FCFBF8` for high impact AI and footer areas.
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: FEEDBACK */}
          {activeTab === 'feedback' && (
            <div className="space-y-8">
              <section className="bg-[#FCFBF8] rounded-3xl p-8 border border-[#10233F]/08 shadow-sm space-y-6">
                <h2 className="text-2xl font-normal text-[#10233F]" style={{ fontFamily: "'Instrument Serif', serif" }}>
                  Toasts & Notifications
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-[#FCFBF8] border border-[#2E8B72]/30 text-[#2E8B72] shadow-sm flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-[#172033]">Session Complete</p>
                      <p className="text-[11px] text-[#627083]">Saved 15 practice questions.</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FCFBF8] border border-[#C95C5C]/30 text-[#C95C5C] shadow-sm flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-[#172033]">Connection Lost</p>
                      <p className="text-[11px] text-[#627083]">Check internet connection.</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FCFBF8] border border-[#1F5F8B]/30 text-[#1F5F8B] shadow-sm flex items-center gap-3">
                    <Info className="w-5 h-5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-[#172033]">New PYQ Added</p>
                      <p className="text-[11px] text-[#627083]">GATE 2026 CS paper available.</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FCFBF8] border border-[#D99A3D]/30 text-[#D99A3D] shadow-sm flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-[#172033]">Streak Warning</p>
                      <p className="text-[11px] text-[#627083]">Study today for 12-day streak.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-[#10233F]/08">
                  <Button variant="primary" onClick={() => setModalOpen(true)}>
                    Trigger System Modal Shell
                  </Button>
                </div>
              </section>

              {/* Modal Shell Component Test */}
              <ModalShell
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
              >
                <ModalHeader>
                  <h3 className="text-2xl font-normal text-[#172033]" style={{ fontFamily: "'Instrument Serif', serif" }}>
                    Design System 2.0 Modal
                  </h3>
                </ModalHeader>
                <ModalBody>
                  <p className="text-xs text-[#627083] leading-relaxed">
                    This modal container uses Paper White background `#FCFBF8`, Deep Navy overlay backdrop `rgba(16, 35, 63, 0.75)`, and soft blue accent borders.
                  </p>
                </ModalBody>
                <ModalFooter>
                  <div className="flex justify-end gap-3">
                    <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
                    <Button variant="primary" onClick={() => setModalOpen(false)}>Confirm Action</Button>
                  </div>
                </ModalFooter>
              </ModalShell>
            </div>
          )}

          {/* TAB 6: AI ORB & MOTION */}
          {activeTab === 'ai' && (
            <div className="bg-[#10233F] text-[#FCFBF8] rounded-3xl p-10 border border-white/12 shadow-2xl space-y-8">
              <div className="text-center max-w-xl mx-auto">
                <span className="text-xs uppercase font-semibold text-[#FCDAB7] bg-white/10 px-3 py-1 rounded-full inline-block mb-3">
                  AI Orb Component 2.0
                </span>
                <h2 className="text-3xl font-normal text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>
                  StudyMate AI State Machine
                </h2>
                <p className="text-xs text-white/75 mt-1">
                  Deep Blue core `#1F5F8B`, Soft Blue glow `#4E88B7`, and small Warm Peach highlight `#FCDAB7`.
                </p>
              </div>

              <div className="flex flex-col items-center justify-center py-6">
                <AIOrb state={orbState} size={160} />
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-white/10">
                {(['idle', 'hover', 'listening', 'thinking', 'success'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrbState(st)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold capitalize transition-all ${
                      orbState === st
                        ? 'bg-[#1F5F8B] text-white shadow-md'
                        : 'bg-white/10 text-white/75 hover:bg-white/20'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>
    </>
  );
}



