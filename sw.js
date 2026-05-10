// =====================================================================
// Voyage MMXXVI — Service Worker
//
// To force all installed PWAs to refresh after you push an update:
// bump CACHE_VERSION below by one. The next time the user opens the
// app while online, the old cache is purged and the new files load.
// =====================================================================

const CACHE_VERSION = 'voyage-v2';

// Files to pre-cache on install (the shell of the app)
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png',
];

// ---------- Install: pre-cache core assets ----------
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ---------- Activate: clean up old caches ----------
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== CACHE_VERSION)
          .map((name) => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

// ---------- Fetch: stale-while-revalidate for HTML, cache-first for assets ----------
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Only handle GET requests
  if (req.method !== 'GET') return;

  // Don't cache cross-origin requests we don't control (Google Fonts, unpkg, etc.)
  // — let the browser handle them with its normal HTTP cache.
  const url = new URL(req.url);
  const isSameOrigin = url.origin === self.location.origin;

  if (!isSameOrigin) {
    // Try network first, fall back to cache (for offline use of fonts/scripts that previously loaded)
    event.respondWith(
      fetch(req)
        .then((res) => {
          // Opportunistically cache successful cross-origin responses
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Same-origin: stale-while-revalidate
  event.respondWith(
    caches.match(req).then((cached) => {
      const networkFetch = fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);

      return cached || networkFetch;
    })
  );
});
