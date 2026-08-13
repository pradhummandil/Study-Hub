// src/pages/video-learning/VideoHistoryPage.tsx
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { History, ArrowLeft, CheckCircle2, Clock } from 'lucide-react';
import { getLocalWatchHistory, fetchVideos, formatTime } from '../../lib/videoLearningApi';
import type { VideoWatchHistory, YouTubeVideo } from '../../types/video-learning';
import { Link } from 'react-router-dom';
import { YouTubePlayerModal } from '../../components/video-learning/YouTubePlayerModal';

export default function VideoHistoryPage() {
  const [historyEntries, setHistoryEntries] = useState<(VideoWatchHistory & { videoDetail?: YouTubeVideo })[]>([]);
  const [activeModalVideo, setActiveModalVideo] = useState<YouTubeVideo | null>(null);

  useEffect(() => {
    async function load() {
      const history = getLocalWatchHistory();
      const allVideos = await fetchVideos();

      const enriched = history.map((h) => {
        const detail = allVideos.find((v) => v.youtube_video_id === h.youtube_video_id);
        return { ...h, videoDetail: detail };
      });

      setHistoryEntries(enriched);
    }
    load();
  }, []);

  const continueWatching = historyEntries.filter((h) => !h.completed && h.progress_percent > 0);
  const completed = historyEntries.filter((h) => h.completed);

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <Helmet>
        <title>Watch History | Study Hub Video Learning</title>
      </Helmet>

      <div className="bg-slate-900/90 border-b border-white/10 px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/video-learning" className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <History className="w-5 h-5 text-cyan-400" /> Watch History
              </h1>
              <p className="text-xs text-slate-400">Resume watching where you left off or review completed lectures</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* CONTINUE WATCHING SECTION */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" /> Continue Watching
          </h2>

          {continueWatching.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/40 rounded-3xl border border-white/10 text-xs text-slate-400">
              No videos currently in progress.<br />
              <Link to="/video-learning" className="text-cyan-400 font-bold hover:underline mt-2 inline-block">
                Start Learning →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {continueWatching.map((item) => {
                if (!item.videoDetail) return null;
                const v = item.videoDetail;
                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveModalVideo(v)}
                    className="bg-slate-900 border border-white/10 hover:border-cyan-500/40 rounded-2xl overflow-hidden cursor-pointer transition-all hover:scale-[1.01] group flex flex-col justify-between"
                  >
                    <div className="relative aspect-video bg-slate-950">
                      <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover" />
                      <div className="absolute bottom-0 inset-x-0 h-1.5 bg-slate-800">
                        <div className="h-full bg-cyan-400" style={{ width: `${item.progress_percent}%` }} />
                      </div>
                      <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-slate-950/80 text-cyan-300 font-mono text-[11px] font-bold backdrop-blur-sm">
                        Resume at {formatTime(item.last_position)}
                      </div>
                    </div>
                    <div className="p-4 space-y-1">
                      <span className="text-[10px] font-bold text-cyan-400 uppercase">{v.subject}</span>
                      <h3 className="text-xs font-semibold text-slate-100 line-clamp-2">{v.title}</h3>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* COMPLETED LECTURES */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Completed Lessons
          </h2>

          {completed.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/40 rounded-3xl border border-white/10 text-xs text-slate-400">
              No completed videos yet. Complete 90% of a lecture to mark it finished!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {completed.map((item) => {
                if (!item.videoDetail) return null;
                const v = item.videoDetail;
                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveModalVideo(v)}
                    className="bg-slate-900 border border-white/10 hover:border-emerald-500/40 rounded-2xl overflow-hidden cursor-pointer transition-all p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
                      <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Completed</span>
                      <span className="text-[10px] text-slate-400 font-mono">{v.duration}</span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-100 line-clamp-2">{v.title}</h3>
                  </div>
                );
              })}
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
