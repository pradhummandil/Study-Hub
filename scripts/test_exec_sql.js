import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey);

async function testConnectionAndCreateTables() {
  console.log('Testing RPC or direct table creation...');

  // Try creating table via RPC if exec_sql or similar exists
  const migrationSql = fs.readFileSync('supabase/migrations/20260814100000_question_engine_v2.sql', 'utf-8');

  // Let's check if exec_sql rpc exists
  const { data: rpcRes, error: rpcErr } = await supabase.rpc('exec_sql', { sql: migrationSql });
  console.log('exec_sql RPC result:', rpcRes, 'error:', rpcErr?.message);
}

testConnectionAndCreateTables().catch(err => console.error(err));
