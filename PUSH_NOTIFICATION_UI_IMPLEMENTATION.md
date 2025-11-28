# Push Notification UI Implementation

## Overview
This document describes the complete implementation of push notification UI for both foreground (app open) and background (app closed) scenarios.

## Implementation Summary

### 1. Foreground Notifications (App Open)
When the user has the app open in their browser, FCM messages are handled by the `onMessage` handler in `useNotifications.ts`.

**File**: `lib/hooks/useNotifications.ts`

**Behavior**:
- Receives FCM payload via `onMessage` callback
- Displays an in-app toast notification using the `toastBar` helper
- Updates unread counts for the relevant topic
- Toast appears in bottom-right corner for 5 seconds

**Toast Location**: Bottom-right corner of the screen (via `ToastProvider`)

**Example**:
```
┌─────────────────────────────────────┐
│ ℹ️ New Message: Hey, are you there? │
│                                  ✕  │
└─────────────────────────────────────┘
```

### 2. Background Notifications (App Closed/Minimized)
When the app is closed or minimized, the service worker handles FCM messages and displays system notifications.

**File**: `public/firebase-messaging-sw.js`

**Behavior**:
- Service worker receives FCM payload via `onBackgroundMessage`
- Displays native browser/OS notification
- Notification includes:
  - Title from `payload.notification.title`
  - Body from `payload.notification.body`
  - Icon/badge
  - Click action to navigate to the relevant topic

**Notification Click Handling**:
- Clicking the notification focuses/opens the app
- Navigates to the specific topic (e.g., `/channels?topic=<topic_id>`)
- If app is already open, focuses the window and navigates
- If app is closed, opens a new window at the topic URL

### 3. Service Worker Message Handling
**File**: `components/providers/ServiceWorkerProvider.tsx`

**Purpose**:
- Listens for messages from the service worker
- Handles navigation when notifications are clicked
- Uses Next.js router to navigate to the correct topic

## Files Modified/Created

### Modified Files
1. **`lib/hooks/useNotifications.ts`**
   - Updated `onMessage` handler to show toast notifications
   - Added unread count updates for foreground messages

2. **`public/firebase-messaging-sw.js`**
   - Enhanced notification options (icon, badge, tag, data)
   - Added `notificationclick` event handler
   - Implemented smart window focusing and navigation

3. **`app/layout.tsx`**
   - Added `ServiceWorkerProvider` to handle notification clicks

### Created Files
1. **`components/providers/ServiceWorkerProvider.tsx`**
   - New provider to handle service worker messages
   - Manages navigation when notifications are clicked

## User Experience Flow

### Scenario 1: App is Open (Foreground)
1. User receives a message in a topic they're not currently viewing
2. FCM delivers the push notification
3. `onMessage` handler catches it
4. Toast notification appears in bottom-right corner
5. Toast shows: "New Message: [message preview]"
6. Toast auto-dismisses after 5 seconds
7. Unread count for that topic increments

### Scenario 2: App is Closed (Background)
1. User receives a message while app is closed
2. FCM delivers the push notification
3. Service worker catches it via `onBackgroundMessage`
4. Native OS notification appears (Windows notification center, macOS notification, etc.)
5. User clicks the notification
6. Browser opens/focuses the app
7. App navigates to the specific topic
8. User sees the new message

### Scenario 3: App is Open but Minimized
1. User receives a message while app is minimized
2. Service worker shows native OS notification
3. User clicks notification
4. Browser focuses the existing tab
5. App navigates to the topic
6. User sees the message

## Notification Payload Structure

The backend should send FCM messages with this structure:

```json
{
  "notification": {
    "title": "New Message from John Doe",
    "body": "Hey, are you available for a quick call?"
  },
  "data": {
    "topic_id": "a78979c9-06d1-45d8-aa90-8455f933682f",
    "message_id": "f07405c8-971b-43f0-8176-a4bf416f7c75",
    "sender_id": "8003aac3-74c1-49c4-ab05-8f51a2ef6b53"
  }
}
```

## Testing

### Test Foreground Notifications
1. Open the app in your browser
2. Enable notifications (click bell icon)
3. Open a different topic or stay on the channels page
4. Send a message from another user/device
5. **Expected**: Toast notification appears in bottom-right corner

### Test Background Notifications
1. Open the app and enable notifications
2. Close the browser tab completely (or minimize)
3. Send a message from another user/device
4. **Expected**: OS notification appears
5. Click the notification
6. **Expected**: Browser opens to the specific topic

### Test Notification Click Navigation
1. Receive a background notification
2. Click it
3. **Expected**: App opens and navigates to `/channels?topic=<topic_id>`

## Browser Console Logs

When everything is working correctly, you should see:

**Foreground (app open)**:
```
[useNotifications] 📬 FCM foreground message received: {notification: {...}, data: {...}}
[useNotifications] FCM: Incrementing unread count for topic a78979c9-...: 0 -> 1
```

**Background (app closed)**:
```
[firebase-messaging-sw.js] Received background message {from: '[REDACTED]', ...}
[firebase-messaging-sw.js] Notification clicked: Notification {...}
[ServiceWorkerProvider] Received message from service worker: {type: 'NOTIFICATION_CLICK', url: '/channels?topic=...'}
```

## Troubleshooting

### No toast appears when app is open
- Check browser console for `[useNotifications] 📬 FCM foreground message received`
- Verify `ToastProvider` is in the layout
- Check that `toastBar` callback is set up

### No system notification when app is closed
- Verify service worker is registered: `navigator.serviceWorker.controller` should not be null
- Check notification permission: `Notification.permission` should be `"granted"`
- Verify VAPID key is configured correctly
- Check browser console in service worker scope (Chrome DevTools > Application > Service Workers)

### Notification click doesn't navigate
- Check `ServiceWorkerProvider` is in the layout
- Verify service worker message event is firing
- Check browser console for navigation logs

## Next Steps

Future enhancements could include:
- Sound notifications
- Notification grouping by topic
- Custom notification actions (Reply, Mark as Read)
- Notification history
- Per-topic notification preferences
