// src/lib/videoLearningApi.ts
import { supabase } from './supabase';
import type {
  YouTubeChannel,
  YouTubePlaylist,
  YouTubeVideo,
  YouTubeCollection,
  VideoWatchHistory,
  VideoNote,
  SavedVideoItem,
  VideoLearningFilters,
} from '../types/video-learning';

// Real YouTube Data Payload (generated from real YouTube channels sync)
import realData from '../data/realYoutubeData.json';

const LOCAL_WATCH_KEY = 'studyhub_video_watch_history';
const LOCAL_SAVED_KEY = 'studyhub_saved_video_items';
const LOCAL_NOTES_KEY = 'studyhub_video_notes';

export interface PaginatedVideosResponse {
  videos: YouTubeVideo[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ----------------------------------------------------
// FETCH CHANNELS
// ----------------------------------------------------
export async function fetchChannels(): Promise<YouTubeChannel[]> {
  try {
    const { data, error } = await supabase.from('youtube_channels').select('*').order('priority', { ascending: false });
    if (!error && data && data.length > 0) {
      return data as YouTubeChannel[];
    }
  } catch (err) {
    console.warn('Using fallback sync dataset for channels:', err);
  }
  return (realData.channels || []) as unknown as YouTubeChannel[];
}

export async function fetchChannelByHandleOrId(identifier: string): Promise<YouTubeChannel | null> {
  const channels = await fetchChannels();
  const lower = identifier.toLowerCase();
  return (
    channels.find(
      (c) =>
        c.id === identifier ||
        c.channel_handle.toLowerCase() === lower ||
        c.channel_handle.toLowerCase() === `@${lower}` ||
        c.youtube_channel_id === identifier
    ) || null
  );
}

// ----------------------------------------------------
// PAGINATED FETCH VIDEOS WITH SERVER-SIDE DB FILTERS
// ----------------------------------------------------
export async function fetchVideosPaginated(
  page: number = 1,
  pageSize: number = 24,
  filters?: VideoLearningFilters
): Promise<PaginatedVideosResponse> {
  let list: YouTubeVideo[] = [];
  let totalCount = 0;

  try {
    let query = supabase.from('youtube_videos').select('*', { count: 'exact' }).eq('status', 'available').eq('is_short', false);

    // Apply exam filter
    if (filters?.exam && filters.exam !== 'All Exams' && filters.exam !== 'All') {
      query = query.ilike('exam', `%${filters.exam}%`);
    }

    // Apply subject filter
    if (filters?.subject && filters.subject !== 'All Subjects' && filters.subject !== 'All') {
      query = query.eq('subject', filters.subject);
    }

    // Apply topic filter
    if (filters?.topic && filters.topic !== 'All Topics' && filters.topic !== 'All') {
      query = query.eq('topic', filters.topic);
    }

    // Apply channel filter
    if (filters?.channelId) {
      query = query.eq('channel_id', filters.channelId);
    }

    // Apply type filter
    if (filters?.type && filters.type !== 'ALL') {
      query = query.eq('video_type', filters.type);
    }

    // Apply text search
    if (filters?.searchQuery && filters.searchQuery.trim()) {
      const q = filters.searchQuery.trim();
      query = query.or(`title.ili.*${q}*,description.ili.*${q}*,channel_name.ili.*${q}*,subject.ili.*${q}*,topic.ili.*${q}*,exam.ili.*${q}*`);
    }

    // Apply duration filter
    if (filters?.duration && filters.duration !== 'all') {
      if (filters.duration === 'short') query = query.lt('duration_seconds', 600); // < 10 mins
      else if (filters.duration === 'medium') query = query.gte('duration_seconds', 600).lte('duration_seconds', 1800); // 10-30 mins
      else if (filters.duration === 'long') query = query.gt('duration_seconds', 1800); // > 30 mins
    }

    // Apply sorting
    if (filters?.sort === 'newest') query = query.order('published_at', { ascending: false });
    else if (filters?.sort === 'oldest') query = query.order('published_at', { ascending: true });
    else if (filters?.sort === 'longest') query = query.order('duration_seconds', { ascending: false });
    else if (filters?.sort === 'shortest') query = query.order('duration_seconds', { ascending: true });
    else query = query.order('priority', { ascending: false }).order('published_at', { ascending: false });

    // Pagination range
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (!error && data && data.length > 0) {
      list = data as YouTubeVideo[];
      totalCount = count || data.length;
    }
  } catch (err) {
    console.warn('Database query fallback to sync dataset:', err);
  }

  // Fallback to local sync dataset if DB returned 0 records or had error
  if (list.length === 0 && page === 1) {
    let fallback = (realData.videos || []).filter((v) => !v.is_short) as unknown as YouTubeVideo[];

    if (filters?.exam && filters.exam !== 'All Exams' && filters.exam !== 'All') {
      const exLow = filters.exam.toLowerCase();
      fallback = fallback.filter((v) => v.exam.toLowerCase().includes(exLow) || (exLow.includes('gate') && v.exam.toLowerCase().includes('gate')));
    }
    if (filters?.subject && filters.subject !== 'All Subjects' && filters.subject !== 'All') {
      fallback = fallback.filter((v) => v.subject.toLowerCase().includes(filters.subject!.toLowerCase()));
    }
    if (filters?.topic && filters.topic !== 'All Topics' && filters.topic !== 'All') {
      fallback = fallback.filter((v) => v.topic.toLowerCase().includes(filters.topic!.toLowerCase()));
    }
    if (filters?.channelId) {
      fallback = fallback.filter((v) => v.channel_id === filters.channelId);
    }
    if (filters?.type && filters.type !== 'ALL') {
      fallback = fallback.filter((v) => v.video_type === filters.type);
    }
    if (filters?.searchQuery && filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      fallback = fallback.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.subject.toLowerCase().includes(q) ||
          v.topic.toLowerCase().includes(q) ||
          v.channel_name?.toLowerCase().includes(q) ||
          v.exam.toLowerCase().includes(q)
      );
    }

    if (filters?.sort === 'newest') fallback.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
    else if (filters?.sort === 'oldest') fallback.sort((a, b) => new Date(a.published_at).getTime() - new Date(b.published_at).getTime());
    else if (filters?.sort === 'longest') fallback.sort((a, b) => b.duration_seconds - a.duration_seconds);
    else if (filters?.sort === 'shortest') fallback.sort((a, b) => a.duration_seconds - b.duration_seconds);

    totalCount = fallback.length;
    const startIdx = (page - 1) * pageSize;
    list = fallback.slice(startIdx, startIdx + pageSize);
  }

  return {
    videos: list,
    totalCount,
    page,
    pageSize,
    hasMore: (page - 1) * pageSize + list.length < totalCount,
  };
}

export async function fetchVideos(filters?: VideoLearningFilters): Promise<YouTubeVideo[]> {
  const res = await fetchVideosPaginated(1, 100, filters);
  return res.videos;
}

// ----------------------------------------------------
// FETCH PLAYLISTS
// ----------------------------------------------------
export async function fetchPlaylists(exam?: string, channelId?: string): Promise<YouTubePlaylist[]> {
  let list: YouTubePlaylist[] = [];

  try {
    let query = supabase.from('youtube_playlists').select('*').order('created_at', { ascending: false });
    if (exam && exam !== 'All Exams' && exam !== 'All') {
      query = query.ilike('exam', `%${exam}%`);
    }
    if (channelId) {
      query = query.eq('channel_id', channelId);
    }
    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      list = data as YouTubePlaylist[];
    }
  } catch (err) {
    console.warn('Using sync dataset for playlists:', err);
  }

