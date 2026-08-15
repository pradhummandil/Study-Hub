import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function checkTableProperties() {
  const resp = await fetch(`${supabaseUrl}/rest/v1/`, {
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`
    }
  });

  if (!resp.ok) {
    console.error('Failed to fetch REST OpenAPI schema:', resp.status, resp.statusText);
    return;
  }

  const json = await resp.json();
  const targetTables = ['practice_questions', 'questions', 'exam_catalog', 'exam_subjects', 'exam_topics', 'question_sources'];
  
  for (const t of targetTables) {
    if (json.definitions && json.definitions[t]) {
      console.log(`\n=== PROPERTIES FOR ${t} ===`);
      console.log(Object.keys(json.definitions[t].properties || {}));
    } else {
      console.log(`\n=== TABLE ${t} NOT FOUND IN DEFINITIONS ===`);
    }
  }
}

checkTableProperties().catch(err => console.error(err));
