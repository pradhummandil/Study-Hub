import { useState, useRef, useEffect } from 'react';
import { Play, Heart, CheckCircle2, Clock, VolumeX, MoreVertical, ExternalLink, HelpCircle, BrainCircuit } from 'lucide-react';
import type { YouTubeVideo } from '../../types/video-learning';
import { isItemSaved, toggleSaveItem, getVideoWatchState, formatTime } from '../../lib/videoLearningApi';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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
  const [saved, setSaved] = useState(() => isItemSaved(video.id, 'video'));
  const [isHovered, setIsHovered] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const watchState = getVideoWatchState(video.youtube_video_id);

  // Subscribe to global active preview changes
  useEffect(() => {
    const handleGlobalChange = () => {
      if (globalActivePreviewVideoId !== video.youtube_video_id && showPreview) {
        setShowPreview(false);
      }
    };
    previewListeners.add(handleGlobalChange);
    return () => {
      previewListeners.delete(handleGlobalChange);
    };
  }, [video.youtube_video_id, showPreview]);

  // Handle desktop mouse enter for 600ms hover preview trigger
  const handleMouseEnter = () => {
    setIsHovered(true);
    // Disable hover preview on touch screens or small devices
    const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
    if (isTouchDevice || window.innerWidth < 768) return;

    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      setActivePreview(video.youtube_video_id);
      setShowPreview(true);
    }, 650);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setShowMenu(false);
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    if (showPreview) {
      setShowPreview(false);
      if (globalActivePreviewVideoId === video.youtube_video_id) {
        setActivePreview(null);
      }
    }
  };

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSaveItem(user?.id || 'guest_user', video.id, 'video').then((nowSaved) => {
      setSaved(nowSaved);
    });
  };

  const badgeColorMap: Record<string, string> = {
    LECTURE: 'bg-[#EAF2F7] text-[#1F5F8B] border-[#1F5F8B]/20',
    ONE_SHOT: 'bg-[#2E8B72]/10 text-[#2E8B72] border-[#2E8B72]/20',
    PYQ: 'bg-[#F7E7D0] text-[#10233F] border-[#10233F]/10',
    REVISION: 'bg-[#FCDAB7]/30 text-[#10233F] border-[#10233F]/10',
    CRASH_COURSE: 'bg-[#C95C5C]/10 text-[#C95C5C] border-[#C95C5C]/20',
    SHORT: 'bg-[#EAF2F7] text-[#1F5F8B] border-[#1F5F8B]/20',
    STRATEGY: 'bg-[#F7E7D0] text-[#10233F] border-[#10233F]/10',
  };

  const thumbnailUrl = video.thumbnail || video.thumbnail_url || `https://i.ytimg.com/vi/${video.youtube_video_id}/hqdefault.jpg`;

  const channelAvatarUrl =
    video.channel_handle === '@PW-JEEWallah'
      ? 'https://yt3.googleusercontent.com/9C0637F55s9zY8P8e-28D6uY75N4m_uP-b7h_zQ2F2eZ7s-f1A_7L2v1t-G-V9e_X-8v_b-1=s176-c-k-c0x00ffffff-no-rj'
      : video.channel_handle === '@PWNEET-Official'
      ? 'https://yt3.googleusercontent.com/w2Yv2S5e8B9A0M9B9B9B9B9B9B9B9B9B9B9B9B9B9B9B9B9B9B9B9B9B9B9B9B9B=s176-c-k-c0x00ffffff-no-rj'
      : 'https://yt3.googleusercontent.com/ytc/AIdro_k9_N_v0-7-L8v8-8-8-8-8-8-8-8-8-8-8-8=s176-c-k-c0x00ffffff-no-rj';

  return (
    <div
      onClick={() => onSelect(video)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group relative bg-[#FCFBF8] border rounded-[20px] overflow-hidden transition-all duration-300 cursor-pointer flex flex-col justify-between ${
        isHovered
          ? 'border-[#1F5F8B]/40 shadow-[0_14px_40px_rgba(16,35,63,0.08)] -translate-y-1'
          : 'border-[#10233F]/08 shadow-sm hover:shadow-md'
      }`}
    >
      {/* Thumbnail & Preview Player Area */}
      <div className="relative aspect-video w-full overflow-hidden bg-[#10233F] rounded-[18px]">
        {showPreview ? (
          <div className="relative w-full h-full">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${video.youtube_video_id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${video.youtube_video_id}&modestbranding=1&rel=0`}
              title={video.title}
              className="w-full h-full border-0 pointer-events-none scale-105"
              allow="autoplay; encrypted-media"
            />
            {/* Preview indicator badge */}
            <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-[#10233F]/90 text-[#4E88B7] text-[10px] font-semibold flex items-center gap-1 backdrop-blur-md border border-[#4E88B7]/30">
              <VolumeX className="w-3 h-3 text-[#4E88B7] animate-pulse" />
              <span>Preview · Muted</span>
            </div>
          </div>
        ) : (
          <>
            <img
              src={thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${video.youtube_video_id}/hqdefault.jpg`;
              }}
            />

            {/* Hover Overlay Play Button */}
            <div className="absolute inset-0 bg-[#10233F]/30 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-[#1F5F8B] text-white flex items-center justify-center shadow-lg shadow-[#1F5F8B]/40 transform scale-90 group-hover:scale-100 transition-transform">
                <Play className="w-5 h-5 fill-current ml-0.5" />
              </div>
            </div>

            {/* Top Badges */}
            <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#10233F]/90 text-[#FCFBF8] backdrop-blur-md border border-white/20">
                  {video.exam}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase backdrop-blur-md border ${
                    badgeColorMap[video.video_type] || 'bg-[#10233F]/80 text-[#FCFBF8] border-white/20'
                  }`}
                >
                  {video.video_type.replace('_', ' ')}
                </span>
              </div>

              {/* Save Heart Button */}
              <button
                onClick={handleSaveToggle}
                title={saved ? 'Remove from Saved' : 'Save Video'}
                className={`pointer-events-auto p-2 rounded-full backdrop-blur-md transition-all ${
                  saved
                    ? 'bg-[#172033] text-[#FCDAB7] shadow-md'
                    : 'bg-[#10233F]/80 text-[#FCFBF8] hover:text-[#FCDAB7] hover:bg-[#10233F]'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${saved ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Duration Pill */}
            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-[#10233F]/90 text-[#FCFBF8] text-[11px] font-mono font-medium flex items-center gap-1 backdrop-blur-sm">
              <Clock className="w-3 h-3 text-[#4E88B7]" />
              {video.duration || 'Video'}
            </div>
          </>
        )}

        {/* Watch Progress Bar */}
        {watchState && watchState.progress_percent > 0 && (
          <div className="absolute bottom-0 inset-x-0 h-1.5 bg-[#10233F] z-10">
            <div
              className={`h-full ${watchState.completed ? 'bg-[#2E8B72]' : 'bg-[#1F5F8B]'}`}
              style={{ width: `${watchState.progress_percent}%` }}
            />
          </div>
        )}
      </div>

      {/* Content Info Area */}
      <div className="p-4 flex-1 flex flex-col justify-between bg-[#FCFBF8]">
        <div>
          <div className="flex items-center justify-between text-xs text-[#1F5F8B] font-semibold mb-1">
            <span className="truncate max-w-[200px]">{video.subject} • {video.topic}</span>
            
            {/* Options Menu Trigger */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-1 rounded-full text-[#627083] hover:text-[#172033] hover:bg-[#EAF2F7] transition-colors"
                title="More options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {/* Quick Actions Dropdown Menu */}
              {showMenu && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-6 w-48 bg-[#FCFBF8] rounded-xl shadow-xl border border-[#10233F]/12 py-1 z-30 text-xs text-[#172033]"
                >
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onSelect(video);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-[#EAF2F7] flex items-center gap-2"
                  >
                    <Play className="w-3.5 h-3.5 text-[#1F5F8B]" /> Watch Lesson
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      navigate(`/practice?topic=${encodeURIComponent(video.topic)}`);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-[#EAF2F7] flex items-center gap-2"
                  >
                    <BrainCircuit className="w-3.5 h-3.5 text-[#4E88B7]" /> Practice Topic
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      navigate(`/study-ai?q=${encodeURIComponent(`Explain key concepts from: ${video.title}`)}`);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-[#EAF2F7] flex items-center gap-2"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-[#4E88B7]" /> Ask StudyMate
                  </button>
                  <a
                    href={video.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowMenu(false)}
                    className="w-full px-3 py-2 text-left hover:bg-[#EAF2F7] flex items-center gap-2 border-t border-[#10233F]/08 text-[#627083]"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Watch on YouTube
                  </a>
                </div>
              )}
            </div>
          </div>

          <h3 className="font-semibold text-sm text-[#172033] line-clamp-2 leading-snug group-hover:text-[#1F5F8B] transition-colors">
            {video.title}
          </h3>
        </div>

        {/* Real Channel Branding & Metadata */}
        <div className="mt-3 pt-3 border-t border-[#10233F]/08 flex items-center justify-between text-xs text-[#627083]">
          <div className="flex items-center gap-2 font-medium text-[#172033] truncate">
            <img
              src={channelAvatarUrl}
              alt={video.channel_name || 'Channel Avatar'}
              className="w-5 h-5 rounded-full object-cover shrink-0 border border-[#10233F]/10 bg-[#F7E7D0]"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <span className="truncate max-w-[140px] px-2 py-0.5 rounded bg-[#F7E7D0]/60 text-[#10233F] text-[11px] font-semibold">{video.channel_name || 'Physics Wallah'}</span>
          </div>

          {watchState ? (
            <span className="text-[11px] font-medium text-[#1F5F8B] flex items-center gap-1 shrink-0">
              {watchState.completed ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2E8B72]" /> Done
                </>
              ) : (
                <>{formatTime(watchState.last_position)}</>
              )}
            </span>
          ) : (
            <span className="text-[11px] text-[#627083] shrink-0">
              {video.view_count || 'Verified'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

