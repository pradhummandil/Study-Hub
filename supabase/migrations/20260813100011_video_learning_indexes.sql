-- Migration: 20260813100011_video_learning_indexes.sql
-- Description: Indexes for Video Learning 2.0 query optimization

-- 1. YOUTUBE VIDEOS INDEXES
CREATE INDEX IF NOT EXISTS idx_youtube_videos_ytid ON public.youtube_videos (youtube_video_id);
CREATE INDEX IF NOT EXISTS idx_youtube_videos_channel ON public.youtube_videos (channel_id);
CREATE INDEX IF NOT EXISTS idx_youtube_videos_exam ON public.youtube_videos (exam);
CREATE INDEX IF NOT EXISTS idx_youtube_videos_subject ON public.youtube_videos (subject);
CREATE INDEX IF NOT EXISTS idx_youtube_videos_topic ON public.youtube_videos (topic);
CREATE INDEX IF NOT EXISTS idx_youtube_videos_vtype ON public.youtube_videos (video_type);
CREATE INDEX IF NOT EXISTS idx_youtube_videos_short ON public.youtube_videos (is_short);
CREATE INDEX IF NOT EXISTS idx_youtube_videos_pub ON public.youtube_videos (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_youtube_videos_combo ON public.youtube_videos (status, exam, subject, video_type, published_at DESC);

-- 2. YOUTUBE PLAYLISTS INDEXES
CREATE INDEX IF NOT EXISTS idx_youtube_playlists_ytid ON public.youtube_playlists (youtube_playlist_id);
CREATE INDEX IF NOT EXISTS idx_youtube_playlists_channel ON public.youtube_playlists (channel_id);
CREATE INDEX IF NOT EXISTS idx_youtube_playlists_exam ON public.youtube_playlists (exam);
CREATE INDEX IF NOT EXISTS idx_youtube_playlists_subject ON public.youtube_playlists (subject);

-- 3. YOUTUBE PLAYLIST ITEMS INDEXES
CREATE INDEX IF NOT EXISTS idx_youtube_playlist_items_pl ON public.youtube_playlist_items (playlist_id);
CREATE INDEX IF NOT EXISTS idx_youtube_playlist_items_vid ON public.youtube_playlist_items (video_id);
CREATE INDEX IF NOT EXISTS idx_youtube_playlist_items_pos ON public.youtube_playlist_items (playlist_id, position ASC);

-- 4. WATCH HISTORY & SAVED ITEMS INDEXES
CREATE INDEX IF NOT EXISTS idx_watch_history_user ON public.video_watch_history (user_id, watched_at DESC);
CREATE INDEX IF NOT EXISTS idx_video_saved_user ON public.video_saved (user_id, item_type);
