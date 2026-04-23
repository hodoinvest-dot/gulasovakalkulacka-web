/* Service Worker — Gulášová Kalkulačka
 * Offline-first caching pre PWA
 * Verzia: 2.0.0 — rozšírené o obrázky, OG, ikony
 */

const CACHE_NAME = 'gulas-kalk-v2';

/* Statické core aktíva — pre-cachované pri inštalácii */
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './favicon.svg',
  './hero-kotlik.jpg',
  './hero-kotlik.webp',
  './ingredience.jpg',
  './ingredience.webp',
  './kotliky-porovnanie.jpg',
  './kotliky-porovnanie.webp',
  './timeline-varenia.jpg',
  './timeline-varenia.webp',
  './og-image-sk.jpg',
  './og-image-cz.jpg',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png'
];

/* Install — pre-cache core assets (individuálne, aby jeden fail nezabil všetko) */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(
        CORE_ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn('[SW] Failed to cache:', url, err);
          })
        )
      )
    ).then(() => self.skipWaiting())
  );
});

/* Activate — clean old caches */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

/* Fetch — stale-while-revalidate pre obrázky, cache-first pre HTML/ikony */
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  /* Ignorovať externé requesty (affiliate linky, CDN, analytics) */
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone);
            });
          }
          return response;
        })
        .catch(() => {
          /* Offline fallback pre HTML navigáciu */
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
          return cached;
        });

      /* Ak máme cached → okamžite vrátime, no na pozadí refreshneme */
      return cached || fetchPromise;
    })
  );
});
