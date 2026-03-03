const CACHE_NAME = 'surveillance-digue-v16';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Installation du Service Worker
self.addEventListener('install', function(event) {
  console.log('📦 Installation du Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('✅ Cache ouvert');
        return cache.addAll(urlsToCache);
      })
      .catch(function(error) {
        console.error('❌ Erreur lors du cache:', error);
      })
  );
  // Force le nouveau Service Worker à devenir actif immédiatement
  self.skipWaiting();
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
        return fetch(event.request)
          .then(function(response) {
            // Ne pas mettre en cache les réponses non-valides
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }

            // Cloner la réponse car elle ne peut être consommée qu'une seule fois
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          });
      })
      .catch(function() {
        // En cas d'erreur réseau, retourner une page par défaut si disponible
        return caches.match('./index.html');
      })
  );
});

// Mise à jour du cache
self.addEventListener('activate', function(event) {
  console.log('🔄 Activation du Service Worker...');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return cacheName !== CACHE_NAME;
        }).map(function(cacheName) {
          console.log('🗑️ Suppression ancien cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    })
  );
  // Force le nouveau Service Worker à prendre le contrôle immédiatement
  return self.clients.claim();
});

// Gestion des notifications
self.addEventListener('notificationclick', function(event) {
  console.log('🔔 Notification cliquée');
  event.notification.close();

  // Ouvrir ou focus sur l'application
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        // Si une fenêtre est déjà ouverte, la mettre au premier plan
        for (var i = 0; i < clientList.length; i++) {
          var client = clientList[i];
          if ('focus' in client) {
            return client.focus();
          }
        }
        // Sinon, ouvrir une nouvelle fenêtre
        if (clients.openWindow) {
          return clients.openWindow('./');
        }
      })
  );
});
