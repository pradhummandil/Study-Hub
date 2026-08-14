import React, { useState } from 'react';
import { Layers, Play, ShieldCheck, Heart } from 'lucide-react';
import type { YouTubePlaylist } from '../../types/video-learning';
import { isItemSaved, toggleSaveItem } from '../../lib/videoLearningApi';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface PlaylistCardProps {
  playlist: YouTubePlaylist;
  onOpen: (playlist: YouTubePlaylist) => void;
}

export const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist, onOpen }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(() => isItemSaved(playlist?.id || '', 'playlist'));
  const [thumbError, setThumbError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!playlist?.id) return;
    const nowSaved = await toggleSaveItem(user.id, playlist.id, 'playlist');
    setSaved(nowSaved);
  };

  const channelAvatarUrl =
    playlist?.channel_name?.includes('JEE')
      ? 'https://yt3.googleusercontent.com/9C0637F55s9zY8P8e-28D6uY75N4m_uP-b7h_zQ2F2eZ7s-f1A_7L2v1t-G-V9e_X-8v_b-1=s176-c-k-c0x00ffffff-no-rj'
      : playlist?.channel_name?.includes('NEET')
      ? 'https://yt3.googleusercontent.com/w2Yv2S5e8B9A0M9B9B9B9B9B9B9B9B9B9B9B9B9B9B9B9B9B9B9B9B9B9B9B9B9B=s176-c-k-c0x00ffffff-no-rj'
      : 'https://yt3.googleusercontent.com/ytc/AIdro_k9_N_v0-7-L8v8-8-8-8-8-8-8-8-8-8-8-8=s176-c-k-c0x00ffffff-no-rj';

  const thumbUrl = playlist?.thumbnail || playlist?.thumbnail_url;
  const title = playlist?.title || 'Course Playlist';
  const exam = playlist?.exam || 'General';
  const subject = playlist?.subject || 'General Studies';
  const channelName = playlist?.channel_name || 'Official Channel';

  return (
    <div
      onClick={() => onOpen(playlist)}
      className="group relative bg-[#FFFFFF] border border-[#1C201D]/10 hover:border-[#2D5A3F]/40 rounded-[20px] overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-[#1C201D]">
        {!thumbError && thumbUrl ? (
          <img
            src={thumbUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setThumbError(true)}
          />
        ) : (
          <div className="w-full h-full bg-[#EDE8DB] flex flex-col items-center justify-center text-[#6C706D] p-4 text-center">
            <Layers className="w-8 h-8 text-[#2D5A3F]/50 mb-1" />
            <span className="text-xs font-bold text-[#1C201D]">{title}</span>
          </div>
        )}

        {/* Stack overlay badge indicating playlist video count */}
        <div className="absolute top-0 right-0 bottom-0 w-2/5 bg-[#1C201D]/85 backdrop-blur-md border-l border-[#FFFFFF]/10 flex flex-col items-center justify-center p-3 text-center">
          <Layers className="w-6 h-6 text-[#D4AF37] mb-1" />
          <span className="text-xl font-bold text-[#FFFFFF]">{playlist?.video_count || 12}</span>
          <span className="text-[10px] uppercase tracking-wider text-[#EDE8DB] font-semibold">Lessons</span>
        </div>

        {/* Exam Badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#1C201D]/90 text-[#FFFFFF] backdrop-blur-md border border-[#FFFFFF]/20">
            {exam}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#2D5A3F]/30 text-[#EDE8DB] border border-[#2D5A3F]/50 backdrop-blur-md">
            Playlist
          </span>
        </div>

        {/* Save Toggle */}
        <button
          onClick={handleSaveToggle}
          title={saved ? 'Remove from Saved' : 'Save Playlist'}
          className={`absolute bottom-2 left-2 p-2 rounded-full backdrop-blur-md transition-all z-10 ${
            saved
              ? 'bg-[#1C201D] text-[#D4AF37] shadow-md'
              : 'bg-[#1C201D]/80 text-[#FFFFFF] hover:text-[#D4AF37] hover:bg-[#1C201D]'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${saved ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between bg-[#FFFFFF]">
        <div>
          <span className="text-xs text-[#2D5A3F] font-semibold block mb-1">{subject}</span>
          <h3 className="font-semibold text-sm text-[#1C201D] line-clamp-2 leading-snug group-hover:text-[#2D5A3F] transition-colors">
            {title}
          </h3>
          {playlist?.description && (
            <p className="text-xs text-[#6C706D] line-clamp-2 mt-1.5 leading-relaxed">
              {playlist.description}
            </p>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-[#1C201D]/10 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-medium text-[#1C201D] truncate">
            {!avatarError && channelAvatarUrl ? (
              <img
                src={channelAvatarUrl}
                alt={channelName}
                className="w-4 h-4 rounded-full object-cover shrink-0"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <div className="w-4 h-4 rounded-full bg-[#2D5A3F]/20 text-[#2D5A3F] flex items-center justify-center text-[9px] font-bold shrink-0">
                {channelName.charAt(0)}
              </div>
            )}
            <ShieldCheck className="w-3.5 h-3.5 text-[#2D5A3F] shrink-0" />
            <span className="truncate max-w-[130px]">{channelName}</span>
          </div>

          <span className="text-xs text-[#2D5A3F] font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
            Start <Play className="w-3 h-3 fill-current ml-0.5" />
          </span>
        </div>
      </div>
    </div>
  );
};
