export interface VisualAsset {
  id: string;
  pinNumber: number;
  sourcePinUrl: string;
  originalSource: string;
  localPath: string;
  assetType: 'image' | 'video' | 'interactive_ui';
  intendedPage: string;
  intendedSection: string;
  licenseStatus: 'approved' | 'reference_only' | 'generated_equivalent';
  visualStyle: string;
  dominantColors: string[];
  aspectRatio: string;
  motionCharacteristics: string;
  notes: string;
}

export const VISUAL_ASSETS: Record<string, VisualAsset> = {
  hero: {
    id: 'hero-ai-study',
    pinNumber: 1,
    sourcePinUrl: 'https://in.pinterest.com/pin/322359285828940269/',
    originalSource: 'Instagram / Artist Editorial Illustration',
    localPath: '/assets/pinterest/hero/hero-ai-study.webp',
    assetType: 'image',
    intendedPage: 'Homepage',
    intendedSection: 'Hero Section (Right artwork / Floating preview)',
    licenseStatus: 'generated_equivalent',
    visualStyle: '3D Glassmorphism Neural Brain with Floating Recall Controls',
    dominantColors: ['#062B3D', '#287BFF', '#5CE1E6', '#FFFFFF'],
    aspectRatio: '4:3',
    motionCharacteristics: 'Subtle hover float, soft cyan glow pulse',
    notes: 'Inspiration: Pin 1 active recall brain controls. Created custom high-performance WebP artwork matching Study Hub visual system.'
  },
  focusRoom: {
    id: 'focus-ambient-room',
    pinNumber: 2,
    sourcePinUrl: 'https://in.pinterest.com/pin/975521969305585422/',
    originalSource: 'Find Mental Balance (External Site)',
    localPath: '/assets/pinterest/focus/focus-ambient-room.webp',
    assetType: 'image',
    intendedPage: 'Focus Room',
    intendedSection: 'Focus Ambient Mode / Digital Shield',
    licenseStatus: 'generated_equivalent',
    visualStyle: 'Dark Mode Ambient Study Workspace with Cyan Focus Aura',
    dominantColors: ['#0A1926', '#062B3D', '#5CE1E6', '#287BFF'],
    aspectRatio: '9:16',
    motionCharacteristics: 'Deep calm ambient glow, pulse timer',
    notes: 'Inspiration: Pin 2 glowing smartphone screen stress. Converted concept into a calm, distraction-free study aura.'
  },
  studioLibrary: {
    id: 'knowledge-library-brain',
    pinNumber: 3,
    sourcePinUrl: 'https://in.pinterest.com/pin/203858320627823184/',
    originalSource: 'Directory of Illustration (Artist Portfolio)',
    localPath: '/assets/pinterest/study/knowledge-library-brain.webp',
    assetType: 'image',
    intendedPage: 'Studio',
    intendedSection: 'Smart Resource Library & Knowledge Search',
    licenseStatus: 'generated_equivalent',
    visualStyle: 'Structured Bookshelf Brain Matrix with Knowledge Beam',
    dominantColors: ['#062B3D', '#287BFF', '#5CE1E6', '#6F7CFF'],
    aspectRatio: '2:3',
    motionCharacteristics: 'Static crisp vector with interactive search hover',
    notes: 'Inspiration: Pin 3 brain bookshelf ladder. Created digital smart library equivalent.'
  },
  examSimulator: {
    id: 'exam-confidence-suite',
    pinNumber: 4,
    sourcePinUrl: 'https://in.pinterest.com/pin/998743654885257487/',
    originalSource: 'Blogvibe (External Site)',
    localPath: '/assets/pinterest/exams/exam-confidence-suite.webp',
    assetType: 'image',
    intendedPage: 'Exam Simulator',
    intendedSection: 'Pre-exam Readiness & Panic-free Test Mode',
    licenseStatus: 'generated_equivalent',
    visualStyle: 'Clean Exam Desk Console with Real-time Confidence Gauge',
    dominantColors: ['#F4F9FF', '#FFFFFF', '#062B3D', '#287BFF', '#5CE1E6'],
    aspectRatio: '9:16',
    motionCharacteristics: 'Interactive option selection highlight',
    notes: 'Inspiration: Pin 4 exam stress panic. Re-engineered into a calm confidence-boosting test suite.'
  },
  roadmapPathway: {
    id: 'roadmap-pathway-mastery',
    pinNumber: 5,
    sourcePinUrl: 'https://in.pinterest.com/pin/1127025875509575308/',
    originalSource: 'ProductiveLegends (YouTube Channel)',
    localPath: '/assets/pinterest/study/roadmap-pathway-mastery.webp',
    assetType: 'image',
    intendedPage: 'Roadmap',
    intendedSection: 'Syllabus Breakdown & Milestone Tracker',
    licenseStatus: 'generated_equivalent',
    visualStyle: 'Ascending S-Curve Pathway with Milestone Nodes',
    dominantColors: ['#062B3D', '#5CE1E6', '#287BFF', '#FFFFFF'],
    aspectRatio: '9:16',
    motionCharacteristics: 'Step-by-step milestone illumination on scroll',
    notes: 'Inspiration: Pin 5 falling stack of textbooks. Replaced chaotic stack with structured progression roadmap.'
  },
  pyqPractice: {
    id: 'pyq-deep-practice',
    pinNumber: 6,
    sourcePinUrl: 'https://in.pinterest.com/pin/574771971205186318/',
    originalSource: 'Pinterest Video Pin (Unknown Creator)',
    localPath: '/assets/pinterest/study/pyq-deep-practice.webp',
    assetType: 'image',
    intendedPage: 'Practice / PYQ',
    intendedSection: 'Deep Practice & Topic Solution Breakdown',
    licenseStatus: 'generated_equivalent',
    visualStyle: 'Open Study Document with High-Yield Solution Highlights',
    dominantColors: ['#F4F9FF', '#FFFFFF', '#062B3D', '#5CE1E6'],
    aspectRatio: '9:16',
    motionCharacteristics: 'Hover zoom on step-by-step solution breakdown',
    notes: 'Inspiration: Pin 6 peeking over open book. Transformed into deep focus question paper view.'
  },
  revisionFlashcards: {
    id: 'revision-fast-flashcards',
    pinNumber: 7,
    sourcePinUrl: 'https://in.pinterest.com/pin/682858362229488216/',
    originalSource: 'Pinterest Motion Visual',
    localPath: '/assets/pinterest/ui/revision-fast-flashcards.webp',
    assetType: 'image',
    intendedPage: 'Revision / Flashcards',
    intendedSection: 'Rapid Spaced Repetition Flashcards Deck',
    licenseStatus: 'generated_equivalent',
    visualStyle: '3D Stacked Swiping Active Recall Deck',
    dominantColors: ['#062B3D', '#FFFFFF', '#287BFF', '#5CE1E6'],
    aspectRatio: '1:1',
    motionCharacteristics: 'Dynamic card swipe spring transition',
    notes: 'Inspiration: Pin 7 fast skateboard typing motion. Created high-speed flashcard recall visual.'
  },
  studioEcosystem: {
    id: 'ecosystem-juggling-widgets',
    pinNumber: 8,
    sourcePinUrl: 'https://in.pinterest.com/pin/1041387113816400123/',
    originalSource: 'Later.com Marketing Art',
    localPath: '/assets/pinterest/ui/ecosystem-juggling-widgets.webp',
    assetType: 'image',
    intendedPage: 'Homepage / Studio',
    intendedSection: 'Product Preview / Unified Ecosystem Overview',
    licenseStatus: 'generated_equivalent',
    visualStyle: 'Central Core with Orbiting Interactive Study Widgets',
    dominantColors: ['#062B3D', '#287BFF', '#5CE1E6', '#B49CFF'],
    aspectRatio: '9:16',
    motionCharacteristics: 'Smooth orbital widget transition',
    notes: 'Inspiration: Pin 8 juggling media elements. Unified Study Hub features into one orbiting core.'
  },
  communityStudyRooms: {
    id: 'study-room-collaborative',
    pinNumber: 9,
    sourcePinUrl: 'https://in.pinterest.com/pin/53972895522938608/',
    originalSource: 'Pinterest Motion Visual',
    localPath: '/assets/pinterest/community/study-room-collaborative.webp',
    assetType: 'image',
    intendedPage: 'Community',
    intendedSection: 'Virtual Study Circles & Live Study Lounge',
    licenseStatus: 'generated_equivalent',
    visualStyle: 'Modern Collaborative Lounge with Active Study Avatars',
    dominantColors: ['#0A1926', '#062B3D', '#287BFF', '#5CE1E6'],
    aspectRatio: '1:1',
    motionCharacteristics: 'Pulse indicator on active room participants',
    notes: 'Inspiration: Pin 9 relaxed desk posture. Designed friendly study room lounge preview.'
  },
  productPreviewClick: {
    id: 'interactive-click-preview',
    pinNumber: 10,
    sourcePinUrl: 'https://in.pinterest.com/pin/909656824725158872/',
    originalSource: '@sandracreatess (Creator Artwork)',
    localPath: '/assets/pinterest/ui/interactive-click-preview.webp',
    assetType: 'image',
    intendedPage: 'Homepage',
    intendedSection: 'Interactive Product Preview Tab Controls',
    licenseStatus: 'generated_equivalent',
    visualStyle: 'Glass Card Hover & One-Click Launch Ripple Effect',
    dominantColors: ['#F4F9FF', '#062B3D', '#287BFF', '#5CE1E6'],
    aspectRatio: '1:1',
    motionCharacteristics: 'Click ripple pulse animation',
    notes: 'Inspiration: Pin 10 mouse scroll click. Rendered clean UI micro-interaction card.'
  },
  aboutFutureAspirations: {
    id: 'about-future-aspirations',
    pinNumber: 11,
    sourcePinUrl: 'https://in.pinterest.com/pin/526991593908723703/',
    originalSource: 'ArtStation (Shavrin 21 Artwork)',
    localPath: '/assets/pinterest/decorative/about-future-aspirations.webp',
    assetType: 'image',
    intendedPage: 'About',
    intendedSection: 'Founder Vision & Future Aspirations Story',
    licenseStatus: 'generated_equivalent',
    visualStyle: 'Horizon Rays & Student Career Trajectory Portal',
    dominantColors: ['#062B3D', '#287BFF', '#5CE1E6', '#FFFFFF'],
    aspectRatio: '8:9',
    motionCharacteristics: 'Soft atmospheric horizon light shimmer',
    notes: 'Inspiration: Pin 11 "What are you going to be when you grow up?". Created inspirational student career horizon visual.'
  }
};