  if (list.length === 0) {
    list = (realData.playlists || []) as unknown as YouTubePlaylist[];
    if (exam && exam !== 'All Exams' && exam !== 'All') {
      const exLow = exam.toLowerCase();
      list = list.filter((p) => p.exam.toLowerCase().includes(exLow) || (exLow.includes('gate') && p.exam.toLowerCase().includes('gate')));
    }
    if (channelId) {
      list = list.filter((p) => p.channel_id === channelId);
    }
  }

  return list;
}

// ----------------------------------------------------
// FETCH SHORTS
// ----------------------------------------------------
export async function fetchShorts(exam?: string, category?: string): Promise<YouTubeVideo[]> {
  let list: YouTubeVideo[] = [];

  try {
    let query = supabase.from('youtube_videos').select('*').eq('is_short', true).order('published_at', { ascending: false });
    if (exam && exam !== 'All Exams' && exam !== 'All') {
      query = query.ilike('exam', `%${exam}%`);
    }
    if (category && category !== 'All') {
      query = query.or(`subject.ili.*${category}*,topic.ili.*${category}*,title.ili.*${category}*`);
    }
    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      list = data as YouTubeVideo[];
    }
  } catch (err) {
    console.warn('Using sync dataset for shorts:', err);
  }

  if (list.length === 0) {
    const allV = (realData.videos || []) as unknown as YouTubeVideo[];
    list = allV.filter((v) => v.is_short || v.video_type === 'SHORT');
    if (exam && exam !== 'All Exams' && exam !== 'All') {
      const exLow = exam.toLowerCase();
      list = list.filter((v) => v.exam.toLowerCase().includes(exLow));
    }
    if (category && category !== 'All') {
      const catLow = category.toLowerCase();
      list = list.filter((v) => v.subject.toLowerCase().includes(catLow) || v.topic.toLowerCase().includes(catLow) || v.title.toLowerCase().includes(catLow));
    }
  }

  return list;
}

