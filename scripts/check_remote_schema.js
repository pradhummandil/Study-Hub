import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function checkRemoteSchema() {
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
  console.log('--- REMOTE SUPABASE TABLES FOUND IN DEFINITIONS ---');
  if (json.definitions) {
    const tableNames = Object.keys(json.definitions);
    console.log(tableNames.sort().join('\n'));
  } else if (json.paths) {
    console.log(Object.keys(json.paths).sort().join('\n'));
  } else {
    console.log(Object.keys(json));
  }
}

checkRemoteSchema().catch(err => console.error(err));
