/* Gym Tracker service worker — caches the app shell so it opens with no signal.
   Bump CACHE whenever you change the cached files to force a refresh. */
const CACHE = 'gym-v5';
const CORE = [
  './',
  './index.html',
  './chart.umd.min.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './avatars.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Same-origin GETs: serve from cache instantly, refresh in the background
// (stale-while-revalidate). Cross-origin (the Google Sheet sync) is left to
// the network untouched.
self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req, { ignoreSearch: true });
    const network = fetch(req).then(res => {
      if (res && res.status === 200) cache.put(req, res.clone());
      return res;
    }).catch(() => null);
    return cached || (await network) || cache.match('./index.html');
  })());
});
