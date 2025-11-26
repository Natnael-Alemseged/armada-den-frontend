// Service Worker for Push Notifications
// This file handles push notifications when the app is not open

self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);

  if (!event.data) {
    console.warn('Push event has no data');
    return;
  }

  try {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'New message received',
      icon: data.icon || '/logo_black.png',
      badge: data.badge || '/logo_black.png',
      tag: data.tag || 'default',
      data: data.data || {},
      requireInteraction: false,
      vibrate: [200, 100, 200],
      actions: data.actions || [],
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Armada Den', options)
    );
  } catch (error) {
    console.error('Error processing push notification:', error);
  }
});

self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  const data = event.notification.data;
  
  // Determine the URL to open based on notification data
  let urlToOpen = '/';
  
  if (data.topic_id) {
    urlToOpen = `/channels?topic=${data.topic_id}`;
  } else if (data.room_id) {
    urlToOpen = `/messages?room=${data.room_id}`;
  } else if (data.url) {
    urlToOpen = data.url;
  }
  
  // Open or focus the app window
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus().then(() => {
              // Navigate to the appropriate page
              if ('navigate' in client) {
                return client.navigate(urlToOpen);
              }
            });
          }
        }
        
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
});

// Handle service worker activation
self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  event.waitUntil(clients.claim());
});

// Handle service worker installation
self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  self.skipWaiting();
});
