'use client';

import React, { useState, useRef, useEffect } from 'react';
import { DirectMessage, DMEligibleUser, DMReaction } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { MoreVertical, Reply, Smile, Edit2, Trash2, X } from 'lucide-react';
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

  const handleReactionClick = async (messageId: string, emoji: string) => {
    const message = messages.find((m) => m.id === messageId);
    if (!message) return;

    // Check if current user already reacted with this emoji
    const userReaction = message.reactions?.find(
      (r) => r.emoji === emoji && r.users.includes(currentUserId)
    );

    try {
      if (userReaction) {
        await dispatch(removeDMReaction({ messageId, emoji })).unwrap();
      } else {
        await dispatch(addDMReaction({ messageId, emoji })).unwrap();
      }
      setShowEmojiPicker(null);
    } catch (error) {
      console.error('Failed to handle reaction:', error);
    }
  };

  const handleEmojiSelect = (messageId: string, emojiData: EmojiClickData) => {
    handleReactionClick(messageId, emojiData.emoji);
  };

  const commonEmojis = ['👍', '❤️', '😊', '😂', '🎉', '🔥', '👏', '✅'];

  return (
    <div className="p-4 space-y-4">
      {messages.map((message) => {
        const isOwnMessage = message.sender_id === currentUserId;
        const isEditing = editingMessageId === message.id;
        const isHovered = hoveredMessageId === message.id;

        return (
          <div
            key={message.id}
            className="flex flex-col"
            onMouseEnter={() => setHoveredMessageId(message.id)}
            onMouseLeave={() => setHoveredMessageId(null)}
          >
            <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col group`}>
                {/* Sender info for other user's messages */}
                {!isOwnMessage && (
                  <div className="flex items-center gap-2 mb-1 px-3">
                    <div className="relative">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-xs font-semibold">
                        {(otherUser.full_name || otherUser.email)[0].toUpperCase()}
                      </div>
                      {otherUser.is_online && (
                        <OnlineIndicator isOnline={true} className="absolute -bottom-0.5 -right-0.5" size="sm" />
                      )}
                    </div>
                    <span className="text-xs text-gray-600 font-medium">
                      {otherUser.full_name || otherUser.email}
                    </span>
                  </div>
                )}

                {/* Reply indicator */}
                {message.reply_to_id && (
                  <div className="text-xs text-gray-500 mb-1 px-3 flex items-center gap-1">
                    <Reply className="w-3 h-3" />
                    <span>Replying to a message</span>
                  </div>
                )}

                {/* Message bubble */}
                <div className="relative">
                  <div
                    className={`rounded-2xl px-4 py-2 ${
                      isOwnMessage
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {isEditing ? (
                      <div className="space-y-2">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full p-2 border rounded text-gray-900 text-sm resize-none"
                          rows={3}
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveEdit(message.id)}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-xs hover:bg-gray-400"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <MessageContent content={message.content} />
                        {message.is_edited && (
                          <span className={`text-xs ml-2 ${isOwnMessage ? 'text-blue-200' : 'text-gray-500'}`}>
                            (edited)
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {/* Message actions */}
                  {!isEditing && isHovered && (
                    <div className={`absolute top-0 ${isOwnMessage ? 'left-0 -ml-2' : 'right-0 -mr-2'} -mt-2`}>
                      <div className="flex gap-1 bg-white rounded-lg shadow-lg border border-gray-200 p-1">
                        <button
                          onClick={() => setShowEmojiPicker(showEmojiPicker === message.id ? null : message.id)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                          title="React"
                        >
                          <Smile className="w-4 h-4 text-gray-600" />
                        </button>
                        {isOwnMessage && (
                          <>
                            <button
                              onClick={() => handleStartEdit(message)}
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4 text-gray-600" />
                            </button>
                            <button
                              onClick={() => setMessageToDelete(message)}
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Emoji Picker */}
                  {showEmojiPicker === message.id && (
                    <div ref={emojiPickerRef} className="absolute z-50 top-full mt-2">
                      <EmojiPicker onEmojiClick={(emojiData) => handleEmojiSelect(message.id, emojiData)} />
                    </div>
                  )}
                </div>

                {/* Attachments */}
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-2 px-3">
                    <MessageAttachments attachments={message.attachments as any} />
                  </div>
                )}

                {/* Reactions */}
                {message.reactions && message.reactions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1 px-3">
                    {message.reactions.map((reaction: DMReaction) => {
                      const userReacted = reaction.users.includes(currentUserId);
                      return (
                        <button
                          key={reaction.emoji}
                          onClick={() => handleReactionClick(message.id, reaction.emoji)}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors ${
                            userReacted
                              ? 'bg-blue-100 border border-blue-300'
                              : 'bg-gray-100 border border-gray-300 hover:bg-gray-200'
                          }`}
                        >
                          <span>{reaction.emoji}</span>
                          <span className="text-gray-600">{reaction.count}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Timestamp and read status */}
                <div className={`text-xs text-gray-500 mt-1 px-3 flex items-center gap-2`}>
                  <span>{formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}</span>
                  {isOwnMessage && message.is_read && (
                    <span className="text-blue-600">✓✓ Read</span>
                  )}
                </div>
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
