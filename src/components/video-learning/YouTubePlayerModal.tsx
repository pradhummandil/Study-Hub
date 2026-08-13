// src/components/video-learning/YouTubePlayerModal.tsx
import { useState, useEffect } from 'react';
import {
  X, CheckCircle2, Bookmark, ExternalLink, Bot, HelpCircle,
  Clock, Plus, Trash2, BookOpen, Award, MessageSquare, Layers, Repeat, ShieldCheck
} from 'lucide-react';
import type { YouTubeVideo, VideoNote } from '../../types/video-learning';
import {
  saveWatchProgress,
  getVideoWatchState,
  getLocalNotes,
  addVideoNote,
  deleteVideoNote,
  isItemSaved,
  toggleSaveItem,
  formatTime
} from '../../lib/videoLearningApi';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { InteractivePostVideoQuiz } from './InteractivePostVideoQuiz';

interface YouTubePlayerModalProps {
  video: YouTubeVideo | null;
  onClose: () => void;
  startTime?: number;
}

export const YouTubePlayerModal: React.FC<YouTubePlayerModalProps> = ({ video, onClose, startTime = 0 }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [saved, setSaved] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [notes, setNotes] = useState<VideoNote[]>([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [currentSec, setCurrentSec] = useState(startTime);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [embedBlocked, setEmbedBlocked] = useState(false);

  useEffect(() => {
    if (video) {
      setSaved(isItemSaved(video.id, 'video'));
      const state = getVideoWatchState(video.youtube_video_id);
      if (state) {
        setCompleted(state.completed);
        if (!startTime && state.last_position > 0) {
          setCurrentSec(state.last_position);
        }
      }
      setNotes(getLocalNotes(video.youtube_video_id));
      setEmbedBlocked(false);
    }
  }, [video, startTime]);

  if (!video) return null;

  const handleMarkComplete = async () => {
    const isComp = !completed;
    setCompleted(isComp);
    const durSec = video.duration_seconds || 3600;
    await saveWatchProgress(
      user?.id || 'guest_user',
      video.id,
      video.youtube_video_id,
      isComp ? durSec : 0,
      durSec
    );

    if (isComp) {
      setShowQuizModal(true);
    }
  };

  const handleSaveToggle = async () => {
    const s = await toggleSaveItem(user?.id || 'guest_user', video.id, 'video');
    setSaved(s);
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    const note = await addVideoNote(
      user?.id || 'guest_user',
      video.id,
      video.youtube_video_id,
      currentSec,
      newNoteText
    );
    setNotes([note, ...notes]);
    setNewNoteText('');
  };

  const handleDeleteNote = (id: string) => {
    deleteVideoNote(id);
    setNotes(notes.filter((n) => n.id !== id));
  };

  const handleStudyMateAction = (actionPrompt: string) => {
    const fullContextPrompt = `Regarding lecture "${video.title}" (${video.exam} — ${video.subject} / ${video.topic}): ${actionPrompt}`;
    onClose();
    navigate('/study-ai', { state: { initialPrompt: fullContextPrompt } });
  };

  const embedUrl = `https://www.youtube-nocookie.com/embed/${video.youtube_video_id}?autoplay=1&enablejsapi=1&start=${Math.floor(currentSec)}`;
  const youtubeWatchUrl = `https://www.youtube.com/watch?v=${video.youtube_video_id}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex flex-col md:flex-row items-stretch overflow-hidden animate-fade-in">
      {/* LEFT / TOP MAIN PLAYER AREA */}
      <div className="flex-1 flex flex-col bg-black overflow-y-auto">
        {/* Top Bar inside modal */}
        <div className="bg-slate-900/90 border-b border-white/10 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 truncate">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {video.exam}
            </span>
            <span className="text-slate-300 text-xs truncate font-medium">
              {video.subject} &bull; {video.topic}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Official Privacy-Enhanced YouTube Embed Player */}
        <div className="relative aspect-video w-full bg-black shadow-2xl">
          {embedBlocked ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-950 space-y-3">
              <p className="text-sm font-semibold text-slate-200">
                Embedding is unavailable for this video directly inside third-party apps.
              </p>
              <a
                href={youtubeWatchUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-2 hover:brightness-110"
              >
                Watch on YouTube ↗
              </a>
            </div>
          ) : (
            <iframe
              src={embedUrl}
              title={video.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          )}
        </div>

        {/* Video Info Header */}
        <div className="p-4 md:p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div className="space-y-1">
              <h1 className="text-lg md:text-xl font-bold text-slate-100 leading-snug">
                {video.title}
              </h1>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{video.channel_name}</span>
                </div>
                <span>&bull;</span>
                <a
                  href={youtubeWatchUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 hover:text-cyan-300 flex items-center gap-1 transition-colors font-medium"
                >
                  Watch on YouTube ↗ <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <button
                onClick={handleMarkComplete}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  completed
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-white/10'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {completed ? 'Completed ✓' : 'Mark Complete'}
              </button>

              <button
                onClick={handleSaveToggle}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  saved
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-white/10'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
                {saved ? 'Saved' : 'Save'}
              </button>

              <button
                onClick={() => setShowQuizModal(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 hover:brightness-110 shadow-lg shadow-cyan-500/20 flex items-center gap-1.5"
              >
                <Award className="w-4 h-4" />
                Test Yourself
              </button>
            </div>
          </div>

          {/* INTEGRATION ACTION ROW */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              onClick={() => {
                onClose();
                navigate(`/practice?exam=${encodeURIComponent(video.exam)}&topic=${encodeURIComponent(video.topic)}`);
              }}
              className="p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 hover:border-cyan-500/40 text-xs font-semibold text-slate-200 hover:text-cyan-300 flex items-center justify-between transition-all"
            >
              <span>Practice this topic</span>
              <BookOpen className="w-4 h-4 text-cyan-400" />
            </button>

            <button
              onClick={() => {
                onClose();
                navigate('/flashcards');
              }}
              className="p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 hover:border-purple-500/40 text-xs font-semibold text-slate-200 hover:text-purple-300 flex items-center justify-between transition-all"
            >
              <span>Create flashcards</span>
              <Layers className="w-4 h-4 text-purple-400" />
            </button>

            <button
              onClick={() => {
                onClose();
                navigate('/revision-manager');
              }}
              className="p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 hover:border-amber-500/40 text-xs font-semibold text-slate-200 hover:text-amber-300 flex items-center justify-between transition-all"
            >
              <span>Add to revision</span>
              <Repeat className="w-4 h-4 text-amber-400" />
            </button>
          </div>

          {/* Description */}
          {video.description && (
            <div className="bg-slate-900/60 border border-white/5 rounded-xl p-4 text-xs text-slate-300 leading-relaxed">
              <span className="font-semibold text-slate-200 block mb-1">About this lesson</span>
              {video.description}
            </div>
          )}

          {/* STUDYMATE QUICK AI ASSISTANT SECTION */}
          <div className="bg-gradient-to-br from-slate-900 to-cyan-950/40 border border-cyan-500/20 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-100">Ask StudyMate AI about this lecture</h3>
                <p className="text-[11px] text-slate-400">Get grounded topic summaries, explanations & PYQs</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              <button
                onClick={() => handleStudyMateAction('Summarize the key takeaways and core concepts of this topic.')}
                className="px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/30 text-[11px] text-slate-200 hover:text-cyan-300 font-medium text-left flex items-center gap-1.5 transition-all"
              >
                <BookOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                Summarize topic
              </button>
              <button
                onClick={() => handleStudyMateAction('Quiz me on this topic with 5 standard exam level questions.')}
                className="px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/30 text-[11px] text-slate-200 hover:text-cyan-300 font-medium text-left flex items-center gap-1.5 transition-all"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                Quiz me on this
              </button>
              <button
                onClick={() => handleStudyMateAction('Provide top 5 official PYQs related to this exact topic.')}
                className="px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/30 text-[11px] text-slate-200 hover:text-cyan-300 font-medium text-left flex items-center gap-1.5 transition-all"
              >
                <Award className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                Give me PYQs
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDEBAR: TIMESTAMP NOTES & STUDY LOG */}
      <div className="w-full md:w-80 lg:w-96 bg-slate-900 border-t md:border-t-0 md:border-l border-white/10 flex flex-col justify-between shrink-0">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-100">Personal Video Notes</h3>
          </div>
          <span className="text-xs text-slate-400">{notes.length} saved</span>
        </div>

        {/* Add Note Form */}
        <form onSubmit={handleAddNote} className="p-4 border-b border-white/10 bg-slate-950/40 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Timestamp:</span>
            <span className="text-cyan-400 font-bold">{formatTime(currentSec)}</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="e.g. Important formula at this timestamp..."
              className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-cyan-500 text-slate-950 hover:brightness-110 font-bold shrink-0"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notes.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
              No notes added yet.<br />Add timestamped notes to review later!
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className="bg-slate-950/80 border border-white/5 hover:border-cyan-500/30 rounded-xl p-3 text-xs space-y-1.5 transition-colors group"
              >
                <div className="flex items-center justify-between text-slate-400">
                  <button
                    onClick={() => setCurrentSec(note.timestamp_seconds)}
                    className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 font-mono font-semibold text-[11px] flex items-center gap-1 transition-colors"
                  >
                    <Clock className="w-3 h-3" /> {formatTime(note.timestamp_seconds)}
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-300 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-slate-200 leading-relaxed font-sans">{note.note}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Interactive Post-Video Quiz Modal */}
      {showQuizModal && (
        <InteractivePostVideoQuiz video={video} onClose={() => setShowQuizModal(false)} />
      )}
    </div>
  );
};
