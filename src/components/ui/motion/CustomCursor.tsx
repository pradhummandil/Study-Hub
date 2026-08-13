import React, { useEffect, useRef, useState } from 'react';

export const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    // Check desktop & reduced motion
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

      // Inspect target element for cursor hints
      const target = e.target as HTMLElement | null;
      if (target) {
        const cursorAttr = target.closest('[data-cursor]')?.getAttribute('data-cursor');
        if (cursorAttr) {
          setLabel(cursorAttr);
        } else if (target.closest('a, button, input, select, [role="button"]')) {
          setLabel(null);
          cursorRef.current?.classList.add('cursor-expanded');
        } else {
          setLabel(null);
          cursorRef.current?.classList.remove('cursor-expanded');
        }
      }
    };

    const render = () => {
      // Smooth lerp (15% interpolation per frame)
      cursorX += (mouseX - cursorX) * 0.18;
      cursorY += (mouseY - cursorY) * 0.18;

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
      {/* Outer Glow Ring / Capsule */}
      <div
        className={`rounded-full transition-all duration-200 flex items-center justify-center ${
          label
            ? 'px-3 py-1 bg-[#062B3D]/90 text-white text-[10px] font-bold tracking-wider shadow-lg border border-[#5CE1E6]/40 backdrop-blur-md'
            : 'w-4 h-4 rounded-full bg-[#287BFF]/80 mix-blend-difference shadow-[0_0_12px_rgba(40,123,255,0.8)] border border-white/60'
        }`}
      >
        <span ref={textRef} className="select-none font-sans uppercase">
          {label}
        </span>
      </div>
    </div>
  );
};
