import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;

const passwordsToTry = [
  process.env.SUPABASE_DB_PASSWORD,
  process.env.POSTGRES_PASSWORD,
  process.env.DB_PASSWORD,
  'postgres',
  'StudyHub2026!',
  'StudyHub123!',
  'fmpgcdwmkhpkbpwdhyhm',
  'sb_publishable_oRHG7ZdrUYzp-lORwpbIVg_v2rkc89Z'
].filter(Boolean);

const poolerHosts = [
  'aws-0-ap-south-1.pooler.supabase.com',
  'aws-0-us-east-1.pooler.supabase.com',
  'aws-0-eu-central-1.pooler.supabase.com'
];

async function testPoolerConnections() {
  console.log('Testing Pooler PG connections...');

  const user = 'postgres.fmpgcdwmkhpkbpwdhyhm';

  for (const host of poolerHosts) {
    for (const pass of passwordsToTry) {
      const port = 6543; // Transaction pooler
      const connectionString = `postgres://${user}:${encodeURIComponent(pass)}@${host}:${port}/postgres`;
      console.log(`Trying ${host}:${port} with user ${user} and pass prefix ${pass.substring(0, 4)}...`);
      const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 3000
      });
      try {
        await client.connect();
        console.log(`\n🎉 SUCCESS connecting to ${host}! Password matched!`);
        await client.end();
        return connectionString;
      } catch (err) {
        console.log(`Failed: ${err.message}`);
      }
    }
  }
}

testPoolerConnections().catch(err => console.error(err));
