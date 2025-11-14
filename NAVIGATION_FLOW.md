# Navigation Flow - Armada Den

## 🗺️ Visual Navigation Map

```
START
  │
  ├─→ Column 1: CHANNELS (80px wide)
  │   │
  │   ├─ [A] Workspace Icon
  │   │
  │   ├─ [#] Channel 1 ──────┐
  │   ├─ [📱] Channel 2       │ CLICK
  │   ├─ [🎮] Channel 3       │
  │   └─ [+] Add Channel      │
  │                           │
  │                           ▼
  ├─→ Column 2: TOPICS (256px wide)
  │   │
  │   ├─ Header: "# Channel Name" [Logout]
  │   │
  │   ├─ # general ──────────┐
  │   ├─ # random            │ CLICK
  │   ├─ # dev-team          │
  │   ├─ # announcements     │
  │   └─ [+] Add Topic        │
  │                           │
  │                           ▼
  └─→ Column 3: MESSAGES (Flexible width)
      │
      ├─ Header: "# Topic Name"
      │
      ├─ Messages:
      │  ┌─────────────────────────────┐
      │  │ 👤 User 1 • 2 min ago       │
      │  │ Hello everyone!             │
      │  │ 👍 3  ❤️ 1                  │
      │  ├─────────────────────────────┤
      │  │ 👤 User 2 • 1 min ago       │
      │  │ Hey! How's it going?        │
      │  │ 👋 2                        │
      │  └─────────────────────────────┘
      │
      └─ Input: "Message #topic-name" [Send]
```

---

## 🎯 Step-by-Step User Journey

### **Step 1: Landing**
```
User opens app
↓
Sees all channels in Column 1
↓
Column 2: "Select a channel to view topics"
↓
Column 3: "Welcome to Armada Den"
```

### **Step 2: Select Channel**
```
User clicks channel icon (e.g., #)
↓
Channel icon turns WHITE (selected)
↓
Column 2 loads topics for that channel
↓
Shows: "# Channel Name" header + topic list
↓
Column 3: Still shows welcome message
```

### **Step 3: Select Topic**
```
User clicks topic (e.g., "# general")
↓
Topic highlights in BLUE
↓
Column 3 loads messages
↓
Shows: Topic header + message list + input
↓
Connects to Socket.IO for real-time updates
```

### **Step 4: Send Message**
```
User types in input field
↓
Presses Enter or clicks Send button
↓
Message appears immediately (optimistic update)
↓
Broadcasts to other users via Socket.IO
↓
Scrolls to bottom automatically
```

### **Step 5: React to Message**
```
User hovers over a message
↓
Action buttons appear (😊 ✏️ 🗑️)
↓
Clicks emoji button
↓
Emoji picker opens
↓
Selects emoji
↓
Reaction appears on message
↓
Broadcasts to other users
```

---

## 🔄 State Transitions

### **Channel Selection**
```javascript
// Before
currentChannel: null
currentTopic: null
messages: []

// User clicks Channel A
↓
currentChannel: Channel A
currentTopic: null
messages: []
topics: [topics for Channel A]

// Column 2 updates to show topics
```

### **Topic Selection**
```javascript
// Before
currentChannel: Channel A
currentTopic: null
messages: []

// User clicks Topic 1
↓
currentChannel: Channel A
currentTopic: Topic 1
messages: [loading...]

// Fetches messages
↓
messages: [msg1, msg2, msg3...]

// Column 3 updates to show messages
```

### **Switching Channels**
```javascript
// User on Channel A, Topic 1
currentChannel: Channel A
currentTopic: Topic 1
messages: [messages for Topic 1]

// User clicks Channel B
↓
currentChannel: Channel B
currentTopic: null  // ← Cleared!
messages: []        // ← Cleared!
topics: [topics for Channel B]

// Column 2 shows new topics
// Column 3 shows welcome message
```

---

## 🎨 Visual States

### **Column 1: Channels**

**Unselected Channel**
```
┌────────┐
│   #    │  ← Purple background
│        │     White text
└────────┘
```

**Selected Channel**
```
┌────────┐
│   #    │  ← White background
│        │     Purple text
└────────┘
```

**Hover State**
```
┌────────┐
│   #    │  ← Darker purple
│        │     Rounded corners animate
└────────┘
```

---

### **Column 2: Topics**

**No Channel Selected**
```
┌─────────────────────┐
│                     │
│   📂               │
│   Select a channel  │
│   to view topics    │
│                     │
└─────────────────────┘
```