// ----------------------------------------------------
// FETCH BY ID & COLLECTIONS
// ----------------------------------------------------
export async function fetchVideoById(videoId: string): Promise<YouTubeVideo | null> {
  try {
    const { data, error } = await supabase
      .from('youtube_videos')
      .select('*')
      .or(`id.eq.${videoId},youtube_video_id.eq.${videoId}`)
      .maybeSingle();

    if (!error && data) {
      return data as YouTubeVideo;
    }
  } catch (err) {
    console.warn('DB fetch error for video:', err);
  }

  const all = (realData.videos || []) as unknown as YouTubeVideo[];
  return all.find((v) => v.id === videoId || v.youtube_video_id === videoId) || null;
}

export async function fetchPlaylistById(playlistId: string): Promise<YouTubePlaylist | null> {
  let found: YouTubePlaylist | null = null;

  try {
    const { data, error } = await supabase
      .from('youtube_playlists')
      .select('*')
      .or(`id.eq.${playlistId},youtube_playlist_id.eq.${playlistId}`)
      .maybeSingle();

    if (!error && data) {
      found = data as YouTubePlaylist;
    }
  } catch (err) {
    console.warn('DB fetch error for playlist:', err);
  }

  if (!found) {
    const allPlaylists = (realData.playlists || []) as unknown as YouTubePlaylist[];
    found = allPlaylists.find((p) => p.id === playlistId || p.youtube_playlist_id === playlistId) || null;
  }

  if (found) {
    const allVideos = await fetchVideos({ exam: found.exam, subject: found.subject });
    const matchingVideos = allVideos.filter(
      (v) => v.channel_id === found!.channel_id || v.subject.toLowerCase().includes(found!.subject.toLowerCase())
    );
    found.videos = matchingVideos.length > 0 ? matchingVideos : allVideos.slice(0, 12);
    found.video_count = found.videos.length;
  }

  return found;
}

export async function fetchCollectionBySlug(slug: string): Promise<YouTubeCollection | null> {
  const allVideos = await fetchVideos();
  return {
    id: `col-${slug}`,
    slug,
    title: `${slug.toUpperCase()} Master Learning Path`,
    description: `Curated learning sequence for ${slug}`,
    exam: 'GATE',
    subject: slug,
    video_ids: allVideos.slice(0, 5).map((v) => v.id),
    videos: allVideos.slice(0, 5),
  };
}

