// Service Worker Version: 1.0.1
console.log('[firebase-messaging-sw.js] Service Worker v1.0.1 loaded');

importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "[REDACTED]",
    authDomain: "[REDACTED]",
    projectId: "[REDACTED]",
    storageBucket: "[REDACTED]",
    messagingSenderId: "[REDACTED]",
    appId: "1:[REDACTED]:web:c40568e62307f3bab4e5ff"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    const notificationTitle = payload.notification?.title || 'New Message';
    const notificationOptions = {
        body: payload.notification?.body || 'You have a new message',
        icon: '/icon.png',
        badge: '/icon.png',
        tag: payload.data?.topic_id || 'notification',
        requireInteraction: false,
        data: {
            url: payload.data?.topic_id 
                ? `/channels?topic=${payload.data.topic_id}` 
                : '/channels',
            ...payload.data
        }
    };

    console.log('[firebase-messaging-sw.js] Showing notification:', notificationTitle, notificationOptions);
    
    return self.registration.showNotification(notificationTitle, notificationOptions)
        .then(() => {
            console.log('[firebase-messaging-sw.js] Notification displayed successfully');
        })
        .catch((error) => {
            console.error('[firebase-messaging-sw.js] Error showing notification:', error);
        });
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('[firebase-messaging-sw.js] Notification clicked:', event.notification);
    
    event.notification.close();
    
    // Get the URL from notification data
    const urlToOpen = event.notification.data?.url || '/channels';
    
    // Focus or open the app window
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Check if there's already a window open
                for (const client of clientList) {
                    if (client.url.includes(self.location.origin) && 'focus' in client) {
                        return client.focus().then(() => {
                            // Navigate to the specific topic
                            return client.postMessage({
                                type: 'NOTIFICATION_CLICK',
                                url: urlToOpen
                            });
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
