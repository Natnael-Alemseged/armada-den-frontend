# Quick Start Guide - Real-Time Chat

## 🚀 Get Started in 3 Steps

### Step 1: Add Chat Page to Your App

```tsx
// app/chat/page.tsx (or pages/chat.tsx for Pages Router)
import { RealtimeChatPage } from '@/components/realtimeChat';

export default function ChatPage() {
  return <RealtimeChatPage />;
}
```

### Step 2: Verify Environment Variables

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Step 3: Start Your App

```bash
pnpm dev
# or
npm run dev
```

Navigate to `/chat` and start messaging! 🎉

---

## 📖 Usage Examples

### Create a Direct Chat
1. Click the "+" button in the sidebar
2. Select "Direct" chat type
3. Search and select a user
4. Click "Create Chat"

### Create a Group Chat
1. Click the "+" button
2. Select "Group" chat type
3. Enter group name and description
4. Search and select multiple users
5. Click "Create Chat"

### Send a Message
- Type in the input field
- Press Enter or click Send button
- Your message appears instantly!

### Send Media
1. Click the paperclip icon
2. Select image, video, audio, or file
3. File uploads automatically
4. Message sent with media attached

### Edit a Message
1. Hover over your message
2. Click the edit icon
3. Modify the text
4. Press Enter to save

### Reply to a Message
1. Hover over any message
2. Click the reply icon
3. Type your reply
4. Original message shows in your reply

### Delete a Message
1. Hover over your message
2. Click the trash icon
3. Confirm deletion
4. Message marked as deleted

---

## 🎨 Features at a Glance

| Feature | Status | Description |
|---------|--------|-------------|
| Direct Chat | ✅ | 1-on-1 conversations |
| Group Chat | ✅ | Multi-user conversations |
| Real-Time | ✅ | Instant message delivery |
| Media Upload | ✅ | Images, videos, audio, files |
| Edit Messages | ✅ | Edit your own messages |
| Delete Messages | ✅ | Delete your own messages |
| Reply | ✅ | Reply to any message |
| Typing Indicators | ✅ | See when others are typing |
| Read Receipts | ✅ | See who read your messages |
| Unread Badges | ✅ | Count of unread messages |
| Search Users | ✅ | Find users by email/name |
| Last Message | ✅ | Preview recent activity |
| Dark Mode | ✅ | Automatic theme support |

---

## 🔧 Customization

### Change Colors

Edit the Tailwind classes in the components:

```tsx
// Blue theme (default)
className="bg-blue-600 hover:bg-blue-700"

// Change to purple
className="bg-purple-600 hover:bg-purple-700"
```

### Adjust Message Bubble Size

```tsx
// In MessageBubble.tsx
className="max-w-[70%]"  // Default

// Make wider
className="max-w-[80%]"
```

### Modify Sidebar Width

```tsx
// In RealtimeChatPage.tsx
className="w-80"  // Default (320px)

// Make wider
className="w-96"  // 384px
```

---

## 🐛 Troubleshooting

### Socket Not Connecting?
- Check `NEXT_PUBLIC_API_URL` is set correctly
- Ensure backend is running on port 8000
- Verify JWT token is valid

### Messages Not Sending?
- Check browser console for errors
- Verify you're authenticated
- Ensure you're a member of the room

### Media Upload Failing?
- Check Supabase configuration on backend
- Verify file size is under limit
- Check file type is supported

---

## 📞 Support

For issues or questions:
1. Check `REALTIME_CHAT_INTEGRATION_SUMMARY.md` for detailed docs
2. Review `CHAT_FEATURE_README.md` for backend API details
3. Check browser console for error messages

---

**Enjoy your new real-time chat! 💬**
