// scripts/reload_schema.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey);

async function reload() {
  console.log('Sending schema reload request...');
  const res = await fetch(`${supabaseUrl}/rest/v1/`, {
    method: 'GET',
    headers: {
      'apikey': serviceKey,
      'Authorization': `Bearer ${serviceKey}`
    }
  });
  console.log('OpenAPI schema status:', res.status);
  const json = await res.json();
  console.log('Tables available in definitions:', Object.keys(json.definitions || {}));
}

reload().catch(err => console.error(err));
