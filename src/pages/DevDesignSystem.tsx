import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { theme } from '../lib/design-system/theme';
import { SpatialCard } from '../components/3d/SpatialCard';
import { Shield, CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';


export default function DevDesignSystem() {
  const [activeTab, setActiveTab] = useState<'palette' | 'typography' | 'buttons' | 'cards' | 'spatial' | 'feedback'>('palette');

  return (
    <>
      <Helmet>
        <title>Visual Design System 3.0 Catalog — Study Hub</title>
      </Helmet>

      <div className="bg-paper text-ink min-h-screen pb-24 selection:bg-terracotta/20 selection:text-ink">
        {/* Header Hero Banner (Deep Forest #10261F) */}
        <header className="bg-forest text-paper py-14 px-6 border-b border-forest/20 shadow-deep">
          <div className="max-w-6xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gold/20 text-gold text-xs font-semibold uppercase tracking-wider mb-4 border border-gold/30">
              <Shield className="w-3.5 h-3.5" />
              <span>Design System 3.0 Verification Suite</span>
            </div>

            <h1
              className="text-4xl sm:text-6xl font-normal text-paper tracking-tight"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Study Hub Phase 3 Visual Identity
            </h1>
            <p className="text-base text-sage mt-2 max-w-2xl leading-relaxed">
              Complete semantic token catalog. Deep Forest, Scholar Green, Sage, Paper, Parchment, Terracotta, and Gold.
            </p>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-2 mt-8 border-b border-sage/20 pb-4">
              {[
                { key: 'palette', label: 'Color System' },
                { key: 'typography', label: 'Typography Scale' },
                { key: 'buttons', label: 'Buttons & CTAs' },
                { key: 'cards', label: 'Cards & Surfaces' },
                { key: 'spatial', label: '3D Spatial Cards' },
                { key: 'feedback', label: 'Toasts & States' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === tab.key
                      ? 'bg-scholar text-paper shadow-md border border-sage/40'
                      : 'bg-scholar/30 text-sage hover:bg-scholar/60 hover:text-paper'
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
                <h2 className="text-2xl font-normal text-ink mb-2" style={{ fontFamily: "'Instrument Serif', serif" }}>
                  Phase 3 Primary Brand Palette
                </h2>
                <p className="text-xs text-muted mb-6">Exact curated hex codes replacing legacy blue/purple identity.</p>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Object.entries(theme.colors).map(([name, hex]) => (
                    <div key={name} className="bg-parchment/60 rounded-2xl p-4 border border-forest/10 shadow-card flex flex-col justify-between h-36">
                      <div className="w-full h-14 rounded-xl border border-forest/10 shadow-inner" style={{ backgroundColor: hex }} />
                      <div className="mt-2">
                        <p className="text-xs font-bold text-ink capitalize">{name}</p>
                        <p className="text-[11px] font-mono text-muted uppercase">{hex}</p>
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
              <section className="bg-paper rounded-3xl p-8 border border-forest/10 shadow-card space-y-6">
                <div>
                  <span className="text-xs text-terracotta font-mono uppercase font-bold">Hero Display: Instrument Serif clamp(56px, 7vw, 104px)</span>
                  <h1 className="text-5xl sm:text-6xl font-normal text-ink mt-1" style={{ fontFamily: "'Instrument Serif', serif" }}>
                    Know what to study next.
                  </h1>
                </div>

                <div>
                  <span className="text-xs text-scholar font-mono uppercase font-bold">Section Titles: Instrument Serif clamp(42px, 5vw, 72px)</span>
                  <h2 className="text-3xl sm:text-4xl font-normal text-ink mt-1" style={{ fontFamily: "'Instrument Serif', serif" }}>
                    Your preparation, in motion.
                  </h2>
                </div>

                <div>
                  <span className="text-xs text-muted font-mono uppercase font-bold">Body: Inter (16–18px)</span>
                  <p className="text-base text-ink mt-1 leading-relaxed max-w-2xl">
                    Study Hub replaces scattered PDFs, noisy social feeds, and disconnected apps with one scholarly, calm study environment.
                  </p>
                </div>
              </section>
            </div>
          )}

          {/* TAB 3: BUTTONS */}
          {activeTab === 'buttons' && (
            <div className="space-y-10">
              <section className="bg-paper rounded-3xl p-8 border border-forest/10 shadow-card space-y-6">
                <h2 className="text-2xl font-normal text-ink" style={{ fontFamily: "'Instrument Serif', serif" }}>
                  Button & Magnetic CTA System
                </h2>

                <div className="flex flex-wrap items-center gap-4">
                  <button className="px-6 py-3 rounded-xl bg-forest text-paper font-bold text-xs shadow-card hover:shadow-float transition-all">
                    Deep Forest Primary CTA
                  </button>
                  <button className="px-6 py-3 rounded-xl bg-scholar text-paper font-bold text-xs shadow-card hover:shadow-float transition-all">
                    Scholar Green Action
                  </button>
                  <button className="px-6 py-3 rounded-xl bg-terracotta text-paper font-bold text-xs shadow-card hover:shadow-float transition-all">
                    Terracotta Accent CTA
                  </button>
                  <button className="px-6 py-3 rounded-xl bg-gold text-forest font-bold text-xs shadow-card transition-all">
                    Gold Highlight Action
                  </button>
                  <button className="px-6 py-3 rounded-xl bg-paper border border-forest/15 text-ink font-semibold text-xs hover:bg-parchment transition-all">
                    Paper Outlined Button
                  </button>
                </div>
              </section>
            </div>
          )}

          {/* TAB 4: CARDS */}
          {activeTab === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-paper rounded-3xl p-8 border border-forest/10 shadow-card">
                <span className="text-xs uppercase font-bold text-terracotta bg-terracotta/10 px-3 py-1 rounded-full inline-block mb-3">
                  Paper Surface
                </span>
                <h3 className="text-2xl font-normal text-ink mb-2" style={{ fontFamily: "'Instrument Serif', serif" }}>
                  Paper White Card Surface
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  Clean border `rgba(24, 26, 25, 0.1)` with restrained floating hover shadow.
                </p>
              </div>

              <div className="bg-forest text-paper rounded-3xl p-8 border border-forest/20 shadow-deep">
                <span className="text-xs uppercase font-bold text-gold bg-gold/20 px-3 py-1 rounded-full inline-block mb-3">
                  Deep Forest Container
                </span>
                <h3 className="text-2xl font-normal text-paper mb-2" style={{ fontFamily: "'Instrument Serif', serif" }}>
                  Deep Forest Surface
                </h3>
                <p className="text-xs text-sage leading-relaxed">
                  Deep Forest background `#10261F` with paper typography `#F5F0E8` for major CTA sections and StudyMate.
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: SPATIAL CARDS */}
          {activeTab === 'spatial' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-normal text-ink" style={{ fontFamily: "'Instrument Serif', serif" }}>
                3D Spatial Floating Card System
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-4">
                <SpatialCard depth={80} rotate={-4} className="bg-paper text-ink p-6">
                  <span className="text-[10px] font-bold uppercase text-terracotta">Depth 80px</span>
                  <h3 className="font-serif text-xl font-bold mt-1">Spatial Card A</h3>
                  <p className="text-xs text-muted mt-1">Supports x, y, z depth and hover lift physics.</p>
                </SpatialCard>

                <SpatialCard depth={120} rotate={2} className="bg-parchment text-ink p-6">
                  <span className="text-[10px] font-bold uppercase text-scholar">Depth 120px</span>
                  <h3 className="font-serif text-xl font-bold mt-1">Spatial Card B</h3>
                  <p className="text-xs text-muted mt-1">Interactive 3D depth with warm parchment background.</p>
                </SpatialCard>

                <SpatialCard depth={160} rotate={-2} className="bg-forest text-paper p-6">
                  <span className="text-[10px] font-bold uppercase text-gold">Depth 160px</span>
                  <h3 className="font-serif text-xl font-bold mt-1">Spatial Card C</h3>
                  <p className="text-xs text-sage mt-1">Deep Forest variant with gold highlight accent.</p>
                </SpatialCard>
              </div>
            </div>
          )}

          {/* TAB 6: FEEDBACK */}
          {activeTab === 'feedback' && (
            <div className="space-y-8">
              <section className="bg-paper rounded-3xl p-8 border border-forest/10 shadow-card space-y-6">
                <h2 className="text-2xl font-normal text-ink" style={{ fontFamily: "'Instrument Serif', serif" }}>
                  Feedback & Toast Notifications
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-success/10 border border-success/20 text-success shadow-sm flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-ink">Session Complete</p>
                      <p className="text-[11px] text-muted">Saved 15 practice questions.</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-error/10 border border-error/20 text-error shadow-sm flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-ink">Connection Notice</p>
                      <p className="text-[11px] text-muted">Check internet connection.</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-scholar/10 border border-scholar/20 text-scholar shadow-sm flex items-center gap-3">
                    <Info className="w-5 h-5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-ink">New PYQ Added</p>
                      <p className="text-[11px] text-muted">GATE 2026 CS paper available.</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-warning/10 border border-warning/20 text-warning shadow-sm flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-ink">Streak Warning</p>
                      <p className="text-[11px] text-muted">Study today for 12-day streak.</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
