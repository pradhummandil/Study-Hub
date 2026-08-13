// src/pages/video-learning/VideoCollectionPage.tsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft } from 'lucide-react';
import { fetchCollectionBySlug } from '../../lib/videoLearningApi';
import type { YouTubeCollection, YouTubeVideo } from '../../types/video-learning';
import { VideoCard } from '../../components/video-learning/VideoCard';
import { YouTubePlayerModal } from '../../components/video-learning/YouTubePlayerModal';

export default function VideoCollectionPage() {
  const { slug } = useParams<{ slug: string }>();
  const [collection, setCollection] = useState<YouTubeCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeModalVideo, setActiveModalVideo] = useState<YouTubeVideo | null>(null);

  useEffect(() => {
    async function load() {
      if (!slug) return;
      setLoading(true);
      const data = await fetchCollectionBySlug(slug);
      setCollection(data);
      setLoading(false);
    }
    load();
  }, [slug]);

  if (loading || !collection) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <Helmet>
        <title>{collection.title} | Learning Path | Study Hub</title>
      </Helmet>

      <div className="bg-slate-900 border-b border-white/10 pt-10 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-4">
          <Link to="/video-learning" className="inline-flex items-center gap-1.5 text-xs text-cyan-400 font-semibold hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Video Learning
          </Link>
          <div>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Curated Study Hub Collection
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-100 mt-1">
              {collection.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1 leading-relaxed">
              {collection.description}
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h2 className="text-lg font-bold text-slate-100">
            Step-by-Step Pathway ({collection.videos?.length || 0} Lectures)
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {collection.videos?.map((vid) => (
            <VideoCard
              key={vid.id}
              video={vid}
              onSelect={(v) => setActiveModalVideo(v)}
            />
          ))}
        </div>
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
