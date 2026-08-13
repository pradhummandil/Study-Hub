// src/lib/server/youtube/syncEngine.ts
/**
 * Server-side YouTube Content Import & Sync Engine
 * 
 * IMPORTANT:
 * Uses server-side YOUTUBE_API_KEY if present in environment.
 * NEVER exposes API keys to client JavaScript.
 */

import { supabase } from '../../supabase';
import type { YouTubeChannel, YouTubeVideo, YouTubePlaylist, VideoContentType } from '../../../types/video-learning';

export interface SyncResult {
  channelHandle: string;
  videosDiscovered: number;
  videosImported: number;
  playlistsImported: number;
  shortsImported: number;
  unavailableCount: number;
  status: 'completed' | 'failed';
  error?: string;
}

export const CONFIGURED_TARGET_CHANNELS = [
  {
    handle: '@PW-JEEWallah',
    name: 'PW JEE Wallah',
    exam: 'JEE Main',
    examCategory: 'JEE',
    subjects: ['Physics', 'Chemistry', 'Mathematics'],
    url: 'https://www.youtube.com/@PW-JEEWallah',
  },
  {
    handle: '@PWNEET-Official',
    name: 'PW NEET Official',
    exam: 'NEET',
    examCategory: 'NEET',
    subjects: ['Physics', 'Chemistry', 'Biology'],
    url: 'https://www.youtube.com/@PWNEET-Official',
  },
  {
    handle: '@PhysicsWallah',
    name: 'Physics Wallah - Alakh Pandey',
    exam: 'NEET',
    examCategory: 'NEET',
    subjects: ['Physics', 'Chemistry'],
    url: 'https://www.youtube.com/@PhysicsWallah',
  },
  {
    handle: '@gatewallah_cse_da',
    name: 'GATE Wallah CSE & DA',
    exam: 'GATE',
    examCategory: 'GATE',
    subjects: ['Programming', 'Data Structures', 'Algorithms', 'OS', 'DBMS', 'Computer Networks', 'TOC', 'Compiler Design', 'COA', 'Digital Logic', 'Engineering Mathematics', 'General Aptitude', 'Data Science & AI'],
    branches: ['Computer Science', 'Information Technology', 'Data Science & AI'],
    url: 'https://www.youtube.com/@gatewallah_cse_da',
  },
  {
    handle: '@GATEWallah_ECE_EE_IN',
    name: 'GATE Wallah ECE EE IN',
    exam: 'GATE',
    examCategory: 'GATE',
    subjects: ['Network Theory', 'Control Systems', 'Signals & Systems', 'Analog Circuits', 'Digital Circuits', 'EMFT', 'Electrical Machines', 'Power Systems'],
    branches: ['ECE', 'EE', 'IN'],
    url: 'https://www.youtube.com/@GATEWallah_ECE_EE_IN',
  },
  {
    handle: '@gatewallah_me_ce_xe_ch',
    name: 'GATE Wallah ME CE XE CH',
    exam: 'GATE',
    examCategory: 'GATE',
    subjects: ['Thermodynamics', 'Fluid Mechanics', 'Strength of Materials', 'Theory of Machines', 'Structural Analysis', 'Geotechnical Engineering'],
    branches: ['ME', 'CE', 'XE', 'CH', 'PI', 'ES'],
    url: 'https://www.youtube.com/@gatewallah_me_ce_xe_ch',
  },
];

export async function getChannelByHandle(handle: string): Promise<YouTubeChannel | null> {
  const { data, error } = await supabase
    .from('youtube_channels')
    .select('*')
    .eq('channel_handle', handle)
    .single();

  if (error || !data) return null;
  return data as YouTubeChannel;
}

export async function getChannelVideos(channelId: string): Promise<YouTubeVideo[]> {
  const { data, error } = await supabase
    .from('youtube_videos')
    .select('*')
    .eq('channel_id', channelId)
    .order('published_at', { ascending: false });

  if (error || !data) return [];
  return data as YouTubeVideo[];
}

export async function getChannelPlaylists(channelId: string): Promise<YouTubePlaylist[]> {
  const { data, error } = await supabase
    .from('youtube_playlists')
    .select('*')
    .eq('channel_id', channelId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data as YouTubePlaylist[];
}

export async function getVideoDetails(youtubeVideoId: string): Promise<YouTubeVideo | null> {
  const { data, error } = await supabase
    .from('youtube_videos')
    .select('*')
    .eq('youtube_video_id', youtubeVideoId)
    .single();

  if (error || !data) return null;
  return data as YouTubeVideo;
}

export async function getShorts(exam?: string): Promise<YouTubeVideo[]> {
  let query = supabase
    .from('youtube_videos')
    .select('*')
    .eq('is_short', true)
    .order('published_at', { ascending: false });

  if (exam && exam !== 'All Exams') {
    query = query.ilike('exam', `%${exam}%`);
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return data as YouTubeVideo[];
}

/**
 * Classifies a video title into appropriate educational type
 */
export function classifyVideoType(title: string, isShort: boolean = false): VideoContentType {
  if (isShort) return 'SHORT';
  const t = title.toUpperCase();
  if (t.includes('ONE SHOT') || t.includes('ONESHOT') || t.includes('MARATHON')) return 'ONE_SHOT';
  if (t.includes('PYQ') || t.includes('PREVIOUS YEAR') || t.includes('QUESTIONS')) return 'PYQ';
  if (t.includes('REVISION') || t.includes('QUICK REVISION') || t.includes('FORMULA')) return 'REVISION';
  if (t.includes('CRASH COURSE') || t.includes('BOOSTER')) return 'CRASH_COURSE';
  if (t.includes('STRATEGY') || t.includes('ROADMAP') || t.includes('TIPS')) return 'STRATEGY';
  if (t.includes('LIVE') || t.includes('STREAM')) return 'LIVE';
  return 'LECTURE';
}
