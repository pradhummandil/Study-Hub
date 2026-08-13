# Study Hub Phase 3 — Awwwards Interaction & 3D Research Study

## Executive Summary
This document analyzes 8 award-winning interactive websites from Awwwards (categories: WebGL, 3D Websites, GSAP, Framer, Typography Choreography, Spatial Interaction). It outlines the core interaction principles extracted from each reference and documents how they are adapted specifically for Study Hub's academic, warm, non-gimmicky Phase 3 experience.

---

## 8 Reference Site Case Studies

### 1. Active Theory — Spatial Depth & Camera Panning
- **URL**: `https://activetheory.net`
- **Key Observation**: Seamless WebGL camera panning linked to scroll position. Floating spatial elements maintain fixed real-world physical coordinate spaces while text layers move at differential parallax speeds.
- **Study Hub Adaptation**: Applied in **Scene 1 (The Scatter)** and **Scene 2 (The Organize)** on the homepage. Scattered study objects (books, laptops, flashcards) float with continuous z-index depth while text overlays remain pinned with subtle differential scroll velocity.

### 2. Apple Vision Pro Experience — Smooth Object Persistence
- **URL**: `https://www.apple.com/apple-vision-pro/`
- **Key Observation**: High-contrast, warm key lighting on 3D assets with soft shadows. Objects gracefully transition state on scroll (unfolding, rotating, organizing) without jarring scene breaks.
- **Study Hub Adaptation**: Applied to the **Homepage 5-Scene Storyteller**. Unstructured study elements physically move into an organized Study Hub core, then transform into structured roadmap nodes and practice cards.

### 3. Stripe Press — Editorial Typography & Paper Palette
- **URL**: `https://press.stripe.com`
- **Key Observation**: Warm cream/paper textures (`#F5F0E8`), refined serif typography (Instrument Serif paired with clean sans-serif), and subtle page transitions that evoke physical book publishing.
- **Study Hub Adaptation**: Direct inspiration for Study Hub's new brand palette (`--forest`, `--scholar`, `--paper`, `--parchment`, `--terracotta`, `--gold`). Applied across `/login`, `/journal`, `/about`, and main page layouts.

### 4. Locomotive Scroll & Spatial Cards
- **URL**: `https://locomotive.ca`
- **Key Observation**: Fluid custom cursor that expands over interactive targets and provides soft spring-based physics on magnetic CTAs. Cards feature multi-layered depth with independent element movement.
- **Study Hub Adaptation**: `<SpatialCard />` implementation supporting `depth={120}`, `rotate={3}`, and `parallax={0.15}` props. Custom cursor point with cream ring focus state.

### 5. Resn — Micro-Interactions & Particle Convergence
- **URL**: `https://resn.co.nz`
- **Key Observation**: Particle streams and shape morphing on scroll that react to cursor velocity.
- **Study Hub Adaptation**: Adapted in the **StudyMate AI Ambient Visual** and **Scene 2 (The Organize)** where scattered notes and videos converge smoothly into the central Study Hub emblem.

### 6. Bruno Simon 3D Interactive Portfolio
- **URL**: `https://bruno-simon.com`
- **Key Observation**: Low-overhead Three.js rendering with frustum culling, fixed DPR caps (capped at 2), and mobile fallbacks to ensure LCP < 2.5s and 60 FPS performance.
- **Study Hub Adaptation**: Implemented in `SpatialHero3D.tsx` and `ScrollStory3D.tsx`. Capped DPR at `min(window.devicePixelRatio, 2)`, disabled heavy rendering on mobile devices, and implemented clean unmount cleanup for memory stability.

### 7. Pitch.com — Horizontal Feature Carousel & Mask Reveals
- **URL**: `https://pitch.com`
- **Key Observation**: Single controlled horizontal scroll section embedded naturally inside vertical scroll flow. Page masks expand outwards to reveal new application views.
- **Study Hub Adaptation**: Applied to the **Horizontal Scroll Moment ("Everything inside your study day")** on the homepage and the route transition mask reveal in `PageTransitionAnimation.tsx`.

### 8. Linear.app — Focused Data Visualization & Micro-animations
- **URL**: `https://linear.app`
- **Key Observation**: Extremely clean, functional micro-animations for status counters, progress rings, and data states without overwhelming clutter.
- **Study Hub Adaptation**: Applied to the **Dashboard**, **Exam Simulator Result**, and **Practice** session feedback components. Focused, scholarly, non-distracting data motion.

---

## Core Interaction Principles Summary
1. **Depth over Flatness**: Use spatial z-indices, scale, subtle blur, and camera distance instead of reliance on flat box-shadows.
2. **Scroll Choreography**: Scroll is the primary controller for 3D camera and typography movement; mouse adds only minor tilt (±2 degrees).
3. **Academic Warmth**: Soft paper grain, warm key lights, terracotta/gold highlights replace sci-fi cyan/purple lighting.
4. **Performance & Graceful Degradation**: 3D lazily unmounts when out of viewport; mobile uses lightweight 2D spatial cards.
