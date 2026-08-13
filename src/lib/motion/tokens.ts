/**
 * Centralized Motion Tokens for Study Hub
 * Standardized timings, spring physics, and easing curves.
 */

export const MOTION_TOKENS = {
  // Durations (in seconds for Framer Motion / GSAP)
  duration: {
    instant: 0.1,
    fast: 0.18,
    normal: 0.3,
    smooth: 0.45,
    slow: 0.7,
    cinematic: 1.0,
    heroSequence: 1.2,
  },

  // Millisecond equivalents for JS setTimeout
  durationMs: {
    instant: 100,
    fast: 180,
    normal: 300,
    smooth: 450,
    slow: 700,
    cinematic: 1000,
    heroSequence: 1200,
  },

  // Spring Physics Configurations (Framer Motion style)
  spring: {
    tight: { stiffness: 300, damping: 30, mass: 0.8 },
    normal: { stiffness: 200, damping: 25, mass: 1 },
    gentle: { stiffness: 150, damping: 22, mass: 1.2 },
    snappy: { stiffness: 260, damping: 20, mass: 0.9 },
    heroTilt: { stiffness: 180, damping: 28, mass: 1 },
    cursor: { stiffness: 350, damping: 28, mass: 0.5 },
  },

  // Easing Curves as explicit cubic-bezier tuples
  easing: {
    easeOut: [0.16, 1, 0.3, 1] as [number, number, number, number],
    editorialText: [0.22, 1, 0.36, 1] as [number, number, number, number],
    maskReveal: [0.77, 0, 0.175, 1] as [number, number, number, number],
    easeIn: [0.7, 0, 0.84, 0] as [number, number, number, number],
    gsapOut: 'power3.out',
    gsapEditorial: 'power4.out',
  },

  // Hero Timed Sequence Delays (ms)
  heroSequence: {
    bg: 0,
    nav: 100,
    eyebrow: 250,
    headlineLine1: 400,
    headlineLine2: 500,
    paragraph: 650,
    primaryCta: 750,
    heroVisual: 850,
    floatingCards: 950,
  },

  // Stagger delays (ms)
  stagger: {
    fast: 60,
    normal: 100,
    slow: 150,
  },

  // Floating Card Physics (individual non-synchronized loop durations in seconds)
  floatingDurations: {
    card1: 8,
    card2: 10,
    card3: 12,
    card4: 9,
  },
};
