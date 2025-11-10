'use client';

import React, { useEffect } from 'react';
import { MessageSquare, Trash2, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { fetchConversations, fetchConversation, deleteConversation } from '@/lib/features/chat/chatThunk';
import { Conversation } from '@/lib/types';

export function ConversationList() {
  const dispatch = useAppDispatch();
  const { conversations, currentConversation, loading } = useAppSelector(
    (state) => state.chat
  );

  useEffect(() => {
    // Load conversations on mount
    dispatch(fetchConversations({ page: 1, pageSize: 20 }));
  }, [dispatch]);

  const handleSelectConversation = async (conversation: Conversation) => {
    if (currentConversation?.id === conversation.id) return;
    
    try {
      await dispatch(
        fetchConversation({
          conversationId: conversation.id,
          includeMessages: true,
        })
      ).unwrap();
    } catch (err) {
      console.error('Failed to load conversation:', err);
    }
  };

  const handleDeleteConversation = async (
    e: React.MouseEvent,
    conversationId: string
  ) => {
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this conversation?')) {
      return;
    }

    try {
      await dispatch(
        deleteConversation({
          conversationId,
          hardDelete: false,
        })
      ).unwrap();
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  const handleRefresh = () => {
    dispatch(fetchConversations({ page: 1, pageSize: 20 }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Conversations
        </h3>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
          title="Refresh conversations"
        >
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        {loading && conversations.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No conversations yet</p>
            <p className="text-xs mt-1">Start a new chat to begin</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {conversations.map((conversation: Conversation) => (
              <button
                key={conversation.id}
                onClick={() => handleSelectConversation(conversation)}
                className={cn(
                  'w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors',
                  currentConversation?.id === conversation.id &&
                    'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate">
                      {conversation.title || 'Untitled Conversation'}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {conversation.message_count} message
                      {conversation.message_count !== 1 ? 's' : ''} •{' '}
                      {formatDate(conversation.created_at)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteConversation(e, conversation.id)}
                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                    title="Delete conversation"
                  >
                    <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-600" />
                  </button>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}