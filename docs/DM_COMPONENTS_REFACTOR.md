# Direct Messaging Components Refactoring Plan

## Overview
The DMMessageThread component needs to be refactored to match the functionality and appearance of TopicView, using shared components where possible.

## Shared Components to Use

### 1. MessageContent (`@/components/channels/MessageContent`)
- Renders markdown content
- Handles code blocks, links, formatting
- **Usage**: Replace plain text rendering with `<MessageContent content={message.content} />`

### 2. MessageAttachments (`@/components/channels/MessageAttachments`)
- Displays file attachments with icons
- Handles images, PDFs, documents
- **Usage**: `<MessageAttachments attachments={message.attachments} />`

### 3. InlineMentionInput (`@/components/channels/InlineMentionInput`)
- Textarea with @mention support
- Auto-resizing
- **Note**: For DMs, pass empty users array since mentions aren't needed
- **Alternative**: Use regular textarea for DMs

### 4. OnlineIndicator (`@/components/ui/OnlineIndicator`)
- Shows online/offline status
- **Usage**: `<OnlineIndicator isOnline={user.is_online} size="sm" />`

## Features to Implement in DMMessageThread

### ✅ Already Implemented
- Basic message display
- Send messages
- Edit/delete own messages
- Reactions (emoji picker)
- Reply to messages
- Typing indicators (UI ready)
- WebSocket integration

### 🔄 Needs Enhancement

#### 1. File Upload Support
**Current**: Basic structure exists
**Needed**:
```typescript
// File selection
const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(e.target.files || []);
  setSelectedFiles(files);
  // Generate previews for images
};

// Upload files (need DM-specific upload endpoint)
const handleUploadFiles = async () => {
  const uploadedAttachments = await uploadFilesToDM(selectedFiles, conversationId);
  setAttachments(prev => [...prev, ...uploadedAttachments]);
};
```

#### 2. Markdown Rendering
**Replace**:
```tsx
<p className="text-sm whitespace-pre-wrap">{message.content}</p>
```

**With**:
```tsx
<MessageContent content={message.content} />
```

#### 3. Better Attachment Display
**Replace**: Custom attachment rendering

**With**:
```tsx
{message.attachments && message.attachments.length > 0 && (
  <MessageAttachments attachments={message.attachments} />
)}
```

#### 4. Emoji Picker Integration
**Current**: Basic emoji picker
**Enhancement**: Match TopicView's emoji picker positioning and UX
- Position relative to message
- Close on outside click
- Common emoji shortcuts

#### 5. Message Actions Menu
**Current**: Inline buttons on hover
**Enhancement**: Match TopicView's dropdown menu
- Edit, Delete, Reply options
- Better mobile support
- Consistent with TopicView

## Implementation Steps

### Step 1: Create DMMessageList Component
Similar to MessageList but for DMs:

```tsx
// components/directMessages/DMMessageList.tsx
export function DMMessageList({ messages, currentUserId, otherUser }) {
  // Render messages with:
  // - MessageContent for markdown
  // - MessageAttachments for files
  // - Reactions display
  // - Edit/delete actions
  // - OnlineIndicator for other user
}
```

### Step 2: Update DMMessageThread
```tsx
// components/directMessages/DMMessageThread.tsx
export function DMMessageThread() {
  return (
    <div className="flex-1 flex flex-col">
      {/* Header with user info */}
      <DMHeader user={currentConversation.user} />
      
      {/* Messages */}
      <DMMessageList 
        messages={messages}
        currentUserId={user.id}
        otherUser={currentConversation.user}
      />
      
      {/* Input area with file upload, emoji picker */}
      <DMInput 
        onSend={handleSend}
        onFileUpload={handleFileUpload}
      />
    </div>
  );
}
```

### Step 3: File Upload Utility
Create DM-specific file upload:

```typescript
// lib/util/dmFileUpload.ts
export async function uploadFilesToDM(
  files: File[],
  conversationId: string
): Promise<Omit<Attachment, 'id' | 'created_at'>[]> {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));
  
  const response = await ApiService.post(
    `/direct-messages/upload/${conversationId}`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  
  return response.data.attachments;
}
```

## Component Structure Comparison

### TopicView Structure
```
TopicView
├── Header (topic info, settings)
├── MessageList (shared component)
│   ├── MessageContent (markdown)
│   ├── MessageAttachments (files)
│   ├── Reactions
│   └── Actions (edit, delete, reply)
└── Input Area
    ├── File upload
    ├── Emoji picker
    ├── InlineMentionInput
    └── Send button
```

### DMMessageThread Structure (Target)
```
DMMessageThread
├── Header (user info, online status)
├── DMMessageList (DM-specific)
│   ├── MessageContent (markdown) ← shared
│   ├── MessageAttachments (files) ← shared
│   ├── Reactions
│   └── Actions (edit, delete, reply)
└── Input Area
    ├── File upload
    ├── Emoji picker
    ├── Textarea (simpler than mentions)
    └── Send button
```

## Key Differences from TopicView

1. **No Mentions**: DMs are 1-on-1, no need for @mentions
2. **Simpler Header**: Just user info, no topic settings
3. **Read Receipts**: Show when other user has read messages
4. **Online Status**: Prominent display of other user's online status
5. **Typing Indicators**: Show when other user is typing

## Files to Modify

1. ✅ `components/directMessages/DMMessageList.tsx` - Created
2. ⚠️ `components/directMessages/DMMessageThread.tsx` - Needs recreation with fixes
3. 📝 `lib/util/dmFileUpload.ts` - To be created
4. 📝 `components/directMessages/DMInput.tsx` - Optional: Extract input area

## Testing Checklist

- [ ] Messages display with markdown formatting
- [ ] File attachments show correctly
- [ ] Emoji reactions work
- [ ] Edit/delete own messages
- [ ] Reply to messages
- [ ] File upload works
- [ ] Typing indicators appear
- [ ] Read receipts update
- [ ] Online status shows correctly
- [ ] WebSocket real-time updates work

## Next Actions

1. **Fix DMMessageThread.tsx** - The file keeps getting emptied, needs stable recreation
2. **Create file upload utility** for DMs
3. **Test all features** against TopicView for consistency
4. **Add missing features** (if any) from TopicView

---

**Note**: The DMMessageThread.tsx file has been experiencing issues with edits. It should be recreated manually or with a fresh approach to ensure stability.
