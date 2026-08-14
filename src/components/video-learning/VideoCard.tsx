import React, { useState, useRef, useEffect } from 'react';
import { Play, Heart, CheckCircle2, Clock, VolumeX, MoreVertical, ExternalLink, HelpCircle, BrainCircuit, Calendar, Film } from 'lucide-react';
import type { YouTubeVideo } from '../../types/video-learning';
import { isItemSaved, toggleSaveItem, getVideoWatchState, formatTime } from '../../lib/videoLearningApi';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ChannelAvatar } from './ChannelAvatar';

interface VideoCardProps {
  video: YouTubeVideo;
  onSelect: (video: YouTubeVideo) => void;
}

// Global active preview tracker so ONLY ONE preview plays at a time
let globalActivePreviewVideoId: string | null = null;
const previewListeners: Set<() => void> = new Set();

function setActivePreview(videoId: string | null) {
  globalActivePreviewVideoId = videoId;
  previewListeners.forEach((fn) => fn());
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, onSelect }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(() => isItemSaved(video?.id || '', 'video'));
  const [isHovered, setIsHovered] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [thumbError, setThumbError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const watchState = video?.youtube_video_id ? getVideoWatchState(video.youtube_video_id) : null;

  // Safe variables with optional chaining & fallbacks
  const videoId = video?.youtube_video_id || video?.id || '';
  const title = video?.title || 'Untitled Lesson';
  const exam = video?.exam || 'General';
  const subject = video?.subject || 'General Studies';
  const topic = video?.topic || subject;
  const channelName = video?.channel_name || 'Verified Channel';
  const duration = video?.duration || (video?.duration_seconds ? formatTime(video.duration_seconds) : 'Lesson');
  const videoType = video?.video_type || 'LECTURE';
  
  // Safe thumbnail URL logic
  const initialThumb = video?.thumbnail || video?.thumbnail_url || (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : '');

  // Safe formatted published date
  const formattedDate = video?.published_at
    ? new Date(video.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  // Channel avatar fallback logic
  const channelAvatarUrl = video?.channel_handle === '@PW-JEEWallah'
    ? 'https://yt3.googleusercontent.com/9C0637F55s9zY8P8e-28D6uY75N4m_uP-b7h_zQ2F2eZ7s-f1A_7L2v1t-G-V9e_X-8v_b-1=s176-c-k-c0x00ffffff-no-rj'
    : video?.channel_handle === '@PWNEET-Official'
    ? 'https://yt3.googleusercontent.com/w2Yv2S5e8B9A0M9B9B9B9B9B9B9B9B9B9B9B9B9B9B9B9B9B9B9B9B9B9B9B9B9B=s176-c-k-c0x00ffffff-no-rj'
    : 'https://yt3.googleusercontent.com/ytc/AIdro_k9_N_v0-7-L8v8-8-8-8-8-8-8-8-8-8-8-8=s176-c-k-c0x00ffffff-no-rj';

  // Subscribe to global active preview changes
  useEffect(() => {
    const handleGlobalChange = () => {
      if (globalActivePreviewVideoId !== videoId && showPreview) {
        setShowPreview(false);
      }
    };
    previewListeners.add(handleGlobalChange);
    return () => {
      previewListeners.delete(handleGlobalChange);
    };
  }, [videoId, showPreview]);

  // Desktop hover preview trigger (~500ms delay)
  const handleMouseEnter = () => {
    setIsHovered(true);
    const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    if (isTouchDevice || window.innerWidth < 768 || !videoId) return;

    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      setActivePreview(videoId);
      setShowPreview(true);
    }, 500);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setShowMenu(false);
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    if (showPreview) {
      setShowPreview(false);
      if (globalActivePreviewVideoId === videoId) {
        setActivePreview(null);
      }
    }
  };

  const [guestNotice, setGuestNotice] = useState(false);

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      setGuestNotice(true);
      setTimeout(() => setGuestNotice(false), 2500);
      return;
    }
    if (!video?.id) return;
    toggleSaveItem(user.id, video.id, 'video').then((nowSaved) => {
      setSaved(nowSaved);
    });
  };

  const badgeColorMap: Record<string, string> = {
    LECTURE: 'bg-[#EDE8DB] text-[#2D5A3F] border-[#2D5A3F]/20',
    ONE_SHOT: 'bg-[#2D5A3F]/10 text-[#2D5A3F] border-[#2D5A3F]/30',
    PYQ: 'bg-[#C86D51]/10 text-[#C86D51] border-[#C86D51]/20',
    REVISION: 'bg-[#D4AF37]/15 text-[#1C201D] border-[#D4AF37]/30',
    CRASH_COURSE: 'bg-[#C86D51]/15 text-[#C86D51] border-[#C86D51]/30',
    SHORT: 'bg-[#EDE8DB] text-[#2D5A3F] border-[#2D5A3F]/20',
    STRATEGY: 'bg-[#D4AF37]/20 text-[#1C201D] border-[#D4AF37]/30',
  };

  return (
    <div
      onClick={() => onSelect(video)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group relative bg-[#FFFFFF] border rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer flex flex-col justify-between ${
        isHovered
          ? 'border-[#2D5A3F]/40 shadow-lg -translate-y-1'
          : 'border-[#1C201D]/10 shadow-sm hover:shadow-md'
      }`}
    >
      {/* Thumbnail & Preview Player Area */}
      <div className="relative aspect-video w-full overflow-hidden bg-[#EDE8DB]">
        {showPreview ? (
          <div className="relative w-full h-full">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&modestbranding=1&rel=0`}
              title={title}
              className="w-full h-full border-0 pointer-events-none scale-105"
              allow="autoplay; encrypted-media"
            />
            <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-[#1C201D]/90 text-[#D4AF37] text-[10px] font-semibold flex items-center gap-1 backdrop-blur-md border border-[#EDE8DB]/30">
              <VolumeX className="w-3 h-3 text-[#D4AF37] animate-pulse" />
              <span>Preview · Muted</span>
            </div>
          </div>
        ) : (
          <>
            {thumbError || !initialThumb ? (
              <div className="w-full h-full bg-[#EDE8DB] flex flex-col items-center justify-center text-[#6C706D] p-4 text-center">
                <Film className="w-8 h-8 text-[#2D5A3F]/40 mb-1" />
                <span className="text-[11px] font-bold text-[#1C201D]">{exam} Lesson</span>
                <span className="text-[10px] text-[#6C706D]">{subject}</span>
              </div>
            ) : (
              <img
                src={initialThumb}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                loading="lazy"
                onError={() => {
                  if (videoId && initialThumb !== `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`) {
                    // Try youtube img domain first before showing parchment fallback
                    const fallback = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                    const img = new Image();
                    img.src = fallback;
                    img.onload = () => {};
                    img.onerror = () => setThumbError(true);
                  } else {
                    setThumbError(true);
                  }
                }}
              />
            )}

            {/* Guest Sign-in Toast Notice */}
            {guestNotice && (
              <div className="absolute inset-x-2 top-10 bg-[#1C201D]/95 text-[#FFFFFF] text-[11px] font-bold py-1.5 px-3 rounded-lg text-center shadow-lg border border-[#D4AF37]/40 backdrop-blur-md z-30 animate-fade-rise">
                Sign in to save this lesson.
              </div>
            )}

            {/* Hover Overlay Play Button */}
            <div className="absolute inset-0 bg-[#1C201D]/25 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-[#2D5A3F] text-[#FFFFFF] flex items-center justify-center shadow-lg shadow-[#2D5A3F]/40 transform scale-90 group-hover:scale-100 transition-transform">
                <Play className="w-5 h-5 fill-current ml-0.5" />
              </div>
            </div>

            {/* Top Badges */}
            <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none z-10">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#1C201D]/85 text-[#FFFFFF] backdrop-blur-md border border-[#FFFFFF]/20">
                  {exam}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase backdrop-blur-md border ${
                    badgeColorMap[videoType] || 'bg-[#1C201D]/75 text-[#FFFFFF] border-[#FFFFFF]/20'
                  }`}
                >
                  {videoType.replace('_', ' ')}
                </span>
              </div>

              {/* Save Heart Button */}
              <button
                onClick={handleSaveToggle}
                title={saved ? 'Remove from Saved' : 'Save Video'}
                className={`pointer-events-auto p-2 rounded-full backdrop-blur-md transition-all ${
                  saved
                    ? 'bg-[#1C201D] text-[#D4AF37] shadow-md'
                    : 'bg-[#1C201D]/80 text-[#FFFFFF] hover:text-[#D4AF37] hover:bg-[#1C201D]'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${saved ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Duration Pill */}
            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-[#1C201D]/90 text-[#FFFFFF] text-[11px] font-mono font-medium flex items-center gap-1 backdrop-blur-sm z-10">
              <Clock className="w-3 h-3 text-[#D4AF37]" />
              {duration}
            </div>
          </>
        )}

        {/* Watch Progress Bar */}
        {watchState && watchState.progress_percent > 0 && (
          <div className="absolute bottom-0 inset-x-0 h-1.5 bg-[#1C201D] z-20">
            <div
              className={`h-full ${watchState.completed ? 'bg-[#2D5A3F]' : 'bg-[#D4AF37]'}`}
              style={{ width: `${watchState.progress_percent}%` }}
            />
          </div>
        )}
      </div>

      {/* Content Info Area with Explicit Contrast Colors */}
      <div className="p-4 flex-1 flex flex-col justify-between bg-[#FFFFFF]">
        <div>
          <div className="flex items-center justify-between text-xs text-[#2D5A3F] font-semibold mb-1.5">
            <span className="truncate max-w-[190px]">{subject} • {topic}</span>
            
            {/* Options Menu Trigger */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-1 rounded-full text-[#6C706D] hover:text-[#1C201D] hover:bg-[#EDE8DB]/50 transition-colors"
                title="More options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {/* Quick Actions Dropdown Menu */}
              {showMenu && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-6 w-48 bg-[#FFFFFF] rounded-xl shadow-xl border border-[#1C201D]/10 py-1 z-30 text-xs text-[#1C201D]"
                >
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onSelect(video);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-[#EDE8DB]/50 flex items-center gap-2"
                  >
                    <Play className="w-3.5 h-3.5 text-[#2D5A3F]" /> Watch Lesson
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      navigate(`/practice?topic=${encodeURIComponent(topic)}`);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-[#EDE8DB]/50 flex items-center gap-2"
                  >
                    <BrainCircuit className="w-3.5 h-3.5 text-[#C86D51]" /> Practice Topic
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      navigate(`/study-ai?q=${encodeURIComponent(`Explain key concepts from: ${title}`)}`);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-[#EDE8DB]/50 flex items-center gap-2"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-[#D4AF37]" /> Ask StudyMate
                  </button>
                  {video?.source_url && (
                    <a
                      href={video.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setShowMenu(false)}
                      className="w-full px-3 py-2 text-left hover:bg-[#EDE8DB]/50 flex items-center gap-2 border-t border-[#1C201D]/10 text-[#6C706D]"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Watch on YouTube
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          <h3 className="font-semibold text-sm text-[#1C201D] line-clamp-2 leading-snug group-hover:text-[#2D5A3F] transition-colors">
            {title}
          </h3>
        </div>

        {/* Real Channel Branding & Metadata */}
        <div className="mt-3 pt-3 border-t border-[#1C201D]/10 flex items-center justify-between text-xs text-[#6C706D]">
          <div className="flex items-center gap-2 font-medium text-[#1C201D] truncate">
            <ChannelAvatar channelName={channelName} avatarUrl={video?.channel_avatar_url} size="sm" />
            <span className="truncate max-w-[130px] px-2 py-0.5 rounded bg-[#EDE8DB]/60 text-[#1C201D] text-[11px] font-semibold">
              {channelName}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-[#6C706D] shrink-0">
            {formattedDate && (
              <span className="hidden sm:inline-flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#6C706D]" /> {formattedDate}
              </span>
            )}

            {watchState ? (
              <span className="font-medium text-[#2D5A3F] flex items-center gap-1">
                {watchState.completed ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2D5A3F]" /> Done
                  </>
                ) : (
                  <>{formatTime(watchState.last_position)}</>
                )}
              </span>
            ) : (
              <span>{video?.view_count || 'Verified'}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
