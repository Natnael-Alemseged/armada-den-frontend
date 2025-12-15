'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { TopicMessage, GroupedReaction } from '@/lib/types';
import { OptimisticMessage } from '@/lib/features/channels/channelsSlice';
import { formatDistanceToNow } from 'date-fns';
import { MoreVertical, Reply, Smile, Edit2, Trash2, AlertCircle, RefreshCw, X, Clock, ArrowUpRight } from 'lucide-react';
import { useAppDispatch } from '@/lib/hooks';
import { useOnlineStatus } from '@/lib/hooks/useOnlineStatus';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import {
  updateTopicMessage,
  deleteTopicMessage,
  addReaction,
  removeReaction,
} from '@/lib/features/channels/channelsThunk';
import { updateMessageInState } from '@/lib/features/channels/channelsSlice';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { MessageContent } from './MessageContent';
import { MessageAttachments } from './MessageAttachments';
import { OnlineIndicator } from '@/components/ui/OnlineIndicator';

interface MessageListProps {
  messages: OptimisticMessage[];
  currentUserId: string;
  onRetryMessage?: (tempId: string, content: string) => void;
  onCancelMessage?: (tempId: string) => void;
  onReply?: (message: OptimisticMessage) => void;
}

export function MessageList({ messages, currentUserId, onRetryMessage, onCancelMessage, onReply }: MessageListProps) {
  const dispatch = useAppDispatch();
  const { isUserOnline } = useOnlineStatus();
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [messageToDelete, setMessageToDelete] = useState<TopicMessage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const messageById = useMemo(() => {
    const map = new Map<string, OptimisticMessage>();
    messages.forEach((m) => map.set(m.id, m));
    return map;
  }, [messages]);

  const scrollToMessage = useCallback((messageId: string) => {
    const el = messageRefs.current[messageId];
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setHighlightedMessageId(messageId);
    window.setTimeout(
      () => setHighlightedMessageId((prev) => (prev === messageId ? null : prev)),
      1200
    );
  }, []);

  const handleEdit = (message: TopicMessage) => {
    setEditingMessageId(message.id);
    setEditContent(message.content);
  };

  const handleSaveEdit = async (messageId: string) => {
    if (!editContent.trim()) return;

    const originalMessage = messages.find((m) => m.id === messageId);
    if (!originalMessage) return;

    const originalContent = originalMessage.content;
    const originalEditedAt = originalMessage.edited_at;

    // Optimistic update
    dispatch(
      updateMessageInState({
        messageId,
        content: editContent.trim(),
        editedAt: new Date().toISOString(),
      })
    );
    setEditingMessageId(null);

    try {
      await dispatch(
        updateTopicMessage({
          messageId,
          data: { content: editContent.trim() },
        })
      ).unwrap();
    } catch (error) {
      console.error('Failed to update message:', error);
      // Revert optimistic update
      dispatch(
        updateMessageInState({
          messageId,
          content: originalContent,
          editedAt: originalEditedAt || new Date().toISOString(), // Fallback if null, though it shouldn't matter much for revert
        })
      );
      // Ideally show a toast here
    }
  };

  const handleDelete = async () => {
    if (!messageToDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteTopicMessage(messageToDelete.id)).unwrap();
      setMessageToDelete(null);
    } catch (error) {
      console.error('Failed to delete message:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleReaction = async (messageId: string, emoji: string) => {
    const message = messages.find((m) => m.id === messageId);
    if (!message) return;

    // Initialize reactions if undefined
    const reactions = message.reactions || [];

    // Check if reactions are in grouped format
    const isGroupedFormat = reactions.length > 0 && 'user_reacted' in reactions[0];

    let existingReactionEmoji: string | null = null;

    if (isGroupedFormat) {
      // Backend grouped format
      const groupedReactions = reactions as GroupedReaction[];
      // Find ANY reaction where the user is included in the users array
      const userReaction = groupedReactions.find((r) =>
        r.users.includes(currentUserId)
      );
      if (userReaction) {
        existingReactionEmoji = userReaction.emoji;
      }
    } else {
      // Legacy individual format
      const userReaction = (reactions as any[]).find(
        (r: any) => r.user_id === currentUserId
      );
      if (userReaction) {
        existingReactionEmoji = userReaction.emoji;
      }
    }

    try {
      if (existingReactionEmoji) {
        if (existingReactionEmoji === emoji) {
          // User clicked the same emoji -> Remove it
          await dispatch(removeReaction({ messageId, emoji, currentUserId })).unwrap();
        } else {
          // User clicked a different emoji -> Remove old, Add new (Update)
          await dispatch(removeReaction({ messageId, emoji: existingReactionEmoji, currentUserId })).unwrap();
          await dispatch(addReaction({ messageId, emoji, currentUserId })).unwrap();
        }
      } else {
        // No existing reaction -> Add new
        await dispatch(addReaction({ messageId, emoji, currentUserId })).unwrap();
      }
    } catch (error) {
      console.error('Failed to toggle reaction:', error);
    }
  };

  const handleEmojiSelect = async (messageId: string, emojiData: EmojiClickData) => {
    setShowEmojiPicker(null); // Close picker immediately
    await handleToggleReaction(messageId, emojiData.emoji);
  };

  // Helper to check if reactions are in grouped format
  const isGroupedReactions = (reactions: TopicMessage['reactions']): reactions is GroupedReaction[] => {
    return reactions !== undefined && reactions.length > 0 && 'user_reacted' in reactions[0];
  };

  return (
    <div className="space-y-3 px-4">
      {messages.map((message) => {
        const isOwnMessage = message.sender_id === currentUserId;
        const isEditing = editingMessageId === message.id;
        const isHovered = hoveredMessageId === message.id;
        const replyMessage = message.reply_to_id ? messageById.get(message.reply_to_id) : undefined;
        const isHighlighted = highlightedMessageId === message.id;

        if (message.is_deleted) {
          return (
            <div
              key={message.id}
              className="flex justify-center text-gray-500 italic text-xs"
            >
              <div className="bg-gray-100 px-3 py-1 rounded-full">Message deleted</div>
            </div>
          );
        }

        const isPending = message._pending;
        const isFailed = message._failed;
        const isOptimistic = message._optimistic;

        return (
          <div
            key={message.id}
            className={`flex gap-2 group ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} ${isFailed ? 'opacity-60' : ''} ${isHighlighted ? 'ring-2 ring-yellow-300 ring-offset-2 rounded-xl p-1' : ''}`}
            onMouseEnter={() => setHoveredMessageId(message.id)}
            onMouseLeave={() => setHoveredMessageId(null)}
            ref={(el) => {
              if (el) {
                messageRefs.current[message.id] = el;
              } else {
                delete messageRefs.current[message.id];
              }
            }}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-xs">
                {message.sender_full_name?.[0]?.toUpperCase() ||
                  message.sender_email?.[0]?.toUpperCase() ||
                  'U'}
              </div>
              {/* Online indicator */}
              <OnlineIndicator 
                isOnline={isUserOnline(message.sender_id)} 
                size="sm"
                className="absolute -bottom-0.5 -right-0.5 shadow-md"
              />
            </div>

            {/* Message Content */}
            <div className={`flex flex-col min-w-0 w-full max-w-[90%] sm:max-w-[85%] md:max-w-[80%] lg:max-w-[75%] xl:max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
              {/* Header */}
              <div className={`flex items-baseline gap-2 mb-1 px-1 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                <span className="font-medium text-gray-900 text-xs">
                  {message.sender_full_name || message.sender_email || 'Unknown User'}
                </span>
                <span className="text-[10px] text-gray-500">
                  {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                </span>
                {message.is_edited && (
                  <span className="text-[10px] text-gray-600">(edited)</span>
                )}
                {isPending && (
                  <span className="text-[10px] text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 animate-pulse" />
                    Sending...
                  </span>
                )}
                {isFailed && (
                  <span className="text-[10px] text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Failed
                  </span>
                )}
              </div>

              {/* Message Bubble */}
              <div className="relative group/message max-w-full">
                {isEditing ? (
                  <div className="space-y-2 min-w-[300px]">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSaveEdit(message.id);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1A73E8] bg-white text-gray-900 resize-none text-sm"
                      rows={3}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveEdit(message.id)}
                        className="px-3 py-1 bg-[#1A73E8] text-white text-xs rounded-md hover:bg-[#1557B0]"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingMessageId(null)}
                        className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-md hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* WhatsApp-style card: attachments and content together */}
                    <div className={`rounded-2xl overflow-hidden max-w-full ${isOwnMessage
                      ? isFailed ? 'bg-red-500/20 border border-red-500/50' : 'bg-[#007aff]'
                      : 'bg-gray-100'
                      }`}>
                      {message.reply_to_id && (
                        <div className={`px-3 py-2 border-l-2 ${isOwnMessage ? 'border-white/60 bg-white/15' : 'border-gray-400 bg-white/60'}`}>
                          <div className="flex items-start gap-2">
                            <div className="flex-1 min-w-0">
                              <div className={`text-[11px] font-medium ${isOwnMessage ? 'text-white/90' : 'text-gray-700'}`}>
                                Replying to{' '}
                                {replyMessage
                                  ? replyMessage.sender_id === currentUserId
                                    ? 'You'
                                    : (replyMessage.sender_full_name || replyMessage.sender_email || 'User')
                                  : 'message'}
                              </div>
                              <div className={`text-[11px] ${isOwnMessage ? 'text-white/80' : 'text-gray-600'} truncate`}>
                                {replyMessage
                                  ? replyMessage.content
                                    ? replyMessage.content
                                    : replyMessage.attachments && replyMessage.attachments.length > 0
                                      ? 'Attachment'
                                      : 'Message'
                                  : 'Original message not found'}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                if (message.reply_to_id) {
                                  scrollToMessage(message.reply_to_id);
                                }
                              }}
                              disabled={!message.reply_to_id}
                              className={`p-1 rounded transition-colors ${isOwnMessage ? 'hover:bg-white/20' : 'hover:bg-black/5'} disabled:opacity-40`}
                              title="Jump to message"
                            >
                              <ArrowUpRight className={`w-3.5 h-3.5 ${isOwnMessage ? 'text-white/90' : 'text-gray-600'}`} />
                            </button>
                          </div>
                        </div>
                      )}
                      {/* Message Attachments at the top */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="w-full">
                          <MessageAttachments 
                            attachments={message.attachments} 
                            isOwnMessage={isOwnMessage}
                            isFailed={isFailed}
                          />
                        </div>
                      )}
                      
                      {/* Message Content below attachments */}
                      {message.content && (
                        <div className="px-3 py-2">
                          <MessageContent
                            content={message.content}
                            className={isOwnMessage && !isFailed ? 'text-white' : 'text-gray-900'}
                          />
                        </div>
                      )}
                    </div>

                    {/* Failed Message Actions */}
                    {isFailed && isOwnMessage && onRetryMessage && onCancelMessage && message._tempId && (
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => onRetryMessage(message._tempId!, message.content)}
                          className="flex items-center gap-1 px-2 py-1 bg-[#1A73E8] text-white text-xs rounded-md hover:bg-[#1557B0] transition-colors"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Retry
                        </button>
                        <button
                          onClick={() => onCancelMessage(message._tempId!)}
                          className="flex items-center gap-1 px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-md hover:bg-gray-300 transition-colors"
                        >
                          <X className="w-3 h-3" />
                          Cancel
                        </button>
                      </div>
                    )}

                    {/* Reactions */}
                    {message.reactions && message.reactions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {isGroupedReactions(message.reactions) ? (
                          // Backend grouped format
                          message.reactions.map((reaction) => (
                            <button
                              key={reaction.emoji}
                              onClick={() => handleToggleReaction(message.id, reaction.emoji)}
                              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs transition-colors ${reaction.user_reacted
                                ? 'bg-[#1A73E8]/20 border border-[#1A73E8] text-[#1A73E8]'
                                : 'bg-gray-50 border border-gray-200 hover:border-gray-300 text-gray-600'
                                }`}
                              title={`${reaction.count} reaction${reaction.count > 1 ? 's' : ''}`}
                            >
                              <span>{reaction.emoji}</span>
                              <span className="text-[10px]">
                                {reaction.count}
                              </span>
                            </button>
                          ))
                        ) : (
                          // Legacy individual format - group them
                          Object.entries(
                            message.reactions.reduce((acc: any, r: any) => {
                              if (!acc[r.emoji]) acc[r.emoji] = [];
                              acc[r.emoji].push(r);
                              return acc;
                            }, {})
                          ).map(([emoji, reactions]: [string, any]) => {
                            const userReacted = reactions.some((r: any) => r.user_id === currentUserId);
                            return (
                              <button
                                key={emoji}
                                onClick={() => handleToggleReaction(message.id, emoji)}
                                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs transition-colors ${userReacted
                                  ? 'bg-[#1A73E8]/20 border border-[#1A73E8] text-[#1A73E8]'
                                  : 'bg-gray-50 border border-gray-200 hover:border-gray-300 text-gray-600'
                                  }`}
                                title={`${reactions.length} reaction${reactions.length > 1 ? 's' : ''}`}
                              >
                                <span>{emoji}</span>
                                <span className="text-[10px]">
                                  {reactions.length}
                                </span>
                              </button>
                            );
                          })
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    {!isEditing && isHovered && !isFailed && !isPending && (
                      <div className={`absolute top-0 flex gap-0.5 bg-white border border-gray-200 rounded-lg shadow-lg p-0.5 opacity-0 group-hover/message:opacity-100 transition-opacity ${isOwnMessage ? 'right-full mr-2' : 'left-full ml-2'
                        }`}>
                        <div className="relative">
                          <button
                            onClick={() => setShowEmojiPicker(showEmojiPicker === message.id ? null : message.id)}
                            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                            title="Add reaction"
                          >
                            <Smile className="w-3.5 h-3.5 text-gray-400" />
                          </button>
                          {showEmojiPicker === message.id && (
                            <div ref={emojiPickerRef} className={`absolute top-full mt-2 z-50 ${isOwnMessage ? 'right-0' : 'left-0'
                              }`}>
                              <EmojiPicker
                                onEmojiClick={(emojiData) => handleEmojiSelect(message.id, emojiData)}
                                autoFocusSearch={false}
                              />
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            onReply?.(message);
                            setShowEmojiPicker(null);
                          }}
                          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                          title="Reply"
                        >
                          <Reply className="w-3.5 h-3.5 text-gray-400" />
                        </button>
                        {isOwnMessage && (
                          <>
                            <button
                              onClick={() => handleEdit(message)}
                              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                              title="Edit message"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-gray-400" />
                            </button>
                            <button
                              onClick={() => setMessageToDelete(message)}
                              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                              title="Delete message"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-400" />
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
      <AlertDialog
        open={!!messageToDelete}
        onOpenChange={(open: boolean) => {
          if (!open) {
            setMessageToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this message?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected message for everyone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
