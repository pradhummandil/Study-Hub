import https from 'https';
import fs from 'fs';

function fetchUrl(url, headers = {}) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36', 'Accept-Language': 'en-US,en;q=0.9', ...headers } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location, headers).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function postJson(url, payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch(e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function testContinuation() {
  console.log('Fetching videos tab HTML for @PW-JEEWallah...');
  const html = await fetchUrl('https://www.youtube.com/@PW-JEEWallah/videos');
  
  // Extract apiKey from ytcfg
  const apiKeyMatch = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/);
  const apiKey = apiKeyMatch ? apiKeyMatch[1] : null;
  console.log('InnerTube API Key:', apiKey ? apiKey.substring(0, 15) + '...' : 'NOT FOUND');

  // Extract initial token
  const tokenMatch = html.match(/"continuationCommand":\{"token":"([^"]+)"/);
  let token = tokenMatch ? tokenMatch[1] : null;
  console.log('Initial continuation token:', token ? token.substring(0, 20) + '...' : 'NOT FOUND');

  const videoIdRegex = /"videoId":"([a-zA-Z0-9_-]{11})"/g;
  let match;
  const videoIds = new Set();
  while ((match = videoIdRegex.exec(html)) !== null) {
    videoIds.add(match[1]);
  }
  console.log('Initial page video IDs:', videoIds.size);

  let page = 1;
  while (token && apiKey && page <= 5) {
    page++;
    console.log(`Fetching page ${page} via continuation...`);
    const endpoint = `https://www.youtube.com/youtubei/v1/browse?key=${apiKey}`;
    const resData = await postJson(endpoint, {
      context: { client: { clientName: 'WEB', clientVersion: '2.20240101.00.00' } },
      continuation: token
    });

    const resStr = JSON.stringify(resData);
    let countBefore = videoIds.size;
    let m;
    const itemRegex = /"videoId":"([a-zA-Z0-9_-]{11})"/g;
    while ((m = itemRegex.exec(resStr)) !== null) {
      videoIds.add(m[1]);
    }
    console.log(`Page ${page}: new videos added: ${videoIds.size - countBefore}, total unique: ${videoIds.size}`);

    const nextTokenMatch = resStr.match(/"continuationCommand":\{"token":"([^"]+)"/);
    token = nextTokenMatch ? nextTokenMatch[1] : null;
  }
}

testContinuation().catch(err => console.error('Error:', err));