**Channel Selected**
```
┌─────────────────────┐
│ # Channel Name  [⎋] │  ← Header with logout
├─────────────────────┤
│ # general           │  ← Topics list
│ # random            │
│ # dev-team          │
│ [+] Add Topic       │  ← Admin only
└─────────────────────┘
```

**Selected Topic**
```
┌─────────────────────┐
│ # general           │  ← Blue background
│                     │     White text
└─────────────────────┘
```

**Unselected Topic**
```
┌─────────────────────┐
│ # random            │  ← Dark background
│                     │     Gray text
└─────────────────────┘
```

**Topic with Unread**
```
┌─────────────────────┐
│ # announcements  [3]│  ← Red badge
│                     │
└─────────────────────┘
```

---

### **Column 3: Messages**

**No Topic Selected**
```
┌─────────────────────────────┐
│                             │
│         #                   │
│   Welcome to Armada Den     │
│                             │
│   Select a topic to start   │
│                             │
└─────────────────────────────┘
```

**Topic Selected**
```
┌─────────────────────────────┐
│ # general                   │  ← Header
├─────────────────────────────┤
│                             │
│ 👤 User 1 • 2 min ago       │  ← Messages
│ Hello everyone!             │
│ 👍 3  ❤️ 1                  │
│                             │
│ 👤 User 2 • 1 min ago       │
│ Hey there!                  │
│                             │
├─────────────────────────────┤
│ Message #general      [📤]  │  ← Input
└─────────────────────────────┘
```

**Message Hover**
```
┌─────────────────────────────┐
│ 👤 User 1 • 2 min ago       │
│ Hello everyone!             │  [😊 ✏️ 🗑️]  ← Actions
│ 👍 3  ❤️ 1                  │
└─────────────────────────────┘
```

---

## 🎯 Interaction Patterns

### **Click Behaviors**

| Element | Action | Result |
|---------|--------|--------|
| Channel icon | Click | Load topics, clear current topic |
| Topic item | Click | Load messages, connect Socket.IO |
| Message | Hover | Show action buttons |
| Emoji button | Click | Open emoji picker |
| Reaction | Click | Toggle reaction on/off |
| Send button | Click | Send message |
| Input field | Enter key | Send message |

### **Keyboard Shortcuts** (Future)

| Key | Action |
|-----|--------|
| `Cmd/Ctrl + K` | Quick switcher |
| `Cmd/Ctrl + /` | Keyboard shortcuts help |
| `↑` / `↓` | Navigate topics |
| `Enter` | Select topic |
| `Esc` | Close picker/modal |

---

## 🔔 Real-Time Updates

### **New Message Flow**
```
User A sends message
↓
API call to backend
↓
Backend saves to database
↓
Backend emits Socket.IO event
↓
All connected users receive event
↓
Redux state updates
↓
UI re-renders with new message
↓
Auto-scrolls to bottom
```

### **Reaction Flow**
```
User clicks reaction
↓
Optimistic update (shows immediately)
↓
API call to backend
↓
Backend saves/removes reaction
↓
Backend emits Socket.IO event
↓
All users receive event
↓
Redux state updates
↓
UI shows updated reaction count
```

---

## 📊 Data Flow

```
Component Tree:
ChannelsLayout
├── ChannelsList
│   └── Dispatches: setCurrentChannel
│
├── TopicsList
│   └── Dispatches: setCurrentTopic
│
└── TopicView
    ├── Fetches: messages
    ├── Listens: Socket.IO events
    └── MessageList
        └── Dispatches: addReaction, removeReaction
```

```
Redux Store:
{
  channels: {
    channels: [...],
    topics: [...],
    messages: [...],
    currentChannel: Channel | null,
    currentTopic: Topic | null,
    loading: boolean
  }
}
```

---

## ✅ Navigation Checklist

- [x] Can select channel
- [x] Topics load when channel selected
- [x] Can select topic
- [x] Messages load when topic selected
- [x] Can switch between channels
- [x] Topic selection clears when switching channels
- [x] Can switch between topics
- [x] Messages update in real-time
- [x] Reactions work in real-time
- [x] Empty states show correctly
- [x] Loading states show correctly
- [x] Selection states highlight correctly

---

## 🎯 Summary

The navigation follows a clear left-to-right flow:

1. **Channels** (Column 1) → Select workspace area
2. **Topics** (Column 2) → Select conversation
3. **Messages** (Column 3) → View and send messages

Each column depends on the previous selection, creating an intuitive breadcrumb-style navigation that users will find familiar and easy to use.
