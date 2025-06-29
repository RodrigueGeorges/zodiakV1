const CACHE_NAME = 'zodiak-cache-v1';
const OFFLINE_URL = '/offline.html';

// Liste des ressources à mettre en cache immédiatement
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/icon.svg'
];

// Installation: mise en cache des ressources essentielles
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activation: nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      self.clients.claim();
    })
  );
});

// Stratégie de cache: Network First avec fallback cache
self.addEventListener('fetch', (event) => {
  // Ignorer les requêtes non GET
  if (event.request.method !== 'GET') return;

  // Ignorer les requêtes vers l'API et les extensions Chrome
  if (
    event.request.url.includes('/api/') ||
    event.request.url.startsWith('chrome-extension://')
  ) return;

  event.respondWith(
    fetch(event.request)
      .then(async (networkResponse) => {
        // Mettre en cache une copie de la réponse
        const cache = await caches.open(CACHE_NAME);
        try {
          // Ne mettre en cache que les ressources de notre domaine
          if (event.request.url.startsWith(self.location.origin)) {
            cache.put(event.request, networkResponse.clone());
          }
        } catch (error) {
          console.error('Cache error:', error);
        }
        return networkResponse;
      })
      .catch(async () => {
        // En cas d'erreur réseau, essayer le cache
        const cachedResponse = await caches.match(event.request);
        
        if (cachedResponse) {
          return cachedResponse;
        }

        // Si pas de cache et c'est une navigation, retourner la page offline
        if (event.request.mode === 'navigate') {
          const cache = await caches.open(CACHE_NAME);
          return cache.match(OFFLINE_URL);
        }

        // Sinon retourner une erreur
        return new Response('', {
          status: 408,
          headers: new Headers({
            'Content-Type': 'text/plain',
          }),
        });
      })
  );
});

// Mettre à jour le cache quand une nouvelle version est disponible
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});