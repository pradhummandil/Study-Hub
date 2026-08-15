// scripts/study-materials/generate-material-coverage-report.js
import fs from 'fs';
import path from 'path';

console.log('\n========================================================');
console.log('📊 GENERATING STUDY MATERIAL COVERAGE REPORT');
console.log('========================================================\n');

const dataPath = path.join(process.cwd(), 'src/data/studyMaterialsData.json');
if (!fs.existsSync(dataPath)) {
  console.error('❌ Data file studyMaterialsData.json not found!');
  process.exit(1);
}

const materials = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

const coverageMap = {};

materials.forEach(mat => {
  const exam = mat.exam_code;
  const subject = mat.subject;
  const chapter = mat.chapter || 'General';
  const topic = mat.topic || 'General';

  if (!coverageMap[exam]) coverageMap[exam] = {};
  if (!coverageMap[exam][subject]) coverageMap[exam][subject] = {};
  if (!coverageMap[exam][subject][chapter]) coverageMap[exam][subject][chapter] = {};

  const entry = coverageMap[exam][subject][chapter][topic] || {
    REVISION_NOTES: 0,
    SHORT_NOTES: 0,
    FORMULA_SHEET: 0,
    CHAPTER_NOTES: 0,
    GATE_NOTES: 0,
    COMMUNITY_NOTES: 0,
    TOTAL: 0
  };

  entry[mat.material_type] = (entry[mat.material_type] || 0) + 1;
  entry.TOTAL += 1;

  coverageMap[exam][subject][chapter][topic] = entry;
});

const report = {
  generated_at: new Date().toISOString(),
  total_resources_indexed: materials.length,
  exams_covered: Object.keys(coverageMap),
  coverage_map: coverageMap
};

const reportPath = path.join(process.cwd(), 'study-material-coverage-report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

console.log(`✅ COVERAGE REPORT GENERATED: ${reportPath}`);
console.log(`Exams Covered: ${report.exams_covered.join(', ')}`);
console.log(`Total Topics Mapped: ${materials.length}\n`);
