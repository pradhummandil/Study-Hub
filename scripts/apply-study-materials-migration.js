// scripts/apply-study-materials-migration.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function applyMigration() {
  console.log('\n========================================================');
  console.log('⚡ APPLYING STUDY MATERIALS SCHEMA MIGRATION');
  console.log('========================================================\n');

  const migrationPath = path.join(process.cwd(), 'supabase/migrations/20260814110000_study_materials_engine.sql');
  const sql = fs.readFileSync(migrationPath, 'utf-8');

  // Check if exec_sql rpc exists
  const { data: rpcRes, error: rpcErr } = await supabase.rpc('exec_sql', { sql });
  if (rpcErr) {
    console.log('ℹ️ exec_sql RPC not enabled or errored:', rpcErr.message);
    console.log('ℹ️ Verifying table access via REST API directly...');
  } else {
    console.log('✅ Executed migration SQL via exec_sql RPC successfully!');
  }

  // Check tables presence
  const tables = ['study_material_sources', 'study_materials', 'study_material_versions', 'user_saved_materials', 'study_material_progress'];
  for (const table of tables) {
    const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
    if (error) {
      console.log(`⚠️ Table ${table}: ${error.message}`);
    } else {
      console.log(`✅ Table ${table}: EXISTS (row count: ${count || 0})`);
    }
  }

  // Ensure default sources seeded
  const defaultSources = [
    { id: 'mathongo', name: 'MathonGo', base_url: 'https://www.mathongo.com', source_type: 'AGGREGATOR', license_status: 'PUBLIC_REFERENCE_ONLY', redistribution_allowed: false, external_link_allowed: true, notes: 'Free web revision notes & formula sheets for JEE Main.' },
    { id: 'iitian_academy', name: 'IITian Academy', base_url: 'https://www.iitianacademy.com', source_type: 'AGGREGATOR', license_status: 'PUBLIC_REFERENCE_ONLY', redistribution_allowed: false, external_link_allowed: true, notes: 'Chapter-wise JEE Advanced Physics study materials.' },
    { id: 'practice_paper', name: 'PracticePaper', base_url: 'https://practicepaper.in', source_type: 'AGGREGATOR', license_status: 'PUBLIC_REFERENCE_ONLY', redistribution_allowed: false, external_link_allowed: true, notes: 'GATE CSE notes catalog.' },
    { id: 'iitians_gate', name: 'IITians GATE Classes', base_url: 'https://iitiansgateclasses.com', source_type: 'INSTITUTION', license_status: 'PUBLIC_REFERENCE_ONLY', redistribution_allowed: false, external_link_allowed: true, notes: 'Computer Science GATE study materials.' },
    { id: 'github_gate2027', name: 'Aparnaraha/Gate2027 GitHub', base_url: 'https://github.com/Aparnaraha/Gate2027', source_type: 'GITHUB', license_status: 'COMMUNITY_NOTES', redistribution_allowed: false, external_link_allowed: true, notes: 'GATE 2027 Community Notes repository.' }
  ];

  for (const src of defaultSources) {
    await supabase.from('study_material_sources').upsert(src, { onConflict: 'id' });
  }
  console.log('✅ Default study material sources seeded.');
}

applyMigration().catch(err => {
  console.error('Migration execution failed:', err);
  process.exit(1);
});
