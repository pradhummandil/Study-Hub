import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getLocalWatchHistory, fetchVideoById } from '../../lib/videoLearningApi';
import { getMaterialProgressMap, getStudyMaterialById } from '../../lib/studyMaterialsApi';

export const ContinueLearning: React.FC = () => {
  const [lastVideo, setLastVideo] = useState<{ title: string; percent: number; videoId: string } | null>(null);
  const [lastNote, setLastNote] = useState<{ title: string; page: number; noteId: string } | null>(null);

  useEffect(() => {
    async function loadLastSession() {
      // Check last watched video
      const history = getLocalWatchHistory();
      if (history.length > 0) {
        const topHistory = history.sort((a, b) => new Date(b.watched_at).getTime() - new Date(a.watched_at).getTime())[0];
        if (topHistory && topHistory.progress_percent < 90) {
          const v = await fetchVideoById(topHistory.youtube_video_id || topHistory.video_id);
          if (v) {
            setLastVideo({
              title: v.title,
              percent: topHistory.progress_percent,
              videoId: v.id,
            });
          }
        }
      }

      // Check last read material
      const matMap = getMaterialProgressMap();
      const entries = Object.values(matMap);
      if (entries.length > 0) {
        const topMat = entries.sort((a, b) => new Date(b.last_opened_at).getTime() - new Date(a.last_opened_at).getTime())[0];
        if (topMat) {
          const m = await getStudyMaterialById(topMat.material_id);
          if (m) {
            setLastNote({
              title: m.title,
              page: topMat.last_read_page,
              noteId: m.id,
            });
          }
        }
      }
    }
    loadLastSession();
  }, []);

  const hasItems = lastVideo || lastNote;

  return (
    <div className="bg-paper rounded-3xl p-5 border border-forest/10 shadow-card space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-forest/10">
        <h3 className="text-[10px] uppercase tracking-wider text-muted font-bold font-mono">
          CONTINUE LEARNING
        </h3>
        <span className="text-[10px] text-scholar font-mono font-semibold">Active Session</span>
      </div>

      {!hasItems ? (
        <div className="p-3.5 bg-parchment/40 rounded-2xl border border-forest/10 space-y-2 font-mono text-xs">
          <span className="text-[10px] uppercase font-bold text-terracotta block">VIDEO</span>
          <h4 className="font-bold text-ink text-xs">TCP Congestion Control</h4>
          <span className="text-[11px] text-muted block">42% watched</span>
          <Link
            to="/video-learning"
            className="w-full py-1.5 bg-scholar text-paper font-bold text-[11px] rounded-xl flex items-center justify-center gap-1 mt-2 hover:bg-forest transition-colors"
          >
            <span>Continue →</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {lastVideo && (
            <div className="p-3 bg-parchment/50 rounded-2xl border border-forest/10 flex items-center justify-between gap-3">
              <div className="overflow-hidden">
                <span className="text-[9px] font-mono font-bold text-scholar uppercase">VIDEO</span>
                <h4 className="text-xs font-bold text-ink truncate mt-0.5">{lastVideo.title}</h4>
                <span className="text-[10px] font-mono text-muted block">{lastVideo.percent}% watched</span>
              </div>
              <Link
                to={`/video-learning?v=${lastVideo.videoId}`}
                className="px-3 py-1.5 bg-scholar text-paper font-bold text-[11px] rounded-xl shrink-0 hover:bg-forest transition-colors"
              >
                <span>Continue →</span>
              </Link>
            </div>
          )}

          {lastNote && (
            <div className="p-3 bg-parchment/50 rounded-2xl border border-forest/10 flex items-center justify-between gap-3">
              <div className="overflow-hidden">
                <span className="text-[9px] font-mono font-bold text-terracotta uppercase">NOTES</span>
                <h4 className="text-xs font-bold text-ink truncate mt-0.5">{lastNote.title}</h4>
                <span className="text-[10px] font-mono text-muted block">Page {lastNote.page}</span>
              </div>
              <Link
                to={`/study-materials?m=${lastNote.noteId}`}
                className="px-3 py-1.5 bg-scholar text-paper font-bold text-[11px] rounded-xl shrink-0 hover:bg-forest transition-colors"
              >
                <span>Continue →</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
