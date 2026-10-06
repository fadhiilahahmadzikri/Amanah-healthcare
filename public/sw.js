self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = {
      title: 'Amanah Healthcare',
      body: event.data.text()
    };
  }

  const title = payload.title || 'Amanah Healthcare';
  const options = {
    body: payload.body || '',
    icon: payload.icon || '/logo-symbol-only.png',
    badge: payload.badge || '/apple-touch-icon.png',
    vibrate: payload.vibrationPattern || [300, 100, 300, 100, 300],
    tag: payload.tag || 'amanah-push-notification',
    renotify: true,
    data: {
      url: payload.actionUrl || '/dashboard/klinik/antrean',
      ...payload.data
    }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/dashboard/klinik/antrean';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
