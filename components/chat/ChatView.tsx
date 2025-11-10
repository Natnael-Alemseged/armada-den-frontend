'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User, MessageSquarePlus, Menu, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { sendChatMessage, fetchConversations, fetchConversation, deleteConversation } from '@/lib/features/chat/chatThunk';
import { addOptimisticMessage, clearCurrentConversation } from '@/lib/features/chat/chatSlice';
import { Message, MessageRole, Conversation } from '@/lib/types';
import { MessageContent } from './MessageContent';

export function ChatView() {
  const dispatch = useAppDispatch();
  const [input, setInput] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, currentConversation, conversations, sendingMessage, error, loading } = useAppSelector(
    (state) => state.chat
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load conversations on mount with error handling
    const loadConversations = async () => {
      try {
        await dispatch(fetchConversations({ page: 1, pageSize: 50 })).unwrap();
      } catch (err) {
        console.error('Failed to load conversations:', err);
        // Error is already handled by Redux, just log it
      }
    };
    
    loadConversations();
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sendingMessage) return;

    const userMessageContent = input.trim();
    setInput('');

    // Create optimistic user message
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: currentConversation?.id || '',
      role: 'USER' as MessageRole,
      content: userMessageContent,
      content_type: 'TEXT',
      tool_name: null,
      tool_input: null,
      tool_output: null,
      meta_data: {},
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Add optimistic message to UI
    dispatch(addOptimisticMessage(optimisticMessage));

    // Send message to backend
    try {
      await dispatch(
        sendChatMessage({
          message: userMessageContent,
          conversation_id: currentConversation?.id,
          agent_type: 'general',
        })
      ).unwrap();
      
      // Refresh conversations list to update message count
      dispatch(fetchConversations({ page: 1, pageSize: 50 }));
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleNewChat = () => {
    dispatch(clearCurrentConversation());
    setShowHistory(false);
  };

  const handleSelectConversation = async (conversation: Conversation) => {
    if (currentConversation?.id === conversation.id) {
      setShowHistory(false);
      return;
    }
    
    try {
      await dispatch(
        fetchConversation({
          conversationId: conversation.id,
          includeMessages: true,
        })
      ).unwrap();
      setShowHistory(false);
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

  const filteredConversations = (conversations || []).filter((conv: Conversation) =>
    conv?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 relative">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Conversation history"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {currentConversation?.title || 'New Conversation'}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              AI Assistant
            </p>
          </div>
        </div>
        <button
          onClick={handleNewChat}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105"
          title="Start new conversation"
        >
          <MessageSquarePlus className="w-5 h-5" />
          <span className="hidden sm:inline">New Chat</span>
        </button>
      </div>

      {/* History Sidebar Overlay */}
      {showHistory && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowHistory(false)}
          />
          <div className="fixed left-0 top-0 bottom-0 w-80 bg-white dark:bg-gray-800 shadow-2xl z-50 flex flex-col rounded-r-2xl">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Conversation History
                </h3>
                <button
                  onClick={() => setShowHistory(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                />
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              {loading && conversations.length === 0 ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  <p className="text-sm">
                    {searchQuery ? 'No conversations found' : 'No conversations yet'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredConversations.map((conversation: Conversation) => (
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
                          <X className="w-4 h-4 text-gray-400 hover:text-red-600" />
                        </button>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
        {!messages || messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <div className="text-center max-w-md">
              <Bot className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
              <p className="text-sm">
                I can help you with information, answer questions, or assist with various tasks.
              </p>
            </div>
          </div>
        ) : (
          <>
            {(messages || []).map((message: Message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3',
                  message.role === 'USER' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'ASSISTANT' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                )}
                <div
                  className={cn(
                    'max-w-[70%] rounded-2xl px-4 py-3 shadow-sm',
                    message.role === 'USER'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                  )}
                >
                  <MessageContent 
                    content={message.content} 
                    isUser={message.role === 'USER'}
                  />
                  {message.created_at && (
                    <p className={cn(
                      "text-xs mt-1",
                      message.role === 'USER' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                    )}>
                      {new Date(message.created_at).toLocaleTimeString()}
                    </p>
                  )}
                </div>
                {message.role === 'USER' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                )}
              </div>
            ))}
            {sendingMessage && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 shadow-sm">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 p-4 shadow-lg">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={sendingMessage}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:opacity-50 shadow-sm transition-all"
          />
          <button
            type="submit"
            disabled={sendingMessage || !input.trim()}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg hover:scale-105"
          >
            {sendingMessage ? (
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