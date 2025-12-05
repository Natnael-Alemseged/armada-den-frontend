'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
  fetchDMMessages,
  sendDM,
} from '@/lib/features/directMessages/directMessagesThunk';
import { 
  addIncomingMessage,
  addOptimisticMessage,
  updateOptimisticMessage,
  markMessageAsFailed,
  removeOptimisticMessage,
} from '@/lib/slices/directMessagesSlice';
import { DirectMessage, Attachment } from '@/lib/types';
import { Send, Loader2, Paperclip, X, MessageSquare, Smile } from 'lucide-react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { formatBytes, getFileIcon } from '@/lib/util/fileUpload';
import { socketService } from '@/lib/services/socketService';
import { DMMessageList } from './DMMessageList';

export default function DMMessageThread() {
  const dispatch = useAppDispatch();
  const { currentConversation, messages, messagesLoading } = useAppSelector(
    (state) => state.directMessages
  );
  const { user, token } = useAppSelector((state) => state.auth);
  const [messageContent, setMessageContent] = useState('');
  const [sending, setSending] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState<DirectMessage | null>(null);
  const [attachments, setAttachments] = useState<Omit<Attachment, 'id' | 'created_at'>[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<{ file: File; preview: string }[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const caretPositionRef = useRef<{ start: number; end: number }>({ start: 0, end: 0 });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef(messages.length);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (currentConversation) {
      dispatch(fetchDMMessages({ userId: currentConversation.user.id, page: 1, pageSize: 50 }));
      
      // Join DM room via WebSocket
      if (socketService.isConnected()) {
        socketService.joinDM(currentConversation.user.id);
      }
    }

    return () => {
      // Leave DM room when conversation changes
      if (currentConversation && socketService.isConnected()) {
        socketService.leaveDM(currentConversation.user.id);
      }
    };
  }, [currentConversation, dispatch]);

  // WebSocket integration
  useEffect(() => {
    if (!currentConversation || !token) return;

    // Connect socket if not connected
    if (!socketService.isConnected()) {
      socketService.connect(token).catch((err) => {
        console.error('Failed to connect socket:', err);
      });
    }

    // Listen for new DM messages
    const handleNewMessage = (data: any) => {
      if (data.message.sender_id === currentConversation.user.id || 
          data.message.receiver_id === currentConversation.user.id) {
        dispatch(addIncomingMessage(data.message));
      }
    };

    // Listen for message edits
    const handleMessageEdited = (data: any) => {
      // Update will be handled via Redux
    };

    // Listen for message deletes
    const handleMessageDeleted = (data: any) => {
      // Delete will be handled via Redux
    };

    // Listen for typing indicators
    const handleTyping = (data: any) => {
      if (data.user_id === currentConversation.user.id) {
        if (data.is_typing) {
          setTypingUsers((prev) => [...new Set([...prev, data.user_id])]);
        } else {
          setTypingUsers((prev) => prev.filter((id) => id !== data.user_id));
        }
      }
    };

    socketService.onDMNewMessage(handleNewMessage);
    socketService.onDMMessageEdited(handleMessageEdited);
    socketService.onDMMessageDeleted(handleMessageDeleted);
    socketService.onDMTyping(handleTyping);

    return () => {
      socketService.offDMNewMessage(handleNewMessage);
      socketService.offDMMessageEdited(handleMessageEdited);
      socketService.offDMMessageDeleted(handleMessageDeleted);
      socketService.offDMTyping(handleTyping);
    };
  }, [currentConversation, token]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messages.length > prevMessageCountRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevMessageCountRef.current = messages.length;
  }, [messages]);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setSelectedFiles(files);

    // Create previews for images
    const previews: { file: File; preview: string }[] = [];
    files.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          previews.push({ file, preview: reader.result as string });
          if (previews.length === files.filter((f) => f.type.startsWith('image/')).length) {
            setFilePreviews(previews);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  // Handle file upload
  const handleUploadFiles = async () => {
    if (selectedFiles.length === 0 || !currentConversation) return;

    setUploading(true);
    try {
      // TODO: Create DM-specific file upload endpoint
      // For now, create attachment objects from files
      const uploadedAttachments = selectedFiles.map(file => ({
        url: URL.createObjectURL(file),
        filename: file.name,
        size: file.size,
        mime_type: file.type
      }));
      
      setAttachments((prev) => [...prev, ...uploadedAttachments]);
      setSelectedFiles([]);
      setFilePreviews([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Failed to upload files:', error);
    } finally {
      setUploading(false);
    }
  };

  // Remove file before upload
  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Remove uploaded attachment
  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle emoji selection
  const handleEmojiClick = (emojiData: EmojiClickData) => {
    const emoji = emojiData.emoji;
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = caretPositionRef.current.start;
    const end = caretPositionRef.current.end;
    const newText = messageContent.slice(0, start) + emoji + messageContent.slice(end);
    
    setMessageContent(newText);
    setShowEmojiPicker(false);
    
    // Focus back and set cursor position
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + emoji.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  // Track caret position and send typing indicator
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessageContent(value);
    
    const textarea = textareaRef.current;
    if (textarea) {
      caretPositionRef.current = {
        start: textarea.selectionStart,
        end: textarea.selectionEnd,
      };
    }

    // Send typing indicator
    if (currentConversation && socketService.isConnected()) {
      socketService.sendDMTyping(currentConversation.user.id, value.length > 0);
    }
  };

  // Handle send message
  const handleSendMessage = async () => {
    if ((!messageContent.trim() && attachments.length === 0) || !currentConversation || sending) return;

    const content = messageContent.trim();
    const tempId = `temp-${Date.now()}-${Math.random()}`;

    // Create optimistic message
    const optimisticMessage: DirectMessage = {
      id: tempId,
      sender_id: user!.id,
      receiver_id: currentConversation.user.id,
      content: content,
      reply_to_id: replyToMessage?.id || null,
      is_read: false,
      read_at: null,
      is_edited: false,
      edited_at: null,
      is_deleted: false,
      deleted_at: null,
      created_at: new Date().toISOString(),
      attachments: attachments.map(att => ({
        ...att,
        id: `temp-${Date.now()}`,
        created_at: new Date().toISOString(),
      })),
      reactions: [],
      sender_email: user!.email,
      sender_full_name: user!.full_name || null,
      receiver_email: currentConversation.user.email,
      receiver_full_name: currentConversation.user.full_name || null,
      _optimistic: true,
      _pending: true,
      _failed: false,
      _tempId: tempId,
    };

    // Add optimistic message immediately and clear input
    dispatch(addOptimisticMessage(optimisticMessage));
    setMessageContent('');
    setReplyToMessage(null);
    setAttachments([]);
    textareaRef.current?.focus();

    // Stop typing indicator
    if (socketService.isConnected()) {
      socketService.sendDMTyping(currentConversation.user.id, false);
    }

    // Send to server in background
    setSending(true);
    try {
      const result = await dispatch(sendDM({
        receiver_id: currentConversation.user.id,
        content: content,
        reply_to_id: replyToMessage?.id,
        attachments: attachments.length > 0 ? attachments : undefined,
      })).unwrap();

      // Replace optimistic message with real message from server
      dispatch(updateOptimisticMessage({ tempId, message: result }));
    } catch (error) {
      console.error('Failed to send message:', error);
      // Mark message as failed
      dispatch(markMessageAsFailed(tempId));
    } finally {
      setSending(false);
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showEmojiPicker &&
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node) &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

  if (!currentConversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
        <MessageSquare className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Conversation Selected</h3>
        <p className="text-sm text-gray-500">Select a conversation to start messaging</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white min-w-0">
      {/* Header */}
      <div className="h-14 border-b border-gray-200 flex items-center px-5 gap-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
            {(currentConversation.user.full_name || currentConversation.user.email)[0].toUpperCase()}
          </div>
          {currentConversation.user.is_online && (
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
          )}
        </div>
        
        {/* Name and Status */}
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold text-gray-900 truncate">
            {currentConversation.user.full_name || currentConversation.user.email}
          </h2>
          <p className="text-xs text-gray-500 truncate">
            {currentConversation.user.is_online 
              ? 'Online' 
              : currentConversation.user.last_seen_at 
                ? `Last seen ${new Date(currentConversation.user.last_seen_at).toLocaleString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    hour: 'numeric', 
                    minute: '2-digit' 
                  })}` 
                : 'Offline'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 custom-scrollbar">
        {messagesLoading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-600">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p className="text-sm">No messages yet. Start the conversation!</p>
            </div>
          </div>
        ) : (
          <DMMessageList 
            messages={messages}
            currentUserId={user?.id || ''}
            otherUser={currentConversation.user}
          />
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <div className="px-4 py-2 text-sm text-gray-500 italic">
          {currentConversation.user.full_name || currentConversation.user.email} is typing...
        </div>
      )}

      {/* Reply Preview */}
      {replyToMessage && (
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs text-gray-500">Replying to:</p>
            <p className="text-sm text-gray-700 truncate">{replyToMessage.content}</p>
          </div>
          <button
            onClick={() => setReplyToMessage(null)}
            className="p-1 hover:bg-gray-200 rounded"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      )}

      {/* File Previews */}
      {selectedFiles.length > 0 && (
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {selectedFiles.map((file, index) => {
              const preview = filePreviews.find((p) => p.file === file);
              return (
                <div key={index} className="relative group">
                  {preview ? (
                    <img
                      src={preview.preview}
                      alt={file.name}
                      className="w-20 h-20 object-cover rounded border border-gray-300"
                    />
                  ) : (
                    <div className="w-20 h-20 flex flex-col items-center justify-center bg-gray-100 rounded border border-gray-300">
                      {getFileIcon(file.type)}
                      <span className="text-xs text-gray-600 mt-1 truncate max-w-full px-1">
                        {file.name.split('.').pop()?.toUpperCase()}
                      </span>
                    </div>
                  )}
                  <button
                    onClick={() => handleRemoveFile(index)}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <div className="text-xs text-gray-600 mt-1 text-center truncate max-w-20">
                    {formatBytes(file.size)}
                  </div>
                </div>
              );
            })}
          </div>
          <button
            onClick={handleUploadFiles}
            disabled={uploading}
            className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload Files'}
          </button>
        </div>
      )}

      {/* Uploaded Attachments */}
      {attachments.length > 0 && (
        <div className="px-4 py-2 bg-blue-50 border-t border-blue-200">
          <p className="text-xs text-blue-700 mb-2">Attachments:</p>
          <div className="flex flex-wrap gap-2">
            {attachments.map((attachment, index) => (
              <div key={index} className="flex items-center gap-2 bg-white px-2 py-1 rounded border border-blue-300">
                <span className="text-xs text-gray-700 truncate max-w-32">{attachment.filename}</span>
                <button
                  onClick={() => handleRemoveAttachment(index)}
                  className="p-0.5 hover:bg-gray-200 rounded"
                >
                  <X className="w-3 h-3 text-gray-500" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-gray-200 px-5 py-3">
        {/* Input Container */}
        <div className="relative flex items-center gap-2 bg-[#F5F5F5] rounded-full px-4 py-2 border border-gray-200">
          {/* Left Icons */}
          <div className="flex items-center gap-2 relative">
            {/* Emoji Button */}
            <button
              type="button"
              ref={emojiButtonRef}
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              title="Add emoji"
            >
              <Smile className="w-5 h-5" />
            </button>

            {showEmojiPicker && (
              <div
                ref={emojiPickerRef}
                className="absolute bottom-full mb-2 left-0 z-50 shadow-lg"
              >
                <EmojiPicker onEmojiClick={handleEmojiClick} autoFocusSearch={false} />
              </div>
            )}

            {/* File Attachment Button */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              title="Attach files"
            >
              <Paperclip className="w-5 h-5" />
            </button>
          </div>

          {/* Text Input */}
          <textarea
            ref={textareaRef}
            value={messageContent}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1 bg-transparent border-none outline-none resize-none text-sm text-gray-900 placeholder-gray-500 max-h-32"
            rows={1}
          />

          {/* Send Button */}
          <button
            type="button"
            onClick={handleSendMessage}
            disabled={(!messageContent.trim() && attachments.length === 0) || sending}
            className="flex-shrink-0 w-8 h-8 bg-gray-400 text-white rounded-full flex items-center justify-center hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
