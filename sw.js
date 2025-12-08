const CACHE_NAME = 'surveillance-digue-v1';
const urlsToCache = [
  '/Surveillance-Digue-V2/',
  '/Surveillance-Digue-V2/index.html',
  '/Surveillance-Digue-V2/manifest.json',
  '/Surveillance-Digue-V2/icon-192.png',
  '/Surveillance-Digue-V2/icon-512.png'
];

// Installation du Service Worker
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Cache ouvert');
        return cache.addAll(urlsToCache);
      })
  );
});

// Récupération des ressources
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Ressource trouvée dans le cache
        if (response) {
          return response;
        }
        // Sinon, on va chercher sur le réseau
        return fetch(event.request);
      }
    )
  );
});

// Mise à jour du cache
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return cacheName !== CACHE_NAME;
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
});
