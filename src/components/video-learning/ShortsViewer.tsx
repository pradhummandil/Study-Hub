import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronUp, ChevronDown, Heart, ShieldCheck,
  Bot, BrainCircuit, Play, ArrowRight, Share2, Check
} from 'lucide-react';
import type { YouTubeVideo } from '../../types/video-learning';
import { toggleSaveItem, isItemSaved } from '../../lib/videoLearningApi';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ChannelAvatar } from './ChannelAvatar';

interface ShortsViewerProps {
  shorts: YouTubeVideo[];
  onOpenFullLecture?: (short: YouTubeVideo) => void;
}

export const ShortsViewer: React.FC<ShortsViewerProps> = ({ shorts, onOpenFullLecture }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);
  const wheelLockRef = useRef<boolean>(false);

  const activeShort = shorts[activeIndex];

  useEffect(() => {
    if (activeShort) {
      setSaved(isItemSaved(activeShort.id, 'video'));
      setIsPlaying(true);
    }
  }, [activeIndex, activeShort]);

  const handleNext = () => {
    if (activeIndex < shorts.length - 1) {
      setActiveIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      setActiveIndex((prev) => prev - 1);
    }
  };

  // Keyboard Up/Down navigation
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
  }, [activeIndex, shorts.length]);

  // Wheel scroll navigation
  const handleWheel = (e: React.WheelEvent) => {
    if (wheelLockRef.current) return;
    if (Math.abs(e.deltaY) > 40) {
      wheelLockRef.current = true;
      if (e.deltaY > 0) {
        handleNext();
      } else {
        handlePrev();
      }
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
      <div className="text-center py-20 text-[#6C706D]">
        <p className="text-sm font-medium">No educational Shorts available for this selection.</p>
      </div>
    );
  }

  const handleSaveToggle = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    const nowSaved = await toggleSaveItem(user.id, activeShort.id, 'video');
    setSaved(nowSaved);
  };

  const handleAskStudyMate = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate('/study-ai', {
      state: {
        initialPrompt: `Explain the core formula / idea behind "${activeShort.title}" (${activeShort.exam} — ${activeShort.subject}) in simple terms with a real exam example.`,
      },
    });
  };

  const handleShare = () => {
    const url = window.location.origin + `/video-learning/video/${activeShort.youtube_video_id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const embedUrl = `https://www.youtube-nocookie.com/embed/${activeShort.youtube_video_id}?autoplay=1&loop=1&playlist=${activeShort.youtube_video_id}&controls=1&modestbranding=1&rel=0`;
  const thumbnailUrl = activeShort.thumbnail || activeShort.thumbnail_url || `https://i.ytimg.com/vi/${activeShort.youtube_video_id}/hqdefault.jpg`;

  return (
    <div className="flex flex-col items-center justify-center py-6 px-2 select-none">
      <div className="relative flex items-center justify-center gap-4 w-full max-w-[480px]">
        {/* Main 9:16 Vertical Shorts Card */}
        <div
          ref={containerRef}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative w-full max-w-[360px] aspect-[9/16] bg-[#1C201D] rounded-[28px] overflow-hidden shadow-2xl border border-[#1C201D]/20 flex flex-col justify-between group"
        >
          {/* Top Tag Overlay (No 1/1000 counter badge!) */}
          <div className="absolute top-3 left-3 z-20 pointer-events-none">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-[#1C201D]/85 text-[#D4AF37] border border-[#D4AF37]/30 backdrop-blur-md shadow-sm">
              {activeShort.exam} • {activeShort.subject}
            </span>
          </div>

          {/* Player Viewport */}
          <div className="relative w-full h-full bg-[#1C201D]">
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
                <div className="absolute inset-0 bg-[#1C201D]/40 backdrop-blur-[2px] flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-[#2D5A3F] text-[#FFFFFF] flex items-center justify-center shadow-2xl shadow-[#2D5A3F]/50 transform group-hover/thumb:scale-110 transition-transform">
                    <Play className="w-8 h-8 fill-current ml-1" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom YouTube-Style Details Overlay */}
          <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-[#1C201D] via-[#1C201D]/90 to-transparent space-y-2 z-10 pointer-events-auto">
            {/* Channel Info & Verified Badge */}
            <div className="flex items-center gap-2">
              <ChannelAvatar channelName={activeShort.channel_name} size="sm" />
              <div className="flex items-center gap-1 font-bold text-xs text-[#FFFFFF]">
                <span>{activeShort.channel_name || 'Physics Wallah'}</span>
                <ShieldCheck className="w-3.5 h-3.5 text-[#2D5A3F]" />
              </div>
            </div>

            {/* Short Title */}
            <h3 className="text-xs sm:text-sm font-bold text-[#FFFFFF] leading-snug line-clamp-2">
              {activeShort.title}
            </h3>

            {/* Related Full Lesson Pill (YouTube Shorts Remix/Related style) */}
            {onOpenFullLecture && (
              <button
                onClick={() => onOpenFullLecture(activeShort)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1C201D]/85 hover:bg-[#2D5A3F] text-[#FFFFFF] border border-[#FFFFFF]/20 text-[11px] font-bold backdrop-blur-md transition-all mt-1 shadow-md cursor-pointer"
              >
                <Play className="w-3 h-3 text-[#D4AF37] fill-current" />
                <span className="truncate max-w-[200px]">Watch Related Full Lesson</span>
                <ArrowRight className="w-3 h-3 text-[#D4AF37]" />
              </button>
            )}
          </div>
        </div>

        {/* YouTube-Style Vertical Action Rail (Placed on the right side of the Short) */}
        <div className="flex flex-col items-center gap-4 text-[#FFFFFF] shrink-0 z-20">
          {/* Previous Short Button */}
          <button
            aria-label="Previous Short"
            disabled={activeIndex === 0}
            onClick={handlePrev}
            className="w-11 h-11 rounded-full bg-[#1C201D]/90 disabled:opacity-30 text-[#FFFFFF] hover:text-[#D4AF37] border border-[#FFFFFF]/20 flex items-center justify-center backdrop-blur-md transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
            title="Previous Short (ArrowUp)"
          >
            <ChevronUp className="w-5 h-5" />
          </button>

          {/* Like / Save Button */}
          <div className="flex flex-col items-center gap-1">
            <button
              aria-label="Save Short"
              onClick={handleSaveToggle}
              className={`w-11 h-11 rounded-full backdrop-blur-md border flex items-center justify-center transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer ${
                saved
                  ? 'bg-[#2D5A3F] text-[#D4AF37] border-[#D4AF37]'
                  : 'bg-[#1C201D]/90 text-[#FFFFFF] border-[#FFFFFF]/20 hover:text-[#D4AF37]'
              }`}
              title={saved ? 'Remove from Saved' : 'Save Short'}
            >
              <Heart className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
            </button>
            <span className="text-[10px] font-bold font-mono text-[#1C201D]">{saved ? 'Saved' : 'Save'}</span>
          </div>

          {/* Ask AI Button */}
          <div className="flex flex-col items-center gap-1">
            <button
              aria-label="Ask AI"
              onClick={handleAskStudyMate}
              className="w-11 h-11 rounded-full bg-[#1C201D]/90 hover:bg-[#2D5A3F] text-[#D4AF37] border border-[#FFFFFF]/20 flex items-center justify-center backdrop-blur-md transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
              title="Ask AI about this Short"
            >
              <Bot className="w-5 h-5" />
            </button>
            <span className="text-[10px] font-bold font-mono text-[#1C201D]">Ask AI</span>
          </div>

          {/* Practice Topic Button */}
          <div className="flex flex-col items-center gap-1">
            <button
              aria-label="Practice Topic"
              onClick={() => {
                if (!user) {
                  navigate('/login');
                  return;
                }
                navigate(`/practice?topic=${encodeURIComponent(activeShort.topic)}`);
              }}
              className="w-11 h-11 rounded-full bg-[#1C201D]/90 hover:bg-[#C86D51] text-[#C86D51] hover:text-[#FFFFFF] border border-[#FFFFFF]/20 flex items-center justify-center backdrop-blur-md transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
              title="Practice Topic"
            >
              <BrainCircuit className="w-5 h-5" />
            </button>
            <span className="text-[10px] font-bold font-mono text-[#1C201D]">Practice</span>
          </div>

          {/* Share Button */}
          <div className="flex flex-col items-center gap-1">
            <button
              aria-label="Share Short"
              onClick={handleShare}
              className="w-11 h-11 rounded-full bg-[#1C201D]/90 hover:bg-[#2D5A3F] text-[#FFFFFF] border border-[#FFFFFF]/20 flex items-center justify-center backdrop-blur-md transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
              title="Copy Link"
            >
              {copied ? <Check className="w-5 h-5 text-[#2D5A3F]" /> : <Share2 className="w-5 h-5" />}
            </button>
            <span className="text-[10px] font-bold font-mono text-[#1C201D]">{copied ? 'Copied!' : 'Share'}</span>
          </div>

          {/* Next Short Button */}
          <button
            aria-label="Next Short"
            disabled={activeIndex === shorts.length - 1}
            onClick={handleNext}
            className="w-11 h-11 rounded-full bg-[#1C201D]/90 disabled:opacity-30 text-[#FFFFFF] hover:text-[#D4AF37] border border-[#FFFFFF]/20 flex items-center justify-center backdrop-blur-md transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
            title="Next Short (ArrowDown)"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
