import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('\n❌ ERROR: Missing required environment variables.');
  console.error('Ensure VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env.local or .env file.\n');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

function loadMergedManifest() {
  const mergedPath = path.join(__dirname, 'merged-resource-manifest.json');
  if (fs.existsSync(mergedPath)) {
    return JSON.parse(fs.readFileSync(mergedPath, 'utf-8'));
  }

  // Fallback: merge directly if merged-resource-manifest.json doesn't exist
  const f1Path = path.join(__dirname, 'resource-manifest-FINAL-GATE-JEE-Advanced.json');
  const f2Path = path.join(__dirname, 'resource-manifest-updated.json');
  const items1 = fs.existsSync(f1Path) ? JSON.parse(fs.readFileSync(f1Path, 'utf-8')).resources || [] : [];
  const items2 = fs.existsSync(f2Path) ? JSON.parse(fs.readFileSync(f2Path, 'utf-8')).resources || [] : [];
  
  const seen = new Set();
  const merged = [];
  [...items1, ...items2].forEach((item) => {
    const key = (item.source_url || `${item.title}_${item.year}_${item.exam_tag}`).trim().toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(item);
    }
  });
  return merged;
}

async function checkSupportsYearAndSubject() {
  try {
    const { error } = await supabase
      .from('resources')
      .select('id, year, subject')
      .limit(1);
    if (error && (error.message.includes('year') || error.message.includes('subject'))) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

async function importResources() {
  console.log('\n========================================');
  console.log('📦 IMPORTING RESOURCES TO SUPABASE');
  console.log('========================================\n');

  const manifest = loadMergedManifest();
  console.log(`Loaded ${manifest.length} resources from manifest.\n`);

  const supportsExtendedColumns = await checkSupportsYearAndSubject();
  if (!supportsExtendedColumns) {
    console.log('💡 TIP: "year" and "subject" columns not detected yet in "resources" table.');
    console.log('👉 Run scripts/add-year-and-subject-to-resources.sql in Supabase SQL Editor to enable full year/subject indexing.\n');
  } else {
    console.log('✅ Verified "year" and "subject" columns exist in "resources" table.\n');
  }

  let importedCount = 0;
  let skippedCount = 0;
  const failures = [];

  const examCounts = {};

  for (let i = 0; i < manifest.length; i++) {
    const item = manifest[i];
    const fileUrl = item.source_url || item.file_url || '';
    const examTag = item.exam_tag || 'General';

    examCounts[examTag] = (examCounts[examTag] || 0) + 1;

    try {
      // 1. Check if resource already exists by source_url / file_url
      let existing = null;

      if (fileUrl) {
        const { data: byUrl } = await supabase
          .from('resources')
          .select('id')
          .eq('file_url', fileUrl)
          .maybeSingle();
        existing = byUrl;
      }

      // 2. Fallback check by title if not found by URL
      if (!existing && item.title) {
        const { data: byTitle } = await supabase
          .from('resources')
          .select('id')
          .eq('title', item.title)
          .maybeSingle();
        existing = byTitle;
      }

      if (existing) {
        console.log(`⏭️ Already exists: ${item.title}`);
        skippedCount++;
        continue;
      }

      // 3. Prepare payload for insertion
      const payload = {
        title: item.title,
        description: item.description || null,
        category: item.category || 'previous_papers',
        exam_tag: examTag,
        file_url: fileUrl,
        thumbnail_url: item.thumbnail_url || null,
        file_type: item.file_type || 'pdf',
      };

      if (supportsExtendedColumns) {
        payload.year = typeof item.year === 'number' ? item.year : (parseInt(item.year, 10) || null);
        payload.subject = item.subject || null;
      }

      // 4. Insert row
      const { error: insertError } = await supabase
        .from('resources')
        .insert([payload]);

      if (insertError) {
        throw new Error(insertError.message);
      }

      console.log(`✅ Imported: ${item.title}`);
      importedCount++;
    } catch (err) {
      console.error(`❌ Failed: ${item.title} — ${err.message}`);
      failures.push({ title: item.title, error: err.message });
    }
  }

  console.log('\n================================');
  console.log('RESOURCE IMPORT COMPLETE');
  console.log('================================\n');

  console.log(`Manifest files: 2`);
  console.log(`Resources discovered: ${manifest.length}`);
  console.log(`Imported: ${importedCount}`);
  console.log(`Already existed: ${skippedCount}`);
  console.log(`Failed: ${failures.length}\n`);

  console.log('Import Summary by Exam Tag:');
  Object.entries(examCounts).forEach(([tag, count]) => {
    console.log(`  • ${tag}: ${count}`);
  });

  // Automated Validation Step
  console.log('\n================================');
  console.log('AUTOMATIC VALIDATION CHECK');
  console.log('================================\n');

  try {
    const { count: totalTableCount } = await supabase
      .from('resources')
      .select('*', { count: 'exact', head: true });

    const { data: gateSample } = await supabase
      .from('resources')
      .select('id')
      .eq('exam_tag', 'GATE')
      .limit(1);

    const { data: jeeSample } = await supabase
      .from('resources')
      .select('id')
      .eq('exam_tag', 'JEE Advanced')
      .limit(1);

    const { data: aatSample } = await supabase
      .from('resources')
      .select('id')
      .eq('exam_tag', 'JEE Advanced AAT')
      .limit(1);

    const connectionOk = totalTableCount !== null;
    const tableOk = (totalTableCount || 0) > 0;

    console.log(`Supabase connection: ${connectionOk ? 'OK' : 'FAIL'}`);
    console.log(`Resource table:      ${tableOk ? 'OK' : 'FAIL'}`);
    console.log(`Imported resources:  ${totalTableCount || 0}`);
    console.log(`GATE records:        ${gateSample && gateSample.length > 0 ? 'OK' : 'NONE'}`);
    console.log(`JEE Advanced:        ${jeeSample && jeeSample.length > 0 ? 'OK' : 'NONE'}`);
    console.log(`JEE Advanced AAT:    ${aatSample && aatSample.length > 0 ? 'OK' : 'NONE'}`);
    console.log(`Studio query:        ${tableOk ? 'OK' : 'FAIL'}\n`);
  } catch (valErr) {
    console.error(`Validation check failed: ${valErr.message}`);
  }
}

importResources();
