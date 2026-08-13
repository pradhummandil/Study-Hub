import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Layers, CheckCircle2, ShieldCheck, ArrowLeft, Clock,
  Heart, Play, Bot, BrainCircuit
} from 'lucide-react';
import type { YouTubePlaylist, YouTubeVideo } from '../../types/video-learning';
import {
  fetchPlaylistById,
  getVideoWatchState,
  isItemSaved,
  toggleSaveItem
} from '../../lib/videoLearningApi';
import { useAuth } from '../../context/AuthContext';

export default function VideoPlaylistPage() {
  const { playlistId } = useParams<{ playlistId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [playlist, setPlaylist] = useState<YouTubePlaylist | null>(null);
  const [activeVideo, setActiveVideo] = useState<YouTubeVideo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      if (!playlistId) return;
      setLoading(true);
      const data = await fetchPlaylistById(playlistId);
      setPlaylist(data);
      if (data && data.videos && data.videos.length > 0) {
        setActiveVideo(data.videos[0]);
      }
      if (data) {
        setSaved(isItemSaved(data.id, 'playlist'));
      }
      setLoading(false);
    }
    load();
  }, [playlistId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-100">Playlist Not Found</h2>
        <Link to="/video-learning" className="text-cyan-400 text-sm flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Video Learning
        </Link>
      </div>
    );
  }

  const handleSaveToggle = async () => {
    const s = await toggleSaveItem(user?.id || 'guest_user', playlist.id, 'playlist');
    setSaved(s);
  };

  const embedUrl = activeVideo
    ? `https://www.youtube-nocookie.com/embed/${activeVideo.youtube_video_id}?autoplay=1&modestbranding=1&rel=0`
    : '';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <Helmet>
        <title>{playlist.title} | {playlist.exam} Course | Study Hub</title>
        <meta name="description" content={playlist.description || playlist.title} />
      </Helmet>

      {/* TOP NAVBAR */}
      <header className="bg-slate-900/90 border-b border-slate-800 sticky top-0 z-30 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/video-learning"
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Back to Catalog"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {playlist.exam}
              </span>
              <span className="text-xs text-slate-400 font-medium">{playlist.subject}</span>
            </div>
            <h1 className="text-sm sm:text-base font-bold text-slate-100 line-clamp-1">{playlist.title}</h1>
          </div>
        </div>

        <button
          onClick={handleSaveToggle}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            saved
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
              : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
          }`}
        >
          <Heart className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
          {saved ? 'Saved Playlist' : 'Save Playlist'}
        </button>
      </header>

      {/* SPLIT SCREEN PLAYLIST PLAYER & LESSONS */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* MAIN EMBED PLAYER AREA */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative aspect-video w-full rounded-[24px] overflow-hidden bg-black shadow-2xl border border-slate-800">
            {activeVideo ? (
              <iframe
                src={embedUrl}
                title={activeVideo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                Select a lesson from the outline to begin
              </div>
            )}
          </div>

          {activeVideo && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-[24px] p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-cyan-400 font-semibold">{activeVideo.subject} • {activeVideo.topic}</span>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-100 mt-0.5">{activeVideo.title}</h2>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => navigate(`/study-ai?q=${encodeURIComponent(`Explain key concepts from: ${activeVideo.title}`)}`)}
                    className="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <Bot className="w-4 h-4" /> Ask AI
                  </button>
                  <button
                    onClick={() => navigate(`/practice?topic=${encodeURIComponent(activeVideo.topic)}`)}
                    className="px-3.5 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <BrainCircuit className="w-4 h-4" /> Practice
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-400 border-t border-slate-800 pt-3">
                <span className="flex items-center gap-1 text-slate-300 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" /> {playlist.channel_name || 'Physics Wallah'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" /> {activeVideo.duration || 'Lecture'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* LESSON SEQUENCE OUTLINE SIDEBAR */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-[24px] p-5 flex flex-col justify-between h-[640px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" /> Course Outline
              </h3>
              <span className="text-xs text-slate-400">
                {playlist.videos?.length || 0} Lessons in sequence
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 py-3 scrollbar-thin">
            {playlist.videos?.map((vid, idx) => {
              const isActive = activeVideo?.id === vid.id || activeVideo?.youtube_video_id === vid.youtube_video_id;
              const watchState = getVideoWatchState(vid.youtube_video_id);

              return (
                <div
                  key={vid.id}
                  onClick={() => setActiveVideo(vid)}
                  className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all flex items-start gap-3 ${
                    isActive
                      ? 'bg-blue-600/20 border-blue-500/50 text-white font-semibold shadow-md'
                      : 'bg-slate-950/80 border-slate-800/80 text-slate-300 hover:bg-slate-800/90 hover:text-white'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>

                  <div className="flex-1 space-y-1 overflow-hidden">
                    <h4 className="line-clamp-2 leading-snug">{vid.title}</h4>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>{vid.duration}</span>
                      {watchState?.completed ? (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Done
                        </span>
                      ) : isActive ? (
                        <span className="text-cyan-400 font-semibold flex items-center gap-1">
                          <Play className="w-3 h-3 fill-current" /> Playing
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
