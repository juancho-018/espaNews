const CACHE_NAME = 'espanews-pwa-v2';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './icon.svg',
    './manifest.json',
    'https://unpkg.com/lucide@latest',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Cache opened');
            // Caching local and external assets
            return cache.addAll(ASSETS.map(url => new Request(url, { mode: 'no-cors' })));
        })
    );
    self.skipWaiting();
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            // Retorna la versión en caché si existe, sino hace la petición a la red
            return response || fetch(event.request).then(fetchRes => {
                // Guarda dinámicamente recursos de la API u otros si no fallan
                return fetchRes;
            });
        }).catch(() => {
            // Falla de red gracefully para modo offline
            console.log("Modo offline: No se pudo obtener el recurso exterior.");
        })
    );
});

self.addEventListener('activate', event => {
    // Limpiar cachés antiguos si se actualiza la app
    const cacheWhiteList = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhiteList.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});
