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
    <div className="min-h-screen bg-[#F8F6F0] text-[#1C201D] pb-20">
      <Helmet>
        <title>Watch History | Study Hub Video Learning</title>
      </Helmet>

      {/* TOP BAR */}
      <div className="bg-[#1C201D] text-[#FFFFFF] border-b border-[#1C201D]/10 px-4 sm:px-6 lg:px-8 py-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/video-learning" className="p-2 rounded-xl bg-[#2D5A3F]/50 text-[#FFFFFF] hover:bg-[#2D5A3F] transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl font-serif font-bold text-[#FFFFFF] flex items-center gap-2">
                <History className="w-5 h-5 text-[#D4AF37]" /> Watch History
              </h1>
              <p className="text-xs text-[#EDE8DB]">Resume watching where you left off or review completed lectures</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* CONTINUE WATCHING SECTION */}
        <section className="space-y-4">
          <h2 className="text-lg font-serif font-bold text-[#1C201D] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#C86D51]" /> Continue Watching
          </h2>

          {continueWatching.length === 0 ? (
            <div className="text-center py-12 bg-[#FFFFFF] rounded-3xl border border-[#1C201D]/10 shadow-sm space-y-2">
              <p className="text-xs font-semibold text-[#6C706D]">No videos currently in progress.</p>
              <Link to="/video-learning" className="text-[#2D5A3F] font-bold text-xs hover:underline inline-block">
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
                    className="bg-[#FFFFFF] border border-[#1C201D]/10 hover:border-[#2D5A3F]/50 rounded-2xl overflow-hidden cursor-pointer transition-all hover:scale-[1.01] shadow-sm flex flex-col justify-between group"
                  >
                    <div className="relative aspect-video bg-[#1C201D]">
                      <img src={v.thumbnail || v.thumbnail_url} alt={v.title} className="w-full h-full object-cover" />
                      <div className="absolute bottom-0 inset-x-0 h-1.5 bg-[#1C201D]/50">
                        <div className="h-full bg-[#2D5A3F]" style={{ width: `${item.progress_percent}%` }} />
                      </div>
                      <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-[#1C201D]/80 text-[#D4AF37] font-mono text-[11px] font-bold backdrop-blur-sm">
                        Resume at {formatTime(item.last_position)}
                      </div>
                    </div>
                    <div className="p-4 space-y-1">
                      <span className="text-[10px] font-bold text-[#2D5A3F] uppercase">{v.subject}</span>
                      <h3 className="text-xs font-bold text-[#1C201D] line-clamp-2 leading-snug">{v.title}</h3>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* COMPLETED LECTURES */}
        <section className="space-y-4">
          <h2 className="text-lg font-serif font-bold text-[#1C201D] flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#2D5A3F]" /> Completed Lessons
          </h2>

          {completed.length === 0 ? (
            <div className="text-center py-12 bg-[#FFFFFF] rounded-3xl border border-[#1C201D]/10 shadow-sm text-xs font-semibold text-[#6C706D]">
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
                    className="bg-[#FFFFFF] border border-[#1C201D]/10 hover:border-[#2D5A3F]/50 rounded-2xl overflow-hidden cursor-pointer transition-all p-4 space-y-2 shadow-sm"
                  >
                    <div className="flex items-center justify-between text-xs text-[#2D5A3F] font-bold">
                      <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Completed</span>
                      <span className="text-[10px] text-[#6C706D] font-mono">{v.duration}</span>
                    </div>
                    <h3 className="text-xs font-bold text-[#1C201D] line-clamp-2 leading-snug">{v.title}</h3>
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
