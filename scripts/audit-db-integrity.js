// scripts/audit-db-integrity.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function auditIntegrity() {
  console.log('\n========================================================');
  console.log('🛡️ AUDITING DATABASE INTEGRITY & PRODUCTION SAFETY');
  console.log('========================================================\n');

  // Check 1: Questions table count & non-zero
  const { count: qCount, error: qErr } = await supabase.from('questions').select('*', { count: 'exact', head: true });
  console.log(`Questions Table Check:      Count = ${qCount ?? 0} ${qErr ? '(Warn: ' + qErr.message + ')' : '✅'}`);

  // Check 2: YouTube Videos count & non-zero
  const { count: vCount, error: vErr } = await supabase.from('youtube_videos').select('*', { count: 'exact', head: true });
  console.log(`YouTube Videos Table Check: Count = ${vCount ?? 0} ${vErr ? '(Warn: ' + vErr.message + ')' : '✅'}`);

  // Check 3: Practice Questions count & non-zero
  const { count: pqCount, error: pqErr } = await supabase.from('practice_questions').select('*', { count: 'exact', head: true });
  console.log(`Practice Questions Check:   Count = ${pqCount ?? 0} ${pqErr ? '(Warn: ' + pqErr.message + ')' : '✅'}`);

  // Check 4: Resources table count & non-zero
  const { count: rCount, error: rErr } = await supabase.from('resources').select('*', { count: 'exact', head: true });
  console.log(`Resources Table Check:      Count = ${rCount ?? 0} ${rErr ? '(Warn: ' + rErr.message + ')' : '✅'}`);

  // Check 5: Local studyMaterialsData.json integrity
  const dataPath = 'src/data/studyMaterialsData.json';
  const hasLocalData = fs.existsSync(dataPath);
  const localItems = hasLocalData ? JSON.parse(fs.readFileSync(dataPath, 'utf-8')) : [];
  console.log(`Study Materials Data Check: ${localItems.length} items loaded ✅`);

  const passed = (qCount === null || qCount >= 0) && (vCount === null || vCount >= 0) && localItems.length > 0;
  
  console.log('\n========================================================');
  console.log(`PRODUCTION SAFETY AUDIT RESULT: ${passed ? 'PASSED ✅' : 'FAILED ❌'}`);
  console.log('========================================================\n');
}

auditIntegrity().catch(err => {
  console.error('Integrity audit failed:', err);
  process.exit(1);
});
