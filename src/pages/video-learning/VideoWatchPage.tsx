import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowLeft, Heart, CheckCircle2, Bookmark, ShieldCheck,
  Bot, BrainCircuit, Plus, Trash2, Clock, BookOpen
} from 'lucide-react';
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

  // Embed URL
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

        // Fetch related videos from same subject & exam
        const rel = await fetchVideos({ exam: data.exam, subject: data.subject });
        setRelatedVideos(rel.filter((v) => v.youtube_video_id !== data.youtube_video_id).slice(0, 10));
      }
      setLoading(false);
    }
    load();
  }, [videoId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Video Lecture Not Found</h2>
        <p className="text-sm text-slate-400">The video requested may be private or unavailable.</p>
        <Link
          to="/video-learning"
          className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center gap-2 hover:bg-blue-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Video Learning
        </Link>
      </div>
    );
  }

  const handleSaveToggle = async () => {
    const nowSaved = await toggleSaveItem(user?.id || 'guest_user', video.id, 'video');
    setSaved(nowSaved);
  };

  const handleCompleteToggle = async () => {
    const nextComp = !completed;
    setCompleted(nextComp);
    await saveWatchProgress(
      user?.id || 'guest_user',
      video.id,
      video.youtube_video_id,
      nextComp ? video.duration_seconds || 1800 : 0,
      video.duration_seconds || 1800
    );
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const created = await addVideoNote(
      user?.id || 'guest_user',
      video.id,
      video.youtube_video_id,
      noteTimestamp,
      newNoteText.trim()
    );

    setNotes((prev) => [created, ...prev]);
    setNewNoteText('');
  };

  const handleDeleteNote = (id: string) => {
    deleteVideoNote(id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleAskStudyMate = () => {
    navigate('/study-ai', {
      state: {
        initialPrompt: `I am watching the lecture "${video.title}" (${video.exam} — ${video.subject}). Explain the key concepts and key takeaways in simple terms.`,
      },
    });
  };

  const channelAvatarUrl =
    video.channel_handle === '@PW-JEEWallah'
      ? 'https://yt3.googleusercontent.com/9C0637F55s9zY8P8e-28D6uY75N4m_uP-b7h_zQ2F2eZ7s-f1A_7L2v1t-G-V9e_X-8v_b-1=s176-c-k-c0x00ffffff-no-rj'
      : video.channel_handle === '@PWNEET-Official'
      ? 'https://yt3.googleusercontent.com/w2Yv2S5e8B9A0M9B9B9B9B9B9B9B9B9B9B9B9B9B9B9B9B9B9B9B9B9B9B9B9B9B=s176-c-k-c0x00ffffff-no-rj'
      : 'https://yt3.googleusercontent.com/ytc/AIdro_k9_N_v0-7-L8v8-8-8-8-8-8-8-8-8-8-8-8=s176-c-k-c0x00ffffff-no-rj';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      <Helmet>
        <title>{video.title} | {video.exam} {video.subject} | Study Hub</title>
        <meta name="description" content={video.description || video.title} />
      </Helmet>

      {/* TOP NAVBAR BRANDING & BACK LINK */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        <Link
          to="/video-learning"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Video Catalog
        </Link>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30">
            {video.exam}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
            {video.subject}
          </span>
        </div>
      </header>

      {/* WATCH LAYOUT CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT / TOP MAIN PLAYER AREA (2 COLS) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Embed Player */}
          <div className="relative aspect-video w-full rounded-[24px] overflow-hidden bg-black shadow-2xl border border-slate-800">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${video.youtube_video_id}?autoplay=1&modestbranding=1&rel=0`}
              title={video.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* Title & Metadata */}
          <div className="space-y-4 bg-slate-900/70 border border-slate-800 rounded-[24px] p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {video.video_type.replace('_', ' ')}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" /> {video.duration || 'Full Lecture'}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveToggle}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    saved
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                      : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
                  {saved ? 'Saved' : 'Save'}
                </button>

                <button
                  onClick={handleCompleteToggle}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    completed
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                      : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {completed ? 'Completed ✓' : 'Mark Completed'}
                </button>
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-white leading-snug">
              {video.title}
            </h1>

            {/* Channel Info Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800 flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={channelAvatarUrl}
                  alt={video.channel_name || 'Channel Avatar'}
                  className="w-10 h-10 rounded-full object-cover border border-cyan-500/40"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-sm text-slate-100">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    <span>{video.channel_name || 'Physics Wallah'}</span>
                  </div>
                  <span className="text-xs text-slate-400">Verified YouTube Source</span>
                </div>
              </div>

              {/* Quick AI & Practice Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAskStudyMate}
                  className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <Bot className="w-4 h-4" /> Ask StudyMate AI
                </button>
                <button
                  onClick={() => navigate(`/practice?topic=${encodeURIComponent(video.topic)}`)}
                  className="px-4 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <BrainCircuit className="w-4 h-4" /> Practice Questions
                </button>
              </div>
            </div>

            {/* Description */}
            {video.description && (
              <div className="pt-3 border-t border-slate-800/60 text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                {video.description}
              </div>
            )}
          </div>

          {/* TIMESTAMPTED PERSONAL NOTES */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-[24px] p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-cyan-400" /> Lesson Notes & Key Timestamps
            </h3>

            {/* Add Note Form */}
            <form onSubmit={handleAddNote} className="flex gap-2">
              <input
                type="text"
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Write a personal note or key equation for this lecture..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Note
              </button>
            </form>

            {/* Notes List */}
            {notes.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">No saved notes yet for this lecture.</p>
            ) : (
              <div className="space-y-2 pt-2">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                  >
                    <span className="text-slate-200">{note.note}</span>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDEBAR: UP NEXT RELATED LESSONS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" /> Up Next in {video.subject}
            </h3>
            <span className="text-xs text-slate-400 font-mono">{relatedVideos.length} recommendations</span>
          </div>

          <div className="space-y-3">
            {relatedVideos.map((rel) => (
              <div
                key={rel.id}
                onClick={() => navigate(`/video-learning/video/${rel.youtube_video_id}`)}
                className="group bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-3 cursor-pointer transition-all hover:bg-slate-800/90 flex gap-3"
              >
                <div className="relative w-28 aspect-video rounded-xl overflow-hidden bg-slate-950 shrink-0">
                  <img
                    src={rel.thumbnail || rel.thumbnail_url}
                    alt={rel.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-slate-200">
                    {rel.duration || 'Video'}
                  </div>
                </div>

                <div className="flex-1 space-y-1 overflow-hidden">
                  <span className="text-[10px] font-bold uppercase text-cyan-400 block">{rel.video_type}</span>
                  <h4 className="text-xs font-semibold text-slate-200 line-clamp-2 leading-snug group-hover:text-cyan-300 transition-colors">
                    {rel.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 block truncate">{rel.channel_name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
