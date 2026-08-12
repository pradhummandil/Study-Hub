import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MANIFEST_FILES = [
  'resource-manifest-FINAL-GATE-JEE-Advanced.json',
  'resource-manifest-updated.json',
];

function loadManifestFile(fileName) {
  const filePath = path.join(__dirname, fileName);
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️ Warning: File not found: ${fileName}`);
    return [];
  }

  try {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    if (Array.isArray(content)) {
      return content;
    }
    if (content && Array.isArray(content.resources)) {
      return content.resources;
    }
    return [];
  } catch (err) {
    console.error(`❌ Error parsing ${fileName}:`, err.message);
    return [];
  }
}

function normalizeUrl(url) {
  if (!url || typeof url !== 'string') return '';
  let u = url.trim();
  // Normalize backslash escapes
  u = u.replace(/\\\\_/g, '_').replace(/\\_/g, '_');
  try {
    u = decodeURIComponent(u);
  } catch {
    // If decoding fails, keep original
  }
  // Trim trailing slash if present (except root protocol slashes)
  if (u.endsWith('/') && u.length > 8) {
    u = u.slice(0, -1);
  }
  return u.toLowerCase();
}

function mergeManifests() {
  console.log('\n========================================');
  console.log('🔄 MERGING RESOURCE MANIFEST FILES');
  console.log('========================================\n');

  const fileStats = [];
  const allResources = [];

  for (const fileName of MANIFEST_FILES) {
    const items = loadManifestFile(fileName);
    fileStats.push({ file: fileName, count: items.length });
    console.log(`📄 Loaded ${fileName}: ${items.length} records`);
    allResources.push(...items);
  }

  const seen = new Set();
  const merged = [];

  for (const item of allResources) {
    const normUrl = normalizeUrl(item.source_url);
    const fallbackKey = `${(item.title || '').trim().toLowerCase()}_${item.year || ''}_${(item.exam_tag || '').trim().toLowerCase()}`;
    const dedupeKey = normUrl || fallbackKey;

    if (!seen.has(dedupeKey)) {
      seen.add(dedupeKey);
      // Clean up properties before saving
      merged.push({
        title: item.title ? item.title.trim() : 'Untitled Resource',
        description: item.description ? item.description.trim() : null,
        category: item.category || 'previous_papers',
        exam_tag: item.exam_tag || 'General',
        year: typeof item.year === 'number' ? item.year : (parseInt(item.year, 10) || null),
        subject: item.subject ? item.subject.trim() : null,
        source_url: item.source_url ? item.source_url.trim() : item.file_url || '',
        file_type: item.file_type || 'pdf',
        thumbnail_url: item.thumbnail_url || null,
        source_type: item.source_type || 'direct_pdf',
      });
    }
  }

  // Save merged output
  const outputPath = path.join(__dirname, 'merged-resource-manifest.json');
  fs.writeFileSync(outputPath, JSON.stringify(merged, null, 2), 'utf-8');

  // Breakdown by exam tag
  const examCounts = {};
  merged.forEach((r) => {
    const tag = r.exam_tag || 'Unspecified';
    examCounts[tag] = (examCounts[tag] || 0) + 1;
  });

  console.log('\n========================================');
  console.log('📊 MANIFEST MERGE SUMMARY REPORT');
  console.log('========================================');
  console.log(`Manifest files processed: ${fileStats.length}`);
  console.log(`Total raw records found:  ${allResources.length}`);
  console.log(`Unique deduplicated:     ${merged.length}`);
  console.log(`Output saved to:          ${outputPath}\n`);

  console.log('Breakdown by Exam Tag:');
  Object.entries(examCounts).forEach(([tag, count]) => {
    console.log(`  • ${tag}: ${count}`);
  });
  console.log('\n✨ Merge completed successfully.\n');
}

mergeManifests();
