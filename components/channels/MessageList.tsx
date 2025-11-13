'use client';

import React, { useState } from 'react';
import { TopicMessage } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { MoreVertical, Reply, Smile, Edit2, Trash2 } from 'lucide-react';
import { useAppDispatch } from '@/lib/hooks';
import {
  updateTopicMessage,
  deleteTopicMessage,
  addReaction,
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

  const handleAddReaction = async (messageId: string, emoji: string) => {
    try {
      await dispatch(addReaction({ messageId, emoji })).unwrap();
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
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
    <div className="space-y-4">
      {messages.map((message) => {
        const isOwnMessage = message.sender_id === currentUserId;
        const isEditing = editingMessageId === message.id;
        const isHovered = hoveredMessageId === message.id;

        if (message.is_deleted) {
          return (
            <div
              key={message.id}
              className="flex gap-3 text-gray-400 dark:text-gray-500 italic text-sm"
            >
              <div className="w-8 h-8 rounded bg-gray-200 dark:bg-gray-700" />
              <div>Message deleted</div>
            </div>
          );
        }

        return (
          <div
            key={message.id}
            className="flex gap-3 group"
            onMouseEnter={() => setHoveredMessageId(message.id)}
            onMouseLeave={() => setHoveredMessageId(null)}
          >
            {/* Avatar */}
            <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              {message.sender?.full_name?.[0]?.toUpperCase() ||
                message.sender?.email?.[0]?.toUpperCase() ||
                'U'}
            </div>

            {/* Message Content */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-semibold text-gray-900 dark:text-white text-sm">
                  {message.sender?.full_name || message.sender?.email || 'Unknown User'}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                </span>
                {message.is_edited && (
                  <span className="text-xs text-gray-400 dark:text-gray-500">(edited)</span>
                )}
              </div>

              {/* Message Body */}
              {isEditing ? (
                <div className="space-y-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                    rows={3}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveEdit(message.id)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingMessageId(null)}
                      className="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm rounded hover:bg-gray-400 dark:hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-gray-900 dark:text-gray-100 text-sm whitespace-pre-wrap break-words">
                    {message.content}
                  </p>

                  {/* Reactions */}
                  {message.reactions && message.reactions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {groupReactions(message.reactions).map(([emoji, reactions]) => (
                        <button
                          key={emoji}
                          onClick={() => handleAddReaction(message.id, emoji)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full text-sm transition-colors"
                        >
                          <span>{emoji}</span>
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {reactions.length}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Action Buttons */}
              {!isEditing && isHovered && (
                <div className="absolute right-4 -mt-8 flex gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-1">
                  <button
                    onClick={() => handleAddReaction(message.id, '👍')}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    title="Add reaction"
                  >
                    <Smile className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                  {isOwnMessage && (
                    <>
                      <button
                        onClick={() => handleEdit(message)}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        title="Edit message"
                      >
                        <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(message.id)}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        title="Delete message"
                      >
                        <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
