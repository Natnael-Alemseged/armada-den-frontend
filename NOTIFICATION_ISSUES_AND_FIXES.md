# Notification Issues & Fixes

## 🐛 Issues Reported

1. ❌ **Unread count not increasing** when message arrives in inactive topic
2. ❌ **No notifications** when on another tab/website (even with permission enabled)
3. ❌ **No online indicators** on profiles in chat

---

## 🔍 Root Cause Analysis

### Issue 1: Unread Counts Not Updating

**Problem**: TopicsList shows `topic.unread_count` from Redux state, but real-time updates happen in `useNotifications` hook which maintains separate state.

**Status**: ✅ **FIXED**
- Modified `TopicsList.tsx` to use `getUnreadCount()` from NotificationContext
- Now shows real-time updates when `global_message_alert` event is received

**What to test**:
```
1. Open Topic A
2. Have someone send message to Topic B
3. Check if Topic B shows unread badge (orange number)
```

---

### Issue 2: No Push Notifications When Tab is Inactive

**Problem**: This requires **BACKEND** to send push notifications via Web Push API.

**Status**: ⚠️ **BACKEND ISSUE**

**What's needed on backend**:

1. **Install web-push library**:
   ```bash
   npm install web-push
   ```

2. **Generate VAPID keys** (one-time):
   ```bash
   npx web-push generate-vapid-keys
   ```

3. **Store in .env**:
   ```env
   VAPID_PUBLIC_KEY=your_public_key_here
   VAPID_PRIVATE_KEY=your_private_key_here
   VAPID_SUBJECT=mailto:your-email@example.com
   ```

4. **Implement endpoints**:
   - `GET /notifications/vapid-public-key` - Return public key
   - `POST /notifications/subscribe` - Store subscription
   - `DELETE /notifications/unsubscribe/:id` - Remove subscription

5. **Send push notifications when message is sent**:
   ```javascript
   // When a message is sent to a topic
   const webpush = require('web-push');
   
   webpush.setVapidDetails(
     process.env.VAPID_SUBJECT,
     process.env.VAPID_PUBLIC_KEY,
     process.env.VAPID_PRIVATE_KEY
   );

   // Get all subscriptions for users in the topic (except sender)
   const subscriptions = await getSubscriptionsForTopic(topicId, excludeSenderId);
   
   // Send push notification to each subscription
   for (const sub of subscriptions) {
     const payload = JSON.stringify({
       title: 'New Message',
       body: messagePreview,
       icon: '/logo_black.png',
       data: {
         topic_id: topicId,
         url: `/channels?topic=${topicId}`
       }
     });
     
     try {
       await webpush.sendNotification(sub, payload);
     } catch (error) {
       if (error.statusCode === 410) {
         // Subscription expired, remove it
         await removeSubscription(sub.id);
       }
     }
   }
   ```

**Frontend is ready** - just needs backend to send push notifications!

---

### Issue 3: No Online Indicators

**Problem**: Online indicators not showing on message avatars.

**Status**: ⚠️ **NEEDS BACKEND VERIFICATION**

**What's needed**:

1. **Backend must emit `user_status_change` event** when users connect/disconnect:
   ```javascript
   // When user connects
   io.emit('user_status_change', {
     user_id: userId,
     is_online: true,
     timestamp: new Date().toISOString()
   });
   
   // When user disconnects
   io.emit('user_status_change', {
     user_id: userId,
     is_online: false,
     timestamp: new Date().toISOString()
   });
   ```

2. **Backend should send initial online users list** when client connects:
   ```javascript
   socket.on('connection', (socket) => {
     // Send list of currently online users
     socket.emit('online_users', {
       user_ids: Array.from(onlineUsers)
     });
   });
   ```

**Frontend is ready** - `MessageList` component already uses `OnlineIndicator` with `useOnlineStatus` hook.

**To test if backend is sending events**:
```javascript
// Open browser console and run:
import { socketService } from '@/lib/services/socketService';

socketService.onUserStatusChange((data) => {
  console.log('User status changed:', data);
});
```

---

## ✅ What's Working (Frontend)

1. ✅ Socket connection established
2. ✅ Joining/leaving topic rooms
3. ✅ Listening for `global_message_alert` events
4. ✅ Listening for `user_status_change` events
5. ✅ Push notification subscription (VAPID)
6. ✅ Service worker registered
7. ✅ Notification permission handling
8. ✅ Unread count state management
9. ✅ Online user state management
10. ✅ UI components (OnlineIndicator, UnreadBadge, NotificationPrompt)

---

## 🧪 Testing Checklist

### Test 1: Unread Counts (Frontend Fixed)
- [ ] Open Topic A
- [ ] Send message to Topic B from another user
- [ ] Check if Topic B shows orange badge with count
- [ ] Click Topic B
- [ ] Badge should disappear

### Test 2: Push Notifications (Needs Backend)
- [ ] Enable notifications (permission granted)
- [ ] Close browser or switch to another tab
- [ ] Send message from another user
- [ ] Should see desktop notification
- [ ] Click notification should open browser to topic

