import { lazy, Suspense, useRef, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { HomeExtensions } from './components/HomeExtensions';
import { SocialProofBar } from './components/SocialProofBar';
import { StartingPointQuiz } from './components/StartingPointQuiz';


// Lazy-loaded pages
const ReachUs   = lazy(() => import('./pages/ReachUs'));
const Studio    = lazy(() => import('./pages/Studio'));
const FocusRoom = lazy(() => import('./pages/FocusRoom'));
const About     = lazy(() => import('./pages/About'));
const Journal   = lazy(() => import('./pages/Journal'));
const NotFound  = lazy(() => import('./pages/NotFound'));

// Pulsing dot fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-2 h-2 rounded-full bg-muted-foreground skeleton-pulse" />
  </div>
);

// Home page — video bg only on this route
function HomePage() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch((err) => {
        console.error("Video play() was blocked or failed:", err);
      });
    }
  }, []);

  return (
    <>
      {/* Hero — locked to exactly the viewport height so the video fills it correctly */}
      <div className="relative h-screen w-full overflow-hidden bg-background">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover object-bottom z-0"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"
          onError={(e) => console.error("Video failed to load:", e.currentTarget.error)}
          onLoadedData={() => console.log("Video loaded successfully")}
          onPlay={() => console.log("Video is now playing")}
          onPause={() => console.log("Video paused")}
        />
        <div className="relative z-10 flex flex-col h-full">
          <Navbar />
          {/* SocialProofBar sits between nav and hero — overlaid on video via liquid-glass */}
          <SocialProofBar />
          <HeroSection />
        </div>
      </div>

      {/* Quiz sits between hero and HomeExtensions — outside video container */}
      <StartingPointQuiz />

      {/* HomeExtensions sits below the hero in normal document flow — outside the video container */}
      <HomeExtensions />
    </>
  );
}

// Other pages share a plain bg layout
function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full bg-background">
      <Navbar />
      {/* SocialProofBar on every non-home page, sits below nav in document flow */}
      <SocialProofBar />
      <Suspense fallback={<PageLoader />}>{children}</Suspense>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/reach-us" element={<PageLayout><ReachUs /></PageLayout>} />
      <Route path="/studio"   element={<PageLayout><Studio /></PageLayout>} />
      <Route path="/focus-room" element={<PageLayout><FocusRoom /></PageLayout>} />
      <Route path="/about"    element={<PageLayout><About /></PageLayout>} />
      <Route path="/journal"  element={<PageLayout><Journal /></PageLayout>} />
      <Route path="/journal/:id" element={<PageLayout><Journal /></PageLayout>} />
      <Route path="*"         element={<PageLayout><NotFound /></PageLayout>} />
    </Routes>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </HelmetProvider>
  );
}
