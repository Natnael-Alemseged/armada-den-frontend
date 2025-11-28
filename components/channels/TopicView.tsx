'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
  fetchTopicMessages,
  createTopicMessage,
} from '@/lib/features/channels/channelsThunk';
import { fetchUsers } from '@/lib/features/realTimeChat/realtimeChatThunk';
import {
  addMessage,
  addOptimisticMessage,
  updateOptimisticMessage,
  markMessageAsFailed,
  removeOptimisticMessage,
  updateMessageInState,
  deleteMessageInState,
  addReactionToMessage,
  removeReactionFromMessage,
  OptimisticMessage,
} from '@/lib/features/channels/channelsSlice';
import { Topic, Attachment } from '@/lib/types';
import { Hash, Loader2, Settings, Paperclip, X } from 'lucide-react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { uploadFilesToTopic, formatBytes, getFileIcon } from '@/lib/util/fileUpload';
import { MessageList } from './MessageList';
import { MentionInput } from './MentionInput';
import { socketService } from '@/lib/services/socketService';
import { ManageTopicModal } from './ManageTopicModal';

interface TopicViewProps {
  topic: Topic;
}

export function TopicView({ topic }: TopicViewProps) {
  const dispatch = useAppDispatch();
  const { messages, messagesLoading } = useAppSelector((state) => state.channels);
  const { user, token } = useAppSelector((state) => state.auth);
  const { users } = useAppSelector((state) => state.realtimeChat);
  const [messageContent, setMessageContent] = useState('');
  const [sending, setSending] = useState(false);
  const [aiTyping, setAiTyping] = useState(false);
  const [aiTypingName, setAiTypingName] = useState('AI');
  const [showManageModal, setShowManageModal] = useState(false);
  const [attachments, setAttachments] = useState<Omit<Attachment, 'id' | 'created_at'>[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const caretPositionRef = useRef<{ start: number; end: number }>({ start: 0, end: 0 });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef(messages.length);

  useEffect(() => {
    if (topic) {
      dispatch(fetchTopicMessages({ topicId: topic.id }));
      
      // Mark topic as read when viewing it
      if (socketService.isConnected()) {
        socketService.markTopicAsRead(topic.id);
      }
    }
  }, [topic, dispatch]);

  useEffect(() => {
    // Fetch users for mentions
    if (users.length === 0) {
      dispatch(fetchUsers({ page: 1, pageSize: 100 }));
    }
  }, [users.length, dispatch]);

  // Socket.IO integration
  useEffect(() => {
    if (!topic || !token) return;

    // Connect socket if not connected
    if (!socketService.isConnected()) {
      socketService.connect(token).catch((err) => {
        console.error('Failed to connect socket:', err);
      });
    }

    // Join topic room
    socketService.joinTopic(topic.id);

    // Listen for new messages
    const handleNewMessage = (data: any) => {
      if (data.topic_id === topic.id) {
        // Don't add messages from current user (already added optimistically)
        // Only add messages from other users or AI bots
        if (data.message.sender_id !== user?.id) {
          dispatch(addMessage(data.message));
        }
      }
    };

    // Listen for message edits
    const handleMessageEdited = (data: any) => {
      if (data.topic_id === topic.id) {
        dispatch(
          updateMessageInState({
            messageId: data.message_id,
            content: data.content,
            editedAt: data.edited_at || new Date().toISOString(),
          })
        );
      }
    };

    // Listen for message deletes
    const handleMessageDeleted = (data: any) => {
      if (data.topic_id === topic.id) {
        dispatch(
          deleteMessageInState({
            messageId: data.message_id,
            deletedAt: data.deleted_at || new Date().toISOString(),
          })
        );
      }
    };

    // Listen for typing indicators
    const handleTyping = (data: any) => {
      if (data.topic_id === topic.id && data.user_type === 'ai') {
        setAiTyping(data.is_typing);
        if (data.is_typing) {
          // Extract bot name from user_type or use default
          const botName = data.bot_name || 'AI Assistant';
          setAiTypingName(botName);
        }
      }
    };

    // Listen for AI errors
    const handleAiError = (data: any) => {
      if (data.topic_id === topic.id) {
        console.error('AI Error:', data.error);
        // You can add a toast notification here if you have a toast library
        // toast.error(data.error);
      }
    };

    // Listen for reactions
    const handleReactionAdded = (data: any) => {
      if (data.topic_id === topic.id) {
        dispatch(
          addReactionToMessage({
            messageId: data.message_id,
            reaction: {
              id: `${data.user_id}-${data.emoji}`,
              message_id: data.message_id,
              user_id: data.user_id,
              emoji: data.emoji,
              created_at: new Date().toISOString(),
            },
            currentUserId: user?.id,
          })
        );
      }
    };

    const handleReactionRemoved = (data: any) => {
      if (data.topic_id === topic.id) {
        dispatch(
          removeReactionFromMessage({
            messageId: data.message_id,
            userId: data.user_id,
            emoji: data.emoji,
            currentUserId: user?.id,
          })
        );
      }
    };

    // Register event listeners
    socketService.onNewTopicMessage(handleNewMessage);
    socketService.onTopicMessageEdited(handleMessageEdited);
    socketService.onTopicMessageDeleted(handleMessageDeleted);
    socketService.onTyping(handleTyping);
    socketService.onAiError(handleAiError);
    socketService.onReactionAdded(handleReactionAdded);
    socketService.onReactionRemoved(handleReactionRemoved);

    // Cleanup
    return () => {
      socketService.leaveTopic(topic.id);
      socketService.offNewTopicMessage(handleNewMessage);
      socketService.offTopicMessageEdited(handleMessageEdited);
      socketService.offTopicMessageDeleted(handleMessageDeleted);
      socketService.offTyping(handleTyping);
      socketService.offAiError(handleAiError);
      socketService.offReactionAdded(handleReactionAdded);
      socketService.offReactionRemoved(handleReactionRemoved);
    };
  }, [topic, token, dispatch, user?.id]);

  useEffect(() => {
    // Only scroll to bottom when new messages are added, not when reactions change
    if (messages.length > prevMessageCountRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevMessageCountRef.current = messages.length;
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!messageContent.trim() || !user) return;

    const content = messageContent.trim();
    const tempId = `temp-${Date.now()}-${Math.random()}`;

    // Create optimistic message
    const optimisticMessage: OptimisticMessage = {
      id: tempId,
      topic_id: topic.id,
      sender_id: user.id,
      content: content,
      reply_to_id: null,
      is_edited: false,
      edited_at: null,
      is_deleted: false,
      deleted_at: null,
      created_at: new Date().toISOString(),
      sender_email: user.email,
      sender_full_name: user.full_name || null,
      mention_count: 0,
      reaction_count: 0,
      reactions: [],
      attachments: attachments.map(att => ({
        ...att,
        id: `temp-${Date.now()}`,
        created_at: new Date().toISOString()
      })),
      _optimistic: true,
      _pending: true,
      _failed: false,
      _tempId: tempId,
    };

    // Add optimistic message immediately
    dispatch(addOptimisticMessage(optimisticMessage));
    setMessageContent('');
    setAttachments([]);
    setSending(false);

    // Send to server in background
    try {
      const result = await dispatch(
        createTopicMessage({
          topic_id: topic.id,
          content: content,
          attachments: attachments.length > 0 ? attachments.map(att => ({
            ...att,
            id: `temp-${Date.now()}`,
            created_at: new Date().toISOString()
          })) : undefined,
        })
      ).unwrap();

      // Replace optimistic message with real message from server
      dispatch(updateOptimisticMessage({ tempId, message: result }));
    } catch (error) {
      console.error('Failed to send message:', error);
      // Mark message as failed
      dispatch(markMessageAsFailed(tempId));
    }
  };

  const handleRetryMessage = async (tempId: string, content: string) => {
    // Remove failed message
    dispatch(removeOptimisticMessage(tempId));

    // Create new optimistic message
    const newTempId = `temp-${Date.now()}-${Math.random()}`;
    const optimisticMessage: OptimisticMessage = {
      id: newTempId,
      topic_id: topic.id,
      sender_id: user!.id,
      content: content,
      reply_to_id: null,
      is_edited: false,
      edited_at: null,
      is_deleted: false,
      deleted_at: null,
      created_at: new Date().toISOString(),
      sender_email: user!.email,
      sender_full_name: user!.full_name || null,
      mention_count: 0,
      reaction_count: 0,
      reactions: [],
      attachments: [],
      _optimistic: true,
      _pending: true,
      _failed: false,
      _tempId: newTempId,
    };

    dispatch(addOptimisticMessage(optimisticMessage));

    // Try sending again
    try {
      const result = await dispatch(
        createTopicMessage({
          topic_id: topic.id,
          content: content,
        })
      ).unwrap();

      dispatch(updateOptimisticMessage({ tempId: newTempId, message: result }));
    } catch (error) {
      console.error('Failed to retry message:', error);
      dispatch(markMessageAsFailed(newTempId));
    }
  };

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

  const handleCancelMessage = (tempId: string) => {
    dispatch(removeOptimisticMessage(tempId));
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploaded = await uploadFilesToTopic(topic.id, Array.from(files));
      setAttachments(prev => [...prev, ...uploaded]);
    } catch (error) {
      console.error('File upload failed:', error);
      alert('Failed to upload files. Please try again.');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const insertEmojiAtCaret = (emoji: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setMessageContent((prev) => prev + emoji);
      return;
    }

    const { start, end } = caretPositionRef.current;
    const newValue =
      messageContent.substring(0, start) + emoji + messageContent.substring(end);
    setMessageContent(newValue);

    const newCaretPosition = start + emoji.length;
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(newCaretPosition, newCaretPosition);
      caretPositionRef.current = { start: newCaretPosition, end: newCaretPosition };
    });
  };

  const handleEmojiSelect = (emojiData: EmojiClickData) => {
    insertEmojiAtCaret(emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleCaretUpdate = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      caretPositionRef.current = {
        start: textarea.selectionStart || 0,
        end: textarea.selectionEnd || 0,
      };
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white min-w-0">
      {/* Topic Header */}
      <div className="h-12 border-b border-gray-200 flex items-center px-5">
        <Hash className="w-5 h-5 text-gray-500 mr-2" />
        <div className="flex-1">
          <h2 className="text-base font-semibold text-gray-900">
            {topic.name}
          </h2>
        </div>
        <button
          onClick={() => setShowManageModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#8E8E93] text-white rounded-full text-sm font-medium hover:bg-[#7a7a7f] transition-colors"
        >
          <Settings className="w-4 h-4" />
          Topic Settings
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 custom-scrollbar">
        {messagesLoading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full bg-gray-50">
            <div className="relative p-5 rounded-3xl border-2 border-white bg-white/30 backdrop-blur-md shadow-lg">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 rounded-full border-[4px] border-gray-200"></div>
                <div className="absolute inset-0 rounded-full border-[4px] border-transparent border-t-blue-500 border-l-blue-400 animate-spin"></div>
              </div>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-600">
            <div className="text-center">
              <Hash className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p className="text-sm">No messages yet. Start the conversation!</p>
            </div>
          </div>
        ) : (
          <MessageList
            messages={messages}
            currentUserId={user?.id || ''}
            onRetryMessage={handleRetryMessage}
            onCancelMessage={handleCancelMessage}
          />
        )}

        {/* AI Typing Indicator */}
        {aiTyping && (
          <div className="flex items-center gap-3 px-4 py-3 animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
              🤖
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">{aiTypingName} is typing</span>
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 px-5 py-3">
        {/* Attachments Preview - Compact Thumbnails */}
        {attachments.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {attachments.map((attachment, index) => {
              const isImageFile = attachment.mime_type.startsWith('image/');
              return (
                <div
                  key={index}
                  className="relative group"
                >
                  {isImageFile ? (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={attachment.url}
                        alt={attachment.filename}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(index)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex flex-col items-center justify-center">
                      <span className="text-2xl">{getFileIcon(attachment.mime_type)}</span>
                      <span className="text-[8px] text-gray-500 mt-0.5 truncate max-w-full px-1">
                        {attachment.filename.split('.').pop()?.toUpperCase()}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(index)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Input Container */}
        <div className="relative flex items-center gap-2 bg-[#F5F5F5] rounded-full px-4 py-2 border border-gray-200">
          {/* Left Icons */}
          <div className="flex items-center gap-2 relative">
            {/* Emoji Button */}
            <button
              type="button"
              ref={emojiButtonRef}
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              title="Add emoji"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                <circle cx="9" cy="10" r="1" fill="currentColor" />
                <circle cx="15" cy="10" r="1" fill="currentColor" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>

            {showEmojiPicker && (
              <div
                ref={emojiPickerRef}
                className="absolute bottom-full mb-2 left-0 z-50 shadow-lg"
              >
                <EmojiPicker onEmojiClick={handleEmojiSelect} autoFocusSearch={false} />
              </div>
            )}

            {/* File Attachment Button */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
              accept="image/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
              title="Attach files"
            >
              {uploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Paperclip className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Text Input */}
          <form onSubmit={handleSendMessage} className="flex-1">
            <textarea
              ref={textareaRef}
              value={messageContent}
              onChange={(e) => {
                setMessageContent(e.target.value);
                handleCaretUpdate();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              onClick={handleCaretUpdate}
              onKeyUp={handleCaretUpdate}
              onSelect={handleCaretUpdate}
              placeholder="Type a message...(paste images with Ctrl + V)"
              rows={1}
              disabled={sending || uploading}
              className="w-full bg-transparent border-none outline-none resize-none text-sm text-gray-900 placeholder-gray-400 max-h-[100px]"
              style={{ height: 'auto' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${Math.min(target.scrollHeight, 100)}px`;
              }}
            />
          </form>

          {/* Send Button */}
          <button
            type="button"
            onClick={handleSendMessage}
            disabled={(!messageContent.trim() && attachments.length === 0) || sending || uploading}
            className="flex-shrink-0 w-8 h-8 bg-gray-400 text-white rounded-full flex items-center justify-center hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Manage Topic Modal */}
      {showManageModal && (
        <ManageTopicModal
          topic={topic}
          onClose={() => setShowManageModal(false)}
        />
      )}
    </div>
  );
}
