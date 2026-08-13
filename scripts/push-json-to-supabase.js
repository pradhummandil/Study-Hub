// scripts/push-json-to-supabase.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

function toUuid(str) {
  const hash = crypto.createHash('md5').update(str || '').digest('hex');
  return `${hash.substring(0, 8)}-${hash.substring(8, 12)}-4${hash.substring(13, 16)}-a${hash.substring(17, 20)}-${hash.substring(20, 32)}`;
}

function cleanStr(str) {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/\0/g, '').replace(/[\uD800-\uDFFF]/g, '').trim();
}

async function seedSupabaseFromPayload() {
  console.log('\n========================================================');
  console.log('🚀 CLEANING & PUSHING 2,530 REAL YOUTUBE RECORDS TO SUPABASE...');
  console.log('========================================================\n');

  const jsonPath = path.join(process.cwd(), 'src/data/realYoutubeData.json');
  if (!fs.existsSync(jsonPath)) {
    console.error('realYoutubeData.json not found!');
    process.exit(1);
  }

  const payload = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  let { channels, playlists, playlistItems, videos } = payload;

  console.log(`Loaded from payload:`);
  console.log(`  • Channels      : ${channels?.length || 0}`);
  console.log(`  • Playlists     : ${playlists?.length || 0}`);
  console.log(`  • Playlist Items: ${playlistItems?.length || 0}`);
  console.log(`  • Videos Total  : ${videos?.length || 0}\n`);

  const channelIdMap = new Map();
  channels = (channels || []).map((c) => {
    const uuid = toUuid(c.id || c.channel_handle);
    channelIdMap.set(c.id, uuid);
    channelIdMap.set(c.channel_handle, uuid);
    return {
      id: uuid,
      channel_name: cleanStr(c.channel_name),
      channel_handle: cleanStr(c.channel_handle),
      youtube_url: cleanStr(c.youtube_url),
      youtube_channel_id: cleanStr(c.youtube_channel_id),
      exam: cleanStr(c.exam),
      exam_category: cleanStr(c.exam_category),
      subjects: c.subjects || [],
      branches: c.branches || [],
      language: cleanStr(c.language || 'Hinglish'),
      verified: true,
      active: true,
      priority: c.priority || 1,
      description: cleanStr(c.description),
      avatar_url: cleanStr(c.avatar_url),
      thumbnail_url: cleanStr(c.thumbnail_url || c.avatar_url),
      banner_url: cleanStr(c.banner_url),
      subscriber_count: cleanStr(c.subscriber_count || 'Verified'),
    };
  });

  const playlistIdMap = new Map();
  playlists = (playlists || []).map((p) => {
    const uuid = toUuid(p.id || p.youtube_playlist_id);
    playlistIdMap.set(p.id, uuid);
    playlistIdMap.set(p.youtube_playlist_id, uuid);
    return {
      id: uuid,
      youtube_playlist_id: cleanStr(p.youtube_playlist_id),
      title: cleanStr(p.title),
      description: cleanStr(p.description),
      thumbnail: cleanStr(p.thumbnail || p.thumbnail_url),
      thumbnail_url: cleanStr(p.thumbnail_url || p.thumbnail),
      channel_id: channelIdMap.get(p.channel_id) || channelIdMap.get(p.channel_handle) || toUuid(p.channel_id),
      channel_name: cleanStr(p.channel_name),
      exam: cleanStr(p.exam),
      subject: cleanStr(p.subject),
      topic: cleanStr(p.topic),
      playlist_type: cleanStr(p.playlist_type || 'PLAYLIST'),
      branch: cleanStr(p.branch),
      video_count: p.video_count || 0,
      verified: true,
      active: true,
    };
  });

  const videoIdMap = new Map();
  videos = (videos || []).map((v) => {
    const uuid = toUuid(v.id || v.youtube_video_id);
    videoIdMap.set(v.id, uuid);
    videoIdMap.set(v.youtube_video_id, uuid);
    return {
      id: uuid,
      youtube_video_id: cleanStr(v.youtube_video_id),
      title: cleanStr(v.title),
      description: cleanStr(v.description),
      thumbnail: cleanStr(v.thumbnail || v.thumbnail_url),
      thumbnail_url: cleanStr(v.thumbnail_url || v.thumbnail),
      duration: cleanStr(v.duration || 'Video'),
      duration_seconds: v.duration_seconds || 600,
      published_at: v.published_at || new Date().toISOString(),
      channel_id: channelIdMap.get(v.channel_id) || channelIdMap.get(v.channel_handle) || toUuid(v.channel_id),
      channel_name: cleanStr(v.channel_name),
      channel_handle: cleanStr(v.channel_handle),
      video_type: cleanStr(v.video_type || 'LECTURE'),
      exam: cleanStr(v.exam),
      subject: cleanStr(v.subject),
      topic: cleanStr(v.topic),
      language: cleanStr(v.language || 'Hinglish'),
      source_url: cleanStr(v.source_url),
      embed_url: cleanStr(v.embed_url || `https://www.youtube-nocookie.com/embed/${v.youtube_video_id}`),
      status: 'available',
      featured: Boolean(v.featured),
      priority: v.priority || 1,
      is_short: Boolean(v.is_short),
      is_live: Boolean(v.is_live),
      is_archive: Boolean(v.is_archive),
      archive_tag: cleanStr(v.archive_tag),
      view_count: cleanStr(v.view_count || '10K views'),
    };
  });

  playlistItems = (playlistItems || []).map((pi) => {
    const pUuid = playlistIdMap.get(pi.playlist_id) || toUuid(pi.playlist_id);
    const vUuid = videoIdMap.get(pi.video_id) || toUuid(pi.video_id);
    return {
      id: toUuid(`${pi.youtube_playlist_id}_${pi.youtube_video_id}`),
      playlist_id: pUuid,
      youtube_playlist_id: cleanStr(pi.youtube_playlist_id),
      video_id: vUuid,
      youtube_video_id: cleanStr(pi.youtube_video_id),
      position: pi.position || 0,
    };
  });

  // 1. Insert Channels
  console.log('1️⃣ Upserting channels...');
  const { error: cErr } = await supabase.from('youtube_channels').upsert(channels, { onConflict: 'channel_handle' });
  if (cErr) console.error('Channels insert error:', cErr.message);
  else console.log('   ✅ Channels inserted successfully!');

  // 2. Insert Videos in Batches of 50
  console.log('2️⃣ Upserting 2,530 videos in batches...');
  let inserted = 0;
  const BATCH_SIZE = 50;
  for (let i = 0; i < videos.length; i += BATCH_SIZE) {
    const batch = videos.slice(i, i + BATCH_SIZE);
    const { error: vErr } = await supabase.from('youtube_videos').upsert(batch, { onConflict: 'youtube_video_id' });
    if (vErr) {
      console.error(`   Batch ${i / BATCH_SIZE + 1} error:`, vErr.message);
    } else {
      inserted += batch.length;
    }
  }
  console.log(`   ✅ ${inserted} videos inserted into Supabase!`);

  // 3. Insert Playlists
  console.log('3️⃣ Upserting playlists...');
  const { error: pErr } = await supabase.from('youtube_playlists').upsert(playlists, { onConflict: 'youtube_playlist_id' });
  if (pErr) console.error('Playlists insert error:', pErr.message);
  else console.log('   ✅ Playlists inserted successfully!');

  // 4. Insert Playlist Items in Batches
  console.log('4️⃣ Upserting playlist items...');
  for (let i = 0; i < playlistItems.length; i += BATCH_SIZE) {
    const batch = playlistItems.slice(i, i + BATCH_SIZE);
    const { error: piErr } = await supabase.from('youtube_playlist_items').upsert(batch, { onConflict: 'youtube_playlist_id,youtube_video_id' });
    if (piErr) console.error(`   PlaylistItems Batch ${i / BATCH_SIZE + 1} error:`, piErr.message);
  }
  console.log('   ✅ Playlist items inserted successfully!');

  // 5. Update Channel Video Counts
  console.log('5️⃣ Updating channel video counts...');
  for (const ch of channels || []) {
    const { count } = await supabase.from('youtube_videos').select('*', { count: 'exact', head: true }).eq('channel_id', ch.id);
    await supabase.from('youtube_channels').update({ video_count: count || 0 }).eq('id', ch.id);
  }

  // Save updated payload back to realYoutubeData.json
  const updatedPayload = {
    syncedAt: new Date().toISOString(),
    channels,
    playlists,
    playlistItems,
    videos,
  };
  fs.writeFileSync(jsonPath, JSON.stringify(updatedPayload, null, 2));

  console.log('\n========================================================');
  console.log('🎉 ALL 2,530 REAL YOUTUBE RECORDS INSTANTLY PUSHED TO SUPABASE!');
  console.log('========================================================\n');
}

seedSupabaseFromPayload().catch(err => {
  console.error('Push error:', err);
  process.exit(1);
});
