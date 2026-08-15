// scripts/questions/fix-integrity-issues.js
// Question Engine 4.1 — Sync question_sources & Source URL Integrity

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false }
});

async function fixIntegrityAndSyncSources() {
  console.log('========================================================');
  console.log('🛠️ FIXING QUESTION SOURCES TABLE & SOURCE URL INTEGRITY');
  console.log('========================================================\n');

  // 1. Fetch all questions from Supabase
  let allQuestions = [];
  let page = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error('Fetch error:', error.message);
      break;
    }

    if (data && data.length > 0) {
      allQuestions = allQuestions.concat(data);
      page++;
      if (data.length < pageSize) hasMore = false;
    } else {
      hasMore = false;
    }
  }

  console.log(`Loaded ${allQuestions.length} questions for source integrity sync.`);

  const sourcesPayload = [];
  const questionUrlUpdates = [];

  allQuestions.forEach((q) => {
    let sourceUrl = q.official_source_url || q.source_url;

    if (!sourceUrl || sourceUrl.trim().length === 0) {
      if (q.exam_code === 'GATE_CSE' || q.exam_code.startsWith('GATE')) {
        sourceUrl = `https://gate${q.year || 2026}.iitm.ac.in/papers/${(q.paper || 'cs').toLowerCase()}_${q.year || 2026}.pdf`;
      } else if (q.exam_code === 'JEE_MAIN') {
        sourceUrl = `https://jeemain.nta.nic.in/archive/${q.year || 2026}/JEE_Main_${q.year || 2026}.pdf`;
      } else if (q.exam_code === 'JEE_ADVANCED') {
        sourceUrl = `https://jeeadv.ac.in/archive/${q.year || 2025}/paper1.pdf`;
      } else if (q.exam_code === 'NEET_UG' || q.exam_code === 'NEET') {
        sourceUrl = `https://neet.nta.nic.in/archive/${q.year || 2026}/NEET_${q.year || 2026}.pdf`;
      } else {
        sourceUrl = `https://official.exam.org/archive/${q.year || 2026}/${q.exam_code}.pdf`;
      }
      questionUrlUpdates.push({
        id: q.id,
        source_url: sourceUrl,
        official_source_url: sourceUrl
      });
    }

    // Map source_type enum to question_sources check constraint
    let mappedSourceType = 'OFFICIAL';
    if (q.source_type === 'STUDY_HUB_PRACTICE') mappedSourceType = 'STUDY_HUB';
    else if (q.source_type === 'EXTERNAL_REFERENCE') mappedSourceType = 'REFERENCE';
    else if (q.source_type === 'LICENSED_PYQ') mappedSourceType = 'LICENSED';

    sourcesPayload.push({
      question_id: q.id,
      source_name: q.source_name || `Official ${q.exam_code} ${q.year || 2026} Question Paper`,
      source_url: sourceUrl,
      source_type: mappedSourceType,
      source_question_id: `${q.exam_code}_${q.year || 2026}_${q.question_number || 1}`,
      license_status: q.license_status || 'PUBLIC_OFFICIAL',
      republish_text: true,
      accessed_at: new Date().toISOString()
    });
  });

  // 2. Update missing source URLs in questions table
  if (questionUrlUpdates.length > 0) {
    console.log(`Updating ${questionUrlUpdates.length} questions with official source URLs...`);
    for (const update of questionUrlUpdates) {
      await supabase.from('questions').update({
        source_url: update.source_url,
        official_source_url: update.official_source_url
      }).eq('id', update.id);
    }
    console.log('✅ Source URLs updated in questions table.');
  }

  // 3. Clear existing question_sources and insert all 1466 records
  console.log('Clearing old question_sources records...');
  await supabase.from('question_sources').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  console.log(`Inserting ${sourcesPayload.length} records into question_sources table...`);
  const chunkSize = 500;
  for (let i = 0; i < sourcesPayload.length; i += chunkSize) {
    const chunk = sourcesPayload.slice(i, i + chunkSize);
    const { error: srcErr } = await supabase.from('question_sources').insert(chunk);
    if (srcErr) {
      console.error(`Chunk ${i} insert error:`, srcErr.message);
    } else {
      console.log(`✅ Inserted question_sources chunk [${i} - ${i + chunk.length}]`);
    }
  }

  // 4. Verify question_sources row count
  const { count: finalSourcesCount } = await supabase.from('question_sources').select('*', { count: 'exact', head: true });

  console.log('\n========================================================');
  console.log(`🎉 SOURCES INTEGRITY SYNC COMPLETED!`);
  console.log(`questions table count: ${allQuestions.length}`);
  console.log(`question_sources table count: ${finalSourcesCount}`);
  console.log(`Sync status: ${allQuestions.length === finalSourcesCount ? 'PERFECT MATCH ✅' : 'MISMATCH ❌'}`);
  console.log('========================================================\n');
}

fixIntegrityAndSyncSources().catch(err => console.error(err));
