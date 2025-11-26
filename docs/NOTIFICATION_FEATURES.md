# Notification Features Implementation

This document describes the implementation of real-time notifications, online status indicators, and push notifications in the Armada Den frontend.

## Features Implemented

### 1. Real-Time Online Status Tracking
- **Socket Event**: `user_status_change`
- **Components**: 
  - `OnlineIndicator` - Visual indicator showing online/offline status
  - `useOnlineStatus` hook - Manages online user tracking
- **Location**: Message avatars in `MessageList` component
- **Functionality**: Shows green dot for online users, updates in real-time

### 2. Global Message Alerts
- **Socket Event**: `global_message_alert`
- **Components**:
  - `GlobalNotificationToast` - Toast notifications for new messages
  - `useNotifications` hook - Manages global alerts
- **Location**: Global component in app layout
- **Functionality**: Shows toast notifications for messages in all topics/channels, not just active ones

### 3. Unread Message Counts
- **API Endpoint**: `/api/topics/unread-counts`
- **Socket Events**: 
  - `new_message` - Increments unread count
  - `mark_as_read` - Resets unread count
- **Components**:
  - `UnreadBadge` - Visual badge showing unread count
  - `useNotifications` hook - Manages unread counts
- **Location**: 
  - Topic list items in `TopicsList`
  - Sidebar topics in `ChannelsSidebar`
  - Total count badge on notification bell
- **Functionality**: 
  - Increments when new messages arrive in inactive topics
  - Resets when topic is viewed
  - Shows total unread count across all topics

### 4. Web Push Notifications
- **Service**: `notificationService`
- **Service Worker**: `/public/sw.js`
- **Components**:
  - `NotificationSettings` - UI for managing push subscriptions
- **Location**: Sidebar header in `ChannelsSidebar`
- **Functionality**:
  - Request notification permission
  - Subscribe/unsubscribe to push notifications
  - Receive notifications even when browser is closed
  - Click notification to navigate to relevant topic

## File Structure

```
lib/
├── services/
│   ├── socketService.ts          # Extended with new events
│   └── notificationService.ts    # New: Push notification management
├── hooks/
│   ├── useNotifications.ts       # New: Main notification hook
│   └── useOnlineStatus.ts        # New: Online status tracking
├── types.ts                      # Extended with new types
└── constants/
    └── endpoints.ts              # Added notification endpoints

components/
├── ui/
│   ├── OnlineIndicator.tsx       # New: Online status dot
│   ├── UnreadBadge.tsx           # New: Unread count badge
│   ├── NotificationSettings.tsx  # New: Push notification settings
│   └── GlobalNotificationToast.tsx # New: Toast notifications
├── providers/
│   └── NotificationProvider.tsx  # New: Global notification context
└── channels/
    ├── MessageList.tsx           # Updated: Added online indicators
    ├── TopicView.tsx             # Updated: Mark as read on view
    └── ChannelsSidebar.tsx       # Updated: Added notification UI

public/
└── sw.js                         # New: Service worker for push notifications

app/
└── layout.tsx                    # Updated: Added NotificationProvider
```

## Usage

### Using the Notification Hook

```typescript
import { useNotifications } from '@/lib/hooks/useNotifications';

function MyComponent() {
  const {
    isSubscribed,
    onlineUsers,
    unreadCounts,
    isUserOnline,
    getUnreadCount,
    subscribeToPush,
    markTopicAsRead,
  } = useNotifications(token);

  // Check if user is online
  const userOnline = isUserOnline(userId);

  // Get unread count for a topic
  const unread = getUnreadCount(topicId);

  // Subscribe to push notifications
  await subscribeToPush();

  // Mark topic as read
  markTopicAsRead(topicId);
}
```

### Using the Notification Context

```typescript
import { useNotificationContext } from '@/components/providers/NotificationProvider';

function MyComponent() {
  const { getTotalUnreadCount, isUserOnline } = useNotificationContext();
  
  const totalUnread = getTotalUnreadCount();
  const isOnline = isUserOnline(userId);
}
```

