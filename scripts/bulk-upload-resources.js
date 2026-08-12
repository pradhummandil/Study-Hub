import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env.local or .env
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

// Initialize Supabase admin client using SERVICE_ROLE_KEY to bypass RLS for administrative script tasks
const supabase = createClient(supabaseUrl, serviceRoleKey);

// Ensure temporary download directory exists
const tmpDir = path.join(__dirname, 'tmp-downloads');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

// Read resource manifest
const manifestPath = path.join(__dirname, 'resource-manifest.json');
if (!fs.existsSync(manifestPath)) {
  console.error(`\n❌ ERROR: Manifest file not found at ${manifestPath}\n`);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

async function downloadFile(url, destPath) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP download failed with status ${res.status} ${res.statusText}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  fs.writeFileSync(destPath, buffer);
  return buffer;
}

function getContentType(fileType) {
  switch ((fileType || '').toLowerCase()) {
    case 'pdf':
      return 'application/pdf';
    case 'zip':
    case 'rar':
      return 'application/zip';
    case 'docx':
    case 'doc':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'link':
    case 'url':
      return 'text/html';
    default:
      return 'application/octet-stream';
  }
}

async function runBulkUpload() {
  console.log('\n🚀 Starting Bulk Resource Upload...\n');
  console.log(`Found ${manifest.length} manifest entries.\n`);

  let successCount = 0;
  let skippedCount = 0;
  const failures = [];

  for (let i = 0; i < manifest.length; i++) {
    const entry = manifest[i];
    const indexStr = `[${i + 1}/${manifest.length}]`;

    console.log(`${indexStr} Processing: "${entry.title}"...`);

    // Skip example placeholder URLs
    if (
      !entry.source_url ||
      entry.source_url.includes('example.com') ||
      entry.source_url.includes('replace-with-real')
    ) {
      console.log(`   ⚠️ Skipped placeholder URL for "${entry.title}". Replace source_url in manifest with a real direct link.\n`);
      skippedCount++;
      continue;
    }

    try {
      const fileType = entry.file_type || 'pdf';
      const cleanTitle = entry.title.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
      const examTag = (entry.exam_tag || 'gen').toLowerCase();
      const storageFilename = `${examTag}_${cleanTitle}_${Date.now()}.${fileType}`;
      const localFilePath = path.join(tmpDir, `${cleanTitle}.${fileType}`);

      // 1. Local Download / Resume Check
      let fileBuffer;
      if (fs.existsSync(localFilePath) && fs.statSync(localFilePath).size > 0) {
        console.log(`   ℹ️ Found existing local download: ${path.basename(localFilePath)}`);
        fileBuffer = fs.readFileSync(localFilePath);
      } else {
        console.log(`   📥 Downloading from: ${entry.source_url}`);
        fileBuffer = await downloadFile(entry.source_url, localFilePath);
      }

      // 2. Upload to Supabase Storage "resources" bucket
      console.log(`   ☁️ Uploading to Supabase Storage bucket "resources" as ${storageFilename}...`);
      const contentType = getContentType(fileType);

      const { error: uploadError } = await supabase.storage
        .from('resources')
        .upload(storageFilename, fileBuffer, {
          contentType,
          upsert: true,
        });

      if (uploadError) {
        throw new Error(`Storage upload failed: ${uploadError.message}`);
      }

      // 3. Obtain public URL
      const { data: publicUrlData } = supabase.storage
        .from('resources')
        .getPublicUrl(storageFilename);

      const publicUrl = publicUrlData.publicUrl;

      // 4. Check if title already exists in resources table
      const { data: existingRow, error: checkError } = await supabase
        .from('resources')
        .select('id')
        .eq('title', entry.title)
        .maybeSingle();

      if (checkError) {
        console.warn(`   ⚠️ Warning during table check: ${checkError.message}`);
      }

      if (existingRow) {
        console.log(`   ℹ️ Database row already exists for "${entry.title}". Skipping table insert.\n`);
        successCount++;
        continue;
      }

      // 5. Insert new row into resources table
      const { error: insertError } = await supabase
        .from('resources')
        .insert([
          {
            title: entry.title,
            description: entry.description || null,
            category: entry.category,
            exam_tag: entry.exam_tag || null,
            file_url: publicUrl,
            thumbnail_url: entry.thumbnail_url || null,
            file_type: fileType,
          },
        ]);

      if (insertError) {
        throw new Error(`Database insert failed: ${insertError.message}`);
      }

      console.log(`   ✅ Uploaded & Synced successfully: "${entry.title}"\n`);
      successCount++;
    } catch (err) {
      console.error(`   ❌ Failed: "${entry.title}" — ${err.message}\n`);
      failures.push({ title: entry.title, error: err.message });
    }
  }

  // Final Summary Report
  console.log('========================================');
  console.log('📊 BULK UPLOAD SUMMARY REPORT');
  console.log('========================================');
  console.log(`Total Entries: ${manifest.length}`);
  console.log(`Successful:    ${successCount}`);
  console.log(`Skipped:       ${skippedCount}`);
  console.log(`Failed:        ${failures.length}`);

  if (failures.length > 0) {
    console.log('\n❌ Failed Entries:');
    failures.forEach((f, idx) => {
      console.log(`  ${idx + 1}. "${f.title}" — ${f.error}`);
    });
  }
  console.log('\n✨ Done.\n');
}

runBulkUpload();
