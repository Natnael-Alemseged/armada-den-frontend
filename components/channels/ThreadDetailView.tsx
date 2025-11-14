'use client';

import React, { useState, useRef, useEffect } from 'react';
import { TopicMessage } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { Send, Loader2, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { createTopicMessage } from '@/lib/features/channels/channelsThunk';
import { MessageList } from './MessageList';

interface ThreadDetailViewProps {
  parentMessage: TopicMessage;
  allMessages: TopicMessage[];
  onClose: () => void;
}

export function ThreadDetailView({
  parentMessage,
  allMessages,
  onClose,
}: ThreadDetailViewProps) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [replyContent, setReplyContent] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get all replies to this thread
  const replies = allMessages.filter(
    (msg) => msg.reply_to_id === parentMessage.id && !msg.is_deleted
  );

  // Combine parent message with replies
  const threadMessages = [parentMessage, ...replies];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [replies.length]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !user) return;

    setSending(true);
    try {
      await dispatch(
        createTopicMessage({
          topic_id: parentMessage.topic_id,
          content: replyContent.trim(),
          reply_to_id: parentMessage.id,
        })
      ).unwrap();
      setReplyContent('');
    } catch (error) {
      console.error('Failed to send reply:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#1A1D21]">
      {/* Header */}
      <div className="h-14 border-b border-gray-700 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <h2 className="text-white font-semibold">Thread</h2>
          <span className="text-gray-400 text-sm">
            {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-gray-700 rounded transition-colors text-gray-400 hover:text-white"
          title="Close thread"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Thread Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Parent Message */}
        <div className="border-b border-gray-700 p-6">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
              {parentMessage.sender?.full_name?.[0]?.toUpperCase() ||
                parentMessage.sender?.email?.[0]?.toUpperCase() ||
                'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-semibold text-white">
                  {parentMessage.sender?.full_name ||
                    parentMessage.sender?.email ||
                    'Unknown User'}
                </span>
                <span className="text-sm text-gray-400">
                  {formatDistanceToNow(new Date(parentMessage.created_at), { addSuffix: true })}
                </span>
              </div>
              <p className="text-gray-300 whitespace-pre-wrap break-words">
                {parentMessage.content}
              </p>

              {/* Reactions on parent */}
              {parentMessage.reactions && parentMessage.reactions.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {Object.entries(
                    parentMessage.reactions.reduce((acc, r) => {
                      if (!acc[r.emoji]) acc[r.emoji] = [];
                      acc[r.emoji].push(r);
                      return acc;
                    }, {} as Record<string, typeof parentMessage.reactions>)
                  ).map(([emoji, reactions]) => {
                    const userReacted = reactions.some((r) => r.user_id === user?.id);
                    return (
                      <span
                        key={emoji}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm ${
                          userReacted
                            ? 'bg-blue-900 border border-blue-500 text-blue-300'
                            : 'bg-gray-700 text-gray-300'
                        }`}
                      >
                        <span>{emoji}</span>
                        <span className="text-xs">{reactions.length}</span>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Replies */}
        {replies.length > 0 && (
          <div className="p-4">
            <div className="mb-3 text-sm font-semibold text-gray-400">
              {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
            </div>
            <MessageList messages={replies} currentUserId={user?.id || ''} />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Input */}
      <div className="border-t border-gray-700 p-4">
        <form onSubmit={handleSendReply} className="flex gap-2">
          <input
            type="text"
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Reply to thread..."
            className="flex-1 px-4 py-2 bg-[#252A2E] border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!replyContent.trim() || sending}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {sending ? (
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
