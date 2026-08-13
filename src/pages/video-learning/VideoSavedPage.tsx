// src/pages/video-learning/VideoSavedPage.tsx
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Bookmark, ArrowLeft, Layers, BookOpen } from 'lucide-react';
import { getLocalSavedItems, fetchVideos, fetchPlaylists } from '../../lib/videoLearningApi';
import type { YouTubeVideo, YouTubePlaylist } from '../../types/video-learning';
import { VideoCard } from '../../components/video-learning/VideoCard';
import { PlaylistCard } from '../../components/video-learning/PlaylistCard';
import { Link, useNavigate } from 'react-router-dom';
import { YouTubePlayerModal } from '../../components/video-learning/YouTubePlayerModal';

export default function VideoSavedPage() {
  const navigate = useNavigate();
  const [savedVideos, setSavedVideos] = useState<YouTubeVideo[]>([]);
  const [savedPlaylists, setSavedPlaylists] = useState<YouTubePlaylist[]>([]);
  const [activeModalVideo, setActiveModalVideo] = useState<YouTubeVideo | null>(null);

  useEffect(() => {
    async function load() {
      const saved = getLocalSavedItems();
      const allVideos = await fetchVideos();
      const allPlaylists = await fetchPlaylists();

      const vSaved = saved
        .filter((s) => s.item_type === 'video')
        .map((s) => allVideos.find((v) => v.id === s.item_id))
        .filter(Boolean) as YouTubeVideo[];

      const pSaved = saved
        .filter((s) => s.item_type === 'playlist')
        .map((s) => allPlaylists.find((p) => p.id === s.item_id))
        .filter(Boolean) as YouTubePlaylist[];

      setSavedVideos(vSaved);
      setSavedPlaylists(pSaved);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <Helmet>
        <title>Saved Videos & Playlists | Study Hub Video Learning</title>
      </Helmet>

      <div className="bg-slate-900/90 border-b border-white/10 px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/video-learning" className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-amber-400" /> Saved Learning Library
              </h1>
              <p className="text-xs text-slate-400">Your bookmarked lectures and course playlists</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* SAVED PLAYLISTS */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" /> Saved Playlists ({savedPlaylists.length})
          </h2>

          {savedPlaylists.length === 0 ? (
            <div className="text-center py-8 bg-slate-900/40 rounded-3xl border border-white/10 text-xs text-slate-400">
              No saved playlists yet. Click the bookmark icon on any playlist card to save!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {savedPlaylists.map((pl) => (
                <PlaylistCard
                  key={pl.id}
                  playlist={pl}
                  onOpen={(p) => navigate(`/video-learning/playlist/${p.id}`)}
                />
              ))}
            </div>
          )}
        </section>

        {/* SAVED VIDEOS */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" /> Saved Videos ({savedVideos.length})
          </h2>

          {savedVideos.length === 0 ? (
            <div className="text-center py-8 bg-slate-900/40 rounded-3xl border border-white/10 text-xs text-slate-400">
              No saved videos yet. Bookmark videos while browsing to add them to your collection.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {savedVideos.map((vid) => (
                <VideoCard
                  key={vid.id}
                  video={vid}
                  onSelect={(v) => setActiveModalVideo(v)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {activeModalVideo && (
        <YouTubePlayerModal
          video={activeModalVideo}
          onClose={() => setActiveModalVideo(null)}
        />
      )}
    </div>
  );
}
