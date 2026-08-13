// src/pages/video-learning/VideoChannelPage.tsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ShieldCheck, ArrowLeft, ExternalLink, Video, Layers, Film } from 'lucide-react';
import { fetchChannels, fetchVideos, fetchPlaylists } from '../../lib/videoLearningApi';
import type { YouTubeChannel, YouTubeVideo, YouTubePlaylist } from '../../types/video-learning';
import { VideoCard } from '../../components/video-learning/VideoCard';
import { PlaylistCard } from '../../components/video-learning/PlaylistCard';

export default function VideoChannelPage() {
  const { channelId } = useParams<{ channelId: string }>();
  const navigate = useNavigate();

  const [channel, setChannel] = useState<YouTubeChannel | null>(null);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [playlists, setPlaylists] = useState<YouTubePlaylist[]>([]);
  const [activeTab, setActiveTab] = useState<'videos' | 'playlists' | 'shorts'>('videos');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!channelId) return;
      setLoading(true);
      const allChannels = await fetchChannels();
      const lower = channelId.toLowerCase();
      const found = allChannels.find(
        (c) =>
          c.id === channelId ||
          c.channel_handle.toLowerCase() === lower ||
          c.channel_handle.toLowerCase() === `@${lower}` ||
          c.youtube_channel_id === channelId
      );

      const activeChan = found || allChannels[0];
      setChannel(activeChan);

      if (activeChan) {
        const allV = await fetchVideos({ channelId: activeChan.id });
        setVideos(allV);

        const allP = await fetchPlaylists(undefined, activeChan.id);
        setPlaylists(allP);
      }
      setLoading(false);
    }
    load();
  }, [channelId]);

  if (loading || !channel) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  const normalVideos = videos.filter((v) => !v.is_short);
  const shortVideos = videos.filter((v) => v.is_short);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <Helmet>
        <title>{channel.channel_name} | Verified Educational Channel | Study Hub</title>
        <meta name="description" content={channel.description || channel.channel_name} />
      </Helmet>

      {/* CHANNEL PROFILE HERO BANNER */}
      <div className="bg-slate-900 border-b border-slate-800 pt-8 pb-6 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {channel.banner_url && (
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <img src={channel.banner_url} alt="Channel Banner" className="w-full h-full object-cover" />
          </div>
        )}

        <div className="max-w-7xl mx-auto space-y-6 relative z-10">
          <Link to="/video-learning" className="inline-flex items-center gap-2 text-xs text-cyan-400 font-semibold hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Video Catalog
          </Link>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img
                src={channel.avatar_url}
                alt={channel.channel_name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-cyan-500/40 shadow-xl shrink-0"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold text-white">{channel.channel_name}</h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> Verified Source
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-mono block">{channel.channel_handle} • {channel.subscriber_count || 'Official Partner'}</span>
                <p className="text-xs text-slate-300 max-w-xl line-clamp-2 leading-relaxed">{channel.description}</p>
              </div>
            </div>

            <a
              href={channel.youtube_url}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-2 transition-colors shrink-0 shadow-lg shadow-red-600/20"
            >
              Watch on YouTube <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* TABS */}
          <div className="flex items-center gap-2 border-t border-slate-800 pt-4">
            <button
              onClick={() => setActiveTab('videos')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'videos' ? 'bg-cyan-400 text-slate-950 font-bold' : 'bg-slate-950/80 text-slate-400 hover:text-white'
              }`}
            >
              <Video className="w-4 h-4" /> Videos ({normalVideos.length})
            </button>
            <button
              onClick={() => setActiveTab('playlists')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'playlists' ? 'bg-cyan-400 text-slate-950 font-bold' : 'bg-slate-950/80 text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" /> Playlists ({playlists.length})
            </button>
            <button
              onClick={() => setActiveTab('shorts')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'shorts' ? 'bg-cyan-400 text-slate-950 font-bold' : 'bg-slate-950/80 text-slate-400 hover:text-white'
              }`}
            >
              <Film className="w-4 h-4" /> Shorts ({shortVideos.length})
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'videos' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {normalVideos.map((vid) => (
              <VideoCard
                key={vid.id}
                video={vid}
                onSelect={(v) => navigate(`/video-learning/video/${v.youtube_video_id}`)}
              />
            ))}
          </div>
        )}

        {activeTab === 'playlists' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {playlists.map((pl) => (
              <PlaylistCard
                key={pl.id}
                playlist={pl}
                onOpen={(p) => navigate(`/video-learning/playlist/${p.id}`)}
              />
            ))}
          </div>
        )}

        {activeTab === 'shorts' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {shortVideos.map((vid) => (
              <VideoCard
                key={vid.id}
                video={vid}
                onSelect={(v) => navigate(`/video-learning/video/${v.youtube_video_id}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
