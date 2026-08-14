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
    <div className="min-h-screen bg-[#F8F6F0] text-[#1C201D] flex flex-col justify-between">
      <Helmet>
        <title>Quick Educational Shorts & Revision | Study Hub</title>
        <meta name="description" content="High-yield 60-second formulas, concepts, PYQs and strategy shorts for exam preparation." />
      </Helmet>

      {/* HEADER NAVBAR */}
      <div className="bg-[#FFFFFF] border-b border-[#1C201D]/10 px-4 py-3 sticky top-0 z-30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <Link to="/video-learning" className="p-2 rounded-xl bg-[#EDE8DB] text-[#1C201D] hover:bg-[#2D5A3F] hover:text-[#FFFFFF] transition-colors" title="Back to Catalog">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-sm font-bold text-[#1C201D] flex items-center gap-1.5 font-serif text-base">
              <Film className="w-4 h-4 text-[#C86D51]" /> Educational Shorts Feed
            </h1>
            <p className="text-[11px] text-[#6C706D]">Scroll vertical 60-second formulas, concepts and shortcuts</p>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
          {SHORT_CATEGORIES.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  active
                    ? 'bg-[#2D5A3F] text-[#FFFFFF] shadow-sm'
                    : 'bg-[#EDE8DB] text-[#6C706D] hover:text-[#1C201D]'
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
          <div className="w-10 h-10 rounded-full border-2 border-[#2D5A3F] border-t-transparent animate-spin" />
        ) : (
          <ShortsViewer
            shorts={shorts}
            onOpenFullLecture={(v) => navigate(`/video-learning/video/${v.youtube_video_id || v.id}`)}
          />
        )}
      </div>
    </div>
  );
}
