import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function checkRpcs() {
  const resp = await fetch(`${supabaseUrl}/rest/v1/`, {
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`
    }
  });

  const json = await resp.json();
  console.log('--- RPC ENDPOINTS FOUND ---');
  if (json.paths) {
    const rpcs = Object.keys(json.paths).filter(p => p.startsWith('/rpc/'));
    console.log(rpcs.join('\n'));
  }
}

checkRpcs().catch(err => console.error(err));
