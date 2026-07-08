const CACHE_NAME = 'xiaoxiguan-v1';
const ASSETS = [
  '/habit-tracker/',
  '/habit-tracker/index.html',
  '/habit-tracker/manifest.json',
  '/habit-tracker/css/variables.css',
  '/habit-tracker/css/base.css',
  '/habit-tracker/css/components.css',
  '/habit-tracker/js/utils.js',
  '/habit-tracker/js/db.js',
  '/habit-tracker/js/router.js',
  '/habit-tracker/js/app.js',
  '/habit-tracker/js/pages/today.js',
  '/habit-tracker/js/pages/calendar.js',
  '/habit-tracker/js/pages/settings.js',
  '/habit-tracker/js/components/habit-card.js',
  '/habit-tracker/js/components/mini-calendar.js',
  '/habit-tracker/js/components/confetti.js',
  '/habit-tracker/js/components/toast.js',
  '/habit-tracker/js/components/modal.js',
  '/habit-tracker/js/components/bottom-sheet.js',
  '/habit-tracker/js/components/emoji-picker.js',
  '/habit-tracker/assets/icon-192.png',
  '/habit-tracker/assets/icon-512.png',
  '/habit-tracker/assets/favicon.svg',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
