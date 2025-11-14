'use client';

import React from 'react';
import { TopicMessage } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare } from 'lucide-react';

interface ThreadListViewProps {
  messages: TopicMessage[];
  selectedMessageId: string | null;
  onMessageSelect: (message: TopicMessage) => void;
  topicName: string;
}

export function ThreadListView({
  messages,
  selectedMessageId,
  onMessageSelect,
  topicName,
}: ThreadListViewProps) {
  // Filter to show only top-level messages (not replies)
  const threads = messages.filter((msg) => !msg.reply_to_id && !msg.is_deleted);

  return (
    <div className="w-96 bg-[#1A1D21] border-r border-gray-700 flex flex-col">
      {/* Header */}
      <div className="h-14 border-b border-gray-700 flex items-center px-4">
        <div className="flex items-center gap-2">
          <span className="text-white font-semibold">#</span>
          <h2 className="text-white font-semibold">{topicName}</h2>
        </div>
      </div>

      {/* Thread List */}
      <div className="flex-1 overflow-y-auto">
        {threads.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 px-4">
            <MessageSquare className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-center text-sm">No threads yet. Start a conversation!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {threads.map((message) => {
              const replyCount = messages.filter((m) => m.reply_to_id === message.id).length;
              const isSelected = selectedMessageId === message.id;

              return (
                <button
                  key={message.id}
                  onClick={() => onMessageSelect(message)}
                  className={`w-full text-left px-4 py-3 hover:bg-[#252A2E] transition-colors ${
                    isSelected ? 'bg-[#1164A3]' : ''
                  }`}
                >
                  {/* Thread Header */}
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                      {message.sender?.full_name?.[0]?.toUpperCase() ||
                        message.sender?.email?.[0]?.toUpperCase() ||
                        'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-semibold text-white text-sm">
                          {message.sender?.full_name || message.sender?.email || 'Unknown User'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 line-clamp-2">{message.content}</p>
                    </div>
                  </div>

                  {/* Reply Count */}
                  {replyCount > 0 && (
                    <div className="flex items-center gap-2 ml-11 text-xs text-blue-400">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>
                        {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
                      </span>
                    </div>
                  )}

                  {/* Reactions Preview */}
                  {message.reactions && message.reactions.length > 0 && (
                    <div className="flex flex-wrap gap-1 ml-11 mt-2">
                      {Object.entries(
                        message.reactions.reduce((acc, r) => {
                          acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>)
                      )
                        .slice(0, 3)
                        .map(([emoji, count]) => (
                          <span
                            key={emoji}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gray-700 rounded text-xs"
                          >
                            <span>{emoji}</span>
                            <span className="text-gray-400">{count}</span>
                          </span>
                        ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
