const CACHE = 'xhxg-v2';
const ASSETS = [
  '.',
  'index.html',
  'manifest.json',
  'css/variables.css',
  'css/base.css',
  'css/components.css',
  'js/utils.js',
  'js/db.js',
  'js/router.js',
  'js/app.js',
  'js/pages/today.js',
  'js/pages/calendar.js',
  'js/pages/settings.js',
  'js/components/habit-card.js',
  'js/components/mini-calendar.js',
  'js/components/confetti.js',
  'js/components/toast.js',
  'js/components/modal.js',
  'js/components/bottom-sheet.js',
  'js/components/emoji-picker.js',
  'assets/icon-192.png',
  'assets/icon-512.png',
  'assets/favicon.svg',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS).catch(err =>
      console.warn('SW cache failed (some assets may be offline):', err)
    ))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
