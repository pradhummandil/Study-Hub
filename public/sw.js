const CACHE_NAME = 'studyhub-v3';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.svg'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Helper for cache expiration (simple LRU by count)
async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    await cache.delete(keys[0]);
    await trimCache(cacheName, maxItems);
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API calls: Network Only
  if (url.hostname.includes('supabase.co') || url.hostname.includes('googleapis.com')) {
    return; // default fetch
  }

  // Static Assets: Cache First
  if (request.destination === 'style' || request.destination === 'script' || request.destination === 'image' || request.destination === 'font') {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(request).then(response => {
          const resClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, resClone);
            trimCache(CACHE_NAME, 50);
          });
          return response;
        });
      })
    );
    return;
  }

  // HTML Navigation: Network First with cache fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const resClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, resClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match('/index.html');
        })
    );
    return;
  }

  // Everything else: Network First with 5s timeout
  event.respondWith(
    new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => reject(new Error('Network timeout')), 5000);
      fetch(request).then(response => {
        clearTimeout(timeoutId);
        const resClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(request, resClone);
          trimCache(CACHE_NAME, 50);
        });
        resolve(response);
      }).catch(reject);
    }).catch(() => {
      return caches.match(request);
    })
  );
});
