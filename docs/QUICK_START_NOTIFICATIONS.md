# Quick Start: Notification Features

This guide will help you quickly get started with the new notification features.

## What's New

✅ **Real-time online status** - See who's online with green dots on avatars  
✅ **Global message alerts** - Get notified of messages in all topics, not just the active one  
✅ **Unread message counts** - See how many unread messages you have per topic  
✅ **Push notifications** - Receive notifications even when the browser is closed  

## Quick Setup

### 1. Enable Push Notifications (Optional)

1. Click the **bell icon** in the sidebar header
2. Click **"Enable Notifications"**
3. Allow notification permission when prompted
4. You're all set! You'll now receive push notifications even when the app is closed

### 2. View Unread Messages

- **Per Topic**: Look for the red badge next to topic names showing unread count
- **Total Count**: Check the red badge on the bell icon for total unread messages across all topics
- **Auto-clear**: Unread counts automatically reset when you view a topic

### 3. See Who's Online

- Look for **green dots** on user avatars in message lists
- Green dot = user is currently online
- No dot = user is offline

### 4. Global Notifications

- When someone sends a message in any topic, you'll see a **toast notification** in the top-right corner
- Click the notification to jump to that topic
- Notifications auto-dismiss after 5 seconds

## Features in Action

### Unread Counts

```
Sidebar:
  🔔 (3)  ← Total unread across all topics
  
Topics List:
  # General (2)  ← 2 unread messages
  # Random (1)   ← 1 unread message
  # Team (0)     ← No unread messages
```

### Online Status

```
Message:
  👤 (green dot) John Doe
  "Hey everyone!"
  
  👤 (no dot) Jane Smith
  "See you later!"
```

### Push Notifications

When browser is closed:
```
🔔 Armada Den
New Message
"Hey, are you available for a quick call?"
[Click to view in app]
```

## User Flow Examples

### Scenario 1: Receiving a Message While Away

1. You're viewing Topic A
2. Someone sends a message in Topic B
3. You see:
   - Toast notification appears (top-right)
   - Unread badge appears on Topic B (sidebar)
   - Total unread count increases (bell icon)
4. Click the toast or Topic B to view the message
5. Unread count resets automatically

### Scenario 2: Enabling Push Notifications

1. Click bell icon in sidebar
2. Click "Enable Notifications"
3. Browser asks for permission → Click "Allow"
4. Button changes to "Notifications On" (green)
5. Close browser completely
6. Someone sends you a message
7. You receive a desktop notification
8. Click notification → Browser opens to that topic

### Scenario 3: Checking Who's Online

1. Open any topic
2. Scroll through messages
3. Users with green dots on avatars are currently online
4. Status updates in real-time as users connect/disconnect

## Tips & Tricks

### Managing Notifications

- **Toggle Push**: Click bell icon → Click "Notifications On/Off"
- **Check Total Unread**: Look at the badge on the bell icon
- **Clear Unread**: Simply view the topic to reset its unread count

### Keyboard Shortcuts (Future)

- `Ctrl/Cmd + K`: Quick topic switcher (shows unread counts)
- `Ctrl/Cmd + Shift + N`: Toggle notifications

### Best Practices

1. **Enable push notifications** if you want to stay updated when away
2. **Check the bell icon** regularly for total unread count
3. **Use online indicators** to know when to expect quick responses
4. **Click toast notifications** to quickly jump to new messages

## Troubleshooting

### "Enable Notifications" button doesn't work

1. Check if you're using HTTPS (required for push notifications)
2. Try a different browser (Chrome, Firefox, Edge recommended)
3. Check browser notification settings aren't blocked

### Unread counts not updating

1. Refresh the page
2. Check your internet connection
3. Verify you're logged in

### Online status not showing

1. Make sure socket connection is active (check console)
2. Refresh the page
3. Check if other users are actually online

### Push notifications not received

1. Verify notifications are enabled (bell icon should be green)
2. Check browser notification permission (browser settings)
3. Make sure browser isn't in "Do Not Disturb" mode
4. Verify HTTPS is enabled

## Need Help?

- Check the [full documentation](./NOTIFICATION_FEATURES.md)
- Review the [implementation guide](./implementation/FRONTEND_IMPLEMENTATION_GUIDE.md)
- Contact the development team

## What's Next?

Future features coming soon:
- 🔇 Mute specific topics
- 🌙 Do Not Disturb mode
- 🔊 Sound notifications
- 📱 Mobile app notifications
- ✅ Read receipts
