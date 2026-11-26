/* Menyimpan tampilan aplikasi di HP supaya tetap terbuka saat sinyal lemah.
   Data laporan tidak disimpan di sini; antrean laporan ada di localStorage. */
var CACHE = 'paten-v1';
var FILES = ['./', './index.html', './dashboard.html', './api.js', './manifest.json',
  './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  /* Coba jaringan dulu supaya versi terbaru terpakai; kalau gagal, pakai salinan di HP. */
  e.respondWith(fetch(e.request).then(function (r) {
    var copy = r.clone();
    caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
    return r;
  }).catch(function () {
    return caches.match(e.request, { ignoreSearch: true }).then(function (m) { return m || caches.match('./index.html'); });
  }));
});
