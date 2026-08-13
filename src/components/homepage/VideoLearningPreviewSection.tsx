import { useState, useEffect } from 'react';
import { Play, Sparkles, ArrowRight, ShieldCheck, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { fetchVideos, fetchChannels } from '../../lib/videoLearningApi';
import type { YouTubeVideo, YouTubeChannel } from '../../types/video-learning';
import { useStudentContext } from '../../context/StudentContext';
import { useAuth } from '../../context/AuthContext';
import { YouTubePlayerModal } from '../video-learning/YouTubePlayerModal';
import { MOTION_TOKENS } from '../../lib/motion/tokens';

export const VideoLearningPreviewSection: React.FC = () => {
  const { user } = useAuth();
  const studentContext = useStudentContext();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

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
    <section className="py-16 bg-slate-950/60 relative border-t border-white/5 overflow-hidden">
      {/* Background glow accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-96 bg-cyan-500/5 blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative z-10">
        {/* SECTION HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Video Learning Hub
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-100 tracking-tight">
              Learn from lessons that actually help.
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Curated YouTube lectures, concept one-shots, PYQs, and revision sessions organized around your exact target exam.
            </p>
          </div>

          <Link
            to="/video-learning"
            className="px-5 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shrink-0 shadow-lg shadow-cyan-500/20"
          >
            Explore Video Learning <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* VERIFIED CHANNELS MARQUEE */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs font-semibold text-slate-400 shrink-0">Verified Sources:</span>
          {channels.map((chan) => (
            <motion.div
              key={chan.id}
              onClick={() => navigate(`/video-learning/channel/${chan.id}`)}
              whileHover={shouldReduceMotion ? {} : { scale: 1.03, y: -2 }}
              transition={{ duration: 0.2 }}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 hover:border-cyan-500/40 text-xs text-slate-200 hover:text-cyan-300 font-medium flex items-center gap-2 shrink-0 cursor-pointer transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              {chan.channel_name}
            </motion.div>
          ))}
        </div>

        {/* FEATURED VIDEOS GRID WITH CARD LIFT & SCALE 1.01 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {featuredVideos.map((vid, idx) => (
            <motion.div
              key={vid.id}
              data-cursor="VIEW"
              onClick={() => setActiveModalVideo(vid)}
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: MOTION_TOKENS.duration.smooth }}
              whileHover={
                shouldReduceMotion
                  ? {}
                  : {
                      scale: 1.01,
                      y: -3,
                      boxShadow: '0 20px 30px -10px rgba(92,225,230,0.15)',
                    }
              }
              className="group bg-slate-900 border border-white/10 hover:border-cyan-500/40 rounded-2xl overflow-hidden cursor-pointer transition-colors flex flex-col justify-between shadow-xl"
            >
              <div className="relative aspect-video bg-slate-950 overflow-hidden">
                <img
                  src={vid.thumbnail}
                  alt={vid.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-500/50">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 backdrop-blur-md">
                  {vid.exam}
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-slate-950/80 text-slate-200 text-[10px] font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3 text-cyan-400" /> {vid.duration}
                </div>
              </div>

              <div className="p-4 space-y-2">
                <span className="text-[11px] text-cyan-400 font-semibold">{vid.subject} &bull; {vid.topic}</span>
                <h3 className="text-sm font-bold text-slate-100 line-clamp-2 leading-snug group-hover:text-cyan-300 transition-colors">
                  {vid.title}
                </h3>
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                  <span className="truncate">{vid.channel_name}</span>
                  <span className="text-cyan-400 font-semibold text-[11px]">Watch Now →</span>
                </div>
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
