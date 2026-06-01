// Bavaria DQI - Service Worker
const CACHE_NAME = 'bavaria-dqi-v1';
const urlsToCache = [
  '/',
  '/novedades-logistica.html'
];

// Install - cache files
self.addEventListener('install', function(e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(urlsToCache);
    })
  );
});

// Activate - clean old caches
self.addEventListener('activate', function(e) {
  self.clients.claim();
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      );
    })
  );
});

// Fetch - serve from cache when offline
self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    })
  );
});

// Push notification received
self.addEventListener('push', function(e) {
  var data = e.data ? e.data.json() : {};
  var titulo = data.titulo || 'Bavaria DQI';
  var cuerpo = data.cuerpo || 'Tienes una novedad nueva';
  e.waitUntil(
    self.registration.showNotification(titulo, {
      body: cuerpo,
      icon: '/icon.png',
      badge: '/icon.png',
      vibrate: [200, 100, 200],
      tag: 'dqi-' + Date.now(),
      requireInteraction: false,
      actions: [
        { action: 'abrir', title: 'Ver novedad' },
        { action: 'cerrar', title: 'Cerrar' }
      ]
    })
  );
});

// Notification click
self.addEventListener('notificationclick', function(e) {
  e.notification.close();
  if(e.action === 'cerrar') return;
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then(function(clientList) {
      for(var i = 0; i < clientList.length; i++) {
        if(clientList[i].url.includes('novedades-logistica') && 'focus' in clientList[i]) {
          return clientList[i].focus();
        }
      }
      if(clients.openWindow) {
        return clients.openWindow('https://exquisite-cucurucho-c0d811.netlify.app/novedades-logistica.html');
      }
    })
  );
});
