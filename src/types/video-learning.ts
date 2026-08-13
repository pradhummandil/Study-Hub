// src/types/video-learning.ts

export type VideoContentType =
  | 'LECTURE'
  | 'ONE_SHOT'
  | 'PYQ'
  | 'REVISION'
  | 'CRASH_COURSE'
  | 'STRATEGY'
  | 'DOUBT_SOLVING'
  | 'MOTIVATION'
  | 'SHORT'
  | 'LIVE'
  | 'PLAYLIST';

export type VideoLanguage = 'English' | 'Hindi' | 'Hinglish' | 'Tamil' | 'Telugu' | 'Other';
export type VideoDifficulty = 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
export type VideoDurationFilter = 'all' | 'short' | 'medium' | 'long';

export interface YouTubeChannel {
  id: string;
  channel_name: string;
  channel_handle: string;
  youtube_url: string;
  youtube_channel_id?: string;
  exam?: string;
  exam_category: string;
  subjects: string[];
  branches?: string[];
  language: VideoLanguage;
  verified: boolean;
  active: boolean;
  priority: number;
  description: string;
  avatar_url?: string;
  thumbnail_url?: string;
  banner_url?: string | null;
  subscriber_count?: string;
  created_at?: string;
  updated_at?: string;
}

export interface YouTubePlaylist {
  id: string;
  youtube_playlist_id: string;
  title: string;
  description: string;
  thumbnail: string;
  thumbnail_url?: string;
  channel_id: string;
  channel_name?: string;
  exam: string;
  subject: string;
  topic?: string;
  video_count: number;
  verified: boolean;
  active: boolean;
  created_at?: string;
  updated_at?: string;
  videos?: YouTubeVideo[];
}

export interface YouTubeVideo {
  id: string;
  youtube_video_id: string;
  title: string;
  description: string;
  thumbnail: string;
  thumbnail_url?: string;
  duration: string;
  duration_seconds: number;
  published_at: string;
  channel_id: string;
  channel_name?: string;
  channel_handle?: string;
  playlist_ids?: string[];
  tags?: string[];
  live_status?: 'none' | 'upcoming' | 'live' | 'completed';
  video_type: VideoContentType;
  exam: string;
  subject: string;
  topic: string;
  language: VideoLanguage;
  difficulty?: VideoDifficulty;
  source_url: string;
  embed_url?: string;
  status: 'available' | 'private' | 'deleted' | 'unavailable';
  featured?: boolean;
  priority?: number;
  is_short?: boolean;
  is_live?: boolean;
  is_archive?: boolean;
  archive_tag?: string;
  view_count?: string;
  last_synced_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface YouTubeCollection {
  id: string;
  slug: string;
  title: string;
  description: string;
  exam: string;
  subject: string;
  video_ids: string[];
  videos?: YouTubeVideo[];
  created_at?: string;
  updated_at?: string;
}

export interface VideoWatchHistory {
  id?: string;
  user_id: string;
  video_id: string;
  youtube_video_id: string;
  last_position: number;
  duration: number;
  progress_percent: number;
  completed: boolean;
  watched_at: string;
  video?: YouTubeVideo;
}

export interface VideoNote {
  id: string;
  user_id: string;
  video_id: string;
  youtube_video_id: string;
  timestamp_seconds: number;
  note: string;
  created_at: string;
}

export interface SavedVideoItem {
  id: string;
  user_id: string;
  item_type: 'video' | 'playlist';
  item_id: string;
  saved_at: string;
  video?: YouTubeVideo;
  playlist?: YouTubePlaylist;
}

export interface VideoTranscript {
  id?: string;
  youtube_video_id: string;
  transcript_text: string;
  created_at?: string;
}

export interface VideoLearningFilters {
  exam?: string;
  subject?: string;
  topic?: string;
  branch?: string;
  channelId?: string;
  type?: VideoContentType | 'ALL';
  duration?: VideoDurationFilter;
  language?: VideoLanguage | 'ALL';
  level?: VideoDifficulty | 'ALL';
  searchQuery?: string;
  onlyVerified?: boolean;
  sort?: 'recommended' | 'newest' | 'oldest' | 'longest' | 'shortest';
}
