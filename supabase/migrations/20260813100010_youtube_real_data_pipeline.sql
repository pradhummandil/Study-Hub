-- Migration: 20260813100010_youtube_real_data_pipeline.sql
-- Description: Enhancements for Real YouTube Content Import & Embed System

-- 1. ENHANCE YOUTUBE CHANNELS TABLE
ALTER TABLE public.youtube_channels 
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
  ADD COLUMN IF NOT EXISTS banner_url TEXT,
  ADD COLUMN IF NOT EXISTS subscriber_count TEXT,
  ADD COLUMN IF NOT EXISTS video_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ DEFAULT NOW();

-- 2. ENHANCE YOUTUBE VIDEOS TABLE
ALTER TABLE public.youtube_videos
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
  ADD COLUMN IF NOT EXISTS embed_url TEXT,
  ADD COLUMN IF NOT EXISTS is_short BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_live BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_archive BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS archive_tag TEXT,
  ADD COLUMN IF NOT EXISTS view_count TEXT,
  ADD COLUMN IF NOT EXISTS channel_handle TEXT,
  ADD COLUMN IF NOT EXISTS channel_name TEXT;

-- 3. ENHANCE YOUTUBE PLAYLISTS TABLE
ALTER TABLE public.youtube_playlists
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
  ADD COLUMN IF NOT EXISTS playlist_type TEXT DEFAULT 'PLAYLIST',
  ADD COLUMN IF NOT EXISTS branch TEXT,
  ADD COLUMN IF NOT EXISTS channel_name TEXT;

-- 4. YOUTUBE PLAYLIST ITEMS (Junction table)
CREATE TABLE IF NOT EXISTS public.youtube_playlist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    playlist_id UUID REFERENCES public.youtube_playlists(id) ON DELETE CASCADE,
    youtube_playlist_id TEXT NOT NULL,
    video_id UUID REFERENCES public.youtube_videos(id) ON DELETE CASCADE,
    youtube_video_id TEXT NOT NULL,
    position INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(youtube_playlist_id, youtube_video_id)
);

-- 5. YOUTUBE SYNC JOBS & LOGS TABLE
CREATE TABLE IF NOT EXISTS public.youtube_sync_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_handle TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, running, completed, failed
    videos_discovered INT DEFAULT 0,
    videos_imported INT DEFAULT 0,
    playlists_imported INT DEFAULT 0,
    shorts_imported INT DEFAULT 0,
    unavailable_count INT DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- RLS POLICIES
ALTER TABLE public.youtube_playlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.youtube_sync_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public playlist items read" ON public.youtube_playlist_items FOR SELECT USING (true);
CREATE POLICY "Public sync jobs read" ON public.youtube_sync_jobs FOR SELECT USING (true);
CREATE POLICY "Admin sync jobs write" ON public.youtube_sync_jobs FOR ALL USING (true);
