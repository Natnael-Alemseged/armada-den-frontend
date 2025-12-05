'use client';

import React, { useState, useRef, useEffect } from 'react';
import { DirectMessage, DMEligibleUser, DMReaction } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { MoreVertical, Reply, Smile, Edit2, Trash2, X, User } from 'lucide-react';
import { useAppDispatch } from '@/lib/hooks';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import {
  editDM,
  deleteDM,
  addDMReaction,
  removeDMReaction,
} from '@/lib/features/directMessages/directMessagesThunk';
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
import { MessageContent } from '@/components/channels/MessageContent';
import { MessageAttachments } from '@/components/channels/MessageAttachments';
import { OnlineIndicator } from '@/components/ui/OnlineIndicator';

interface DMMessageListProps {
  messages: DirectMessage[];
  currentUserId: string;
  otherUser: DMEligibleUser;
}

export function DMMessageList({ messages, currentUserId, otherUser }: DMMessageListProps) {
  const dispatch = useAppDispatch();
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [messageToDelete, setMessageToDelete] = useState<DirectMessage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

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

  const handleStartEdit = (message: DirectMessage) => {
    setEditingMessageId(message.id);
    setEditContent(message.content);
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditContent('');
  };

  const handleSaveEdit = async (messageId: string) => {
    if (!editContent.trim()) return;

    try {
      await dispatch(editDM({ messageId, content: editContent.trim() })).unwrap();
      setEditingMessageId(null);
      setEditContent('');
    } catch (error) {
      console.error('Failed to edit message:', error);
    }
  };

  const handleDeleteMessage = async () => {
    if (!messageToDelete) return;

    setIsDeleting(true);
    try {
      await dispatch(deleteDM(messageToDelete.id)).unwrap();
      setMessageToDelete(null);
    } catch (error) {
      console.error('Failed to delete message:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const getExistingReaction = (message: DirectMessage) => {
    return message.reactions?.find((reaction) =>
      reaction.users.includes(currentUserId)
    );
  };

  const handleToggleReaction = async (message: DirectMessage, emoji: string) => {
    try {
      const existingReaction = getExistingReaction(message);

      if (existingReaction) {
        if (existingReaction.emoji === emoji) {
          await dispatch(removeDMReaction({ messageId: message.id, emoji, currentUserId })).unwrap();
        } else {
          await dispatch(
            removeDMReaction({ messageId: message.id, emoji: existingReaction.emoji, currentUserId })
          ).unwrap();
          await dispatch(addDMReaction({ messageId: message.id, emoji, currentUserId })).unwrap();
        }
      } else {
        await dispatch(addDMReaction({ messageId: message.id, emoji, currentUserId })).unwrap();
      }

      setShowEmojiPicker(null);
    } catch (error) {
      console.error('Failed to toggle reaction:', error);
    }
  };

  const handleEmojiSelect = (message: DirectMessage, emojiData: EmojiClickData) => {
    handleToggleReaction(message, emojiData.emoji);
  };

  const commonEmojis = ['👍', '❤️', '😊', '😂', '🎉', '🔥', '👏', '✅'];

  return (
    <div className="space-y-3 px-4">
      {messages.map((message) => {
        const isOwnMessage = message.sender_id === currentUserId;
        const isEditing = editingMessageId === message.id;
        const isHovered = hoveredMessageId === message.id;
        const userReaction = getExistingReaction(message);

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

        return (
          <div
            key={message.id}
            className={`flex gap-2 group ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
            onMouseEnter={() => setHoveredMessageId(message.id)}
            onMouseLeave={() => setHoveredMessageId(null)}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-xs">
                {isOwnMessage
                  ? 'You'[0]
                  : (otherUser.full_name || otherUser.email)[0].toUpperCase()}
              </div>
              {/* Online indicator */}
              {!isOwnMessage && otherUser.is_online && (
                <OnlineIndicator 
                  isOnline={true} 
                  size="sm"
                  className="absolute -bottom-0.5 -right-0.5 shadow-md"
                />
              )}
            </div>

            {/* Message Content */}
            <div className={`flex flex-col w-full max-w-[85%] sm:max-w-[75%] md:max-w-[70%] lg:max-w-[65%] xl:max-w-[60%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
              {/* Header */}
              <div className={`flex items-baseline gap-2 mb-1 px-1 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                <span className="font-medium text-gray-900 text-xs">
                  {isOwnMessage ? 'You' : (otherUser.full_name || otherUser.email)}
                </span>
                <span className="text-[10px] text-gray-500">
                  {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                </span>
                {message.is_edited && (
                  <span className="text-[10px] text-gray-600">(edited)</span>
                )}
              </div>

              {/* Message Bubble */}
              <div className="relative group/message">
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
                        onClick={handleCancelEdit}
                        className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-md hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* WhatsApp-style card: attachments and content together */}
                    <div className={`rounded-2xl overflow-hidden max-w-full ${isOwnMessage ? 'bg-[#007aff]' : 'bg-gray-100'}`}>
                      {/* Message Attachments at the top */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="w-full">
                          <MessageAttachments 
                            attachments={message.attachments as any}
                            isOwnMessage={isOwnMessage}
                          />
                        </div>
                      )}
                      
                      {/* Message Content below attachments */}
                      {message.content && (
                        <div className="px-3 py-2">
                          <MessageContent
                            content={message.content}
                            className={isOwnMessage ? 'text-white' : 'text-gray-900'}
                          />
                        </div>
                      )}
                    </div>

                    {/* Reactions */}
                    {message.reactions && message.reactions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {message.reactions.map((reaction: DMReaction) => {
                          const userReacted = reaction.users.includes(currentUserId);
                          return (
                            <button
                              key={reaction.emoji}
                              onClick={() => handleToggleReaction(message, reaction.emoji)}
                              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs transition-colors ${
                                userReacted
                                  ? 'bg-[#1A73E8]/20 border border-[#1A73E8] text-[#1A73E8]'
                                  : 'bg-gray-50 border border-gray-200 hover:border-gray-300 text-gray-600'
                              }`}
                              title={`${reaction.count} reaction${reaction.count > 1 ? 's' : ''}`}
                            >
                              <span>{reaction.emoji}</span>
                              <span className="text-[10px]">{reaction.count}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Action Buttons */}
                    {!isEditing && isHovered && (
                      <div className={`absolute top-0 flex gap-0.5 bg-white border border-gray-200 rounded-lg shadow-lg p-0.5 opacity-0 group-hover/message:opacity-100 transition-opacity ${
                        isOwnMessage ? 'right-full mr-2' : 'left-full ml-2'
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
                            <div ref={emojiPickerRef} className={`absolute top-full mt-2 z-50 ${
                              isOwnMessage ? 'right-0' : 'left-0'
                            }`}>
                              <EmojiPicker
                                onEmojiClick={(emojiData) => handleEmojiSelect(message, emojiData)}
                                autoFocusSearch={false}
                              />
                            </div>
                          )}
                        </div>
                        {isOwnMessage && (
                          <>
                            <button
                              onClick={() => handleStartEdit(message)}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!messageToDelete} onOpenChange={() => setMessageToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMessage}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
