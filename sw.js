var C = 'shelf-v3';
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(C).then(function (c) { return c.add('./index.html'); }).then(function () { return self.skipWaiting(); }));
});
// 激活时清空所有旧缓存（v1/v2 残留），立即接管所有页面
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
// 网络优先：有网永远拿最新，断网才用缓存兜底
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).then(function (res) {
    var copy = res.clone();
    caches.open(C).then(function (c) { c.put(e.request, copy); });
    return res;
  }).catch(function () { return caches.match(e.request); }));
});
