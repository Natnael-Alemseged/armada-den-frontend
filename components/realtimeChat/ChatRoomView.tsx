'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import {
  createChatMessage,
  uploadMedia,
  markMessagesAsRead,
} from '@/lib/features/realTimeChat/realtimeChatThunk';
import { addOptimisticMessage, removeOptimisticMessage } from '@/lib/features/realTimeChat/realtimeChatSlice';
import { socketService } from '@/lib/services/socketService';
import { ChatRoomMessage, ChatMessageType } from '@/lib/types';
import { MessageBubble } from './MessageBubble';
import { Send, Paperclip, Loader2, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ChatRoomView() {
  const dispatch = useAppDispatch();
  const { currentRoom, messages, sendingMessage, uploadingMedia, typingUsers } =
    useAppSelector((state) => state.realtimeChat);
  const { user } = useAppSelector((state) => state.auth);
  
  const [input, setInput] = useState('');
  const [replyTo, setReplyTo] = useState<ChatRoomMessage | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mark messages as read when viewing
  useEffect(() => {
    if (!currentRoom || messages.length === 0) return;

    const unreadMessages = messages
      .filter((m: any) => m.sender_id !== user?.id && !m.read_by?.includes(user?.id || ''))
      .map((m: any) => m.id);

    if (unreadMessages.length > 0) {
      dispatch(
        markMessagesAsRead({
          roomId: currentRoom.id,
          messageIds: unreadMessages,
        })
      );
      socketService.markAsRead(currentRoom.id, unreadMessages);
    }
  }, [currentRoom, messages, user, dispatch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);

    if (!currentRoom) return;

    // Send typing indicator
    if (!isTyping) {
      setIsTyping(true);
      socketService.sendTyping(currentRoom.id, true);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socketService.sendTyping(currentRoom.id, false);
    }, 2000);
  };

  const sendMessage = async (content: string, replyToId?: string) => {
    if (!currentRoom) return;

    // Create optimistic message
    const optimisticMessage: ChatRoomMessage = {
      id: `temp-${Date.now()}`,
      room_id: currentRoom.id,
      sender_id: user?.id || '',
      message_type: 'text',
      content: content,
      media_url: null,
      media_filename: null,
      media_size: null,
      media_mime_type: null,
      reply_to_id: replyToId || null,
      forwarded_from_id: null,
      is_edited: false,
      edited_at: null,
      is_deleted: false,
      deleted_at: null,
      created_at: new Date().toISOString(),
      sender: user || undefined,
      reply_to: replyToId ? messages.find((m: any) => m.id === replyToId) : undefined,
    };

    dispatch(addOptimisticMessage(optimisticMessage));

    // Send message
    try {
      await dispatch(
        createChatMessage({
          room_id: currentRoom.id,
          message_type: 'text',
          content: content,
          reply_to_id: replyToId,
        })
      ).unwrap();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !currentRoom || sendingMessage) return;

    const messageContent = input.trim();
    setInput('');

    // Stop typing indicator
    if (isTyping) {
      setIsTyping(false);
      socketService.sendTyping(currentRoom.id, false);
    }

    await sendMessage(messageContent, replyTo?.id);
    setReplyTo(null);
  };

  const handleRetry = (message: ChatRoomMessage) => {
    // Remove the failed message
    dispatch(removeOptimisticMessage(message.id));
    // Resend the message
    sendMessage(message.content, message.reply_to_id || undefined);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentRoom) return;

    try {
      // Upload media
      const mediaData = await dispatch(uploadMedia({ file })).unwrap();

      // Determine message type based on MIME type
      let messageType: ChatMessageType = 'file';
      if (mediaData.mime_type.startsWith('image/')) {
        messageType = 'image';
      } else if (mediaData.mime_type.startsWith('video/')) {
        messageType = 'video';
      } else if (mediaData.mime_type.startsWith('audio/')) {
        messageType = 'audio';
      }

      // Send message with media
      await dispatch(
        createChatMessage({
          room_id: currentRoom.id,
          message_type: messageType,
          content: file.name,
          media_url: mediaData.url,
          media_filename: mediaData.filename,
          media_size: mediaData.size,
          media_mime_type: mediaData.mime_type,
        })
      ).unwrap();

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Failed to upload media:', error);
    }
  };

  const getRoomName = () => {
    if (!currentRoom) return '';
    if (currentRoom.room_type === 'GROUP') {
      return currentRoom.name || 'Unnamed Group';
    }
    const otherMember = currentRoom.members?.find((m: any) => m.user_id !== user?.id);
    return otherMember?.user?.email || 'Unknown User';
  };

  const getTypingText = () => {
    if (!currentRoom) return '';
    const typingUserIds = typingUsers[currentRoom.id] || [];
    const typingUsersList = typingUserIds.filter((id: any) => id !== user?.id);
    
    if (typingUsersList.length === 0) return '';
    if (typingUsersList.length === 1) return 'Someone is typing...';
    return `${typingUsersList.length} people are typing...`;
  };

  if (!currentRoom) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-3">
          {currentRoom.avatar_url ? (
            <img
              src={currentRoom.avatar_url}
              alt={getRoomName()}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
          )}
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">
              {getRoomName()}
            </h2>
            {currentRoom.room_type === 'GROUP' && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {currentRoom.members?.length || 0} members
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <p className="text-sm">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((message: any) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.sender_id === user?.id}
                onReply={() => setReplyTo(message)}
                onRetry={message.status === 'failed' ? () => handleRetry(message) : undefined}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Typing Indicator */}
      {getTypingText() && (
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            {getTypingText()}
          </p>
        </div>
      )}

      {/* Reply Preview */}
      {replyTo && (
        <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-800 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
              Replying to {replyTo.sender?.email || 'Unknown'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {replyTo.content}
            </p>
          </div>
          <button
            onClick={() => setReplyTo(null)}
            className="ml-2 p-1 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded"
          >
            <span className="text-blue-600 dark:text-blue-400">✕</span>
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingMedia}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {uploadingMedia ? (
              <Loader2 className="w-5 h-5 animate-spin text-gray-600 dark:text-gray-400" />
            ) : (
              <Paperclip className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>

          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Type a message..."
            disabled={sendingMessage}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={sendingMessage || !input.trim()}
            className={cn(
              'p-2 rounded-lg transition-colors',
              input.trim()
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
            )}
          >
            {sendingMessage ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
