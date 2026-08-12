import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { SITE_NAME } from '../config';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fadingOutRef = useRef<boolean>(false);
  const animFrameIdRef = useRef<number | null>(null);

  // Smooth fade-in / fade-out helper via rAF reading current opacity off element style
  const fadeTo = (targetOpacity: number, durationMs: number = 500) => {
    if (animFrameIdRef.current !== null) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }

    const video = videoRef.current;
    if (!video) return;

    const currentStyleVal = parseFloat(video.style.opacity || '1');
    const startOpacity = isNaN(currentStyleVal) ? 1 : currentStyleVal;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      const newOpacity = startOpacity + (targetOpacity - startOpacity) * progress;

      if (videoRef.current) {
        videoRef.current.style.opacity = String(newOpacity);
      }

      if (progress < 1) {
        animFrameIdRef.current = requestAnimationFrame(animate);
      } else {
        animFrameIdRef.current = null;
      }
    };

    animFrameIdRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    // Initial mount fade-in
    fadeTo(1, 500);

    return () => {
      if (animFrameIdRef.current !== null) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, []);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;

    // Fade out 0.55s before end if not already fading out
    if (video.duration - video.currentTime <= 0.55 && !fadingOutRef.current) {
      fadingOutRef.current = true;
      fadeTo(0, 500);
    }
  };

  const handleEnded = () => {
    const video = videoRef.current;
    if (video) {
      video.style.opacity = '0';
    }

    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }
      fadingOutRef.current = false;
      fadeTo(1, 500);
    }, 100);
  };

  return (
    <div className="min-h-screen bg-black overflow-hidden relative flex flex-col w-full selection:bg-white/20 selection:text-white">
      {/* Nav Strip — Spans full width across top */}
      <header className="absolute top-0 inset-x-0 z-30 px-6 py-6 w-full">
        <div className="liquid-glass rounded-full px-6 py-3 flex items-center justify-between max-w-5xl mx-auto w-full">
          <Link
            to="/"
            className="text-2xl tracking-tight text-white flex items-baseline select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            {SITE_NAME}<sup className="text-xs ml-0.5 font-sans">®</sup>
          </Link>
          <Link
            to="/"
            className="text-white/80 hover:text-white text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded"
          >
            Back to home
          </Link>
        </div>
      </header>

      {/* Main Two-Column Grid (Desktop) / Stacked Layout (Mobile) */}
      <div className="grid lg:grid-cols-2 min-h-screen w-full flex-1">
        {/* Left Column: Form Content on Solid Dark Background */}
        <main className="order-2 lg:order-1 relative z-10 flex flex-col items-center justify-center px-6 lg:px-16 pt-16 lg:pt-24 pb-12 w-full bg-black min-h-[calc(100vh-35vh)] lg:min-h-screen">
          {children}
        </main>

        {/* Right Column (Desktop) / Top Banner (Mobile): Video */}
        <div className="order-1 lg:order-2 relative overflow-hidden w-full h-[35vh] lg:h-auto lg:min-h-screen border-b lg:border-b-0 lg:border-l border-white/10 mt-20 lg:mt-0">
          <video
            ref={videoRef}
            autoPlay
            loop={false}
            muted
            playsInline
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            className="absolute inset-0 w-full h-full object-cover z-0 translate-y-[17%]"
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_115001_bcdaa3b4-03de-47e7-ad63-ae3e392c32d4.mp4"
            style={{ opacity: 1 }}
          />
        </div>
      </div>
    </div>
  );
};
