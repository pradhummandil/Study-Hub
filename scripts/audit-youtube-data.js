// scripts/audit-youtube-data.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function runAudit() {
  console.log('\n========================================================================================');
  console.log('🔍 PHASE 1 & PHASE 89 — SUPABASE YOUTUBE CONTENT DIAGNOSTIC AUDIT REPORT');
  console.log('========================================================================================\n');

  const { data: channels, error: cErr } = await supabase.from('youtube_channels').select('*').order('priority', { ascending: false });
  
  if (cErr) {
    console.error('Error fetching channels:', cErr.message);
    return;
  }

  const reportRows = [];

  let grandTotalVideos = 0;
  let grandTotalShorts = 0;
  let grandTotalPlaylists = 0;
  let grandTotalItems = 0;

  for (const c of channels || []) {
    const { count: vCount } = await supabase.from('youtube_videos').select('*', { count: 'exact', head: true }).eq('channel_id', c.id).eq('is_short', false);
    const { count: sCount } = await supabase.from('youtube_videos').select('*', { count: 'exact', head: true }).eq('channel_id', c.id).eq('is_short', true);
    const { count: pCount } = await supabase.from('youtube_playlists').select('*', { count: 'exact', head: true }).eq('channel_id', c.id);
    const { count: piCount } = await supabase.from('youtube_playlist_items').select('*', { count: 'exact', head: true }).eq('playlist_id', c.id);
    
    const { data: oldest } = await supabase.from('youtube_videos').select('published_at').eq('channel_id', c.id).order('published_at', { ascending: true }).limit(1);
    const { data: newest } = await supabase.from('youtube_videos').select('published_at').eq('channel_id', c.id).order('published_at', { ascending: false }).limit(1);
    const { count: unavailCount } = await supabase.from('youtube_videos').select('*', { count: 'exact', head: true }).eq('channel_id', c.id).eq('status', 'unavailable');

    const totalV = (vCount || 0) + (sCount || 0);
    grandTotalVideos += (vCount || 0);
    grandTotalShorts += (sCount || 0);
    grandTotalPlaylists += (pCount || 0);
    grandTotalItems += (piCount || 0);

    reportRows.push({
      'Channel Name': c.channel_name,
      'Handle': c.channel_handle,
      'Channel ID': c.id,
      'Videos': vCount || 0,
      'Shorts': sCount || 0,
      'Total Uploads': totalV,
      'Playlists': pCount || 0,
      'Oldest Video': oldest?.[0]?.published_at ? oldest[0].published_at.substring(0, 10) : 'N/A',
      'Newest Video': newest?.[0]?.published_at ? newest[0].published_at.substring(0, 10) : 'N/A',
      'Unavailable': unavailCount || 0,
    });
  }

  console.table(reportRows);

  console.log('\n========================================================================================');
  console.log('📊 OVERALL TOTALS IN SUPABASE DATABASE');
  console.log('========================================================================================');
  console.log(`  • TOTAL REGULAR VIDEOS : ${grandTotalVideos}`);
  console.log(`  • TOTAL SHORTS         : ${grandTotalShorts}`);
  console.log(`  • TOTAL ALL CONTENT    : ${grandTotalVideos + grandTotalShorts}`);
  console.log(`  • TOTAL PLAYLISTS      : ${grandTotalPlaylists}`);
  console.log(`  • TOTAL PLAYLIST ITEMS : ${grandTotalItems}`);
  console.log('========================================================================================\n');
}

runAudit().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
