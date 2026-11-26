/* Bộ nhớ đệm để app mở nhanh và mở được khi mất mạng. Đổi số phiên bản khi cập nhật app. */
var CACHE = 'pdt-v1.7.0';
var FILES = ['./', 'index.html', 'styles.css', 'app.js', 'core.js', 'lunar.js', 'config.js', 'manifest.webmanifest',
  'icons/logo-uneti.png', 'icons/favicon.png', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
/* Tệp của app: lấy bản mới trên mạng trước, mất mạng thì dùng bản đã lưu. Dữ liệu máy chủ không lưu đệm. */
self.addEventListener('fetch', function (e) {
  var url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  e.respondWith(fetch(e.request.url, { cache: 'no-cache' }).then(function (r) {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    var copy = r.clone();
    caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
    return r;
  }).catch(function () { return caches.match(e.request, { ignoreSearch: true }).then(function (r) { return r || caches.match('index.html'); }); }));
});
/* Thông báo đẩy từ máy chủ (Firebase Cloud Messaging): hiện cả khi app đã đóng */
self.addEventListener('push', function (e) {
  var p = {};
  try { p = e.data ? e.data.json() : {}; } catch (x) { p = { data: { body: e.data ? e.data.text() : '' } }; }
  var d = p.data || {}, n = p.notification || {};
  var title = d.title || n.title || 'Công việc Phòng Đào tạo';
  var body = d.body || n.body || 'Có cập nhật mới';
  e.waitUntil(Promise.all([
    self.registration.showNotification(title, {
      body: body, icon: 'icons/icon-192.png', badge: 'icons/favicon.png',
      tag: 'pdt-' + Date.now(), data: { taskId: d.taskId || '' }
    }),
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
      list.forEach(function (c) { c.postMessage({ type: 'push' }); });
    })
  ]));
});
self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var taskId = (e.notification.data || {}).taskId || '';
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
    for (var i = 0; i < list.length; i++) if ('focus' in list[i]) {
      if (taskId) list[i].postMessage({ type: 'open', taskId: taskId });
      return list[i].focus();
    }
    return self.clients.openWindow(taskId ? './?task=' + encodeURIComponent(taskId) + '#home' : './#home');
  }));
});
