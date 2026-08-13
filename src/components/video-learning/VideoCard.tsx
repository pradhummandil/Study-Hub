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
    LECTURE: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    ONE_SHOT: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    PYQ: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    REVISION: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    CRASH_COURSE: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    SHORT: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20',
    STRATEGY: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
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
      className={`group relative bg-white/90 dark:bg-slate-900/90 border rounded-[20px] overflow-hidden transition-all duration-300 cursor-pointer flex flex-col justify-between ${
        isHovered
          ? 'border-blue-500/40 shadow-xl shadow-blue-500/10 -translate-y-1'
          : 'border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md'
      }`}
    >
      {/* Thumbnail & Preview Player Area */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
        {showPreview ? (
          <div className="relative w-full h-full">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${video.youtube_video_id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${video.youtube_video_id}&modestbranding=1&rel=0`}
              title={video.title}
              className="w-full h-full border-0 pointer-events-none scale-105"
              allow="autoplay; encrypted-media"
            />
            {/* Preview indicator badge */}
            <div className="absolute top-2 left-2 px-2.5 py-1 rounded-full bg-slate-950/80 text-cyan-400 text-[10px] font-semibold flex items-center gap-1 backdrop-blur-md border border-cyan-500/30">
              <VolumeX className="w-3 h-3 text-cyan-400 animate-pulse" />
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
            <div className="absolute inset-0 bg-slate-950/30 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/40 transform scale-90 group-hover:scale-100 transition-transform">
                <Play className="w-5 h-5 fill-current ml-0.5" />
              </div>
            </div>

            {/* Top Badges */}
            <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-950/70 text-white backdrop-blur-md border border-white/20">
                  {video.exam}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase backdrop-blur-md border ${
                    badgeColorMap[video.video_type] || 'bg-slate-900/80 text-slate-200 border-slate-700'
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
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                    : 'bg-slate-950/60 text-slate-200 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${saved ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Duration Pill */}
            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-slate-950/85 text-slate-200 text-[11px] font-mono font-medium flex items-center gap-1 backdrop-blur-sm">
              <Clock className="w-3 h-3 text-cyan-400" />
              {video.duration || 'Video'}
            </div>
          </>
        )}

        {/* Watch Progress Bar */}
        {watchState && watchState.progress_percent > 0 && (
          <div className="absolute bottom-0 inset-x-0 h-1.5 bg-slate-800 z-10">
            <div
              className={`h-full ${watchState.completed ? 'bg-emerald-500' : 'bg-blue-500'}`}
              style={{ width: `${watchState.progress_percent}%` }}
            />
          </div>
        )}
      </div>

      {/* Content Info Area */}
      <div className="p-4 flex-1 flex flex-col justify-between bg-white dark:bg-slate-900">
        <div>
          <div className="flex items-center justify-between text-xs text-blue-600 dark:text-cyan-400 font-semibold mb-1">
            <span className="truncate max-w-[200px]">{video.subject} • {video.topic}</span>
            
            {/* Options Menu Trigger */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="More options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {/* Quick Actions Dropdown Menu */}
              {showMenu && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-6 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-30 text-xs text-slate-700 dark:text-slate-200"
                >
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onSelect(video);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                  >
                    <Play className="w-3.5 h-3.5 text-blue-500" /> Watch Lesson
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      navigate(`/practice?topic=${encodeURIComponent(video.topic)}`);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                  >
                    <BrainCircuit className="w-3.5 h-3.5 text-purple-500" /> Practice Topic
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      navigate(`/study-ai?q=${encodeURIComponent(`Explain key concepts from: ${video.title}`)}`);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-cyan-500" /> Ask StudyMate
                  </button>
                  <a
                    href={video.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowMenu(false)}
                    className="w-full px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 border-t border-slate-100 dark:border-slate-700/50 text-slate-500"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Watch on YouTube
                  </a>
                </div>
              )}
            </div>
          </div>

          <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-cyan-300 transition-colors">
            {video.title}
          </h3>
        </div>

        {/* Real Channel Branding & Metadata */}
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300 truncate">
            <img
              src={channelAvatarUrl}
              alt={video.channel_name || 'Channel Avatar'}
              className="w-5 h-5 rounded-full object-cover shrink-0 border border-blue-500/30"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <span className="truncate max-w-[140px]">{video.channel_name || 'Physics Wallah'}</span>
          </div>

          {watchState ? (
            <span className="text-[11px] font-medium text-blue-600 dark:text-cyan-400 flex items-center gap-1 shrink-0">
              {watchState.completed ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Done
                </>
              ) : (
                <>{formatTime(watchState.last_position)}</>
              )}
            </span>
          ) : (
            <span className="text-[11px] text-slate-400 shrink-0">
              {video.view_count || 'Verified'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
