// scripts/study-materials/generate-material-health-report.js
import fs from 'fs';
import path from 'path';

console.log('\n========================================================');
console.log('🩺 GENERATING STUDY MATERIAL HEALTH REPORT');
console.log('========================================================\n');

const dataPath = path.join(process.cwd(), 'src/data/studyMaterialsData.json');
if (!fs.existsSync(dataPath)) {
  console.error('❌ Data file studyMaterialsData.json not found!');
  process.exit(1);
}

const materials = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

let brokenLinks = 0;
let validLocalAssets = 0;
let externalReferences = 0;
let licenseUnclear = 0;
let totalBytes = 0;

const healthEntries = materials.map(mat => {
  let isAssetValid = true;
  let status = 'HEALTHY';

  if (mat.is_downloadable && mat.storage_path) {
    const fullPath = path.join(process.cwd(), 'public', mat.storage_path);
    if (!fs.existsSync(fullPath)) {
      isAssetValid = false;
      status = 'BROKEN_LOCAL_FILE';
      brokenLinks++;
    } else {
      validLocalAssets++;
      totalBytes += mat.file_size || fs.statSync(fullPath).size;
    }
  } else {
    externalReferences++;
    if (mat.license_status === 'UNKNOWN_LICENSE') {
      licenseUnclear++;
      status = 'NEEDS_LICENSE_REVIEW';
    }
  }

  return {
    id: mat.id,
    title: mat.title,
    exam_code: mat.exam_code,
    subject: mat.subject,
    license_status: mat.license_status,
    is_downloadable: mat.is_downloadable,
    file_size: mat.file_size,
    file_hash: mat.file_hash,
    status,
    storage_path: mat.storage_path,
    external_url: mat.external_url
  };
});

const report = {
  generated_at: new Date().toISOString(),
  total_resources: materials.length,
  healthy_count: materials.length - brokenLinks,
  broken_link_count: brokenLinks,
  valid_local_assets: validLocalAssets,
  external_references: externalReferences,
  license_unclear: licenseUnclear,
  total_stored_bytes: totalBytes,
  health_entries: healthEntries
};

const reportPath = path.join(process.cwd(), 'study-material-health-report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

console.log(`✅ HEALTH REPORT GENERATED: ${reportPath}`);
console.log(`  • Total Resources:     ${report.total_resources}`);
console.log(`  • Healthy:             ${report.healthy_count}`);
console.log(`  • Broken Links:        ${report.broken_link_count}`);
console.log(`  • Valid Local Assets:  ${report.valid_local_assets}`);
console.log(`  • External References: ${report.external_references}`);
console.log(`  • Stored Bytes:        ${report.total_stored_bytes} bytes\n`);
