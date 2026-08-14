import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowLeft, Heart, CheckCircle2, Bookmark, ShieldCheck,
  Bot, BrainCircuit, Plus, Trash2, Clock, BookOpen, Layers, RotateCcw
} from 'lucide-react';
import { ChannelAvatar } from '../../components/video-learning/ChannelAvatar';
import {
  fetchVideoById,
  fetchVideos,
  isItemSaved,
  toggleSaveItem,
  saveWatchProgress,
  getVideoWatchState,
  getLocalNotes,
  addVideoNote,
  deleteVideoNote
} from '../../lib/videoLearningApi';
import type { YouTubeVideo, VideoNote } from '../../types/video-learning';
import { useAuth } from '../../context/AuthContext';

export default function VideoWatchPage() {
  const { videoId } = useParams<{ videoId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [video, setVideo] = useState<YouTubeVideo | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);

  // User interactions state
  const [saved, setSaved] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Notes state
  const [notes, setNotes] = useState<VideoNote[]>([]);
  const [newNoteText, setNewNoteText] = useState('');
  const noteTimestamp = 0;

  useEffect(() => {
    async function load() {
      if (!videoId) return;
      setLoading(true);
      const data = await fetchVideoById(videoId);
      setVideo(data);

      if (data) {
        setSaved(isItemSaved(data.id, 'video'));
        const wState = getVideoWatchState(data.youtube_video_id);
        if (wState) setCompleted(wState.completed);

        setNotes(getLocalNotes(data.youtube_video_id));

        // Fetch related content prioritized by same topic, subject & exam
        const rel = await fetchVideos({ exam: data.exam, subject: data.subject, topic: data.topic });
        setRelatedVideos(rel.filter((v) => v.youtube_video_id !== data.youtube_video_id).slice(0, 10));
      }
      setLoading(false);
    }
    load();
  }, [videoId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F6F0] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-[#2D5A3F] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-[#F8F6F0] text-[#1C201D] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <h2 className="text-2xl font-serif font-bold text-[#1C201D]">Video Lecture Not Found</h2>
        <p className="text-sm text-[#6C706D]">The video requested may be private or unavailable.</p>
        <Link
          to="/video-learning"
          className="px-5 py-2.5 rounded-xl bg-[#2D5A3F] text-[#FFFFFF] font-bold text-xs flex items-center gap-2 hover:bg-[#2D5A3F]/90 transition-colors shadow-md"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Video Learning
        </Link>
      </div>
    );
  }

  const handleSaveToggle = async () => {
    if (!user) {
      navigate('/login', { state: { redirect: location.pathname } });
      return;
    }
    const nowSaved = await toggleSaveItem(user.id, video.id, 'video');
    setSaved(nowSaved);
  };

  const handleCompleteToggle = async () => {
    if (!user) {
      navigate('/login', { state: { redirect: location.pathname } });
      return;
    }
    const nextComp = !completed;
    setCompleted(nextComp);
    await saveWatchProgress(
      user.id,
      video.id,
      video.youtube_video_id,
      nextComp ? video.duration_seconds || 1800 : 0,
      video.duration_seconds || 1800
    );
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login', { state: { redirect: location.pathname } });
      return;
    }
    if (!newNoteText.trim()) return;

    const created = await addVideoNote(
      user.id,
      video.id,
      video.youtube_video_id,
      noteTimestamp,
      newNoteText.trim()
    );

    setNotes((prev) => [created, ...prev]);
    setNewNoteText('');
  };

  const handleDeleteNote = (id: string) => {
    if (!user) return;
    deleteVideoNote(id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const requireAuthAndNavigate = (targetPath: string, navState?: any) => {
    if (!user) {
      navigate('/login', { state: { redirect: location.pathname } });
      return;
    }
    navigate(targetPath, navState ? { state: navState } : undefined);
  };

  const handleAskStudyMate = () => {
    requireAuthAndNavigate('/study-ai', {
      initialPrompt: `I am watching the lecture "${video.title}" (${video.exam} — ${video.subject}). Explain the key concepts and key takeaways in simple terms.`,
    });
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#1C201D] pb-16">
      <Helmet>
        <title>{video.title} | Study Hub Video Learning</title>
        <meta name="description" content={`Watch ${video.title} (${video.exam} - ${video.subject}) synchronized from verified YouTube academic sources.`} />
      </Helmet>

      {/* TOP NAVBAR BRANDING & BACK LINK */}
      <header className="border-b border-[#1C201D]/10 bg-[#FFFFFF] sticky top-0 z-30 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between shadow-sm">
        <Link
          to="/video-learning"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#1C201D] hover:text-[#2D5A3F] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Video Catalog
        </Link>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-[#2D5A3F]/10 text-[#2D5A3F] border border-[#2D5A3F]/20">
            {video.exam}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-[#EDE8DB] text-[#1C201D] border border-[#1C201D]/10">
            {video.subject}
          </span>
        </div>
      </header>

      {/* WATCH LAYOUT CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT MAIN PLAYER AREA (2 COLS) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Embed Player Canvas */}
          <div className="relative aspect-video w-full rounded-[24px] overflow-hidden bg-[#1C201D] shadow-xl border border-[#1C201D]/10">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${video.youtube_video_id}?autoplay=1&modestbranding=1&rel=0`}
              title={video.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* Title & Metadata Card */}
          <div className="space-y-4 bg-[#FFFFFF] border border-[#1C201D]/10 rounded-[24px] p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-[#2D5A3F]/10 text-[#2D5A3F] border border-[#2D5A3F]/20">
                  {video.video_type.replace('_', ' ')}
                </span>
                <span className="text-xs text-[#6C706D] flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5 text-[#D4AF37]" /> {video.duration || 'Full Lecture'}
                </span>
              </div>

              {/* Save & Complete Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveToggle}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    saved
                      ? 'bg-[#1C201D] text-[#D4AF37] shadow-md'
                      : 'bg-[#EDE8DB] text-[#1C201D] hover:bg-[#EDE8DB]/80 border border-[#1C201D]/10'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
                  {saved ? 'Saved' : 'Save'}
                </button>

                <button
                  onClick={handleCompleteToggle}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    completed
                      ? 'bg-[#2D5A3F] text-[#FFFFFF] shadow-md'
                      : 'bg-[#EDE8DB] text-[#1C201D] hover:bg-[#EDE8DB]/80 border border-[#1C201D]/10'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {completed ? 'Completed ✓' : 'Mark Completed'}
                </button>
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#1C201D] leading-snug">
              {video.title}
            </h1>

            {/* Channel Info Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-[#1C201D]/10 flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <ChannelAvatar channelName={video.channel_name || 'Physics Wallah'} avatarUrl={video.channel_avatar_url} size="md" />
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-sm text-[#1C201D]">
                    <ShieldCheck className="w-4 h-4 text-[#2D5A3F]" />
                    <span>{video.channel_name || 'Physics Wallah'}</span>
                  </div>
                  <span className="text-xs text-[#6C706D]">Verified YouTube Academic Source</span>
                </div>
              </div>

              {/* MANDATED ACTION BUTTONS: Practice, Flashcards, Revision, StudyMate */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleAskStudyMate}
                  className="px-3.5 py-2 rounded-xl bg-[#2D5A3F]/10 hover:bg-[#2D5A3F]/20 text-[#2D5A3F] border border-[#2D5A3F]/30 text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <Bot className="w-4 h-4 text-[#C86D51]" /> Ask AI
                </button>
                <button
                  onClick={() => requireAuthAndNavigate(`/practice?topic=${encodeURIComponent(video.topic)}`)}
                  className="px-3.5 py-2 rounded-xl bg-[#C86D51]/10 hover:bg-[#C86D51]/20 text-[#C86D51] border border-[#C86D51]/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <BrainCircuit className="w-4 h-4" /> Practice Topic
                </button>
                <button
                  onClick={() => requireAuthAndNavigate('/flashcards')}
                  className="px-3.5 py-2 rounded-xl bg-[#EDE8DB] hover:bg-[#EDE8DB]/80 text-[#1C201D] border border-[#1C201D]/10 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Layers className="w-4 h-4 text-[#2D5A3F]" /> Flashcards
                </button>
                <button
                  onClick={() => requireAuthAndNavigate('/revision')}
                  className="px-3.5 py-2 rounded-xl bg-[#EDE8DB] hover:bg-[#EDE8DB]/80 text-[#1C201D] border border-[#1C201D]/10 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-[#C86D51]" /> Revision
                </button>
              </div>
            </div>

            {video.description && (
              <div className="pt-3 border-t border-[#1C201D]/10 text-xs text-[#6C706D] leading-relaxed">
                <h4 className="font-bold text-[#1C201D] mb-1">Description</h4>
                <p className="whitespace-pre-line">{video.description}</p>
              </div>
            )}
          </div>

          {/* PERSONAL NOTES SECTION */}
          <div className="bg-[#FFFFFF] border border-[#1C201D]/10 rounded-[24px] p-6 space-y-4 shadow-sm">
            <h3 className="font-serif font-bold text-base text-[#1C201D] flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-[#C86D51]" /> Lesson Notes & Key Timestamps
            </h3>

            <form onSubmit={handleAddNote} className="flex gap-2">
              <input
                type="text"
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Add a timestamp note or key formula..."
                className="flex-1 bg-[#F8F6F0] border border-[#1C201D]/14 rounded-xl px-4 py-2.5 text-xs text-[#1C201D] placeholder-[#6C706D] focus:outline-none focus:border-[#2D5A3F]"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-[#2D5A3F] text-[#FFFFFF] text-xs font-bold flex items-center gap-1 shadow-sm hover:bg-[#2D5A3F]/90 transition-opacity"
              >
                <Plus className="w-4 h-4" /> Add Note
              </button>
            </form>

            {notes.length > 0 && (
              <div className="space-y-2 pt-2">
                {notes.map((n) => (
                  <div key={n.id} className="p-3 rounded-xl bg-[#EDE8DB]/40 border border-[#1C201D]/10 flex items-center justify-between text-xs">
                    <span className="text-[#1C201D] font-medium">{n.note}</span>
                    <button onClick={() => handleDeleteNote(n.id)} className="text-[#6C706D] hover:text-[#C86D51]">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: RELATED CONTENT SIDEBAR (1 COL) */}
        <div className="space-y-6">
          <div className="bg-[#FFFFFF] border border-[#1C201D]/10 rounded-[24px] p-5 space-y-4 shadow-sm">
            <h3 className="font-serif font-bold text-base text-[#1C201D] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#2D5A3F]" /> Related Lessons in {video.subject}
            </h3>

            <div className="space-y-3">
              {relatedVideos.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => navigate(`/video-learning/video/${rel.youtube_video_id || rel.id}`)}
                  className="flex gap-3 p-2.5 rounded-xl hover:bg-[#EDE8DB]/50 cursor-pointer transition-colors border border-transparent hover:border-[#1C201D]/10 group"
                >
                  <div className="w-24 aspect-video rounded-lg overflow-hidden bg-[#1C201D] shrink-0 relative">
                    <img src={rel.thumbnail || rel.thumbnail_url} alt={rel.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-1 overflow-hidden">
                    <span className="text-[10px] font-bold uppercase text-[#2D5A3F] block">{rel.video_type}</span>
                    <h4 className="text-xs font-semibold text-[#1C201D] line-clamp-2 group-hover:text-[#2D5A3F] transition-colors leading-snug">
                      {rel.title}
                    </h4>
                    <span className="text-[10px] text-[#6C706D] block">{rel.channel_name || 'Verified'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