### Displaying Online Status

```typescript
import { OnlineIndicator } from '@/components/ui/OnlineIndicator';

<div className="relative">
  <Avatar />
  <OnlineIndicator isOnline={isUserOnline(userId)} size="sm" />
</div>
```

### Displaying Unread Badge

```typescript
import { UnreadBadge } from '@/components/ui/UnreadBadge';

<div className="flex items-center gap-2">
  <span>Topic Name</span>
  <UnreadBadge count={unreadCount} />
</div>
```

## Socket Events

### Listening for Events

The socket service automatically listens for these events:

1. **user_status_change**: User goes online/offline
2. **global_message_alert**: New message in any topic
3. **new_message**: New message in subscribed topic
4. **mark_as_read**: Messages marked as read

### Emitting Events

```typescript
import { socketService } from '@/lib/services/socketService';

// Mark topic as read
socketService.markTopicAsRead(topicId, messageIds);

// Join topic
socketService.joinTopic(topicId);

// Leave topic
socketService.leaveTopic(topicId);
```

## Push Notifications

### Setup

1. Service worker is automatically registered at `/sw.js`
2. VAPID keys must be configured in backend
3. User must grant notification permission

### Subscribing

```typescript
import { notificationService } from '@/lib/services/notificationService';

// Request permission and subscribe
const subscription = await notificationService.subscribeToPush(token);

// Check if subscribed
const isSubscribed = await notificationService.isSubscribed();

// Unsubscribe
await notificationService.unsubscribeFromPush();
```

### Notification Payload

Push notifications include:
- `title`: Notification title
- `body`: Message preview
- `icon`: App icon
- `data`: Contains `topic_id` or `room_id` for navigation

## API Endpoints

### Notification Endpoints

- `GET /api/notifications/vapid-public-key` - Get VAPID public key
- `POST /api/notifications/subscribe` - Subscribe to push notifications
- `DELETE /api/notifications/unsubscribe/:id` - Unsubscribe by ID
- `DELETE /api/notifications/unsubscribe-by-endpoint` - Unsubscribe by endpoint
- `GET /api/notifications/subscriptions` - Get all subscriptions

### Unread Count Endpoint

- `GET /api/topics/unread-counts` - Get unread counts for all topics

## Browser Support

- **Push Notifications**: Requires HTTPS (except localhost)
- **Service Workers**: Modern browsers only
- **Notifications API**: Chrome, Firefox, Edge, Safari 16+

## Testing

### Manual Testing Checklist

- [ ] Online status updates when users connect/disconnect
- [ ] Unread counts increment for messages in inactive topics
- [ ] Unread counts reset when viewing a topic
- [ ] Global toast notifications appear for new messages
- [ ] Push notifications work when browser is closed
- [ ] Clicking push notification navigates to correct topic
- [ ] Notification settings toggle works
- [ ] Total unread count badge shows correct number
- [ ] Online indicators appear on message avatars

## Troubleshooting

### Push Notifications Not Working

1. Check HTTPS is enabled (required for push notifications)
2. Verify VAPID keys are configured in backend
3. Check browser console for service worker errors
4. Verify notification permission is granted
5. Check service worker registration: `navigator.serviceWorker.controller`

### Online Status Not Updating

1. Verify socket connection is active
2. Check `user_status_change` event is being received
3. Ensure socket is connected before joining topics

### Unread Counts Incorrect

1. Verify API endpoint returns correct counts
2. Check `mark_as_read` event is emitted when viewing topic
3. Ensure socket events are properly handled

## Future Enhancements

- [ ] Sound notifications for new messages
- [ ] Desktop notification customization
- [ ] Notification preferences per topic
- [ ] Mute/unmute specific topics
- [ ] Do Not Disturb mode
- [ ] Notification history
- [ ] Read receipts for messages
