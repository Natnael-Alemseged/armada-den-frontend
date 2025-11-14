'use client';

import React, { useState, useRef, useEffect } from 'react';
import { TopicMessage } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { MoreVertical, Reply, Smile, Edit2, Trash2 } from 'lucide-react';
import { useAppDispatch } from '@/lib/hooks';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import {
  updateTopicMessage,
  deleteTopicMessage,
  addReaction,
  removeReaction,
} from '@/lib/features/channels/channelsThunk';

interface MessageListProps {
  messages: TopicMessage[];
  currentUserId: string;
}

export function MessageList({ messages, currentUserId }: MessageListProps) {
  const dispatch = useAppDispatch();
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const handleEdit = (message: TopicMessage) => {
    setEditingMessageId(message.id);
    setEditContent(message.content);
  };

  const handleSaveEdit = async (messageId: string) => {
    if (!editContent.trim()) return;
    try {
      await dispatch(
        updateTopicMessage({
          messageId,
          data: { content: editContent.trim() },
        })
      ).unwrap();
      setEditingMessageId(null);
    } catch (error) {
      console.error('Failed to update message:', error);
    }
  };

  const handleDelete = async (messageId: string) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await dispatch(deleteTopicMessage(messageId)).unwrap();
      } catch (error) {
        console.error('Failed to delete message:', error);
      }
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

    // Check if current user has already reacted with this emoji
    const userReaction = message.reactions?.find(
      (r) => r.user_id === currentUserId && r.emoji === emoji
    );

    try {
      if (userReaction) {
        // Remove reaction
        await dispatch(removeReaction({ messageId, emoji })).unwrap();
      } else {
        // Add reaction
        await dispatch(addReaction({ messageId, emoji })).unwrap();
      }
    } catch (error) {
      console.error('Failed to toggle reaction:', error);
    }
  };

  const handleEmojiSelect = async (messageId: string, emojiData: EmojiClickData) => {
    setShowEmojiPicker(null); // Close picker immediately
    await handleToggleReaction(messageId, emojiData.emoji);
  };

  const groupReactions = (reactions: TopicMessage['reactions']) => {
    if (!reactions) return [];
    const grouped = reactions.reduce((acc, reaction) => {
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = [];
      }
      acc[reaction.emoji].push(reaction);
      return acc;
    }, {} as Record<string, typeof reactions>);
    return Object.entries(grouped);
  };

  return (
    <div className="space-y-3 px-4">
      {messages.map((message) => {
        const isOwnMessage = message.sender_id === currentUserId;
        const isEditing = editingMessageId === message.id;
        const isHovered = hoveredMessageId === message.id;

        if (message.is_deleted) {
          return (
            <div
              key={message.id}
              className="flex justify-center text-gray-500 italic text-xs"
            >
              <div className="bg-[#1A1A1A] px-3 py-1 rounded-full">Message deleted</div>
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
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
              {message.sender_full_name?.[0]?.toUpperCase() ||
                message.sender_email?.[0]?.toUpperCase() ||
                'U'}
            </div>

            {/* Message Content */}
            <div className={`flex flex-col max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
              {/* Header */}
              <div className={`flex items-baseline gap-2 mb-1 px-1 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                <span className="font-medium text-white text-xs">
                  {message.sender_full_name || message.sender_email || 'Unknown User'}
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
                      className="w-full px-3 py-2 border border-[#2A2A2A] rounded-lg focus:outline-none focus:border-[#1A73E8] bg-[#1A1A1A] text-white resize-none text-sm"
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
                        className="px-3 py-1 bg-[#2A2A2A] text-gray-300 text-xs rounded-md hover:bg-[#3A3A3A]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={`px-3 py-2 rounded-2xl ${
                      isOwnMessage 
                        ? 'bg-[#1A73E8] text-white' 
                        : 'bg-[#1A1A1A] text-gray-200'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                        {message.content}
                      </p>
                    </div>

                    {/* Reactions */}
                    {message.reactions && message.reactions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {groupReactions(message.reactions).map(([emoji, reactions]) => {
                          const userReacted = reactions.some((r) => r.user_id === currentUserId);
                          const userNames = reactions
                            .map((r) => r.user?.full_name || r.user?.email || 'Unknown')
                            .join(', ');
                          
                          return (
                            <button
                              key={emoji}
                              onClick={() => handleToggleReaction(message.id, emoji)}
                              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs transition-colors ${
                                userReacted
                                  ? 'bg-[#1A73E8]/20 border border-[#1A73E8] text-[#1A73E8]'
                                  : 'bg-[#0D0D0D] border border-[#2A2A2A] hover:border-[#3A3A3A] text-gray-400'
                              }`}
                              title={userNames}
                            >
                              <span>{emoji}</span>
                              <span className="text-[10px]">
                                {reactions.length}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Action Buttons */}
                    {!isEditing && isHovered && (
                      <div className={`absolute top-0 flex gap-0.5 bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg shadow-lg p-0.5 opacity-0 group-hover/message:opacity-100 transition-opacity ${
                        isOwnMessage ? 'right-full mr-2' : 'left-full ml-2'
                      }`}>
                        <div className="relative">
                          <button
                            onClick={() => setShowEmojiPicker(showEmojiPicker === message.id ? null : message.id)}
                            className="p-1.5 hover:bg-[#2A2A2A] rounded transition-colors"
                            title="Add reaction"
                          >
                            <Smile className="w-3.5 h-3.5 text-gray-400" />
                          </button>
                          {showEmojiPicker === message.id && (
                            <div ref={emojiPickerRef} className={`absolute top-full mt-2 z-50 ${
                              isOwnMessage ? 'right-0' : 'left-0'
                            }`}>
                              <EmojiPicker
                                onEmojiClick={(emojiData) => handleEmojiSelect(message.id, emojiData)}
                                autoFocusSearch={false}
                              />
                            </div>
                          )}
                        </div>
                        {isOwnMessage && (
                          <>
                            <button
                              onClick={() => handleEdit(message)}
                              className="p-1.5 hover:bg-[#2A2A2A] rounded transition-colors"
                              title="Edit message"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-gray-400" />
                            </button>
                            <button
                              onClick={() => handleDelete(message.id)}
                              className="p-1.5 hover:bg-[#2A2A2A] rounded transition-colors"
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
    </div>
  );
}
