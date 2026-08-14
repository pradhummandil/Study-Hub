import { useState, useEffect } from 'react';
import { Play, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchVideos, fetchChannels } from '../../lib/videoLearningApi';
import type { YouTubeVideo, YouTubeChannel } from '../../types/video-learning';
import { useStudentContext } from '../../context/StudentContext';
import { useAuth } from '../../context/AuthContext';
import { YouTubePlayerModal } from '../video-learning/YouTubePlayerModal';

export const VideoLearningPreviewSection: React.FC = () => {
  const { user } = useAuth();
  const studentContext = useStudentContext();
  const navigate = useNavigate();

  const [featuredVideos, setFeaturedVideos] = useState<YouTubeVideo[]>([]);
  const [channels, setChannels] = useState<YouTubeChannel[]>([]);
  const [activeModalVideo, setActiveModalVideo] = useState<YouTubeVideo | null>(null);

  useEffect(() => {
    async function load() {
      const exam = studentContext.targetExam || 'GATE';
      const [vList, cList] = await Promise.all([
        fetchVideos({ exam: user ? exam : 'All Exams' }),
        fetchChannels(),
      ]);
      setFeaturedVideos(vList.slice(0, 3));
      setChannels(cList.slice(0, 6));
    }
    load();
  }, [user, studentContext.targetExam]);

  return (
    <section className="py-20 md:py-28 bg-[#1B3022] text-[#FFFFFF] relative overflow-hidden border-b border-[#FFFFFF]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative z-10">
        {/* SECTION HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4"
        >
          <div className="space-y-2 max-w-2xl">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#2D5A3F]/50 text-[#D4AF37] border border-[#2D5A3F] inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Video Learning Hub
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-[#FFFFFF] tracking-tight">
              Learn from lessons that actually help.
            </h2>
            <p className="text-sm text-[#EDE8DB] leading-relaxed">
              Curated YouTube lectures, concept one-shots, PYQs, and revision sessions organized around your exact target exam.
            </p>
          </div>

          <Link
            to="/video-learning"
            className="px-5 py-2.5 rounded-xl bg-[#C86D51] hover:bg-[#C86D51]/90 text-[#FFFFFF] font-bold text-xs flex items-center gap-2 transition-all shrink-0 shadow-md"
          >
            Explore Video Learning <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* VERIFIED CHANNELS STRIP */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
          <span className="text-xs text-[#EDE8DB] font-semibold shrink-0 mr-2">Verified Sources:</span>
          {channels.map((c) => (
            <button
              key={c.id}
              onClick={() => navigate(`/video-learning?channel=${encodeURIComponent(c.channel_name)}`)}
              className="px-3 py-1 rounded-full bg-[#1C201D]/70 text-[#EDE8DB] hover:text-[#FFFFFF] hover:bg-[#2D5A3F] border border-[#FFFFFF]/10 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#2D5A3F]" />
              <span>{c.channel_name}</span>
            </button>
          ))}
        </div>

        {/* FEATURED VIDEOS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredVideos.map((video) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5 }}
              onClick={() => setActiveModalVideo(video)}
              className="bg-[#1C201D] border border-[#FFFFFF]/10 rounded-2xl overflow-hidden shadow-xl hover:border-[#2D5A3F] cursor-pointer transition-all group"
            >
              <div className="aspect-video relative bg-black">
                <img src={video.thumbnail || video.thumbnail_url} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-[#2D5A3F] text-[#FFFFFF] flex items-center justify-center shadow-lg">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>
                <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono bg-black/80 text-white font-bold">
                  {video.duration}
                </span>
              </div>
              <div className="p-4 space-y-2">
                <span className="text-[10px] font-bold uppercase text-[#D4AF37] px-2 py-0.5 rounded bg-[#2D5A3F]/30 border border-[#2D5A3F]">
                  {video.video_type}
                </span>
                <h3 className="text-sm font-bold text-[#FFFFFF] line-clamp-2 leading-snug group-hover:text-[#D4AF37] transition-colors">
                  {video.title}
                </h3>
                <p className="text-xs text-[#EDE8DB]">{video.channel_name}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {activeModalVideo && (
        <YouTubePlayerModal
          video={activeModalVideo}
          onClose={() => setActiveModalVideo(null)}
        />
      )}
    </section>
  );
};
