# Message Input UI Design Guide

## Overview
The message input has been redesigned to match modern chat applications with a clean, rounded interface and seamless file attachment experience.

## Design Specifications

### Input Container
- **Shape**: Rounded pill (fully rounded corners)
- **Background**: `#F5F5F5` (light gray)
- **Border**: 1px solid `#E5E5E5`
- **Padding**: 8px horizontal, 8px vertical
- **Layout**: Flexbox with icons on left, input in center, send button on right

### Left Icons
**Emoji Button**
- Icon: Smiley face outline
- Size: 20px (w-5 h-5)
- Color: Gray-500, hover Gray-700
- Position: Left side, first icon

**Attachment Button**
- Icon: Paperclip
- Size: 20px (w-5 h-5)
- Color: Gray-500, hover Gray-700
- Shows spinner when uploading
- Position: Left side, second icon

### Text Input
- **Type**: Auto-expanding textarea
- **Background**: Transparent
- **Border**: None
- **Placeholder**: "Type a message...(paste images with Ctrl + V)"
- **Font Size**: 14px (text-sm)
- **Max Height**: 100px
- **Auto-resize**: Grows with content up to max height

### Send Button
- **Shape**: Circle
- **Size**: 32px (w-8 h-8)
- **Background**: Gray-400, hover Gray-500
- **Icon**: Up arrow
- **Disabled State**: Opacity 50% when no content
- **Active State**: Shows spinner when sending

## File Attachment Preview

### Layout
- **Position**: Above input container
- **Spacing**: 8px gap between thumbnails
- **Margin**: 8px bottom margin

### Image Thumbnails
- **Size**: 64x64px (w-16 h-16)
- **Shape**: Rounded (8px border-radius)
- **Border**: 1px solid gray-200
- **Content**: Image preview (object-cover)
- **Remove Button**: 
  - Position: Top-right corner (-4px offset)
  - Size: 20px circle
  - Background: Red-500
  - Icon: X (white, 12px)

### Document Thumbnails
- **Size**: 64x64px (w-16 h-16)
- **Shape**: Rounded (8px border-radius)
- **Border**: 1px solid gray-200
- **Background**: Gray-50
- **Content**: 
  - File type emoji (24px)
  - File extension label (8px text)
- **Remove Button**: Same as image thumbnails

## User Experience Flow

### Attaching Files
1. User clicks paperclip icon
2. File picker opens (supports multiple selection)
3. Files upload immediately (optimistic)
4. Thumbnails appear above input
5. Paperclip icon shows spinner during upload
6. User can continue typing while uploading

### Removing Files
1. Hover over thumbnail
2. Red X button visible at top-right
3. Click X to remove
4. Thumbnail fades out smoothly

### Sending Messages
1. User types message (optional)
2. Send button enabled when:
   - Message has text, OR
   - Files are attached
3. Click send or press Enter
4. Message sent with attachments
5. Input clears, thumbnails disappear
6. Optimistic message appears immediately

## Optimistic UI Behavior

### File Upload
- ✅ Thumbnails show immediately after selection
- ✅ Upload happens in background
- ✅ User can type while uploading
- ✅ Spinner indicates upload in progress
- ✅ No blocking or waiting states

### Message Send
- ✅ Message appears in chat immediately
- ✅ Attachments visible in message
- ✅ Pending indicator (subtle)
- ✅ Failed state with retry option
- ✅ Server response updates message

## Accessibility

- ✅ Keyboard navigation support
- ✅ Enter to send (Shift+Enter for new line)
- ✅ Focus states on all interactive elements
- ✅ ARIA labels on icon buttons
- ✅ Screen reader friendly

## Responsive Behavior

### Desktop (>768px)
- Full width input
- All icons visible
- Thumbnails in horizontal row

### Mobile (<768px)
- Full width input
- Icons may stack if needed
- Thumbnails wrap to multiple rows

## Color Palette

```css
/* Input Container */
background: #F5F5F5
border: #E5E5E5

/* Icons */
default: #6B7280 (gray-500)
hover: #374151 (gray-700)
disabled: opacity-50

/* Send Button */
default: #9CA3AF (gray-400)
hover: #6B7280 (gray-500)
disabled: opacity-50

/* Remove Button */
background: #EF4444 (red-500)
hover: #DC2626 (red-600)

/* Thumbnails */
border: #E5E5E7 (gray-200)
background: #F9FAFB (gray-50)
```

## Animation & Transitions

- **Icon Hover**: 150ms color transition
- **Button Hover**: 150ms background transition
- **Thumbnail Remove**: 200ms fade out
- **Textarea Resize**: Instant (no animation)
- **Spinner**: Continuous rotation

## File Type Support

### Accepted Types
- Images: `image/*`
- Videos: `video/*`
- Documents: `.pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx`

### Display Logic
- **Images**: Show thumbnail preview
- **Videos**: Show file icon + extension
- **Documents**: Show file icon + extension

## Edge Cases

### No Content
- Send button disabled
- Placeholder visible
- No thumbnails

### Only Files (No Text)
- Send button enabled
- Can send files without message
- Thumbnails visible

### Only Text (No Files)
- Send button enabled
- Normal message send
- No thumbnails

### Upload Failure
- Alert shown to user
- File removed from preview
- User can retry

### Large Files
- Backend handles size limits
- Frontend shows upload progress
- Timeout after 30 seconds

## Implementation Notes

### State Management
```typescript
const [messageContent, setMessageContent] = useState('');
const [attachments, setAttachments] = useState<Attachment[]>([]);
const [uploading, setUploading] = useState(false);
const [sending, setSending] = useState(false);
```

### Key Functions
- `handleFileSelect` - Uploads files and adds to state
- `handleRemoveAttachment` - Removes file from state
- `handleSendMessage` - Sends message with attachments
- Auto-resize textarea on input

### Optimistic Updates
1. Add attachments to state immediately
2. Show thumbnails before upload completes
3. Create optimistic message on send
4. Update with server response
5. Handle failures gracefully

## Testing Checklist

- [ ] Click paperclip opens file picker
- [ ] Multiple files can be selected
- [ ] Thumbnails appear immediately
- [ ] Image thumbnails show preview
- [ ] Document thumbnails show icon
- [ ] Remove button works on each thumbnail
- [ ] Can type while uploading
- [ ] Send button disabled when empty
- [ ] Send button enabled with files only
- [ ] Enter key sends message
- [ ] Shift+Enter adds new line
- [ ] Upload spinner shows during upload
- [ ] Send spinner shows during send
- [ ] Optimistic message appears
- [ ] Failed uploads show error
- [ ] Input clears after send
- [ ] Thumbnails clear after send

## Future Enhancements

- [ ] Emoji picker popup
- [ ] Drag & drop file upload
- [ ] Paste images from clipboard
- [ ] Voice message recording
- [ ] GIF picker
- [ ] Sticker support
- [ ] Message formatting toolbar
- [ ] @mention autocomplete integration
- [ ] Link preview generation
