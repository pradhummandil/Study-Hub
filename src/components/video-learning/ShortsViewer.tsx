// src/components/video-learning/ShortsViewer.tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronUp, ChevronDown, Heart, Bot, ShieldCheck, Play, ArrowRight, BrainCircuit
} from 'lucide-react';
import type { YouTubeVideo } from '../../types/video-learning';
import { isItemSaved, toggleSaveItem } from '../../lib/videoLearningApi';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ShortsViewerProps {
  shorts: YouTubeVideo[];
  onOpenFullLecture?: (video: YouTubeVideo) => void;
}

export const ShortsViewer: React.FC<ShortsViewerProps> = ({ shorts, onOpenFullLecture }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [saved, setSaved] = useState(false);

  const touchStartY = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeShort = shorts && shorts.length > 0 ? shorts[activeIndex] : null;

  useEffect(() => {
    if (activeShort) {
      setSaved(isItemSaved(activeShort.id, 'video'));
    }
  }, [activeShort]);

  const handleNext = useCallback(() => {
    if (shorts && activeIndex < shorts.length - 1) {
      setActiveIndex((prev) => prev + 1);
      setIsPlaying(true);
    }
  }, [activeIndex, shorts]);

  const handlePrev = useCallback(() => {
    if (activeIndex > 0) {
      setActiveIndex((prev) => prev - 1);
      setIsPlaying(true);
    }
  }, [activeIndex]);

  // Keyboard ArrowUp / ArrowDown navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  // Mouse wheel navigation with debounce
  const wheelLockRef = useRef(false);
  const handleWheel = (e: React.WheelEvent) => {
    if (wheelLockRef.current) return;
    if (Math.abs(e.deltaY) > 30) {
      wheelLockRef.current = true;
      if (e.deltaY > 0) handleNext();
      else handlePrev();
      setTimeout(() => {
        wheelLockRef.current = false;
      }, 500);
    }
  };

  // Touch swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const diffY = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(diffY) > 50) {
      if (diffY > 0) handleNext();
      else handlePrev();
    }
    touchStartY.current = null;
  };

  if (!shorts || shorts.length === 0 || !activeShort) {
    return (
      <div className="text-center py-20 text-slate-500 dark:text-slate-400">
        <p className="text-sm font-medium">No educational Shorts available for this selection.</p>
      </div>
    );
  }

  const handleSaveToggle = async () => {
    const nowSaved = await toggleSaveItem(user?.id || 'guest_user', activeShort.id, 'video');
    setSaved(nowSaved);
  };

  const handleAskStudyMate = () => {
    navigate('/study-ai', {
      state: {
        initialPrompt: `Explain the core formula / idea behind "${activeShort.title}" (${activeShort.exam} — ${activeShort.subject}) in simple terms with a real exam example.`,
      },
    });
  };

  const embedUrl = `https://www.youtube-nocookie.com/embed/${activeShort.youtube_video_id}?autoplay=1&loop=1&playlist=${activeShort.youtube_video_id}&controls=1&modestbranding=1&rel=0`;
  const thumbnailUrl = activeShort.thumbnail || activeShort.thumbnail_url || `https://i.ytimg.com/vi/${activeShort.youtube_video_id}/hqdefault.jpg`;

  return (
    <div className="flex flex-col items-center justify-center py-4 px-2 select-none">
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative w-full max-w-[360px] aspect-[9/16] bg-slate-950 rounded-[28px] overflow-hidden shadow-2xl border border-slate-800 flex flex-col justify-between group"
      >
        {/* Top Header Overlay */}
        <div className="absolute top-3 inset-x-3 z-20 flex items-center justify-between pointer-events-none">
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-950/80 text-cyan-300 border border-cyan-500/30 backdrop-blur-md">
            {activeShort.exam} • {activeShort.subject}
          </span>

          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-slate-950/80 text-slate-300 border border-white/10 backdrop-blur-md">
            {activeIndex + 1} / {shorts.length}
          </span>
        </div>

        {/* Player Viewport */}
        <div className="relative w-full h-full bg-slate-950">
          {isPlaying ? (
            <iframe
              key={activeShort.youtube_video_id}
              src={embedUrl}
              title={activeShort.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div
              onClick={() => setIsPlaying(true)}
              className="relative w-full h-full cursor-pointer group/thumb"
            >
              <img
                src={thumbnailUrl}
                alt={activeShort.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow-2xl shadow-cyan-500/50 transform group-hover/thumb:scale-110 transition-transform">
                  <Play className="w-8 h-8 fill-current ml-1" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Details Overlay */}
        <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent space-y-3 z-10 pointer-events-auto">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{activeShort.channel_name || 'Physics Wallah'}</span>
            </div>
            <h3 className="text-sm font-bold text-slate-100 leading-snug line-clamp-2">
              {activeShort.title}
            </h3>
          </div>

          {/* Action Row */}
          <div className="flex flex-col gap-2 pt-1">
            {onOpenFullLecture && (
              <button
                onClick={() => onOpenFullLecture(activeShort)}
                className="w-full py-2 px-3 rounded-xl bg-blue-600/30 hover:bg-blue-600/40 text-blue-200 border border-blue-500/40 text-xs font-bold flex items-center justify-between backdrop-blur-md transition-all"
              >
                <span>Watch related full lecture</span>
                <ArrowRight className="w-4 h-4 text-blue-400" />
              </button>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={handleAskStudyMate}
                className="flex-1 py-2 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 backdrop-blur-md transition-all"
              >
                <Bot className="w-3.5 h-3.5" /> Ask AI
              </button>
              <button
                onClick={() => navigate(`/practice?topic=${encodeURIComponent(activeShort.topic)}`)}
                className="flex-1 py-2 px-3 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 backdrop-blur-md transition-all"
              >
                <BrainCircuit className="w-3.5 h-3.5" /> Practice
              </button>
            </div>
          </div>
        </div>

        {/* Right Floating Nav Controls */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3">
          <button
            aria-label="Previous Short"
            disabled={activeIndex === 0}
            onClick={handlePrev}
            className="p-3 rounded-full bg-slate-900/90 disabled:opacity-30 text-slate-200 hover:text-cyan-300 border border-slate-700/80 backdrop-blur-md transition-all shadow-xl hover:scale-105 active:scale-95"
            title="Previous Short (ArrowUp)"
          >
            <ChevronUp className="w-5 h-5" />
          </button>

          <button
            aria-label="Save Short"
            onClick={handleSaveToggle}
            className={`p-3 rounded-full backdrop-blur-md border transition-all shadow-xl hover:scale-105 active:scale-95 ${
              saved
                ? 'bg-rose-500 text-white border-rose-400 font-bold shadow-rose-500/30'
                : 'bg-slate-900/90 text-slate-200 border-slate-700/80 hover:text-white'
            }`}
            title={saved ? 'Remove from Saved' : 'Save Short'}
          >
            <Heart className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
          </button>

          <button
            aria-label="Next Short"
            disabled={activeIndex === shorts.length - 1}
            onClick={handleNext}
            className="p-3 rounded-full bg-slate-900/90 disabled:opacity-30 text-slate-200 hover:text-cyan-300 border border-slate-700/80 backdrop-blur-md transition-all shadow-xl hover:scale-105 active:scale-95"
            title="Next Short (ArrowDown)"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