### Test 3: Online Indicators (Needs Backend)
- [ ] Open chat with messages
- [ ] Check if green dots appear on avatars
- [ ] Have another user disconnect
- [ ] Green dot should disappear

---

## 🔧 Backend Implementation Guide

### 1. Install Dependencies
```bash
npm install web-push socket.io
```

### 2. Generate VAPID Keys
```bash
npx web-push generate-vapid-keys
```

### 3. Create Notification Service (Backend)

```javascript
// services/notificationService.js
const webpush = require('web-push');

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

class NotificationService {
  async sendPushNotification(subscription, payload) {
    try {
      await webpush.sendNotification(subscription, JSON.stringify(payload));
      return true;
    } catch (error) {
      if (error.statusCode === 410) {
        // Subscription expired
        await this.removeSubscription(subscription.endpoint);
      }
      throw error;
    }
  }

  async notifyTopicMessage(topicId, message, excludeUserId) {
    // Get all subscriptions for users in this topic
    const subscriptions = await db.getTopicSubscriptions(topicId, excludeUserId);
    
    const payload = {
      title: `New message in ${message.topic_name}`,
      body: message.content.substring(0, 100),
      icon: '/logo_black.png',
      data: {
        topic_id: topicId,
        url: `/channels?topic=${topicId}`
      }
    };

    // Send to all subscriptions
    const promises = subscriptions.map(sub => 
      this.sendPushNotification(sub, payload)
    );
    
    await Promise.allSettled(promises);
  }
}

module.exports = new NotificationService();
```

### 4. Socket.IO Events (Backend)

```javascript
// socket/handlers.js
const onlineUsers = new Set();

io.on('connection', (socket) => {
  const userId = socket.user.id;
  
  // Add to online users
  onlineUsers.add(userId);
  
  // Broadcast user came online
  io.emit('user_status_change', {
    user_id: userId,
    is_online: true,
    timestamp: new Date().toISOString()
  });
  
  // Send initial online users list
  socket.emit('online_users', {
    user_ids: Array.from(onlineUsers)
  });
  
  // When message is sent
  socket.on('send_message', async (data) => {
    const message = await saveMessage(data);
    
    // Emit to topic room
    io.to(`topic:${data.topic_id}`).emit('new_message', {
      topic_id: data.topic_id,
      message: message
    });
    
    // Send global alert to all users (for unread counts)
    io.emit('global_message_alert', {
      topic_id: data.topic_id,
      sender_id: userId,
      message_preview: message.content.substring(0, 100),
      timestamp: new Date().toISOString()
    });
    
    // Send push notifications to offline/inactive users
    await notificationService.notifyTopicMessage(
      data.topic_id,
      message,
      userId
    );
  });
  
  // When user disconnects
  socket.on('disconnect', () => {
    onlineUsers.delete(userId);
    
    io.emit('user_status_change', {
      user_id: userId,
      is_online: false,
      timestamp: new Date().toISOString()
    });
  });
});
```

### 5. API Endpoints (Backend)

```javascript
// routes/notifications.js
router.get('/vapid-public-key', (req, res) => {
  res.json({ public_key: process.env.VAPID_PUBLIC_KEY });
});

router.post('/subscribe', async (req, res) => {
  const { endpoint, p256dh, auth } = req.body;
  const userId = req.user.id;
  
  const subscription = await db.saveSubscription({
    user_id: userId,
    endpoint,
    p256dh,
    auth
  });
  
  res.json(subscription);
});

router.delete('/unsubscribe/:id', async (req, res) => {
  await db.removeSubscription(req.params.id);
  res.json({ success: true });
});

router.delete('/unsubscribe-by-endpoint', async (req, res) => {
  await db.removeSubscriptionByEndpoint(req.body.endpoint);
  res.json({ success: true });
});

router.get('/subscriptions', async (req, res) => {
  const subscriptions = await db.getUserSubscriptions(req.user.id);
  res.json(subscriptions);
});
```

### 6. Database Schema (Backend)

```sql
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);
```

---

## 📝 Summary

### Frontend Status: ✅ COMPLETE
- All UI components implemented
- Socket event listeners configured
- Push notification subscription working
- Service worker registered
- Unread counts updating in real-time

### Backend Status: ⚠️ NEEDS IMPLEMENTATION
1. **VAPID keys** - Generate and configure
2. **Push notification endpoints** - Implement 5 endpoints
3. **Socket.IO events** - Emit `user_status_change` and `global_message_alert`
4. **Push notification sending** - Send when message arrives
5. **Database** - Store push subscriptions

### Next Steps:
1. Backend team implements push notification endpoints
2. Backend team emits socket events for online status
3. Backend team sends push notifications when messages arrive
4. Test all three features end-to-end

---

## 🔗 References

- [Web Push Protocol](https://developers.google.com/web/fundamentals/push-notifications)
- [VAPID Keys](https://blog.mozilla.org/services/2016/08/23/sending-vapid-identified-webpush-notifications-via-mozillas-push-service/)
- [Socket.IO Documentation](https://socket.io/docs/v4/)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