// ----------------------------------------------------
// WATCH HISTORY & USER PROGRESS
// ----------------------------------------------------
export async function saveWatchProgress(
  userId: string,
  videoId: string,
  youtubeVideoId: string,
  lastPositionSec: number,
  durationSec: number
): Promise<void> {
  const percent = durationSec > 0 ? Math.min(100, Math.round((lastPositionSec / durationSec) * 100)) : 0;
  const completed = percent >= 90;

  const item: VideoWatchHistory = {
    user_id: userId,
    video_id: videoId,
    youtube_video_id: youtubeVideoId,
    last_position: lastPositionSec,
    duration: durationSec,
    progress_percent: percent,
    completed,
    watched_at: new Date().toISOString(),
  };

  try {
    await supabase.from('video_watch_history').upsert(item, { onConflict: 'user_id,youtube_video_id' });
  } catch {
    // ignore
  }

  const historyMap: Record<string, VideoWatchHistory> = JSON.parse(localStorage.getItem(LOCAL_WATCH_KEY) || '{}');
  historyMap[youtubeVideoId] = item;
  localStorage.setItem(LOCAL_WATCH_KEY, JSON.stringify(historyMap));
}

export function getVideoWatchState(youtubeVideoId: string): VideoWatchHistory | null {
  const historyMap: Record<string, VideoWatchHistory> = JSON.parse(localStorage.getItem(LOCAL_WATCH_KEY) || '{}');
  return historyMap[youtubeVideoId] || null;
}

export function getLocalWatchHistory(): VideoWatchHistory[] {
  const historyMap: Record<string, VideoWatchHistory> = JSON.parse(localStorage.getItem(LOCAL_WATCH_KEY) || '{}');
  return Object.values(historyMap);
}

// ----------------------------------------------------
// PERSONAL NOTES & TIMESTAMPS
// ----------------------------------------------------
export function getLocalNotes(youtubeVideoId: string): VideoNote[] {
  const allNotes: VideoNote[] = JSON.parse(localStorage.getItem(LOCAL_NOTES_KEY) || '[]');
  return allNotes.filter((n) => n.youtube_video_id === youtubeVideoId);
}

export async function addVideoNote(
  userId: string,
  videoId: string,
  youtubeVideoId: string,
  timestampSec: number,
  noteText: string
): Promise<VideoNote> {
  const newNote: VideoNote = {
    id: `note-${Date.now()}`,
    user_id: userId,
    video_id: videoId,
    youtube_video_id: youtubeVideoId,
    timestamp_seconds: timestampSec,
    note: noteText,
    created_at: new Date().toISOString(),
  };

  try {
    await supabase.from('video_notes').insert(newNote);
  } catch {
    // ignore
  }

  const allNotes: VideoNote[] = JSON.parse(localStorage.getItem(LOCAL_NOTES_KEY) || '[]');
  allNotes.unshift(newNote);
  localStorage.setItem(LOCAL_NOTES_KEY, JSON.stringify(allNotes));
  return newNote;
}

export function deleteVideoNote(noteId: string): void {
  const allNotes: VideoNote[] = JSON.parse(localStorage.getItem(LOCAL_NOTES_KEY) || '[]');
  const filtered = allNotes.filter((n) => n.id !== noteId);
  localStorage.setItem(LOCAL_NOTES_KEY, JSON.stringify(filtered));
}

// ----------------------------------------------------
// SAVED ITEMS
// ----------------------------------------------------
export function isItemSaved(itemId: string, itemType: 'video' | 'playlist'): boolean {
  const savedList: SavedVideoItem[] = JSON.parse(localStorage.getItem(LOCAL_SAVED_KEY) || '[]');
  return savedList.some((s) => s.item_id === itemId && s.item_type === itemType);
}

export function getLocalSavedItems(): SavedVideoItem[] {
  return JSON.parse(localStorage.getItem(LOCAL_SAVED_KEY) || '[]');
}

