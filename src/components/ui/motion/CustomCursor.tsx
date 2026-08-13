import React, { useEffect, useRef, useState } from 'react';

export const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isTouch || prefersReducedMotion) {
      setIsEnabled(false);
      return;
    }

    setIsEnabled(true);

    let mouseX = -100;
    let mouseY = -100;
    let cursorX = -100;
    let cursorY = -100;
    let animationFrameId: number;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      const target = e.target as HTMLElement | null;
      if (target) {
        const cursorAttr = target.closest('[data-cursor]')?.getAttribute('data-cursor');
        if (cursorAttr) {
          setLabel(cursorAttr);
          setIsHovered(true);
        } else if (target.closest('a, button, input, select, [role="button"]')) {
          setLabel(null);
          setIsHovered(true);
        } else {
          setLabel(null);
          setIsHovered(false);
        }
      }
    };

    const render = () => {
      cursorX += (mouseX - cursorX) * 0.2;
      cursorY += (mouseY - cursorY) * 0.2;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  if (!isEnabled) return null;

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 pointer-events-none z-[999999] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-opacity duration-300"
      style={{ willChange: 'transform' }}
    >
      {/* Outer Cream Ring / Inner Point */}
      <div
        className={`rounded-full transition-all duration-200 flex items-center justify-center ${
          label
            ? 'px-3 py-1 bg-forest/90 text-paper text-[10px] font-bold tracking-wider shadow-card border border-gold/40 backdrop-blur-md'
            : isHovered
            ? 'w-8 h-8 rounded-full border-2 border-parchment bg-parchment/20 backdrop-blur-sm'
            : 'w-2.5 h-2.5 rounded-full bg-forest border border-paper shadow-sm'
        }`}
      >
        <span ref={textRef} className="select-none font-sans uppercase">
          {label}
        </span>
      </div>
    </div>
  );
};
