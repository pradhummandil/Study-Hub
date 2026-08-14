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
      <div className="min-h-screen bg-[#F8F6F0] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-[#2D5A3F] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="min-h-screen bg-[#F8F6F0] text-[#1C201D] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <h2 className="text-xl font-serif font-bold text-[#1C201D]">Playlist Not Found</h2>
        <Link to="/video-learning" className="text-[#2D5A3F] text-sm flex items-center gap-1 font-bold">
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
    <div className="min-h-screen bg-[#F8F6F0] text-[#1C201D] pb-20">
      <Helmet>
        <title>{playlist.title} | {playlist.exam} Course | Study Hub</title>
        <meta name="description" content={playlist.description || playlist.title} />
      </Helmet>

      {/* TOP NAVBAR */}
      <header className="bg-[#FFFFFF] border-b border-[#1C201D]/10 sticky top-0 z-30 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            to="/video-learning"
            className="p-2 rounded-xl bg-[#EDE8DB] text-[#1C201D] hover:bg-[#2D5A3F] hover:text-[#FFFFFF] transition-colors"
            title="Back to Catalog"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#2D5A3F]/10 text-[#2D5A3F] border border-[#2D5A3F]/20">
                {playlist.exam}
              </span>
              <span className="text-xs text-[#6C706D] font-medium">{playlist.subject}</span>
            </div>
            <h1 className="text-sm sm:text-base font-serif font-bold text-[#1C201D] line-clamp-1">{playlist.title}</h1>
          </div>
        </div>

        <button
          onClick={handleSaveToggle}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            saved
              ? 'bg-[#1C201D] text-[#D4AF37] shadow-md'
              : 'bg-[#EDE8DB] text-[#1C201D] hover:bg-[#EDE8DB]/80 border border-[#1C201D]/10'
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
          <div className="relative aspect-video w-full rounded-[24px] overflow-hidden bg-[#1C201D] shadow-xl border border-[#1C201D]/10">
            {activeVideo ? (
              <iframe
                src={embedUrl}
                title={activeVideo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="flex items-center justify-center h-full text-[#6C706D] text-sm">
                Select a lesson from the outline to begin
              </div>
            )}
          </div>

          {activeVideo && (
            <div className="bg-[#FFFFFF] border border-[#1C201D]/10 rounded-[24px] p-6 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-[#2D5A3F] font-semibold">{activeVideo.subject} • {activeVideo.topic}</span>
                  <h2 className="text-lg sm:text-xl font-serif font-bold text-[#1C201D] mt-0.5">{activeVideo.title}</h2>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => navigate(`/study-ai?q=${encodeURIComponent(`Explain key concepts from: ${activeVideo.title}`)}`)}
                    className="px-3.5 py-2 rounded-xl bg-[#2D5A3F]/10 hover:bg-[#2D5A3F]/20 text-[#2D5A3F] border border-[#2D5A3F]/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <Bot className="w-4 h-4 text-[#C86D51]" /> Ask AI
                  </button>
                  <button
                    onClick={() => navigate(`/practice?topic=${encodeURIComponent(activeVideo.topic)}`)}
                    className="px-3.5 py-2 rounded-xl bg-[#C86D51]/10 hover:bg-[#C86D51]/20 text-[#C86D51] border border-[#C86D51]/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <BrainCircuit className="w-4 h-4" /> Practice
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-[#6C706D] border-t border-[#1C201D]/10 pt-3">
                <span className="flex items-center gap-1 text-[#1C201D] font-semibold">
                  <ShieldCheck className="w-4 h-4 text-[#2D5A3F]" /> {playlist.channel_name || 'Physics Wallah'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5 text-[#D4AF37]" /> {activeVideo.duration || 'Lecture'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* LESSON SEQUENCE OUTLINE SIDEBAR */}
        <div className="bg-[#FFFFFF] border border-[#1C201D]/10 rounded-[24px] p-5 flex flex-col justify-between h-[640px] shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#1C201D]/10">
            <div>
              <h3 className="text-sm font-serif font-bold text-[#1C201D] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#2D5A3F]" /> Course Outline
              </h3>
              <span className="text-xs text-[#6C706D]">
                {playlist.videos?.length || 0} Lessons in sequence
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 py-3 no-scrollbar">
            {playlist.videos?.map((vid, idx) => {
              const isActive = activeVideo?.id === vid.id || activeVideo?.youtube_video_id === vid.youtube_video_id;
              const watchState = getVideoWatchState(vid.youtube_video_id);

              return (
                <div
                  key={vid.id}
                  onClick={() => setActiveVideo(vid)}
                  className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all flex items-start gap-3 ${
                    isActive
                      ? 'bg-[#2D5A3F]/10 border-[#2D5A3F] text-[#1C201D] font-semibold shadow-sm'
                      : 'bg-[#EDE8DB]/30 border-[#1C201D]/10 text-[#1C201D] hover:bg-[#EDE8DB]'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-[#EDE8DB] text-[#1C201D] font-mono text-[11px] font-bold flex items-center justify-center shrink-0 border border-[#1C201D]/10">
                    {idx + 1}
                  </div>

                  <div className="flex-1 space-y-1 overflow-hidden">
                    <h4 className="line-clamp-2 leading-snug">{vid.title}</h4>
                    <div className="flex items-center justify-between text-[11px] text-[#6C706D] font-mono">
                      <span>{vid.duration}</span>
                      {watchState?.completed ? (
                        <span className="text-[#2D5A3F] font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Done
                        </span>
                      ) : isActive ? (
                        <span className="text-[#C86D51] font-semibold flex items-center gap-1">
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