export async function toggleSaveItem(userId: string, itemId: string, itemType: 'video' | 'playlist'): Promise<boolean> {
  const savedList: SavedVideoItem[] = JSON.parse(localStorage.getItem(LOCAL_SAVED_KEY) || '[]');
  const idx = savedList.findIndex((s) => s.item_id === itemId && s.item_type === itemType);

  let isNowSaved = false;
  if (idx >= 0) {
    savedList.splice(idx, 1);
    isNowSaved = false;
    try {
      await supabase.from('video_saved').delete().match({ user_id: userId, item_id: itemId, item_type: itemType });
    } catch {
      // ignore
    }
  } else {
    const newItem: SavedVideoItem = {
      id: `saved-${Date.now()}`,
      user_id: userId,
      item_type: itemType,
      item_id: itemId,
      saved_at: new Date().toISOString(),
    };
    savedList.push(newItem);
    isNowSaved = true;
    try {
      await supabase.from('video_saved').upsert(newItem, { onConflict: 'user_id,item_type,item_id' });
    } catch {
      // ignore
    }
  }

  localStorage.setItem(LOCAL_SAVED_KEY, JSON.stringify(savedList));
  return isNowSaved;
}

// ----------------------------------------------------
// ADMIN CMS IMPORT ACTIONS
// ----------------------------------------------------
export async function addCustomChannel(channel: Partial<YouTubeChannel>): Promise<YouTubeChannel> {
  const newChan: YouTubeChannel = {
    id: `ch-custom-${Date.now()}`,
    channel_name: channel.channel_name || 'Custom Channel',
    channel_handle: channel.channel_handle || '@custom',
    youtube_url: channel.youtube_url || 'https://www.youtube.com',
    youtube_channel_id: channel.youtube_channel_id || `UC_custom_${Date.now()}`,
    exam: channel.exam || 'General',
    exam_category: channel.exam_category || 'General',
    subjects: channel.subjects || ['General'],
    language: 'Hinglish',
    verified: true,
    active: true,
    priority: 10,
    description: channel.description || 'Imported via Admin UI',
    avatar_url: channel.avatar_url || 'https://yt3.googleusercontent.com/9C0637F55s9zY8P8e-28D6uY75N4m_uP-b7h_zQ2F2eZ7s-f1A_7L2v1t-G-V9e_X-8v_b-1=s176-c-k-c0x00ffffff-no-rj',
  };

  try {
    await supabase.from('youtube_channels').insert(newChan);
  } catch (err) {
    console.warn('Saved custom channel locally:', err);
  }
  return newChan;
}

export async function addCustomVideo(video: Partial<YouTubeVideo>): Promise<YouTubeVideo> {
  const ytId = video.youtube_video_id || 'WBb35lYjS-0';
  const newVid: YouTubeVideo = {
    id: `vid-custom-${Date.now()}`,
    youtube_video_id: ytId,
    title: video.title || 'Imported YouTube Video',
    description: video.description || 'Imported via Admin CMS',
    thumbnail: video.thumbnail || `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
    duration: video.duration || '45m',
    duration_seconds: video.duration_seconds || 2700,
    published_at: new Date().toISOString(),
    channel_id: video.channel_id || 'ch-pw-jee-wallah',
    channel_name: video.channel_name || 'Verified Source',
    video_type: video.video_type || 'LECTURE',
    exam: video.exam || 'GATE',
    subject: video.subject || 'General Studies',
    topic: video.topic || 'General Topic',
    language: 'Hinglish',
    source_url: `https://www.youtube.com/watch?v=${ytId}`,
    status: 'available',
    featured: true,
    is_short: video.is_short || false,
  };

  try {
    await supabase.from('youtube_videos').insert(newVid);
  } catch (err) {
    console.warn('Saved custom video locally:', err);
  }
  return newVid;
}

// ----------------------------------------------------
// FORMAT TIME HELPER
// ----------------------------------------------------
export function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}
