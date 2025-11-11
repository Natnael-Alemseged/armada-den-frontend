'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
  updateChatMessage,
  deleteChatMessage,
} from '@/lib/features/realTimeChat/realtimeChatThunk';
import { ChatRoomMessage } from '@/lib/types';
import {
  Reply,
  Edit2,
  Trash2,
  Forward,
  Check,
  CheckCheck,
  MoreVertical,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: ChatRoomMessage;
  isOwn: boolean;
  onReply: () => void;
}

export function MessageBubble({ message, isOwn, onReply }: MessageBubbleProps) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const handleEdit = async () => {
    if (!editContent.trim() || editContent === message.content) {
      setIsEditing(false);
      return;
    }

    try {
      await dispatch(
        updateChatMessage({
          messageId: message.id,
          data: { content: editContent.trim() },
        })
      ).unwrap();
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to edit message:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      await dispatch(deleteChatMessage({ messageId: message.id })).unwrap();
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMediaContent = () => {
    if (!message.media_url) return null;

    switch (message.message_type) {
      case 'image':
        return (
          <img
            src={message.media_url}
            alt={message.media_filename || 'Image'}
            className="max-w-sm rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => window.open(message.media_url!, '_blank')}
          />
        );
      case 'video':
        return (
          <video
            src={message.media_url}
            controls
            className="max-w-sm rounded-lg"
          />
        );
      case 'audio':
        return (
          <audio src={message.media_url} controls className="max-w-sm" />
        );
      case 'file':
        return (
          <a
            href={message.media_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <div className="flex-1">
              <p className="font-medium text-sm">
                {message.media_filename || 'File'}
              </p>
              {message.media_size && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {(message.media_size / 1024).toFixed(2)} KB
                </p>
              )}
            </div>
            <span className="text-blue-600 dark:text-blue-400">↓</span>
          </a>
        );
      default:
        return null;
    }
  };

  if (message.is_deleted) {
    return (
      <div
        className={cn(
          'flex',
          isOwn ? 'justify-end' : 'justify-start'
        )}
      >
        <div className="max-w-[70%] px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 italic text-sm">
          This message was deleted
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex gap-2 group',
        isOwn ? 'justify-end' : 'justify-start'
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Actions Menu (left side for own messages) */}
      {isOwn && showActions && !isEditing && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onReply}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            title="Reply"
          >
            <Reply className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            title="Edit"
          >
            <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            title="Delete"
          >
            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
          </button>
        </div>
      )}

      {/* Message Bubble */}
      <div
        className={cn(
          'max-w-[70%] rounded-2xl px-4 py-2 shadow-sm',
          isOwn
            ? 'bg-blue-600 text-white'
            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
        )}
      >
        {/* Reply Preview */}
        {message.reply_to && (
          <div
            className={cn(
              'mb-2 p-2 rounded-lg border-l-4 text-sm',
              isOwn
                ? 'bg-blue-700 border-blue-400'
                : 'bg-gray-100 dark:bg-gray-700 border-gray-400 dark:border-gray-500'
            )}
          >
            <p className={cn('font-semibold text-xs', isOwn ? 'text-blue-200' : 'text-gray-600 dark:text-gray-400')}>
              {message.reply_to.sender?.email || 'Unknown'}
            </p>
            <p className={cn('truncate', isOwn ? 'text-blue-100' : 'text-gray-700 dark:text-gray-300')}>
              {message.reply_to.content}
            </p>
          </div>
        )}

        {/* Forwarded Badge */}
        {message.forwarded_from_id && (
          <div className={cn('flex items-center gap-1 mb-1 text-xs', isOwn ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400')}>
            <Forward className="w-3 h-3" />
            <span>Forwarded</span>
          </div>
        )}

        {/* Media Content */}
        {renderMediaContent()}

        {/* Text Content */}
        {isEditing ? (
          <div className="space-y-2">
            <input
              type="text"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleEdit();
                if (e.key === 'Escape') setIsEditing(false);
              }}
              className="w-full px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleEdit}
                className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(message.content);
                }}
                className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        )}

        {/* Message Footer */}
        <div className={cn('flex items-center gap-2 mt-1 text-xs', isOwn ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400')}>
          <span>{formatTime(message.created_at)}</span>
          {message.is_edited && <span>(edited)</span>}
          {isOwn && (
            <span>
              {message.read_by && message.read_by.length > 0 ? (
                <CheckCheck className="w-4 h-4 text-blue-200" />
              ) : (
                <Check className="w-4 h-4 text-blue-200" />
              )}
            </span>
          )}
        </div>
      </div>

      {/* Actions Menu (right side for other's messages) */}
      {!isOwn && showActions && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onReply}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            title="Reply"
          >
            <Reply className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            title="More"
          >
            <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      )}
    </div>
  );
}
