// scripts/test-gemini.js
// Run with: npm run test-gemini
// Tests the Gemini API connection using the key from .env

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env manually (dotenv may not be available)
function loadEnv() {
  try {
    const envPath = join(__dirname, '..', '.env');
    const content = readFileSync(envPath, 'utf-8');
    const vars = {};
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const value = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
      vars[key] = value;
    }
    return vars;
  } catch {
    return {};
  }
}

const env = loadEnv();
const GEMINI_API_KEY = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const MODEL = 'gemini-flash-latest';

console.log('');
console.log('================================');
console.log('  GEMINI AI CONNECTION TEST');
console.log('================================');
console.log('');

if (!GEMINI_API_KEY) {
  console.log('❌  GEMINI_API_KEY NOT FOUND');
  console.log('   Add GEMINI_API_KEY=your_key_here to your .env file.');
  console.log('');
  console.log('Status: FAIL');
  process.exit(1);
}

// Mask key for display: show first 6 chars + ...
const maskedKey = GEMINI_API_KEY.slice(0, 6) + '...' + GEMINI_API_KEY.slice(-4);
console.log(`API key: FOUND (${maskedKey})`);
console.log(`Model:   ${MODEL}`);
console.log('');
console.log('Sending test request to Gemini...');
console.log('');

const requestPayload = JSON.stringify({
  contents: [
    {
      role: 'user',
      parts: [{ text: 'Reply with exactly this phrase and nothing else: "Gemini connection successful."' }],
    },
  ],
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 2048,
  },
});

const options = {
  hostname: 'generativelanguage.googleapis.com',
  port: 443,
  path: `/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(requestPayload),
  },
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    if (res.statusCode === 200) {
      try {
        const parsed = JSON.parse(data);
        const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

        console.log(`GenerateContent API: SUCCESS (HTTP ${res.statusCode})`);
        console.log('');
        console.log('Response:');
        console.log(`  "${text}"`);
        console.log('');
        console.log('================================');
        console.log('Status: PASS ✅');
        console.log('================================');
        console.log('');
        process.exit(0);
      } catch {
        console.log('❌  Failed to parse Gemini response JSON');
        console.log('');
        console.log('Status: FAIL');
        process.exit(1);
      }
    } else {
      // Parse error safely — never print the key
      let errorMsg = `HTTP ${res.statusCode}`;
      try {
        const errParsed = JSON.parse(data);
        errorMsg = errParsed?.error?.message || errorMsg;
      } catch { /* ignore */ }

      console.log(`❌  Gemini API returned HTTP ${res.statusCode}`);
      console.log(`   Error: ${errorMsg}`);
      console.log('');
      console.log('================================');
      console.log('Status: FAIL');
      console.log('================================');
      console.log('');
      process.exit(1);
    }
  });
});

req.on('error', (err) => {
  console.log('❌  Network error connecting to Gemini API');
  console.log(`   ${err.message}`);
  console.log('');
  console.log('================================');
  console.log('Status: FAIL');
  console.log('================================');
  console.log('');
  process.exit(1);
});

req.write(requestPayload);
req.end();
