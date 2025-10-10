// Service Worker for Claude Code UI PWA
const CACHE_NAME = 'claude-ui-v1.8.12';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Fetch event
self.addEventListener('fetch', event => {
  // Skip caching for API requests
  if (event.request.url.includes('/api/') ||
      event.request.url.includes('/session/') ||
      event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached response if found
        if (response) {
          return response;
        }
        // Otherwise fetch from network with error handling
        return fetch(event.request).catch(error => {
          console.error('Fetch failed for', event.request.url, error);
          // Return a basic fallback response for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          throw error;
        });
      })
  );
});

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});