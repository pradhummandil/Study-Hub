# Study Hub Motion Phase 2 Audit & Upgrade Plan

**Audit Date**: August 14, 2026  
**Visual Identity System**: Color System 2.0  
**Color Palette**: Primary Navy (`#10233F`), Deep Blue (`#1F5F8B`), Soft Blue (`#4E88B7`), Mist (`#EAF2F7`), Paper (`#FCFBF8`), Cream (`#F7E7D0`), Peach (`#FCDAB7`), Ink (`#172033`), Muted (`#627083`)  
**Typography**: Instrument Serif + Inter  

---

## 1. Page-by-Page Audit Table

| Page | Current Animation | Problem | Target Interaction | Implementation Method | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/` (Homepage Hero) | Mouse parallax spring transforms, static text entrance | Static headline entry, static floating cards | Line-by-line clip reveal for headline, unsynchronized independent floating cards (max 6px, 1.025 scale, max 2° tilt), secondary rotating phrase ("Study smarter", "Practice with purpose", "Revise with confidence", "Know what to do next") | Framer Motion + CSS Clip-Path + Custom Spring Hooks | **P0 (Critical)** |
| `/` (Homepage Scroll Stories) | Tab-switched mock views | Abrupt switches, lacks sticky narrative visual | Sticky center visual with scrolling content transformation: 1) "Everything you need. Nothing you don't." (StudyMate, Practice, PYQs, Revision, Focus, Community), 2) "From confusion to clarity." (Continuous step transformations) | GSAP ScrollTrigger / Framer Motion Sticky Viewport Observer | **P0 (Critical)** |
| `/dashboard` | Standard card fade-ins | Dashboard feel is too static, lacks personalized visual progress | Dynamic hero progress gauge, personalized next recommended topic pill ("GATE 2027: Computer Networks -> TCP -> PYQs"), micro-card hover float | Framer Motion layoutId + Stagger Children | **P1 (High)** |
| `/studio` | Standard grid cards | Tools feel flat and detached | Interactive studio toolbar hover states, Lottie focus/strategy animations, smooth tool panel expansion | LottiePlayer + Framer Motion layoutId | **P2 (Medium)** |
| `/study-ai` | Static response list, generic orb glow | Lacks visual state representation for AI thinking/generating/complete | 4 visual states: IDLE (subtle AI orb), THINKING (Lottie AI loading animation), GENERATING (AI orb + progress pulse), COMPLETE (short success checkmark), smooth line reveal for answers + action pills (Explain again, Quiz me, Flashcards, Save) | `AIOrb.tsx` + Lottie AI loading state + Framer Motion height expanding containers | **P0 (Critical)** |
| `/video-learning` | Static YouTube thumbnail cards | Flash when loading previews, no smooth video hover states | Hover muted preview with progress bar, source logo badge, soft fade from thumbnail to preview, skeleton loader for metadata | HTML5 Video / iFrame API hover preview + Framer Motion crossfade | **P1 (High)** |
| `/practice` | Generic list transition | Topic selection feels static | Interactive topic roadmap node connectors, magnetic primary CTA, score pulse feedback | `MagneticButton.tsx` + `RoadmapPath.tsx` SVG draw-on | **P1 (High)** |
| `/mock-tests` | Standard test cards | Missing clear difficulty & status micro-animations | Status badge micro-pulse, test start modal expansion | Framer Motion layoutId + Micro-badge transitions | **P2 (Medium)** |
| `/exam-simulator` | Static view | Too distracting if animated too heavily, lacks clean state feedback | Calm background, smooth question transitions, option selection micro-scale (1.01), clear countdown threshold pulse | Framer Motion AnimatePresence key switching | **P1 (High)** |
| `/exam-simulator/result` | Static score text | Instant score pop without celebration | Count-up animated numbers (0 -> score, 0% -> accuracy), staggered topic analysis reveal, weak topic highlight | `countUp` hook + Framer Motion stagger staggerChildren | **P1 (High)** |
| `/roadmap` | Static SVG paths | Progression tree feels non-interactive | Interactive SVG `stroke-dashoffset` scroll path draw-on, node milestone unlocking states (Foundation, Core, Practice, Revision, Mock, Mastery) | `RoadmapPath.tsx` + GSAP ScrollTrigger | **P0 (Critical)** |
| `/revision` | Simple card flip | Flip lacks depth & perspective, card controls feel rigid | True 3D perspective card flip (`rotateY(180deg)`), tactile card swipe gesture support, micro-animations on (Again, Hard, Good, Easy) buttons | Framer Motion 3D transform + Drag constraints | **P1 (High)** |
| `/flashcards` | Basic flip | Standard flat transition | 3D perspective flip, drag gesture to swipe next/prev | Framer Motion `rotateY` + `useMotionValue` | **P1 (High)** |
| `/mistakes` | Standard filter list | Filter switching feels abrupt | Filter pill layout animation (`layoutId`), mistake card breakdown expansion with smooth height | Framer Motion `layoutId` + AnimatePresence | **P2 (Medium)** |
| `/adaptive-practice` | Basic static cards | Doesn't show adaptive difficulty level changes visually | Dynamic difficulty level indicator gauge, smooth question step transition | Framer Motion + Lottie Quiz pulse | **P2 (Medium)** |
| `/performance` | Static charts | Chart load feels instant and flat | SVG chart path draw-on, staggered metric cards entrance, Lottie analytics visual | Framer Motion + Lottie analytics character | **P1 (High)** |
| `/community` | Static study circle lists | Circles don't feel active or alive | Subtle live indicator pulse on active study circles, discussion card hover reveal preview | Framer Motion + SVG pulse ring | **P2 (Medium)** |
| `/journal` | Standard article list | Doesn't feel like a high-end digital magazine | Editorial split-line heading reveals, clip-path image reveals (opacity 0 scale 1.04 -> opacity 1 scale 1), horizontal scroll shelves, 60-100ms staggered article card entrances | `<MaskText />` + `<RevealText />` + `<ScrollShelf />` + Image Clip-path | **P0 (Critical)** |
| `/about` | Static images and bio | Visuals feel detached from narrative | Editorial image mask reveals, founder photo scale transitions, SVG signature draw-on | Image Clip-path reveal + Framer Motion scroll triggers | **P1 (High)** |
| `/reach-us` | Standard contact form | Form feedback is instant text without delight | Lottie contact-us header animation, form field focus highlight, magnetic submit CTA button | Lottie Navigation asset + `MagneticButton.tsx` | **P2 (Medium)** |
| `/login` / `/signup` / `/setup` | Standard card view | Boring auth screens | Soft video/gradient background motion, sleek step progression for setup | Framer Motion step transitions | **P2 (Medium)** |

---

## 2. Motion System Guidelines & Rules

1. **Restraint & Purpose**: Motion must clarify hierarchy, provide feedback, or guide user attention. No decorative wallpaper or motion fatigue.
2. **Performance Constraints**:
   - Desktop: Full motion, magnetic CTAs, custom cursor, scroll storytelling.
   - Tablet: Reduced parallax, standard cursor.
   - Mobile: Minimal motion, disabled heavy tilt/pinned scenes, disabled custom cursor.
3. **Reduced Motion**: Respect `prefers-reduced-motion: reduce` by replacing spatial animations with simple opacity fades.
4. **Memory Hygiene**: All ScrollTriggers, ResizeObservers, RAF loops, and Lottie listeners must be cleanly disposed on unmount.
