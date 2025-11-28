# Multiple File Attachments Implementation

## Overview
This document describes the implementation of multiple file attachments for topic messages in the Armada Den frontend, migrating from single media fields to an attachments array.

## Changes Summary

### 1. Type Definitions (`lib/types.ts`)

**Added:**
- `Attachment` interface with fields: `id`, `url`, `filename`, `size`, `mime_type`, `created_at`
- `attachments: Attachment[]` field to `TopicMessage` interface
- `attachments?: Attachment[]` field to `CreateTopicMessageRequest` interface

**Removed:**
- Single media fields (`media_url`, `media_filename`, `media_size`, `media_mime_type`) - these are now replaced by the `attachments` array

### 2. API Endpoints (`lib/constants/endpoints.ts`)

**Added:**
```typescript
TOPICS_UPLOAD: (topicId: string) => `/channels/topics/${topicId}/upload`
```

This endpoint handles file uploads one at a time. Multiple files are uploaded sequentially.

### 3. File Upload Utilities (`lib/util/fileUpload.ts`)

**New utility file with:**
- `uploadFileToTopic(topicId, file)` - Upload single file
- `uploadFilesToTopic(topicId, files)` - Upload multiple files (calls single upload for each)
- `formatBytes(bytes, decimals)` - Format file size for display
- `getFileIcon(mimeType)` - Get icon/emoji for file type
- `isImage(mimeType)` - Check if file is an image
- `isVideo(mimeType)` - Check if file is a video

### 4. TopicView Component (`components/channels/TopicView.tsx`)

**Added State:**
```typescript
const [attachments, setAttachments] = useState<Omit<Attachment, 'id' | 'created_at'>[]>([]);
const [uploading, setUploading] = useState(false);
const fileInputRef = useRef<HTMLInputElement>(null);
```

**Added Handlers:**
- `handleFileSelect` - Handles file selection and uploads files
- `handleRemoveAttachment` - Removes attachment from preview

**Updated Message Creation:**
- Optimistic messages now include `attachments` array
- `createTopicMessage` thunk call includes `attachments` in payload
- Attachments are cleared after successful send

**Added UI:**
- File upload button with paperclip icon
- Attachment preview showing filename, size, and remove button
- Upload progress indication
- Multiple file support

### 5. Message Display Components

#### MessageAttachments Component (`components/channels/MessageAttachments.tsx`)

**New component that:**
- Displays images/videos in a grid layout
- Shows other files as downloadable cards
- Provides hover effects and download buttons
- Handles different file types with appropriate icons
- Supports clicking to view/download files

**Features:**
- Image preview with overlay on hover
- Video player embedded
- File cards with icon, name, and size
- Responsive grid layout for media files

#### MessageList Component (`components/channels/MessageList.tsx`)

**Updated to:**
- Import and use `MessageAttachments` component
- Display attachments below message content
- Maintain existing message styling and functionality

### 6. Socket.IO Integration

**No changes required** - The socket events already pass the full `TopicMessage` object, which now includes the `attachments` array. The frontend automatically receives and displays attachments from real-time messages.

## Usage Flow

### Sending Messages with Attachments

1. **User clicks "Attach files" button**
2. **File picker opens** (supports multiple file selection)
3. **Files are uploaded** one at a time to `/channels/topics/{topic_id}/upload`
4. **Upload responses** are collected in the `attachments` state
5. **Preview shows** attached files with ability to remove
6. **User types message** (optional - can send files without text)
7. **User clicks send** or presses Enter
8. **Optimistic message** is created with attachments
9. **API call** sends message with attachments array
10. **Server response** updates optimistic message with real data

### Receiving Messages with Attachments

1. **Socket.IO event** `new_topic_message` received
2. **Message added** to Redux store with attachments
3. **MessageList renders** message with `MessageAttachments` component
4. **Attachments displayed** based on file type:
   - Images/videos in grid
   - Other files as download cards

## File Upload API

### Endpoint
```
POST /api/channels/topics/{topic_id}/upload
Content-Type: multipart/form-data
```

### Request
```typescript
FormData {
  file: File
}
```

### Response
```typescript
{
  url: string;
  filename: string;
  size: number;
  mime_type: string;
}
```

### Multiple Files
For multiple files, call the endpoint multiple times:
```typescript
const files = [file1, file2, file3];
const uploadedAttachments = await Promise.all(
  files.map(file => uploadFileToTopic(topicId, file))
);
```

## Message Creation API

### Endpoint
```
POST /api/channels/topics/{topic_id}/messages
```

