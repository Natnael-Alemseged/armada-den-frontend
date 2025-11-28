# Service Worker Update Guide

## Problem
You're seeing the log `[firebase-messaging-sw.js] Received background message` but no notification appears. This is because the old service worker is cached in your browser.

## Solution: Force Service Worker Update

### Method 1: Chrome DevTools (Recommended)

1. **Open Chrome DevTools** (F12 or Right-click → Inspect)

2. **Go to Application tab** → Service Workers (left sidebar)

3. You should see `firebase-messaging-sw.js` listed

4. **Check these boxes**:
   - ✅ **Update on reload**
   - ✅ **Bypass for network** (optional)

5. Click **"Unregister"** next to the service worker

6. **Hard refresh** the page: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

7. The new service worker should now be active

### Method 2: Manual Unregister via Console

1. Open browser console (F12)

2. Run this code:
```javascript
navigator.serviceWorker.getRegistrations().then(function(registrations) {
  for(let registration of registrations) {
    console.log('Unregistering:', registration);
    registration.unregister();
  }
  console.log('All service workers unregistered. Please refresh the page.');
});
```

3. Refresh the page

4. Re-enable notifications (click the bell icon)

### Method 3: Clear Site Data

1. Open Chrome DevTools (F12)

2. Go to **Application** tab

3. In the left sidebar, click **"Clear storage"**

4. Click **"Clear site data"** button

5. Refresh the page

6. Re-enable notifications

## Verify It's Working

After updating the service worker:

1. **Check the console** - You should see:
   ```
   [firebase-messaging-sw.js] Service Worker v1.0.1 loaded
   ```

2. **Test background notification**:
   - Keep the app open but switch to a different tab
   - Send a message from another device
   - You should see in console:
     ```
     [firebase-messaging-sw.js] Received background message {...}
     [firebase-messaging-sw.js] Showing notification: ...
     [firebase-messaging-sw.js] Notification displayed successfully
     ```
   - **AND** a system notification should appear

3. **Test with app closed**:
   - Close the browser tab completely
   - Send a message
   - System notification should appear
   - Click it → browser opens to the topic

## Troubleshooting

### Still no notification after update?

**Check notification permission:**
```javascript
console.log('Notification permission:', Notification.permission);
```
Should be `"granted"`. If not, click the bell icon to enable.

**Check service worker registration:**
```javascript
navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js')
  .then(reg => console.log('Service worker registered:', reg))
  .catch(err => console.error('Service worker not registered:', err));
```

**Check if service worker is active:**
```javascript
navigator.serviceWorker.ready.then(registration => {
  console.log('Service worker ready:', registration);
  console.log('Active worker:', registration.active);
});
```

### Error: "Failed to show notification"

This usually means:
- Notification permission is denied
- Browser doesn't support notifications
- Service worker scope issue

**Fix**: Re-enable notifications via browser settings or the bell icon.

### Notification appears but click doesn't work

Check the console for:
```
[firebase-messaging-sw.js] Notification clicked: ...
[ServiceWorkerProvider] Received message from service worker: ...
```

If you don't see these logs, the click handler isn't working. Try Method 1 above to fully reset the service worker.

## Quick Test Commands

Run these in the browser console to test:

```javascript
// 1. Check service worker status
navigator.serviceWorker.controller 
  ? console.log('✅ Service worker active') 
  : console.log('❌ No service worker');

// 2. Check notification permission
console.log('Notification permission:', Notification.permission);

// 3. Test notification manually
if (Notification.permission === 'granted') {
  new Notification('Test Notification', {
    body: 'If you see this, notifications work!',
    icon: '/icon.png'
  });
}

// 4. Check FCM token
// (Run this after importing firebase)
import('@/lib/firebase').then(({ messaging }) => {
  import('firebase/messaging').then(({ getToken }) => {
    getToken(messaging, { vapidKey: 'YOUR_VAPID_KEY' })
      .then(token => console.log('FCM Token:', token))
      .catch(err => console.error('FCM Token error:', err));
  });
});
```

## After Update Checklist

- [ ] Service worker version shows `v1.0.1` in console
- [ ] Notification permission is `"granted"`
- [ ] Test notification appears when tab is inactive
- [ ] Test notification appears when browser is closed
- [ ] Clicking notification opens the app
- [ ] Clicking notification navigates to correct topic

## Notes

- Service workers update automatically when the file changes, but browsers cache them
- Always use "Update on reload" during development
- In production, service workers update within 24 hours or on hard refresh
- The version number in the service worker helps track which version is active
