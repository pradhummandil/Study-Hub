import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ShieldCheck, ArrowRight } from 'lucide-react';
import type { YouTubeVideo } from '../../types/video-learning';
import { VideoCard } from './VideoCard';
import { useNavigate } from 'react-router-dom';

import { ChannelAvatar } from './ChannelAvatar';

interface ChannelShelfProps {
  channelName: string;
  channelHandle?: string;
  avatarUrl?: string;
  channelId?: string;
  videos: YouTubeVideo[];
  onSelectVideo: (video: YouTubeVideo) => void;
}

export const ChannelShelf: React.FC<ChannelShelfProps> = ({
  channelName,
  avatarUrl,
  channelId,
  videos,
  onSelectVideo,
}) => {
  const navigate = useNavigate();
  const shelfRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (shelfRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = shelfRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();
    const currentRef = shelfRef.current;
    if (currentRef) {
      currentRef.addEventListener('scroll', checkScroll, { passive: true });
      window.addEventListener('resize', checkScroll);
    }
    return () => {
      if (currentRef) {
        currentRef.removeEventListener('scroll', checkScroll);
      }
      window.removeEventListener('resize', checkScroll);
    };
  }, [videos]);

  const scroll = (direction: 'left' | 'right') => {
    if (shelfRef.current) {
      const scrollAmount = shelfRef.current.clientWidth * 0.75;
      shelfRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!videos || videos.length === 0) return null;

  return (
    <div className="space-y-4 py-2 border-t border-[#1C201D]/10 pt-6">
      {/* Channel Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ChannelAvatar channelName={channelName} avatarUrl={avatarUrl} size="md" />
          <div>
            <h3 className="font-serif font-bold text-lg text-[#1C201D] flex items-center gap-1.5 leading-tight">
              {channelName} <ShieldCheck className="w-4 h-4 text-[#2D5A3F]" />
            </h3>
            <p className="text-xs text-[#6C706D]">Official Verified Channel Lectures</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {channelId && (
            <button
              onClick={() => navigate(`/video-learning/channel/${channelId}`)}
              className="text-xs font-bold text-[#2D5A3F] hover:underline flex items-center gap-1 hidden sm:flex"
            >
              Explore channel <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Left / Right Scroll Controls */}
          <div className="flex items-center gap-1.5">
            <button
              disabled={!canScrollLeft}
              onClick={() => scroll('left')}
              aria-label="Scroll left"
              className={`p-2 rounded-full border transition-all ${
                canScrollLeft
                  ? 'bg-[#FFFFFF] text-[#1C201D] border-[#1C201D]/15 hover:bg-[#EDE8DB] shadow-sm'
                  : 'bg-[#EDE8DB]/40 text-[#6C706D]/40 border-[#1C201D]/5 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={!canScrollRight}
              onClick={() => scroll('right')}
              aria-label="Scroll right"
              className={`p-2 rounded-full border transition-all ${
                canScrollRight
                  ? 'bg-[#FFFFFF] text-[#1C201D] border-[#1C201D]/15 hover:bg-[#EDE8DB] shadow-sm'
                  : 'bg-[#EDE8DB]/40 text-[#6C706D]/40 border-[#1C201D]/5 cursor-not-allowed'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Shelf Cards Rail */}
      <div
        ref={shelfRef}
        className="flex items-stretch gap-5 overflow-x-auto no-scrollbar pb-3 scroll-smooth touch-pan-x"
      >
        {videos.map((vid) => (
          <div key={vid.id} className="min-w-[260px] sm:min-w-[300px] max-w-[320px] shrink-0">
            <VideoCard video={vid} onSelect={onSelectVideo} />
          </div>
        ))}
      </div>
    </div>
  );
};
