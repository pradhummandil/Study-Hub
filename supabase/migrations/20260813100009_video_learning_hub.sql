-- Migration: 20260813100009_video_learning_hub.sql
-- Description: Database schema for YouTube Video Learning Hub ecosystem

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. YOUTUBE CHANNELS
CREATE TABLE IF NOT EXISTS public.youtube_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_name TEXT NOT NULL,
    channel_handle TEXT NOT NULL UNIQUE,
    youtube_url TEXT NOT NULL,
    youtube_channel_id TEXT,
    exam TEXT,
    exam_category TEXT NOT NULL,
    subjects TEXT[] DEFAULT '{}',
    branches TEXT[] DEFAULT '{}',
    language TEXT DEFAULT 'Hinglish',
    verified BOOLEAN DEFAULT true,
    active BOOLEAN DEFAULT true,
    priority INT DEFAULT 1,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. YOUTUBE PLAYLISTS
CREATE TABLE IF NOT EXISTS public.youtube_playlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    youtube_playlist_id TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    thumbnail TEXT NOT NULL,
    channel_id UUID REFERENCES public.youtube_channels(id) ON DELETE CASCADE,
    exam TEXT NOT NULL,
    subject TEXT NOT NULL,
    topic TEXT,
    video_count INT DEFAULT 0,
    verified BOOLEAN DEFAULT true,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. YOUTUBE VIDEOS
CREATE TABLE IF NOT EXISTS public.youtube_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    youtube_video_id TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    thumbnail TEXT NOT NULL,
    duration TEXT NOT NULL,
    duration_seconds INT DEFAULT 0,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    channel_id UUID REFERENCES public.youtube_channels(id) ON DELETE CASCADE,
    playlist_ids TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    live_status TEXT DEFAULT 'none',
    video_type TEXT NOT NULL DEFAULT 'LECTURE',
    exam TEXT NOT NULL,
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    language TEXT DEFAULT 'Hinglish',
    source_url TEXT NOT NULL,
    status TEXT DEFAULT 'available',
    featured BOOLEAN DEFAULT false,
    priority INT DEFAULT 1,
    is_archive BOOLEAN DEFAULT false,
    archive_tag TEXT,
    last_synced_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. YOUTUBE COLLECTIONS (Learning Paths)
CREATE TABLE IF NOT EXISTS public.youtube_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    exam TEXT NOT NULL,
    subject TEXT NOT NULL,
    video_ids UUID[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. VIDEO WATCH HISTORY
CREATE TABLE IF NOT EXISTS public.video_watch_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    video_id UUID REFERENCES public.youtube_videos(id) ON DELETE CASCADE,
    youtube_video_id TEXT NOT NULL,
    last_position INT NOT NULL DEFAULT 0,
    duration INT NOT NULL DEFAULT 0,
    progress_percent INT NOT NULL DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    watched_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, youtube_video_id)
);

-- 6. VIDEO NOTES
CREATE TABLE IF NOT EXISTS public.video_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    video_id UUID REFERENCES public.youtube_videos(id) ON DELETE CASCADE,
    youtube_video_id TEXT NOT NULL,
    timestamp_seconds INT NOT NULL,
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. VIDEO SAVED ITEMS
CREATE TABLE IF NOT EXISTS public.video_saved (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    item_type TEXT NOT NULL CHECK (item_type IN ('video', 'playlist')),
    item_id TEXT NOT NULL,
    saved_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, item_type, item_id)
);

-- 8. VIDEO TRANSCRIPTS
CREATE TABLE IF NOT EXISTS public.video_transcripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    youtube_video_id TEXT NOT NULL UNIQUE,
    transcript_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS POLICIES
ALTER TABLE public.youtube_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.youtube_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.youtube_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.youtube_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_watch_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_saved ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_transcripts ENABLE ROW LEVEL SECURITY;

-- Public read for channels, playlists, videos, collections, transcripts
CREATE POLICY "Public channels read" ON public.youtube_channels FOR SELECT USING (true);
CREATE POLICY "Public playlists read" ON public.youtube_playlists FOR SELECT USING (true);
CREATE POLICY "Public videos read" ON public.youtube_videos FOR SELECT USING (status = 'available');
CREATE POLICY "Public collections read" ON public.youtube_collections FOR SELECT USING (true);
CREATE POLICY "Public transcripts read" ON public.video_transcripts FOR SELECT USING (true);

-- User scoped policies
CREATE POLICY "Users watch history owner" ON public.video_watch_history FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users video notes owner" ON public.video_notes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users video saved owner" ON public.video_saved FOR ALL USING (auth.uid() = user_id);

-- Admin manage all
CREATE POLICY "Admin manage channels" ON public.youtube_channels FOR ALL USING (auth.jwt() ->> 'role' IN ('admin', 'super_admin', 'content_editor'));
CREATE POLICY "Admin manage playlists" ON public.youtube_playlists FOR ALL USING (auth.jwt() ->> 'role' IN ('admin', 'super_admin', 'content_editor'));
CREATE POLICY "Admin manage videos" ON public.youtube_videos FOR ALL USING (auth.jwt() ->> 'role' IN ('admin', 'super_admin', 'content_editor'));
CREATE POLICY "Admin manage collections" ON public.youtube_collections FOR ALL USING (auth.jwt() ->> 'role' IN ('admin', 'super_admin', 'content_editor'));
