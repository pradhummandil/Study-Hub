import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function testSqlEndpoints() {
  const endpoints = [
    '/rest/v1/rpc/exec_sql',
    '/rest/v1/rpc/run_sql',
    '/pg/v1/query',
    '/api/v1/query'
  ];

  for (const ep of endpoints) {
    try {
      const resp = await fetch(`${supabaseUrl}${ep}`, {
        method: 'POST',
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: 'SELECT 1;' })
      });
      console.log(`Endpoint ${ep}: status = ${resp.status}`);
    } catch (err) {
      console.log(`Endpoint ${ep}: error = ${err.message}`);
    }
  }
}

testSqlEndpoints().catch(err => console.error(err));
