// src/pages/video-learning/VideoTopicPage.tsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft } from 'lucide-react';
import { fetchVideos } from '../../lib/videoLearningApi';
import type { YouTubeVideo, VideoContentType } from '../../types/video-learning';
import { VideoCard } from '../../components/video-learning/VideoCard';
import { YouTubePlayerModal } from '../../components/video-learning/YouTubePlayerModal';

export default function VideoTopicPage() {
  const { slug } = useParams<{ slug: string }>();
  const topicName = slug ? slug.replace(/-/g, ' ') : 'Computer Networks';

  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [activeTab, setActiveTab] = useState<VideoContentType | 'ALL'>('ALL');
  const [loading, setLoading] = useState(true);
  const [activeModalVideo, setActiveModalVideo] = useState<YouTubeVideo | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const all = await fetchVideos({ topic: topicName, type: activeTab });
      setVideos(all);
      setLoading(false);
    }
    load();
  }, [topicName, activeTab]);

  const tabs: { label: string; value: VideoContentType | 'ALL' }[] = [
    { label: 'All Content', value: 'ALL' },
    { label: 'Lectures', value: 'LECTURE' },
    { label: 'One Shots', value: 'ONE_SHOT' },
    { label: 'PYQs', value: 'PYQ' },
    { label: 'Revision', value: 'REVISION' },
    { label: 'Shorts', value: 'SHORT' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <Helmet>
        <title>{topicName} Video Lectures & PYQs | Study Hub</title>
      </Helmet>

      <div className="bg-slate-900/90 border-b border-white/10 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto space-y-4">
          <Link to="/video-learning" className="inline-flex items-center gap-1.5 text-xs text-cyan-400 font-semibold hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Video Learning
          </Link>
          <div>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Topic Hub
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-100 capitalize mt-1">
              {topicName}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Curated YouTube lectures, concept one-shots, previous year question marathons and revision sessions.
            </p>
          </div>

          {/* TAB BAR */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 scrollbar-none">
            {tabs.map((tab) => {
              const active = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    active
                      ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
                      : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 py-12">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-64 rounded-2xl bg-slate-900/50 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-white/10 text-xs text-slate-400">
            No videos currently matching this topic tab. Videos for this topic are being curated.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {videos.map((vid) => (
              <VideoCard
                key={vid.id}
                video={vid}
                onSelect={(v) => setActiveModalVideo(v)}
              />
            ))}
          </div>
        )}
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
