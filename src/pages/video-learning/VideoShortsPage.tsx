// src/pages/video-learning/VideoShortsPage.tsx
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Film, ArrowLeft } from 'lucide-react';
import { fetchShorts } from '../../lib/videoLearningApi';
import type { YouTubeVideo } from '../../types/video-learning';
import { ShortsViewer } from '../../components/video-learning/ShortsViewer';
import { Link, useNavigate } from 'react-router-dom';

const SHORT_CATEGORIES = ['All', 'Concept', 'Formula', 'PYQ', 'Revision', 'Strategy'];

export default function VideoShortsPage() {
  const navigate = useNavigate();
  const [shorts, setShorts] = useState<YouTubeVideo[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await fetchShorts(undefined, selectedCategory);
      setShorts(data);
      setLoading(false);
    }
    load();
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <Helmet>
        <title>Quick Educational Shorts & Revision | Study Hub</title>
        <meta name="description" content="High-yield 60-second formulas, concepts, PYQs and strategy shorts for exam preparation." />
      </Helmet>

      {/* HEADER NAVBAR */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-3 sticky top-0 z-30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link to="/video-learning" className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors" title="Back to Catalog">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Film className="w-4 h-4 text-cyan-400" /> Educational Shorts Feed
            </h1>
            <p className="text-[11px] text-slate-400">Scroll vertical 60-second formulas, concepts and shortcuts</p>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none w-full sm:w-auto">
          {SHORT_CATEGORIES.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  active
                    ? 'bg-cyan-400 text-slate-950 shadow-md'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* SHORTS VIEWER CONTAINER */}
      <div className="flex-1 flex items-center justify-center p-4">
        {loading ? (
          <div className="w-10 h-10 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
        ) : (
          <ShortsViewer
            shorts={shorts}
            onOpenFullLecture={(v) => navigate(`/video-learning/video/${v.youtube_video_id}`)}
          />
        )}
      </div>
    </div>
  );
}
