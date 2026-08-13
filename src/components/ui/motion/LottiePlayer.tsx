import React, { useEffect, useRef, useState } from 'react';
import Lottie from 'lottie-react';
import { useReducedMotion } from 'framer-motion';

interface LottiePlayerProps {
  animationData?: object;
  src?: string;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
  style?: React.CSSProperties;
  speed?: number;
}

export const LottiePlayer: React.FC<LottiePlayerProps> = ({
  animationData,
  src,
  loop = true,
  autoplay = true,
  className = '',
  style,
  speed = 1,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lottieRef = useRef<any>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [fetchedData, setFetchedData] = useState<object | null>(null);
  const shouldReduceMotion = useReducedMotion();

  // Fetch remote or local json if src is provided
  useEffect(() => {
    if (src && !animationData) {
      if (src.endsWith('.svg')) {
        // If it's an SVG file, we render directly as img or svg
        return;
      }
      fetch(src)
        .then((res) => res.json())
        .then((data) => setFetchedData(data))
        .catch((err) => console.warn('Lottie fetch failed:', err));
    }
  }, [src, animationData]);

  // Viewport Observer for performance cleanup
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Handle Play/Pause based on viewport visibility & reduced motion
  useEffect(() => {
    if (!lottieRef.current) return;

    if (shouldReduceMotion || !isVisible) {
      lottieRef.current.pause();
    } else if (autoplay) {
      lottieRef.current.play();
      if (speed !== 1) {
        lottieRef.current.setSpeed(speed);
      }
    }
  }, [isVisible, shouldReduceMotion, autoplay, speed]);

  const activeData = animationData || fetchedData;

  // Handle SVG animation fallbacks directly
  if (src && src.endsWith('.svg')) {
    return (
      <div ref={containerRef} className={`inline-block ${className}`} style={style}>
        <img
          src={src}
          alt="Animated Vector Illustration"
          className="w-full h-full object-contain pointer-events-none"
        />
      </div>
    );
  }

  if (!activeData) {
    return <div ref={containerRef} className={`w-full h-full bg-slate-100/50 rounded-lg ${className}`} />;
  }

  return (
    <div ref={containerRef} className={`inline-block ${className}`} style={style}>
      <Lottie
        lottieRef={lottieRef}
        animationData={activeData}
        loop={loop && !shouldReduceMotion}
        autoplay={autoplay && isVisible && !shouldReduceMotion}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};
