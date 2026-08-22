const CACHE_NAME = 'vrikshvera-v3';
const ASSETS = [
  './',
  './index.html',
  './dashboard.html',
  './crop-advisor.html',
  './climate-risk.html',
  './chatbot.html',
  './css/style_v25.css',
  './css/animations_v25.css',
  './js/main_v25.js',
  './js/chatbot_v25.js',
  './js/dashboard.js',
  './js/crop-advisor.js',
  './js/climate-risk.js',
  './js/ml-engine.js',
  './js/weather-engine.js',
  './ml/crop_model.json',
  './manifest.json',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png'
];

// Install Event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  return self.clients.claim();
});

// Fetch Event (Stale-While-Revalidate)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(cachedResponse => {
        const fetchPromise = fetch(event.request).then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      });
    })
  );
});
