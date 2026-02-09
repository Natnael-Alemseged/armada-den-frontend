// Service Worker Version: 1.0.1
// Generated from template - do not edit. Run: node scripts/inject-firebase-config.js
console.log('[firebase-messaging-sw.js] Service Worker v1.0.1 loaded');

importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "%%NEXT_PUBLIC_FIREBASE_API_KEY%%",
    authDomain: "%%NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN%%",
    projectId: "%%NEXT_PUBLIC_FIREBASE_PROJECT_ID%%",
    storageBucket: "%%NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET%%",
    messagingSenderId: "%%NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID%%",
    appId: "%%NEXT_PUBLIC_FIREBASE_APP_ID%%"
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
    
    const urlToOpen = event.notification.data?.url || '/channels';
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                for (const client of clientList) {
                    if (client.url.includes(self.location.origin) && 'focus' in client) {
                        return client.focus().then(() => {
                            return client.postMessage({
                                type: 'NOTIFICATION_CLICK',
                                url: urlToOpen
                            });
                        });
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});