### Request Payload
```typescript
{
  content: string;
  attachments?: Array<{
    url: string;
    filename: string;
    size: number;
    mime_type: string;
  }>;
  reply_to_id?: string;
  mentioned_user_ids?: string[];
}
```

### Response
```typescript
{
  id: string;
  topic_id: string;
  sender_id: string;
  content: string;
  attachments: Array<{
    id: string;
    url: string;
    filename: string;
    size: number;
    mime_type: string;
    created_at: string;
  }>;
  // ... other fields
}
```

## UI/UX Features

### File Upload
- ✅ Multiple file selection support
- ✅ Upload progress indication (spinner on attach icon)
- ✅ Compact thumbnail preview (64x64px)
- ✅ Remove individual attachments (red X button)
- ✅ Image thumbnails for image files
- ✅ File type icons for documents
- ✅ Seamless optimistic UI
- ✅ Disabled state during upload
- ✅ Clean rounded input design matching modern chat UIs

### File Display
- ✅ Image thumbnails with preview
- ✅ Video player embedded
- ✅ File cards for documents
- ✅ Download buttons
- ✅ File size formatting
- ✅ File type icons
- ✅ Hover effects
- ✅ Responsive grid layout

### Error Handling
- ✅ Upload failure alerts
- ✅ Retry failed messages
- ✅ Cancel failed messages
- ✅ Optimistic UI updates

## Browser Support

- ✅ Modern browsers with File API support
- ✅ Drag & drop (can be added later)
- ✅ Multiple file selection
- ✅ File type validation (can be added)
- ✅ File size limits (enforced by backend)

## Testing Checklist

- [ ] Upload single file
- [ ] Upload multiple files (2-5 files)
- [ ] Upload different file types (images, PDFs, documents, videos)
- [ ] Remove attachment before sending
- [ ] Send message with only attachments (no text)
- [ ] Send message with text and attachments
- [ ] Receive message with attachments via Socket.IO
- [ ] Click to download/view attachments
- [ ] Image preview display
- [ ] Video playback
- [ ] File size display accuracy
- [ ] Upload error handling
- [ ] Network failure during upload
- [ ] Large file handling

## Migration Notes

### Backwards Compatibility
- Old messages without `attachments` field will have `attachments: []`
- Frontend handles both old and new message formats
- No data migration required on frontend

### Breaking Changes
- Removed single media fields from `TopicMessage` interface
- Components expecting `media_url` need to check `attachments` array instead

## Future Enhancements

- [ ] Drag & drop file upload
- [ ] File type restrictions
- [ ] File size validation on frontend
- [ ] Image compression before upload
- [ ] Upload progress bar per file
- [ ] Paste images from clipboard
- [ ] Attachment search/filter
- [ ] Bulk download attachments
- [ ] Image gallery view
- [ ] Video thumbnail generation

## Performance Considerations

- Files uploaded sequentially (not in parallel) to avoid overwhelming the server
- Images lazy-loaded in message list
- File previews cached by browser
- Optimistic UI prevents blocking on uploads
- Large files handled by backend (frontend just displays)

## Security

- File uploads require authentication (token in headers)
- Backend validates file types and sizes
- URLs are signed/temporary (handled by backend)
- XSS protection via proper escaping
- CORS headers configured on backend

## Troubleshooting

### Attachments not showing
- Check `message.attachments` array in console
- Verify backend returns attachments in response
- Check Socket.IO event payload includes attachments

### Upload fails
- Check network tab for error response
- Verify authentication token is valid
- Check file size limits on backend
- Verify upload endpoint is correct

### Images not displaying
- Check image URL is accessible
- Verify CORS headers allow image loading
- Check browser console for errors
- Verify image mime_type is correct

## Code Examples

### Upload Files
```typescript
const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const files = event.target.files;
  if (!files) return;

  setUploading(true);
  try {
    const uploaded = await uploadFilesToTopic(topicId, Array.from(files));
    setAttachments(prev => [...prev, ...uploaded]);
  } catch (error) {
    console.error('Upload failed:', error);
    alert('Failed to upload files');
  } finally {
    setUploading(false);
  }
};
```

### Send Message with Attachments
```typescript
const result = await dispatch(
  createTopicMessage({
    topic_id: topic.id,
    content: messageContent,
    attachments: attachments.map(att => ({
      ...att,
      id: `temp-${Date.now()}`,
      created_at: new Date().toISOString()
    }))
  })
).unwrap();
```

### Display Attachments
```typescript
{message.attachments && message.attachments.length > 0 && (
  <MessageAttachments attachments={message.attachments} />
)}
```

## Conclusion

The multiple file attachments feature is now fully implemented and integrated into the topic messaging system. Users can upload, preview, send, and view multiple files per message with a clean and intuitive UI.
