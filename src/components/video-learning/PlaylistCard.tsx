// src/components/video-learning/PlaylistCard.tsx
import React, { useState } from 'react';
import { Layers, Play, ShieldCheck, Heart } from 'lucide-react';
import type { YouTubePlaylist } from '../../types/video-learning';
import { isItemSaved, toggleSaveItem } from '../../lib/videoLearningApi';
import { useAuth } from '../../context/AuthContext';

interface PlaylistCardProps {
  playlist: YouTubePlaylist;
  onOpen: (playlist: YouTubePlaylist) => void;
}

export const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist, onOpen }) => {
  const { user } = useAuth();
  const [saved, setSaved] = useState(() => isItemSaved(playlist.id, 'playlist'));

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const nowSaved = await toggleSaveItem(user?.id || 'guest_user', playlist.id, 'playlist');
    setSaved(nowSaved);
  };

  const channelAvatarUrl =
    playlist.channel_name?.includes('JEE')
      ? 'https://yt3.googleusercontent.com/9C0637F55s9zY8P8e-28D6uY75N4m_uP-b7h_zQ2F2eZ7s-f1A_7L2v1t-G-V9e_X-8v_b-1=s176-c-k-c0x00ffffff-no-rj'
      : playlist.channel_name?.includes('NEET')
      ? 'https://yt3.googleusercontent.com/w2Yv2S5e8B9A0M9B9B9B9B9B9B9B9B9B9B9B9B9B9B9B9B9B9B9B9B9B9B9B9B9B=s176-c-k-c0x00ffffff-no-rj'
      : 'https://yt3.googleusercontent.com/ytc/AIdro_k9_N_v0-7-L8v8-8-8-8-8-8-8-8-8-8-8-8=s176-c-k-c0x00ffffff-no-rj';

  return (
    <div
      onClick={() => onOpen(playlist)}
      className="group relative bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 hover:border-blue-500/40 rounded-[20px] overflow-hidden transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 cursor-pointer flex flex-col justify-between"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
        <img
          src={playlist.thumbnail || playlist.thumbnail_url}
          alt={playlist.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Stack overlay badge indicating playlist video count */}
        <div className="absolute top-0 right-0 bottom-0 w-2/5 bg-slate-950/85 backdrop-blur-md border-l border-white/10 flex flex-col items-center justify-center p-3 text-center">
          <Layers className="w-6 h-6 text-cyan-400 mb-1" />
          <span className="text-xl font-bold text-white">{playlist.video_count || 12}</span>
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Lessons</span>
        </div>

        {/* Exam Badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-950/80 text-white backdrop-blur-md border border-white/20">
            {playlist.exam}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30 backdrop-blur-md">
            Playlist
          </span>
        </div>

        {/* Save Toggle */}
        <button
          onClick={handleSaveToggle}
          title={saved ? 'Remove from Saved' : 'Save Playlist'}
          className={`absolute bottom-2 left-2 p-2 rounded-full backdrop-blur-md transition-all ${
            saved
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
              : 'bg-slate-950/70 text-slate-200 hover:text-white hover:bg-slate-950'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${saved ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between bg-white dark:bg-slate-900">
        <div>
          <span className="text-xs text-blue-600 dark:text-cyan-400 font-semibold block mb-1">{playlist.subject}</span>
          <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-cyan-300 transition-colors">
            {playlist.title}
          </h3>
          {playlist.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
              {playlist.description}
            </p>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300 truncate">
            <img
              src={channelAvatarUrl}
              alt={playlist.channel_name || 'Channel Logo'}
              className="w-4 h-4 rounded-full object-cover shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="truncate max-w-[130px]">{playlist.channel_name || 'Official Channel'}</span>
          </div>

          <span className="text-xs text-blue-600 dark:text-cyan-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
            Start <Play className="w-3 h-3 fill-current ml-0.5" />
          </span>
        </div>
      </div>
    </div>
  );
};
